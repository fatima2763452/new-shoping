const { spawn } = require('child_process');
const http = require('http');

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const targetUrl = "http://localhost:5173";

console.log("Launching Chrome to blank page...");
const chrome = spawn(chromePath, [
  '--headless',
  '--remote-debugging-port=9222',
  '--disable-gpu',
  'about:blank'
]);

chrome.on('error', (err) => {
  console.error("Failed to launch Chrome:", err.message);
  process.exit(1);
});

setTimeout(() => {
  console.log("Connecting to Chrome debug port...");
  http.get('http://localhost:9222/json/list', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const list = JSON.parse(data);
        const target = list.find(t => t.type === 'page');
        if (!target) {
          console.error("Could not find page target.");
          chrome.kill();
          process.exit(1);
        }

        const wsUrl = target.webSocketDebuggerUrl;
        const WebSocket = require('ws');
        const ws = new WebSocket(wsUrl);

        ws.on('open', () => {
          ws.send(JSON.stringify({ id: 1, method: "Runtime.enable" }));
          ws.send(JSON.stringify({ id: 2, method: "Page.enable" }));
          
          setTimeout(() => {
            ws.send(JSON.stringify({
              id: 3,
              method: "Page.navigate",
              params: { url: targetUrl }
            }));
          }, 500);
        });

        ws.on('message', (message) => {
          const msg = JSON.parse(message);
          
          // Print logs
          if (msg.method === "Runtime.consoleAPICalled") {
            const args = msg.params.args.map(a => a.value || JSON.stringify(a)).join(' ');
            console.log(`[CONSOLE]:`, args);
          }
          if (msg.method === "Runtime.exceptionThrown") {
            console.error("[EXCEPTION]:", msg.params.exceptionDetails.exception.description);
          }
        });

        // Query the DOM after 4 seconds of loading
        setTimeout(() => {
          console.log("Querying DOM...");
          ws.send(JSON.stringify({
            id: 4,
            method: "Runtime.evaluate",
            params: {
              expression: "document.getElementById('root').innerHTML",
              returnByValue: true
            }
          }));
          
          ws.on('message', function handleResult(message) {
            const msg = JSON.parse(message);
            if (msg.id === 4) {
              console.log("---------------- DOM ROOT INNER HTML ----------------");
              console.log(msg.result.result.value || "(Empty or null)");
              console.log("-----------------------------------------------------");
              ws.close();
              chrome.kill();
              process.exit(0);
            }
          });
        }, 4000);

      } catch (err) {
        console.error("Error:", err.message);
        chrome.kill();
        process.exit(1);
      }
    });
  }).on('error', (err) => {
    console.error("HTTP error:", err.message);
    chrome.kill();
    process.exit(1);
  });
}, 2000);

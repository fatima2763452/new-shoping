const { spawn } = require('child_process');
const http = require('http');

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const targetUrl = "http://localhost:4000/form";

console.log("Launching Chrome...");
const chrome = spawn(chromePath, [
  '--headless',
  '--remote-debugging-port=9222',
  '--disable-gpu',
  'about:blank'
]);

setTimeout(() => {
  http.get('http://localhost:9222/json/list', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const list = JSON.parse(data);
        const target = list.find(t => t.type === 'page');
        const wsUrl = target.webSocketDebuggerUrl;
        const WebSocket = require('ws');
        const ws = new WebSocket(wsUrl);

        ws.on('open', () => {
          ws.send(JSON.stringify({ id: 1, method: "Runtime.enable" }));
          ws.send(JSON.stringify({ id: 2, method: "Page.enable" }));
          
          // First navigate to the target URL to establish origin
          setTimeout(() => {
            ws.send(JSON.stringify({
              id: 4,
              method: "Page.navigate",
              params: { url: targetUrl }
            }));
            
            // Wait for navigation, then set localStorage, then navigate/reload
            setTimeout(() => {
              const mockUser = {
                _id: 'owner_id',
                username: '9574074927',
                role: 'owner',
                token: 'mock-owner-token-12345'
              };
              const setStorageJs = `
                localStorage.setItem('authToken', '101010');
                localStorage.setItem('userInfo', JSON.stringify(${JSON.stringify(mockUser)}));
                localStorage.setItem('token', 'mock-owner-token-12345');
              `;
              
              ws.send(JSON.stringify({
                id: 3,
                method: "Runtime.evaluate",
                params: { expression: setStorageJs }
              }));
              
              // Reload page to apply localStorage
              setTimeout(() => {
                ws.send(JSON.stringify({
                  id: 6,
                  method: "Page.navigate",
                  params: { url: targetUrl }
                }));
              }, 500);
            }, 1000);
          }, 500);
        });

        ws.on('message', (message) => {
          const msg = JSON.parse(message);
          
          if (msg.method === "Runtime.consoleAPICalled") {
            const args = msg.params.args.map(a => a.value || JSON.stringify(a)).join(' ');
            console.log(`[CONSOLE]:`, args);
          }
          
          if (msg.method === "Runtime.exceptionThrown") {
            const details = msg.params.exceptionDetails;
            console.error(`[EXCEPTION]: ${details.exception ? (details.exception.description || details.text) : details.text}`);
            if (details.stackTrace) {
              const frames = details.stackTrace.callFrames.map(f => `  at ${f.functionName || '<anonymous>'} (${f.url}:${f.lineNumber}:${f.columnNumber})`).join('\n');
              console.error(frames);
            }
          }
        });

        // Close after 8 seconds
        setTimeout(() => {
          console.log("Closing diagnostic...");
          ws.close();
          chrome.kill();
          process.exit(0);
        }, 8000);

      } catch (err) {
        console.error("Error:", err.message);
        chrome.kill();
        process.exit(1);
      }
    });
  });
}, 2000);

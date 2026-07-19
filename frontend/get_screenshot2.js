const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

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

        // Capture a screenshot after 4 seconds of dashboard load
        setTimeout(() => {
          console.log("Capturing dashboard screenshot...");
          ws.send(JSON.stringify({
            id: 5,
            method: "Page.captureScreenshot",
            params: { format: "png" }
          }));

          ws.on('message', (message) => {
            const msg = JSON.parse(message);
            if (msg.id === 5) {
              const base64Data = msg.result.data;
              fs.writeFileSync("d:\\Project - Copy (2)\\frontend\\dashboard_verify.png", Buffer.from(base64Data, 'base64'));
              console.log("Screenshot saved successfully to d:\\Project - Copy (2)\\frontend\\dashboard_verify.png");
              ws.close();
              chrome.kill();
              process.exit(0);
            }
          });
        }, 5000);

      } catch (err) {
        console.error("Error:", err.message);
        chrome.kill();
        process.exit(1);
      }
    });
  });
}, 2000);

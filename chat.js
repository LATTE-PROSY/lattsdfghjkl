(function(){
const statusEl = document.getElementById('status');
const messagesEl = document.getElementById('messages');
const nameEl = document.getElementById('name');
const textEl = document.getElementById('text');

let ws = null;
let username = 'Guest' + Math.floor(Math.random()*9999);

function log(msg){
  const d = document.createElement('div');
  d.className = 'msg';
  d.innerText = msg;
  messagesEl.appendChild(d);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

document.getElementById('connect').addEventListener('click', ()=>{
  username = nameEl.value || username;
  ws = new WebSocket('wss://ws.postman-echo.com/raw');

  ws.addEventListener('open', ()=>{
    statusEl.innerText = 'connected';
    log(`Connected as ${username}`);
  });

  ws.addEventListener('message', ev=>{
    // Echo server sends back your own message
    log(`Echo: ${ev.data}`);
  });

  ws.addEventListener('close', ()=>{
    statusEl.innerText = 'disconnected';
    log('Disconnected from server.');
  });

  ws.addEventListener('error', err=>{
    statusEl.innerText = 'error';
    console.error('WebSocket error:', err);
    log('Error: ' + (err.message || 'unknown'));
  });
});

document.getElementById('send').addEventListener('click', ()=>{
  const text = textEl.value.trim();
  if(!text || !ws || ws.readyState !== WebSocket.OPEN) return;
  ws.send(`${username}: ${text}`);
  textEl.value = '';
});
})();

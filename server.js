const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve frontend files
app.use(express.static(__dirname));

// Rooms storage
const rooms = new Map();
function ensureRoom(name){
  if(!rooms.has(name)) rooms.set(name,{clients:new Set()});
  return rooms.get(name);
}

// Broadcast to all in a room
function broadcast(roomName, data){
  const room=rooms.get(roomName);
  if(!room) return;
  const str=JSON.stringify(data);
  for(const c of room.clients) if(c.readyState===WebSocket.OPEN) c.send(str);
}

wss.on('connection', ws=>{
  ws.id = crypto.randomBytes(8).toString('hex');
  ws.room = null;
  ws.username = 'Anonymous';

  ws.on('message', msg=>{
    let data;
    try{data=JSON.parse(msg);}catch{return;}
    if(data.type==='join'){
      // leave previous room
      if(ws.room){
        const prev=rooms.get(ws.room);
        if(prev){prev.clients.delete(ws); broadcast(ws.room,{type:'presence', users:[...prev.clients].map(c=>({id:c.id, username:c.username}))});}
      }
      ws.room = data.room || 'global';
      ws.username = data.username || ws.username;
      const room=ensureRoom(ws.room);
      room.clients.add(ws);
      broadcast(ws.room,{type:'presence', users:[...room.clients].map(c=>({id:c.id, username:c.username}))});
    } else if(data.type==='message'){
      if(!ws.room) return;
      broadcast(ws.room,{type:'message', username:ws.username, text:data.text});
    }
  });

  ws.on('close', ()=>{
    if(ws.room){
      const room=rooms.get(ws.room);
      if(room){room.clients.delete(ws); broadcast(ws.room,{type:'presence', users:[...room.clients].map(c=>({id:c.id, username:c.username}))});}
    }
  });
});

// Ping alive clients
setInterval(()=>{ wss.clients.forEach(ws=>{ if(ws.readyState===WebSocket.OPEN) ws.ping(); }); },30000);

server.listen(3000,()=>console.log('Server running on port 3000'));

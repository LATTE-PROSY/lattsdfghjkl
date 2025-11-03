// shared.js — allows pages to talk via BroadcastChannel
const Shared={
  channel:new BroadcastChannel('marcus_os_channel'),
  sendCommand(data){ this.channel.postMessage(data); },
  onCommand(fn){ this.channel.onmessage=(e)=>fn(e.data); }
};

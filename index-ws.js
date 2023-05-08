const express = require('express');
const server = require('http').createServer();
const app = express();

app.get('/', function(req, res) {
  res.sendFile('index.html', { root: __dirname });
});

server.on('request', app);
server.listen(3000, function(){
  console.log('server started on port 3000');
});

/** Begin websocket */
const WebSocketServer = require('ws').Server;

const wss = new WebSocketServer({ server: server }); 

wss.on('connection', function connection(ws) {
  const numClients = wss.clients.size;
  console.log('Client connected', numClients);

  wss.broadcast(`Current vistors: ${numClients}`, numClients);

  if (ws.readyState === ws.OPEN) {
    ws.send('Welcome to my server');
  }

  ws.on('close', function close() {
    wss.broadcast(`Current visitors: ${numClients}`, numClients)
  });
});

wss.broadcast = function b(data) {
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
} 

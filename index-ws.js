const express = require('express');
const server = require('http').createServer();
const app = express();
const sqlite = require('sqlite3');
const db = new sqlite.Database(':memory:');

app.get('/', function(req, res) {
  res.sendFile('index.html', { root: __dirname });
});

server.on('request', app);
server.listen(3000, function(){
  console.log('server started on port 3000');
});

process.on('SIGINT', () => {
  wss.clients.forEach(client => client.close());
  server.close(() => {
    shutdownDB();
  });
});

/** begin websockets */
const WebSocketServer = require('ws').Server;

const wss = new WebSocketServer({ server: server }); 

wss.on('connection', function connection(ws) {
  const numClients = wss.clients.size;
  console.log('Client connected', numClients);

  wss.broadcast(`Current visitors: ${numClients}`, numClients);

  if (ws.readyState === ws.OPEN) { 
    ws.send('Welcome to my server');
  }

  db.run(`INSERT INTO visitors (count, time)
          VALUES (${numClients}, datetime('now'))
  `);

  ws.on('close', function close() {
    wss.broadcast(`Current visitors: ${numClients}`, numClients)
  });
});

wss.broadcast = function b(data) {
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
} 

/** end websockets */
/** begin database */

db.serialize(() => {
  db.run(`
    CREATE TABLE visitors (
      count INTEGER,
      time TEXT
    )
  `)
});

function getCounts() {
  db.each('SELECT * FROM visitors', (err, row) => {
    console.log(row);
  });
}

function shutdownDB() {
  getCounts();
  console.log('Shutting down db');
  db.close();
}
/** end database */

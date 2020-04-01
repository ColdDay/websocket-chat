const http = require('http');
const WebSocket = require('ws');
const url = require('url');
var fs = require("fs");

const server = http.createServer(function(request, response) {
    var file = fs.createReadStream(__dirname + '/index.html');
    response.writeHead(200, {'Content-Type' : 'text/html;charset=utf8'});
    file.pipe(response);
});

const wss = new WebSocket.Server({ noServer: true });
wss.on('connection', function connection(ws, req) {
  console.log(333)
  var ip = ws._socket.remoteAddress;
  let mes = getPackageData(ip + '进入房间', 2)
  sendAll(mes);
  
  ws.on('message', function incoming(data) {
    let mes = getPackageData(data, 1)
    sendAll(mes)
  });
  
  function sendAll(mes) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(mes);
      }
    });
  }

  // 获取当前连接数
  function getClientCount() {
    var count = 0;
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        count++;
      }
    });
    return count;
  }

  // 获取组装后的数据
  function getPackageData(text, type) {
    var count = getClientCount()
    var data = {
      ip,
      type,  // 消息类型，1普通消息
      text,
      count
    }
    return JSON.stringify(data)
  }

});

server.on('upgrade', function upgrade(request, socket, head) {
  const pathname = url.parse(request.url).pathname;
  if (pathname === '/ws') {
    console.log(111)
    wss.handleUpgrade(request, socket, head, function done(ws) {
        wss.emit('connection', ws, request);
    });
  } else {
    console.log(222)
    socket.destroy();
  }
});

server.listen(80);
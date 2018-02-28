var redis = require("redis")
  , subscriber = redis.createClient(6379, "redis_db")
  , publisher = redis.createClient(6379, "redis_db")
  , express = require("express")
  , app = express()
  , path = require("path")
  , http = require('http').Server(app)
  , io = require('socket.io')(http);

console.log("hi man")

io.on('connection', function(socket){
  client = socket.client
  clientId = socket.client.conn.id
  publisher.hset('people', clientId, "client");  
  socket.on('chat message', function(msg){
    publisher.publish("font:messages", msg);
    io.emit('chat message', msg);
    console.log('message: ' + msg);
    socket.send("PRVT " + socket.client.conn.id)
  });


});

publisher.publish("front:log", "hi");

app.get('/', function (req, res, next) {
  try {
    res.sendFile(path.join(__dirname + '/web/index.html'));
  } catch (e) {
    next(e)
  }
})

app.post('/', function (req, res, next) {
  try {
    console.log(req);
    res.send("ok");
  } catch (e) {
    next(e)
  }
})

app.use(function (req, res, next) {
  var filename = path.basename(req.url);
  var extension = path.extname(filename);
  console.log(filename);
  next();
});


app.use('/public', express.static('/shared'))
app.use('/', express.static(path.join(__dirname, 'web')))
app.use('/vendor', express.static(path.join(__dirname, 'vendor')))

http.listen(process.env.PORT || 8080, function () {
  console.log('Listening on http://localhost:' + (process.env.PORT || 8080))
})
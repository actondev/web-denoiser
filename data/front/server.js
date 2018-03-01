var redis = require("redis")
  , subscriber = redis.createClient(6379, "redis_db")
  , publisher = redis.createClient(6379, "redis_db")
  // path operations (path.join)
  , path = require("path")
  // connectivity 
  , express = require("express")
  , app = express()
  , http = require('http').Server(app)
  , io = require('socket.io')(http)
  // handling multipart forms
  , multer = require('multer')
  , crypto = require('crypto')
  , mime = require('mime')
  , uuidv1 = require('uuid/v1')
  ;

// our subscriptions
subscriber.subscribe("audiowaveform:done");
// our sends
const FRONT_AUDIOWAVEFORM_DONE = "front:audiowaveform-done";

var clientSockets = [];
var refClients = [];

subscriber.on("message", function (channel, message) {
  console.log("Message '" + message + "' on channel '" + channel + "' arrived!")
  var msg = JSON.parse(message);

  var clientId = refClients[msg.ref];
  console.log("time to inform " + clientId);
  var socket = clientSockets[clientId];
  socket.emit(FRONT_AUDIOWAVEFORM_DONE, message);
  socket.send("got it?")
});


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/shared/')
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype));
    });
  }
});



io.on('connection', function (socket) {
  var client = socket.client
  var clientId = socket.client.conn.id
  clientSockets[clientId] = socket;
  publisher.hset('people', clientId, "client");
  socket.on('chat message', function (msg) {
    publisher.publish("font:messages", msg);
    io.emit('chat message', msg);
    console.log('message: ' + msg);
    socket.send("PRVT " + clientId)
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

app.post('/upload/:client', function (req, res) {
  var clientId = req.params.client;
  var socket = clientSockets[clientId];

  // var savedPath = req.file.path;
  console.log("uploaded from" + req.params.client);

  // var upload = multer({ storage : storage}).any();
  var upload = multer({ dest: '/shared/', storage: storage }).single('file');

  upload(req, res, function (err) {
    var temp = "";
    if (err) {
      console.log(err);
      return res.end("Error uploading file.");
    }
    console.log("file: " + req.file.path);

    var ref = uuidv1();
    refClients[ref] = clientId;
    var msg = {
      "ref": ref,
      "path": req.file.path
    }
    publisher.publish("front:file-uploaded", JSON.stringify(msg));

    res.end("File has been uploaded");
  });
})

app.use(function (req, res, next) {
  var filename = path.basename(req.url);
  var extension = path.extname(filename);
  console.log(filename);
  next();
});


app.use('/shared', express.static('/shared'))
app.use('/', express.static(path.join(__dirname, 'web')))
app.use('/vendor', express.static(path.join(__dirname, 'vendor')))

http.listen(process.env.PORT || 8080, function () {
  console.log('Listening on http://localhost:' + (process.env.PORT || 8080))
})
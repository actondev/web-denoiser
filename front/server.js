var
  // redis stuff
  redis = require("redis")
  , subscriber = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST)
  , publisher = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST)
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
  // uuid
  , uuidv1 = require('uuid/v1')
  ;
const ClientStore = require('./classes/ClientStore');

var clientStore = new ClientStore()

// our subscriptions
const SUB_AUDIOWAVEFORM_DONE = "audiowaveform:done";
const SUB_DENOISER_DONE = "denoiser:done";
const SUB_MICROSERVICE_LOG = "*:log";
const SUB_MICROSERVICE_LOG_REG = /[a-z]+:log/;
// our redis pubs
const PUB_WAVEFORM_ANALYIS_REQUEST = "front:waveform-analysis-request";
const PUB_DENOISE_REQUEST = "front:denoise-request";
const PUB_STATUS_CHECK = "front:status-check";
const PUB_LOG = "front:log";

// socket

// socket subs
const SOCKET_SUB_WEB_DENOISE = "web:denoise";

// socket pubs
const SOCKET_PUB_AUDIOWAVEFORM_DONE = "front:audiowaveform-done";
const SOCKET_PUB_DENOISE_DONE = "front:denoise-done";
// we also publish the *:log 
// --

subscriber.subscribe(SUB_AUDIOWAVEFORM_DONE);
subscriber.subscribe(SUB_DENOISER_DONE);
subscriber.psubscribe(SUB_MICROSERVICE_LOG);

publisher.publish(PUB_LOG, "hi from port" + process.env.PORT);

subscriber.on("message", function (channel, message) {
  if (channel == SUB_AUDIOWAVEFORM_DONE)
    onAudioWaveformDone(message)
  else if (channel == SUB_DENOISER_DONE)
    onDenoiserDone(message)

});

subscriber.on("pmessage", function (pattern, channel, message) {
  if (channel == PUB_LOG) {
    return;
  }
  if (channel.match(SUB_MICROSERVICE_LOG_REG)) {
    onMicroserviceLog(channel, message);
    // publisher.publish(PUB_LOG, "matched microservice log " + channel);
  }
  else {
    publisher.publish(PUB_LOG, "no match for " + channel);
  }
});

var onMicroserviceLog = function (channel, message) {
  var msg;
  try {
    msg = JSON.parse(message);
  } catch (exception) {
    return;
  }
  let ref = msg.ref;
  console.log("will search client for ref ", ref);

  clientId = clientStore.getClientIdByRef(ref);
  var socket = getSocketById(clientId);
  if (!socket) {
    return;
  }
  socket.emit(channel, JSON.stringify(msg));
}

var onAudioWaveformDone = function (message) {
  console.log("here on Audiowaveform done " + message)
  var msg = JSON.parse(message);
  var clientId = clientStore.getClientIdByRef(msg.ref);
  console.log("client id " + clientId)
  var socket = getSocketById(clientId);
  if (!socket) {
    return;
  }
  socket.emit("waveform on your way")

  socket.emit(SOCKET_PUB_AUDIOWAVEFORM_DONE, JSON.stringify(msg));
}

var onDenoiserDone = function (message) {
  console.log("onDenoiserDone")
  var msg = JSON.parse(message);
  var clientId = clientStore.getClientIdByRef(msg.ref);
  var socket = getSocketById(clientId);

  socket.emit("denoised on your way")
  socket.emit(SOCKET_PUB_DENOISE_DONE, message);

  msg.ref = clientStore.attachRefToClient(clientId, { 'type': 'denoised' });

  publisher.publish(PUB_WAVEFORM_ANALYIS_REQUEST, JSON.stringify(msg));
}


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

function getSocketById(id) {
  return io.sockets.sockets[id];
}

io.on('connection', function (socket) {
  var client = socket.client;
  var clientId = socket.client.conn.id
  clientStore.addClient(clientId);
  var ref = clientStore.attachRefToClient(clientId);
  var msg = {
    "ref": ref
  };
  publisher.publish(PUB_STATUS_CHECK, JSON.stringify(msg));

  publisher.hset('people', clientId, "client");
  socket.on('chat message', function (msg) {
    publisher.publish("font:messages", msg);
    io.emit('chat message', msg);
    console.log('message: ' + msg);
    socket.send("PRVT " + clientId)
  });

  socket.on(SOCKET_SUB_WEB_DENOISE, function (msg) {
    let msgJson = JSON.parse(msg);
    console.log("on " + SOCKET_SUB_WEB_DENOISE, msgJson);


    var audioPath = clientStore.getAudioPathForClient(clientId);
    console.log("outside msg ", msgJson);
    var ref = clientStore.attachRefToClient(clientId);
    var msg = {
      "ref": ref,
      "path": audioPath,
      "params": msgJson.params,
    }
    console.log("msg", msg)

    publisher.publish(PUB_DENOISE_REQUEST, JSON.stringify(msg));
  })

});

app.get('/', function (req, res, next) {
  try {
    res.sendFile(path.join(__dirname + '/web/index.html'));
  } catch (e) {
    next(e)
  }
})

app.post('/upload/:client', function (req, res) {
  var clientId = req.params.client;
  var socket = getSocketById(clientId);

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
    var path = req.file.path;
    var ref = clientStore.attachRefToClient(clientId, { 'type': 'original' });
    clientStore.setAudioPathForClient(clientId, path);
    var msg = {
      "ref": ref,
      "path": path
    };

    publisher.publish(PUB_WAVEFORM_ANALYIS_REQUEST, JSON.stringify(msg));

    var response = {
      "ref": ref,
      "message": "File uploaded",
      "path": path
    }
    res.json(response);
  });
})

app.use(function (req, res, next) {
  var filename = path.basename(req.url);
  var extension = path.extname(filename);
  console.log(filename);
  next();
});

if (process.env.NODE_ENV == 'development') {
  console.log("development environment: hot reloading")
  var webpack = require('webpack');
  var webpackConfig = require('./webpack.config');
  webpackConfig.mode = "development";
  var compiler = webpack(webpackConfig);
  compiler.mode = "development";

  app.use(require("webpack-dev-middleware")(compiler, {
    noInfo: true, publicPath: webpackConfig.output.publicPath,
    watchOptions: {
      poll: true,
      aggregateTimeout: 100,
    }
  }));

  app.use(require("webpack-hot-middleware")(compiler, {
    path: "/__hot",
  }));
}


app.use('/shared', express.static('/shared'))
app.use('/', express.static(path.join(__dirname, 'web')))
app.use('/dist', express.static(path.join(__dirname, 'dist')))
app.use('/vendor', express.static(path.join(__dirname, 'vendor')))

http.listen(process.env.PORT || 8080, function () {
  console.log('Listening on http://localhost:' + (process.env.PORT || 8080))
})
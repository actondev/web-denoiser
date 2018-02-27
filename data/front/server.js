var redis = require("redis")
  , subscriber = redis.createClient(6379, "redis_db")
  , publisher  = redis.createClient(6379, "redis_db")
  , express = require("express")
  , app = express()
  , path = require("path")


publisher.publish("front:log", "hi");

app.get('/', function (req, res, next) {
  try {
    res.sendFile(path.join(__dirname + '/web/index.html'));
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

app.listen(process.env.PORT || 8080, function () {
  console.log('Listening on http://localhost:' + (process.env.PORT || 8080))
})
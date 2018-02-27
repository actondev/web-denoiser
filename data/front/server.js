var redis = require("redis")
  , subscriber = redis.createClient(6379, "redis_db")
  , publisher  = redis.createClient(6379, "redis_db")
  , express = require("express")
  , app = express()


publisher.publish("front:log", "hi");

app.get('/', function (req, res, next) {
  try {
    res.send("hi")
  } catch (e) {
    next(e)
  }
})

app.listen(process.env.PORT || 8080, function () {
  console.log('Listening on http://localhost:' + (process.env.PORT || 8080))
})
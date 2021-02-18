const express = require('express') //익스프레스 모듈 로드
const app = express(); //익스프레스의 반환값(애플리케이션)을 app 에 저장
var fs = require('fs');

var bodyParser = require('body-parser');
var compression = require('compression');
var topicRouter = require('./routes/topic');
var indexRouter = require('./routes/index')

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression())
app.get('*', function (request, response, next) {
  fs.readdir('./data', function (error, filelist) {
    request.list = filelist;
    next();
  })
})

app.use('/topic',topicRouter); //topic으로 시작하는 주소들에게 topicRouter미들웨어를 적용하겠다.
app.use('/',indexRouter);

app.use(function (req, res, next) {
  res.status(404).send('Sorry cant find that!');
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

//app.listen(3000,()=>console.log('example app listening on port 3000'))
app.listen(3000, function () {
  return console.log('example app listening on port 3000');
})
const { response } = require('express');
const express = require('express') //익스프레스 모듈 로드
const app = express(); //익스프레스의 반환값(애플리케이션)을 app 에 저장
var fs = require('fs');
var qs = require('querystring');
var path = require('path'); //쿼리스트링을 통한 경로침입 방지를 위해 경로 분석 모듈
var sanitizeHtml = require('sanitize-html');
var template = require('./lib/template.js');//페이지 출력 템플릿 모듈
var bodyParser = require('body-parser');
var compression = require('compression');
var topicRouter = require('./routes/topic');

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

//app.get('/',(req,res)=>res.send('Hello world'))
app.get('/', function (request, response) {//get방식으로 입력된 주소를 라우팅

  var title = "welcome";
  var description = "main page";
  var list = template.List(request.list);
  var HTML = template.HTML(title, list,
    `<h2>${title}</h2>${description} 
    <img src=/images/hello.jpg style="width : 300px; display:block;margin-top:10px;">
    `,
    `<a href="/topic/create">creat</a>`);
  response.send(HTML);

})



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
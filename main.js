const { response } = require('express');
const express = require('express') //익스프레스 모듈 로드
const app = express(); //익스프레스의 반환값(애플리케이션)을 app 에 저장
var fs = require('fs');
var qs = require('querystring');
var path = require('path') //쿼리스트링을 통한 경로침입 방지를 위해 경로 분석 모듈
var sanitizeHtml = require('sanitize-html')
var template = require('./lib/template.js')//페이지 출력 템플릿 모듈
var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }));


//app.get('/',(req,res)=>res.send('Hello world'))
app.get('/', function (request, response) {//get방식으로 입력된 주소를 라우팅
  fs.readdir('./data', function (error, filelist) {
    var title = "welcome";
    var description = "main page";
    var list = template.List(filelist);
    var HTML = template.HTML(title, list,
      `<h2>${title}</h2>${description}`,
      `<a href="/create">creat</a>`);
    response.send(HTML);
  })
})

app.get('/page/:pageId', function (request, response) { //라우팅 방식
  fs.readdir('./data', function (error, filelist) {
    var filteredID = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredID}`, 'utf8', function (err, description) {
      var title = request.params.pageId;
      var sanitizedTitle = sanitizeHtml(title);
      var sanitizedDescription = sanitizeHtml(description);
      var list = template.List(filelist);
      var HTML = template.HTML(sanitizedTitle, list,
        `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
        `<a href="/create">creat</a>
           <a href="/update/${sanitizedTitle}">update</a>
           <form action = "/delete_process" method="post" onsubmit="return confirm('정말로 삭제하시겠습니까?')">
            <input type="hidden" name="id" value=${sanitizedTitle}>
            <input type="submit" value="deleste">
           </form>`
      );
      response.send(HTML);
    });
  });
})
app.get('/create', (request, response) => {
  fs.readdir('./data', function (error, filelist) {
    var title = "WEB - create";
    var list = template.List(filelist);
    var HTML = template.HTML(title, list,
      `<form action="/create_process" method="post">
        <p><input type="text" name="title" placeholder="제목"></p>
        <p>
          <textarea name="description" placeholder="본문"></textarea>
        </p>
        <p><input type="submit"></p>
      </form>
        `, '');
    response.send(HTML);
  })
})
app.post('/create_process', (request, response) => {

  var post = request.body;
  var title = post.title;
  var description = post.description;
  var filteredID = path.parse(post.title).base;
  fs.writeFile(`data/${filteredID}`, description, 'utf8', function (err) {
    //에러 처리시의 내용을 넣어야 하는데 현재는 다루지 않는다
    response.redirect(`/page/${title}`);
  })
})

app.get('/update/:pageId', (request, response) => {
  fs.readdir('./data', function (error, filelist) {
    var filteredID = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredID}`, 'utf8', function (err, description) {
      var title = request.params.pageId;
      var list = template.List(filelist);
      //제목이 바뀔 경우를 대비하여 id로 제목값을 따로 저장
      //사용자와 상관없는 내용이므로 hidden을 이용하여 숨긴다.
      var HTML = template.HTML(title, list,
        `
       <form action="/update_process" method="post">
       <input type="hidden" name="id" value="${title}">
      <p><input type="text" name="title" placeholder="제목" value="${title}"></p>
      <p>
        <textarea name="description" placeholder="본문">${description}</textarea>
      </p>
      <p><input type="submit"></p>
    </form>`,
        `<a href="/create">creat</a> <a href="/update/${title}">update</a>`);
      response.send(HTML);
    });
  });
})
app.post('/update_process', (request, response) => {

  var post = request.body;
  var id = post.id;
  var title = post.title;
  var description = post.description;
  var filteredID = path.parse(post.id).base;
  //파일 이름 수정시 내용
  fs.rename(`data/${filteredID}`, `data/${title}`, function (error) {
    //위의 create에서의 기능과 같이 이름을 바꾸고 내용을 바꾼다.
    fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
      response.redirect(`/page/${title}`);
    })
  });
})

app.post('/delete_process', (request, response) => {

  var post = request.body;
  var id = post.id;
  var filteredID = path.parse(post.id).base;
  fs.unlink(`data/${filteredID}`, function (error) {
    response.redirect(`/`);
  })
})


//app.listen(3000,()=>console.log('example app listening on port 3000'))
app.listen(3000, function () {
  return console.log('example app listening on port 3000');
})

/*var http = require('http');//require는 '모듈'을 가져온다.
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js')//페이지 출력 템플릿 모듈
var path = require('path') //쿼리스트링을 통한 경로침입 방지를 위해 경로 분석 모듈
var sanitizeHtml = require('sanitize-html')

//서버를 생성하고 내용을 표현한다.
var app = http.createServer(function (request, response) {
  var _url = request.url;//_url에 사용자가 접속한 링크를 가져온다.
  var queryData = url.parse(_url, true).query;//쿼리스트링만 따로 떼어온다
  var pathname = url.parse(_url, true).pathname;//경로만 따로 떼어온다.

  else if (pathname == '/delete_process') {//문서 삭제 및 리다이렉션

  }
  else {//잘못된 페이지인 경우
    response.writeHead(404);
    response.end('Not found');
  }


});
app.listen(3000);*/
var http = require('http');//require는 '모듈'을 가져온다.
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js')//페이지 출력 템플릿 모듈
var db = require('./lib/db.js');
var topic = require('./lib/topic.js')


//서버를 생성하고 내용을 표현한다.
var app = http.createServer(function (request, response) {
  var _url = request.url;//_url에 사용자가 접속한 링크를 가져온다.
  var queryData = url.parse(_url, true).query;//쿼리스트링만 따로 떼어온다
  var pathname = url.parse(_url, true).pathname;//경로만 따로 떼어온다.
  if (pathname == '/')//루트라면, 경로가 /로 끝나거나(/없이 끝나거나) 쿼리스트링이 있는 경우라면
  {
    if (queryData.id == undefined)//main페이지라면
    {
      topic.home(request,response);
    }
    else {//하위 페이지 생성, 쿼리스트링이 있는 경우

      topic.page(request,response);
    }
  }
  else if (pathname == '/create') {//문서추가, 추가 경로 존재 시
    topic.create(request,response);
  }
  else if (pathname == '/create_process') {//추가된문서 파일 저장 및 리다이렉션
    topic.create_process(request,response);
  }
  else if (pathname == '/update') {//하위 페이지인 업데이트 페이지
    db.query(`select * from topic`, function (err, topics) {
      if (err) {
        throw err;
      }
      db.query('select * from topic where id = ?', [queryData.id], function (err2, topic) {
        if (err2) {
          throw err2;
        }
        var list = template.List(topics);
        //제목이 바뀔 경우를 대비하여 id로 제목값을 따로 저장
        //사용자와 상관없는 내용이므로 hidden을 이용하여 숨긴다.
        var HTML = template.HTML(topic[0].title, list,
          `
         <form action="/update_process" method="post">
         <input type="hidden" name="id" value="${topic[0].id}">
        <p><input type="text" name="title" placeholder="제목" value="${topic[0].title}"></p>
        <p>
          <textarea name="description" placeholder="본문">${topic[0].description}</textarea>
        </p>
        <p><input type="submit"></p>
      </form>`,
          `<a href="/create">creat</a> <a href="/update?id=${topic[0].id}">update</a>`);
        response.writeHead(200);
        response.end(HTML);
      });
    });
  }
  else if (pathname == '/update_process') {//수정된문서 파일 저장 및 리다이렉션
    var body = '';
    request.on('data', function (data) {
      body += data;

    });
    request.on('end', function () {
      var post = qs.parse(body);

      db.query(`update topic set title = ?,description = ?, author_id = 1 where id = ?`, [post.title, post.description, post.id], function (err2, topic) {
        if (err2) {
          throw err2;
        }
        response.writeHead(302, { Location: `/?id=${post.id}` });
        response.end();
      });

    });
  }
  else if (pathname == '/delete_process') {//문서 삭제 및 리다이렉션
    var body = '';
    request.on('data', function (data) {
      body += data;

    });
    request.on('end', function () {
      var post = qs.parse(body);
      db.query('delete from topic where id = ?', [post.id], function (err, topics) {
        if (err) {
          throw err;
        }
        response.writeHead(302, { Location: `/` });
        response.end();
      });
    });
  }
  else {//잘못된 페이지인 경우
    response.writeHead(404);
    response.end('Not found');
  }


});
app.listen(3000);
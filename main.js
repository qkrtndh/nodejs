var http = require('http');//require는 '모듈'을 가져온다.
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js')//페이지 출력 템플릿 모듈
var path = require('path') //쿼리스트링을 통한 경로침입 방지를 위해 경로 분석 모듈
var sanitizeHtml = require('sanitize-html')
var mysql = require('mysql');//mysql모듈 불러옴
const { DH_UNABLE_TO_CHECK_GENERATOR } = require('constants');
var db = mysql.createConnection({//접속을 위한데이터를 객체로.
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'opentutorials'
});
db.connect();//접속

//서버를 생성하고 내용을 표현한다.
var app = http.createServer(function (request, response) {
  var _url = request.url;//_url에 사용자가 접속한 링크를 가져온다.
  var queryData = url.parse(_url, true).query;//쿼리스트링만 따로 떼어온다
  var pathname = url.parse(_url, true).pathname;//경로만 따로 떼어온다.
  if (pathname == '/')//루트라면, 경로가 /로 끝나거나(/없이 끝나거나) 쿼리스트링이 있는 경우라면
  {
    if (queryData.id == undefined)//main페이지라면
    {
      db.query('select * from topic', function (err, topics) {
        //console.log(topics);
        var title = "welcome";
        var description = "main page";
        var list = template.List(topics);
        var HTML = template.HTML(title, list,
          `<h2>${title}</h2>${description}`,
          `<a href="/create">creat</a>`);

        response.writeHead(200);
        response.end(HTML);
      });
    }
    else {//하위 페이지 생성, 쿼리스트링이 있는 경우

      db.query('select * from topic', function (err, topics) {//먼저 topic을 전체 불러오고
        if (err) {
          throw err;//throw하면 다음 명령어를 수행하지 않고 즉시 종료
        }

        //이후에 topic중에서 id에따라 추려낸다.
        db.query(`select * from topic where id=?`, [queryData.id], function (err2, topic) {
          if (err2) {
            throw err2;
          }
          var title = topic[0].title;
          var description = topic[0].description;
          var list = template.List(topics);
          var HTML = template.HTML(title, list,
            `<h2>${title}</h2>${description}`,
            `<a href="/create">creat</a>
             <a href="/update?id=${queryData.id}">update</a>
             <form action = "/delete_process" method="post" onsubmit="return confirm('정말로 삭제하시겠습니까?')">
              <input type="hidden" name="id" value=${queryData.id}>
              <input type="submit" value="delete">
             </form>`
          );
          response.writeHead(200);
          response.end(HTML);
        });
      });
    }
  }
  else if (pathname == '/create') {//문서추가, 추가 경로 존재 시
    db.query('select * from topic', function (err, topics) {
      if (err) {
        throw err;
      }
      var title = "WEB - create";
      var list = template.List(topics);
      var HTML = template.HTML(title, list,
        `<form action="/create_process" method="post">
        <p><input type="text" name="title" placeholder="제목"></p>
        <p>
          <textarea name="description" placeholder="본문"></textarea>
        </p>
        <p><input type="submit"></p>
      </form>
        `, `<a href="/create">create</a>`);
      response.writeHead(200);
      response.end(HTML);
    });
  }
  else if (pathname == '/create_process') {//추가된문서 파일 저장 및 리다이렉션
    var body = '';
    request.on('data', function (data) {
      body += data;
    });
    request.on('end', function () {
      var post = qs.parse(body);
      db.query(`
        insert into topic (title,description,created,author_id) 
          values(?,?,now(),?)`,//id는 자동으로 삽입되므로 생략, 제목, 설명 저자 아이디는 입력값이므로 현제로선 모르므로 와일드카드 ?처리
        [post.title, post.description, 1],//읽어들인 값을 배열로 다음 자리에 두면 자동으로 인식. 저자아이디는 임의 삽입 하였음.
        function (err, result) {
          if (err) {
            throw err;
          }
          response.writeHead(302, { Location: `/?id=${result.insertId}` });//자동입력될 id는 현제 모르므로 
          //삽입된 데이터의 id를 알아내기 위해 result.insertId를 사용한다
          response.end();
        })
    });
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
      db.query('delete from topic where id = ?',[post.id],function(err,topics){
        if(err)
        {
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
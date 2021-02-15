var http = require('http');//require는 '모듈'을 가져온다.
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
  if (pathname == '/')//루트라면, 경로가 /로 끝나거나(/없이 끝나거나) 쿼리스트링이 있는 경우라면
  {
    if (queryData.id == undefined)//main페이지라면
    {
      fs.readdir('./data', function (error, filelist) {
        var title = "welcome";
        var description = "main page";
        var list = template.List(filelist);
        var HTML = template.HTML(title, list,
          `<h2>${title}</h2>${description}`,
          `<a href="/create">creat</a>`);
        response.writeHead(200);
        response.end(HTML);
      })
    }
    else {//하위 페이지 생성, 쿼리스트링이 있는 경우
      fs.readdir('./data', function (error, filelist) {
        var filteredID = path.parse(queryData.id).base;
        fs.readFile(`data/${filteredID}`, 'utf8', function (err, description) {
          var title = queryData.id;
          var sanitizedTitle = sanitizeHtml(title);
          var sanitizedDescription = sanitizeHtml(description);
          var list = template.List(filelist);
          var HTML = template.HTML(sanitizedTitle, list,
            `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
            `<a href="/create">creat</a>
             <a href="/update?id=${sanitizedTitle}">update</a>
             <form action = "/delete_process" method="post" onsubmit="return confirm('정말로 삭제하시겠습니까?')">
              <input type="hidden" name="id" value=${sanitizedTitle}>
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
      response.writeHead(200);
      response.end(HTML);
    })
  }
  else if (pathname == '/create_process') {//추가된문서 파일 저장 및 리다이렉션
    var body = '';
    request.on('data', function (data) {
      body += data;

    });
    request.on('end', function () {
      var post = qs.parse(body);
      var title = post.title;
      var description = post.description;
      var filteredID = path.parse(post.title).base;
      fs.writeFile(`data/${filteredID}`, description, 'utf8', function (err) {
        /*에러 처리시의 내용을 넣어야 하는데 현재는 다루지 않는다*/
        response.writeHead(302, { Location: `/?id=${title}` });
        response.end();

      })
    });

  }
  else if (pathname == '/update') {//하위 페이지인 업데이트 페이지
    fs.readdir('./data', function (error, filelist) {
      var filteredID = path.parse(queryData.id).base;
      fs.readFile(`data/${filteredID}`, 'utf8', function (err, description) {
        var title = queryData.id;
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
          `<a href="/create">creat</a> <a href="/update?id=${title}">update</a>`);
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
      var id = post.id;
      var title = post.title;
      var description = post.description;
      var filteredID = path.parse(post.id).base;
      //파일 이름 수정시 내용
      fs.rename(`data/${filteredID}`, `data/${title}`, function (error) {
        //위의 create에서의 기능과 같이 이름을 바꾸고 내용을 바꾼다.
        fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
          response.writeHead(302, { Location: `/?id=${title}` });
          response.end();

        })
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
      var id = post.id;
      var filteredID = path.parse(post.id).base;
      fs.unlink(`data/${filteredID}`, function (error) {
        response.writeHead(302, { Location: `/` });
        response.end();
      })

    });
  }
  else {//잘못된 페이지인 경우
    response.writeHead(404);
    response.end('Not found');
  }


});
app.listen(3000);
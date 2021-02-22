var http = require('http');//require는 '모듈'을 가져온다.
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');//페이지 출력 템플릿 모듈
var path = require('path') //쿼리스트링을 통한 경로침입 방지를 위해 경로 분석 모듈
var sanitizeHtml = require('sanitize-html');
var cookie = require('cookie');

function authIsOwner(request, response) {
  var isOwner = false;
  var cookies = {};
  if (request.headers.cookie) {
    cookies = cookie.parse(request.headers.cookie);
  }
  if (cookies.email == '1234' && cookies.password == '1234') {
    isOwner = true;
  }
  return isOwner;
}

function authStatusUI(request, response) {
  var authStatusUI = `<a href="/login">login</a>`;
  if (authIsOwner(request, response)) {
    authStatusUI = `<a href="/logout_process">logout</a>`;
  }
  return authStatusUI;
}

//서버를 생성하고 내용을 표현한다.
var app = http.createServer(function (request, response) {
  var _url = request.url;//_url에 사용자가 접속한 링크를 가져온다.
  var queryData = url.parse(_url, true).query;//쿼리스트링만 따로 떼어온다
  var pathname = url.parse(_url, true).pathname;//경로만 따로 떼어온다.
  var isOwner = authIsOwner(request, response);
  console.log(isOwner);
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
          `<a href="/create">creat</a>`, authStatusUI(request, response));
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
             </form>`, authStatusUI(request, response)
          );
          response.writeHead(200);
          response.end(HTML);
        });
      });
    }
  }
  else if (pathname == '/create') {//문서추가, 추가 경로 존재 시
    if (authIsOwner(request, response) == false) {
      response.writeHead(302, { Location: `/login` });
      response.end();
      /*response.end('need login');
      return false;*/
    }
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
        `, '', authStatusUI(request, response));
      response.writeHead(200);
      response.end(HTML);
    })
  }
  else if (pathname == '/create_process') {//추가된문서 파일 저장 및 리다이렉션
    if (authIsOwner(request, response) == false) {
      response.writeHead(302, { Location: `/login` });
      response.end();
      /*response.end('need login');
      return false;*/
    }
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
    if (authIsOwner(request, response) == false) {
      response.writeHead(302, { Location: `/login` });
      response.end();
      /*response.end('need login');
      return false;*/
    }
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
          `<a href="/create">creat</a> <a href="/update?id=${title}">update</a>`,
          authStatusUI(request, response));
        response.writeHead(200);
        response.end(HTML);
      });
    });
  }
  else if (pathname == '/update_process') {//수정된문서 파일 저장 및 리다이렉션
    if (authIsOwner(request, response) == false) {
      response.writeHead(302, { Location: `/login` });
      response.end();
      /*response.end('need login');
      return false;*/
    }
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
    if (authIsOwner(request, response) == false) {
      response.writeHead(302, { Location: `/login` });
      response.end();
      return false;
      /*response.end('need login');
      return false;*/
    }
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
  else if (pathname == '/login') {
    fs.readdir('./data', function (error, filelist) {
      var title = "Login";
      var list = template.List(filelist);
      var HTML = template.HTML(title, list,
        `<form action = 'login_process' method = 'post'>
        <p><input type = 'text' name = 'email' placeholder='plz insert email'></p>
        <p><input type = 'password' name = 'password' placeholder='plz insert p/w'></p>
        <p><input type = 'submit'></p>
        </form>`,
        `<a href="/create">creat</a>`);
      response.writeHead(200);
      response.end(HTML);
    })
  }
  else if (pathname == '/login_process') {
    var body = '';
    request.on('data', function (data) {
      body += data;
    });
    request.on('end', function () {
      var post = qs.parse(body);
      if (post.email == '1234' && post.password == '1234') {
        response.writeHead(302, {
          'Set-Cookie': [
            `email=${post.email}`,
            `password=${post.password}`,
            `nickname=testemail`
          ],
          Location: `/`
        });
        response.end();
      }
      else {

        response.end("who?");
      }

    });

  }
  else if (pathname == '/logout_process') {
    var body = '';
    request.on('data', function (data) {
      body += data;
    });
    request.on('end', function () {
      var post = qs.parse(body);
      response.writeHead(302, {
        'Set-Cookie': [
          `email= Max-Age=0`,
          `password=Max-Age=0`,
          `nickname=Max-Age=0`
        ],
        Location: `/`
      });
      response.end();
    });
  }
  else {//잘못된 페이지인 경우
    response.writeHead(404);
    response.end('Not found');
  }


});
app.listen(3000);
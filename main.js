var http = require('http');//require는 '모듈'을 가져온다.
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

var template = {
  //html템플릿
  //함수를 통해 공통의 서식을 만들고 nodejs를 통해 동적으로 내용이 바뀌게 한 뒤
  //html 내용을 return한다.
  HTML:function (title, list, body, controll) {
    return `
  <!doctype html>
  <html>
    <head>
     <title>WEB1 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">WEB</a></h1>
       ${list}
       ${controll}
       ${body}
    </body>
   </html>
  `;
},

//목록 생성 템플릿
//각 html페이지마다 공통으로 나타나는 리스트를 파일을 읽어들여
//마찬가지로 html본문에 삽입할 수 있는 내용을 반환시킨다.
List:function (filelist) {
  var list = '<ol>';
  var i = 0;
  while (i < filelist.length) {
    list += `<li><a href='/?id=${filelist[i]}'>${filelist[i]}</a></li>`;
    i += 1;
  }
  list = list + '</ol>';
  return list;
}

}
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
        fs.readFile(`data/${queryData.id}`, 'utf8', function (err, description) {
          var title = queryData.id;
          var list = template.List(filelist);
          var HTML = template.HTML(title, list,
            `<h2>${title}</h2>${description}`,
            `<a href="/create">creat</a>
             <a href="/update?id=${title}">update</a>
             <form action = "/delete_process" method="post" onsubmit="return confirm('정말로 삭제하시겠습니까?')">
              <input type="hidden" name="id" value=${title}>
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
      fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
        /*에러 처리시의 내용을 넣어야 하는데 현재는 다루지 않는다*/
        response.writeHead(302, { Location: `/?id=${title}` });
        response.end();

      })
    });

  }
  else if (pathname == '/update') {//하위 페이지인 업데이트 페이지
    fs.readdir('./data', function (error, filelist) {
      fs.readFile(`data/${queryData.id}`, 'utf8', function (err, description) {
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
      //파일 이름 수정시 내용
      fs.rename(`data/${id}`, `data/${title}`, function (error) {
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
      fs.unlink(`data/${id}`, function (error) {
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
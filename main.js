var http = require('http');
var fs = require('fs');
var url = require('url');
function templateHTML(title, list, body) {
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
       <a href="/create">creat</a>
       ${body}
    </body>
   </html>
  `
    ;
}
function templateList(filelist) {
  var list = '<ol>';
  var i = 0;
  while (i < filelist.length) {
    list += `<li><a href='/?id=${filelist[i]}'>${filelist[i]}</a></li>`;
    i += 1;
  }
  list = list + '</ol>';
  return list;
}
var app = http.createServer(function (request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  if (pathname == '/')//루트라면
  {
    if (queryData.id == undefined)//main페이지라면
    {
      fs.readdir('./data', function (error, filelist) {
        var title = "welcome";
        var description = "main page";
        var list = templateList(filelist);
        var template = templateHTML(title, list, `<h2>${title}</h2>${description}`);
        response.writeHead(200);
        response.end(template);
      })
    }
    else {
      fs.readdir('./data', function (error, filelist) {
        fs.readFile(`data/${queryData.id}`, 'utf8', function (err, description) {
          var title = queryData.id;
          var list = templateList(filelist);
          var template = templateHTML(title, list, `<h2>${title}</h2>${description}`);
          response.writeHead(200);
          response.end(template);
        });
      });
    }
  }
  else if (pathname == '/create') {
    fs.readdir('./data', function (error, filelist) {
      var title = "WEB - create";
      var list = templateList(filelist);
      var template = templateHTML(title, list, 
        `<form action="http://localhost:3000/process_create" method="post">
        <p><input type="text" name="title" placeholder="제목"></p>
        <p>
          <textarea name="description" placeholder="본문"></textarea>
        </p>
        <p><input type="submit"></p>
      </form>
        `);
      response.writeHead(200);
      response.end(template);
    })
  }
  else {
    response.writeHead(404);
    response.end('Not found');
  }


});
app.listen(3000);
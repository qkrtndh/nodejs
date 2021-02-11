var http = require('http');
var fs = require('fs');
var url = require('url');

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
        var list = '<ol>';
        var i = 0;
        while (i < filelist.length) {
          list += `<li><a href='/?id=${filelist[i]}'>${filelist[i]}</a></li>`;
          i += 1;
        }
        list = list + '</ol>';
        var template = `
            <!doctype html>
        <html>
        <head>
          <title>WEB1 - ${title}</title>
          <meta charset="utf-8">
        </head>
        <body>
          <h1><a href="/">WEB</a></h1>
          ${list}
          <h2>${title}</h2>
          
          <p>${description}</p>
        </body>
        </html>
            `;
        response.writeHead(200);
        response.end(template);
      })
    }
    else {
      fs.readdir('./data', function (error, filelist) {
        var list = '<ol>';
        var i = 0;
        while (i < filelist.length) {
          list += `<li><a href='/?id=${filelist[i]}'>${filelist[i]}</a></li>`;
          i += 1;
        }
        list = list + '</ol>';
        fs.readFile(`data/${queryData.id}`, 'utf8', function (err, description) {
          var title = queryData.id;
          var template = `
        <!doctype html>
        <html>
          <head>
           <title>WEB1 - ${title}</title>
            <meta charset="utf-8">
          </head>
          <body>
            <h1><a href="/">WEB</a></h1>
             ${list}
            <h2>${title}</h2>
      
            <p>${description}</p>
          </body>
         </html>
        `;
          response.writeHead(200);
          response.end(template);
        });
      });
    }
  }
  else {
    response.writeHead(404);
    response.end('Not found');
  }


});
app.listen(3000);
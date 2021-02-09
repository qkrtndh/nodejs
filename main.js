var http = require('http');
var fs = require('fs');
var url = require('url');

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData=url.parse(_url,true).query;
    console.log(queryData.id);
    if(_url == '/'){
      _url = '/index.html';
    }
    if(_url == '/favicon.ico'){
        response.writeHead(404);
        response.end();
        return;
    }
    response.writeHead(200);
    
    //response.end(fs.readFileSync(__dirname + _url)); 
    // 사용자가 접속한 url에 따라서 파일들을 읽어주는 코드

    response.end(queryData.id); 
 
});
app.listen(3000);
var http = require('http');
var cookie = require('cookie');

http.createServer((request, response) => {
    var cookies = {};//조건문 안에서 만들면 밖에서 못쓰므로 미리 만듬
    if(request.headers.cookie!=undefined)
    {
        cookies=cookie.parse(request.headers.cookie);
    }
    console.log(cookies.yummy_cookie);
    response.writeHead(200,{'Set-cookie':['yummy_cookie=choco','tasty_cookie=strawbarry']});
    response.end('cookie');
}).listen(3000);
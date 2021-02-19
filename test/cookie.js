var http = require('http');
http.createServer((request, response) => {
    //response.writeHead(200,{'Set-cookie':['yummy_cookie=choco','tasty_cookie=strawbarry']});
    response.end('cookie');
}).listen(3000);
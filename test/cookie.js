var http = require('http');
var cookie = require('cookie');

http.createServer((request, response) => {
    var cookies = {};//조건문 안에서 만들면 밖에서 못쓰므로 미리 만듬
    if(request.headers.cookie!=undefined)//parse가 undifined를 수용못해서 미리 체크해야함
    {
        cookies=cookie.parse(request.headers.cookie);
    }
    console.log(cookies.yummy_cookie);
    response.writeHead(200,{'Set-cookie':[
        'yummy_cookie=choco',
        'tasty_cookie=strawbarry',
        `Permanent=cookies; Max-Age=${60*60*24*30}`,
        'Secure=Secure;Secure',
        'HttpOnly=HttpOnly;HttpOnly',
        'Path=Path;Path=/cookie'
    ]});
    response.end('cookie');
}).listen(3000);
var express = require('express');
var router = express.Router();
var template = require('../lib/template.js');
//app.get('/',(req,res)=>res.send('Hello world'))
router.get('/', function (request, response) {//get방식으로 입력된 주소를 라우팅

    var title = "welcome";
    var description = "main page";
    var list = template.List(request.list);
    var HTML = template.HTML(title, list,
      `<h2>${title}</h2>${description} 
      <img src=/images/hello.jpg style="width : 300px; display:block;margin-top:10px;">
      `,
      `<a href="/topic/create">creat</a>`);
    response.send(HTML);
  
  })

  module.exports = router;
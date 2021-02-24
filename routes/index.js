var express = require('express');
var router = express.Router();
var template = require('../lib/template.js');
var auth = require('../lib/auth');
const { request } = require('express');

router.get('/', function (request, response) {//get방식으로 입력된 주소를 라우팅
  let fmsg = request.flash()
  let feedback = ''
  if (fmsg.message) {
    feedback = fmsg.message
  }
  var title = "welcome";
  var description = "main page";
  var list = template.List(request.list);
  var HTML = template.HTML(title, list,
    `<div style="color:red;">${feedback}</div>
    <h2>${title}</h2>${description} 
      <img src=/images/hello.jpg style="width : 300px; display:block;margin-top:10px;">
      `,
    `<a href="/topic/create">creat</a>`,auth.statusUI(request,response));
  response.send(HTML);

})

module.exports = router;
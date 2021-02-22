var express = require('express');
var router = express.Router();
var template = require('../lib/template.js');

function authIsOwner(request, response) {
  if (request.session.is_login) {
    return true;
  }
  return false;
}

function authStatusUI(request,response)
{
  var authStatusUI = '<a href="/auth/login">login</a>';
  if (authIsOwner(request, response)) {
    authStatusUI = `${request.session.nickname}|<a href="/auth/logout">logout</a>`;
  }
  return authStatusUI;
}
router.get('/', function (request, response) {//get방식으로 입력된 주소를 라우팅
  var title = "welcome";
  var description = "main page";
  var list = template.List(request.list);
  var HTML = template.HTML(title, list,
    `<h2>${title}</h2>${description} 
      <img src=/images/hello.jpg style="width : 300px; display:block;margin-top:10px;">
      `,
    `<a href="/topic/create">creat</a>`,authStatusUI(request,response));
  response.send(HTML);

})

module.exports = router;
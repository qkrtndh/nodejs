var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var sanitizeHtml = require('sanitize-html');
var template = require('../lib/template.js');
router.get('/create', (request, response) => {
    var title = "WEB - create";
    var list = template.List(request.list);
    var HTML = template.HTML(title, list,
        `<form action="/topic/create_process" method="post">
          <p><input type="text" name="title" placeholder="제목"></p>
          <p>
            <textarea name="description" placeholder="본문"></textarea>
          </p>
          <p><input type="submit"></p>
        </form>
          `, '');
    response.send(HTML);
})
router.post('/create_process', (request, response) => {

    var post = request.body;
    var title = post.title;
    var description = post.description;
    var filteredID = path.parse(post.title).base;
    fs.writeFile(`data/${filteredID}`, description, 'utf8', function (err) {
        //에러 처리시의 내용을 넣어야 하는데 현재는 다루지 않는다
        response.redirect(`/topic/${title}`);
    })
})

router.get('/update/:pageId', (request, response) => {

    var filteredID = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredID}`, 'utf8', function (err, description) {
        var title = request.params.pageId;
        var list = template.List(request.list);
        //제목이 바뀔 경우를 대비하여 id로 제목값을 따로 저장
        //사용자와 상관없는 내용이므로 hidden을 이용하여 숨긴다.
        var HTML = template.HTML(title, list,
            `
         <form action="/topic/update_process" method="post">
         <input type="hidden" name="id" value="${title}">
        <p><input type="text" name="title" placeholder="제목" value="${title}"></p>
        <p>
          <textarea name="description" placeholder="본문">${description}</textarea>
        </p>
        <p><input type="submit"></p>
      </form>`,
            `<a href="/topic/create">creat</a> <a href="/topic/update/${title}">update</a>`);
        response.send(HTML);
    });

})
router.post('/update_process', (request, response) => {

    var post = request.body;
    var id = post.id;
    var title = post.title;
    var description = post.description;
    var filteredID = path.parse(post.id).base;
    //파일 이름 수정시 내용
    fs.rename(`data/${filteredID}`, `data/${title}`, function (error) {
        //위의 create에서의 기능과 같이 이름을 바꾸고 내용을 바꾼다.
        fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
            response.redirect(`/topic/${title}`);
        })
    });
})

router.post('/delete_process', (request, response) => {

    var post = request.body;
    var id = post.id;
    var filteredID = path.parse(post.id).base;
    fs.unlink(`data/${filteredID}`, function (error) {
        response.redirect(`/`);
    })
})

router.get('/:pageId', function (request, response, next) { //라우팅 방식

    var filteredID = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredID}`, 'utf8', function (err, description) {
        if (err) {
            next(err);
        }
        else {
            var title = request.params.pageId;
            var sanitizedTitle = sanitizeHtml(title);
            var sanitizedDescription = sanitizeHtml(description);
            var list = template.List(request.list);
            var HTML = template.HTML(sanitizedTitle, list,
                `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
                `<a href="/topic/create">creat</a>
             <a href="/topic/update/${sanitizedTitle}">update</a>
             <form action = "/topic/delete_process" method="post" onsubmit="return confirm('정말로 삭제하시겠습니까?')">
              <input type="hidden" name="id" value=${sanitizedTitle}>
              <input type="submit" value="deleste">
             </form>`
            );
            response.send(HTML);
        }
    });

})
module.exports = router;
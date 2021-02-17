var db = require('./db.js');
var qs = require('querystring');
var template = require('./template.js')//페이지 출력 템플릿 모듈
var url = require('url');
exports.home = function(request,response){
    db.query('select * from topic', function (err, topics) {
        var title = "welcome";
        var description = "main page";
        var list = template.List(topics);
        var HTML = template.HTML(title, list,
          `<h2>${title}</h2>${description}`,
          `<a href="/create">creat</a>`);
    
        response.writeHead(200);
        response.end(HTML);
      });
}


exports.page = function(request,response){
    var _url = request.url;//_url에 사용자가 접속한 링크를 가져온다.
  var queryData = url.parse(_url, true).query;//쿼리스트링만 따로 떼어온다
    db.query('select * from topic', function (err, topics) {//먼저 topic을 전체 불러오고
        if (err) {
          throw err;//throw하면 다음 명령어를 수행하지 않고 즉시 종료
        }

        //이후에 topic중에서 id에따라 추려낸다.
        db.query(`select * from topic left join author on topic.author_id = author.id where topic.id=?`, [queryData.id], function (err2, topic) {
          if (err2) {
            throw err2;
          }
          var title = topic[0].title;
          var description = topic[0].description;
          var list = template.List(topics);
          var HTML = template.HTML(title, list,
            `<h2>${title}</h2>${description}
            <p>by ${topic[0].name}<p>`,
            `<a href="/create">creat</a>
             <a href="/update?id=${queryData.id}">update</a>
             <form action = "/delete_process" method="post" onsubmit="return confirm('정말로 삭제하시겠습니까?')">
              <input type="hidden" name="id" value=${queryData.id}>
              <input type="submit" value="delete">
             </form>`
          );
          response.writeHead(200);
          response.end(HTML);
        });
    });
}
exports.create = function(request,response){
    db.query('select * from topic', function (err, topics) {
        if (err) {
          throw err;
        }
        db.query('select * from author', function (err2, authors) {
          if (err2) {
            throw err2;
          }
          var title = "WEB - create";
          var list = template.List(topics);
          var HTML = template.HTML(title, list,
            `<form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="제목"></p>
            <p>
              <textarea name="description" placeholder="본문"></textarea>
            </p>
            <p>
            ${template.authorSelect(authors)}
            </p>
            <p><input type="submit"></p>
          </form>
            `, `<a href="/create">create</a>`);
          response.writeHead(200);
          response.end(HTML);
        });
      });
}
exports.create_process = function(request,response){
    var body = '';
    request.on('data', function (data) {
      body += data;
    });
    request.on('end', function () {
      var post = qs.parse(body);
      db.query(`
        insert into topic (title,description,created,author_id) 
          values(?,?,now(),?)`,//id는 자동으로 삽입되므로 생략, 제목, 설명 저자 아이디는 입력값이므로 현제로선 모르므로 와일드카드 ?처리
        [post.title, post.description, post.author],//읽어들인 값을 배열로 다음 자리에 두면 자동으로 인식. 저자아이디는 임의 삽입 하였음.
        function (err, result) {
          if (err) {
            throw err;
          }
          response.writeHead(302, { Location: `/?id=${result.insertId}` });//자동입력될 id는 현제 모르므로 
          //삽입된 데이터의 id를 알아내기 위해 result.insertId를 사용한다
          response.end();
        })
    });
}
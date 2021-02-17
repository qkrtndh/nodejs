var template = require('./template.js')//페이지 출력 템플릿 모듈
var db = require('./db.js');
var qs = require('querystring');
var url = require('url');
exports.home = function(request,response){
    db.query('select * from topic', function (err, topics) {
        db.query('select * from author', function (err2, authors) {
            if(err2)
            {
                throw err2;
            }
        
            var title = "author";
        var list = template.List(topics);
        var HTML = template.HTML(title, list,
          `
          ${template.authorTable(authors)}
          
          <style>
          table{
              border-collapse: collapse;
          }
          td{
              border: 1px solid black;
          }
          </style>
          <form action = '/author/create_process' method = 'post'
          <p><input type='text' name='name' placeholder="author name"></p>
          <p><textarea name='profile'></textarea></p>
          <p><input type='submit' value = 'create'></p>
          </form>
          `,
          `
          `);

    
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
        insert into author (name,profile) 
          values(?,?)`,
        [post.name, post.profile],
        function (err, result) {
          if (err) {
            throw err;
          }
          response.writeHead(302, { Location: `/author` });//특정 author를 보는게 목적이 아니므로 /author로 한다
          response.end();
        })
    });
}
exports.update = function(request,response){
    db.query('select * from topic', function (err, topics) {
        db.query('select * from author', function (err2, authors) {
            var _url = request.url;
            var queryData = url.parse(_url, true).query;
            if(err2)
            {
                throw err2;
            }
            db.query('select * from author where id = ?',[queryData.id], function (err3, author) {
            
            var title = "author";
        var list = template.List(topics);
        var HTML = template.HTML(title, list,
          `
          ${template.authorTable(authors)}
          
          <style>
          table{
              border-collapse: collapse;
          }
          td{
              border: 1px solid black;
          }
          </style>
          <form action = '/author/update_process' method = 'post'
          <p><input type ='hidden' name='id' value='${queryData.id}'></p>
          <p><input type='text' name='name' value='${author[0].name}'></p>
          <p><textarea name='profile'>${author[0].profile}</textarea></p>
          <p><input type='submit' value='update'></p>
          </form>
          `,
          `
          `);

    
        response.writeHead(200);
        response.end(HTML);
        });
    });
});
}
exports.update_process = function(request,response)
{
    var body = '';
    request.on('data', function (data) {
      body += data;

    });
    request.on('end', function () {
      var post = qs.parse(body);

      db.query(`update author set name = ?, profile = ? where id = ?`, [post.name, post.profile, post.id], function (err2, result) {
        if (err2) {
          throw err2;
        }
        response.writeHead(302, { Location: `/author` });//업데이트 후 저자페이지 리다이렉트
        response.end();
      });

    });
}
exports.delete_process = function(request,response)
{
    var body = '';
    request.on('data', function (data) {
      body += data;

    });
    request.on('end', function () {
      var post = qs.parse(body);
      db.query('delete from topic where author_id = ?', [post.id], function (err1, result) {
          if(err1)
          {
              throw err1;
          }
      db.query('delete from author where id = ?', [post.id], function (err2, author) {
        if (err2) {
          throw err2;
        }
        response.writeHead(302, { Location: `/author` });
        response.end();
      });
    });
});
}
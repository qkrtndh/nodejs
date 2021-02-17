var template = require('./template.js')//페이지 출력 템플릿 모듈
var db = require('./db.js');
var qs = require('querystring');
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
          <p><input type='submit'></p>
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
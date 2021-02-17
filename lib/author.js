var template = require('./template.js')//페이지 출력 템플릿 모듈
var db = require('./db.js');
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
          `,
          `<a href="/create">creat</a>`);

    
        response.writeHead(200);
        response.end(HTML);
        });
        
      });
}
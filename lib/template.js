module.exports = {
    //html템플릿
    //함수를 통해 공통의 서식을 만들고 nodejs를 통해 동적으로 내용이 바뀌게 한 뒤
    //html 내용을 return한다.
    HTML: function (title, list, body, controll,authStatusUI='<a href="/auth/login">login</a>') {
        return `
    <!doctype html>
    <html>
      <head>
       <title>WEB1 - ${title}</title>
        <meta charset="utf-8">
        <style>
        a{
            text-decoration: none;
            color: green;
        }
        </style>
      </head>
      <body>
        ${authStatusUI}
        <h1><a href="/">WEB</a></h1>
         ${list}
         ${controll}
         ${body}
      </body>
     </html>
    `;
    },

    //목록 생성 템플릿
    //각 html페이지마다 공통으로 나타나는 리스트를 파일을 읽어들여
    //마찬가지로 html본문에 삽입할 수 있는 내용을 반환시킨다.
    List: function (filelist) {
        var list = '<ol>';
        var i = 0;
        while (i < filelist.length) {
            list += `<li><a href='/topic/${filelist[i]}'>${filelist[i]}</a></li>`;
            i += 1;
        }
        list = list + '</ol>';
        return list;
    }

}
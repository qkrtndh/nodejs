module.exports = {
    //html템플릿
    //함수를 통해 공통의 서식을 만들고 nodejs를 통해 동적으로 내용이 바뀌게 한 뒤
    //html 내용을 return한다.
    HTML: function (title, list, body, controll) {
        return `
    <!doctype html>
    <html>
      <head>
       <title>WEB1 - ${title}</title>
        <meta charset="utf-8">
      </head>
      <body>
        <h1><a href="/">WEB</a></h1>
         ${list}
         <p><a href="/author">author</a></p>
         ${controll}
         ${body}
      </body>
     </html>
    `;
    },

    //목록 생성 템플릿
    //각 html페이지마다 공통으로 나타나는 리스트를 파일을 읽어들여
    //마찬가지로 html본문에 삽입할 수 있는 내용을 반환시킨다.
    List: function (topics) {
        var list = '<ol>';
        var i = 0;
        while (i < topics.length) {
            list += `<li><a href='/?id=${topics[i].id}'>${topics[i].title}</a></li>`;
            i += 1;
        }
        list = list + '</ol>';
        return list;
    },
    authorSelect: function(authors){
        var tag ='';
        var i=0;
        while(i<authors.length){
          tag +=`<option value="${authors[i].id}">${authors[i].name}</option>`;
          i++;
        }
        return `<select name="author">${tag}</select>`;
    },
    authorTable: function(authors){
      var tag = '<table>';
        var i=0;
        while(i<authors.length){
            tag+=`<tr>
            <td>${authors[i].name}</td><td>${authors[i].profile}</td><td>update</td><td>del</td>
            </tr>`;
            i++;
        }
        tag+='</table>';
        return tag;
    }

}
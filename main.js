var http = require('http');//require는 '모듈'을 가져온다.
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js')//페이지 출력 템플릿 모듈
var db = require('./lib/db.js');
var topic = require('./lib/topic.js')
var author = require('./lib/author')


//서버를 생성하고 내용을 표현한다.
var app = http.createServer(function (request, response) {
  var _url = request.url;//_url에 사용자가 접속한 링크를 가져온다.
  var queryData = url.parse(_url, true).query;//쿼리스트링만 따로 떼어온다
  var pathname = url.parse(_url, true).pathname;//경로만 따로 떼어온다.
  if (pathname == '/')//루트라면, 경로가 /로 끝나거나(/없이 끝나거나) 쿼리스트링이 있는 경우라면
  {
    if (queryData.id == undefined)//main페이지라면
    {
      topic.home(request,response);
    }
    else {//하위 페이지 생성, 쿼리스트링이 있는 경우

      topic.page(request,response);
    }
  }
  else if (pathname == '/create') {//문서추가, 추가 경로 존재 시
    topic.create(request,response);
  }
  else if (pathname == '/create_process') {//추가된문서 파일 저장 및 리다이렉션
    topic.create_process(request,response);
  }
  else if (pathname == '/update') {//하위 페이지인 업데이트 페이지
    topic.update(request,response);
  }
  else if (pathname == '/update_process') {//수정된문서 파일 저장 및 리다이렉션
    topic.update_process(request,response);
  }
  else if (pathname == '/delete_process') {//문서 삭제 및 리다이렉션
    topic.delete(request,response);
  }
  else if (pathname == '/author') {//저자 목록 출력
    author.home(request,response);
  }
  else if (pathname == '/author/create_process') {//저자 추가
    author.create_process(request,response);
  }
  else if (pathname == '/author/update') {//저자 수정
    author.update(request,response);
  }
  else if (pathname == '/author/update_process') {//저자 수정 처리
    author.update_process(request,response);
  }
  else if (pathname == '/author/delete_process') {//저자 삭제
    author.delete_process(request,response);
  }
  else {//잘못된 페이지인 경우
    response.writeHead(404);
    response.end('Not found');
  }


});
app.listen(3000);
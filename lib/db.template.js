var mysql = require('mysql');//mysql모듈 불러옴
var db = mysql.createConnection({//접속을 위한데이터를 객체로.
    host: '',
    user: '',
    password: '',
    database: ''
  });
  db.connect();//접속
  module.exports = db;
const express = require('express') //익스프레스 모듈 로드
const app = express(); //익스프레스의 반환값(애플리케이션)을 app 에 저장
var fs = require('fs');
var bodyParser = require('body-parser');
var compression = require('compression');
var helmet = require('helmet')
app.use(helmet())
var session = require('express-session')
var FileStore = require('session-file-store')(session)
var flash = require('connect-flash')


app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression())
app.use(session({
  secret: `dafsdfasahdf`,
  resave: false,
  saveUninitialized: true,
  store: new FileStore()
}))

//passport는 session 밑에
var testData = {
  email: '1234',
  password: '1234',
  nickname: 'testauth'
}

var passport = require('passport'), LocalStrategy = require('passport-local').Strategy;

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

passport.serializeUser(function (user, done) {
  done(null, user.email);
});

passport.deserializeUser(function (id, done) {
  console.log("1");
  done(null, testData);
});


/*app.post('/auth/login_process', passport.authenticate('local', { failureRedirect: '/auth/login',failureFlash:true,successFlash:true}),
  (req, res) => {
    req.session.save(() => {
      
      res.redirect('/')
    })
  })*/
app.post('/auth/login_process', (req, res, next) => {

  passport.authenticate('local', (err, user, info) => {

    if (req.session.flash) {
      req.session.flash = {}
    }

    req.flash('message', info.message)

    req.session.save(() => {

      if (err) {
        return next(err)
      }
      if (!user) {
        return res.redirect('/auth/login')
      }

      req.logIn(user, (err) => {
        if (err) {
          return next(err)
        }
        return req.session.save(() => {
          res.redirect('/')
        })
      })
    })

  })(req, res, next)
})


passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'pwd'
  },
  function (username, password, done) {
    if (username == testData.email) {
      if (password == testData.password) {
        return done(null, testData,{message:'success'});
      }
      else {
        return done(null, false, { message: 'Incorrect password.' });
      }
    }
    else {
      return done(null, false, { message: 'Incorrect username.' });
    }
  }
));


app.get('*', function (request, response, next) {
  fs.readdir('./data', function (error, filelist) {
    request.list = filelist;
    next();
  })
})

var topicRouter = require('./routes/topic');
var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
const { response } = require('express');

app.use('/auth', authRouter);
app.use('/topic', topicRouter); //topic으로 시작하는 주소들에게 topicRouter미들웨어를 적용하겠다.
app.use('/', indexRouter);

app.use(function (req, res, next) {
  res.status(404).send('Sorry cant find that!');
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

//app.listen(3000,()=>console.log('example app listening on port 3000'))
app.listen(3000, function () {
  return console.log('example app listening on port 3000');
})
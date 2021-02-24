module.exports = function(app){
var testData = {
    email: '1234',
    password: '1234',
    nickname: 'testauth'
  }
  
  var passport = require('passport'), LocalStrategy = require('passport-local').Strategy;
  
  app.use(passport.initialize());
  app.use(passport.session());
  
  
  passport.serializeUser(function (user, done) {
    done(null, user.email);
  });
  
  passport.deserializeUser(function (id, done) {
    console.log("1");
    done(null, testData);
  });
  
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
  return passport;
}
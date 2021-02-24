var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var sanitizeHtml = require('sanitize-html');
var template = require('../lib/template.js');
const { route } = require('./topic.js');

module.exports = function (passport) {
  router.get('/login', (request, response) => {
    let fmsg = request.flash()
    let feedback = ''
    if (fmsg.message) {
      feedback = fmsg.message
    }
    var title = "WEB - login";
    var list = template.List(request.list);
    var HTML = template.HTML(title, list,
      `<div style="color:red;">${feedback}</div>
    <form action="/auth/login_process" method="post">
          <p><input type="text" name="email" placeholder="email"></p>
          <p>
            <input type="password" name="pwd" placeholder="password">
          </p>
          <p><input type="submit" value="login"></p>
        </form>
          `, '');
    response.send(HTML);
  })

  router.post('/auth/login_process', (req, res, next) => {

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

  router.get('/logout', (request, response) => {
    request.logout();
    request.session.save(() => {
      response.redirect('/');
    })
    /*request.session.destroy((err) => {
      response.redirect('/');
    });*/
  });
  return router;
}

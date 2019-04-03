const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const hash = require("./hash.js").digest;
const users = require("../../model/users");

let initialize, authenticate, authorize;

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use("local-strategy", new LocalStrategy({
  usernameField: "username",
  passwordField: "password",
  passReqToCallback: true
}, (req, username, password, done) => {
  // ユーザー名存在チェック
  users.find(username, (err, user) => {
    if (err) {
      done(err);
    } else {
      // パスワードチェック
      if ((user) && (user.password === hash(password))) {
        // セッション情報の再生成
        req.session.regenerate((err) => {
          if (err) {
            done(err);
          } else {
            done(null, user);
          }
        });
      } else {
        done(null, false, req.flash("message", "ユーザー名　または　パスワード　が間違っています。"));
      }
    }
  });
}));

initialize = function () {
  return [
    passport.initialize(),
    passport.session(),
    function (req, res, next) {
      if (req.user) {
        res.locals.user = req.user;
      }
      next();
    }
  ];
};

authenticate = function () {
  return passport.authenticate(
    "local-strategy", {
      successRedirect: "/admin/",
      failureRedirect: "/admin/login"
    }
  );
};

authorize = function () {
  return function (req, res, next) {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.redirect("/admin/login");
    }
  };
};

module.exports = {
  initialize,
  authenticate,
  authorize
};

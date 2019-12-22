const express = require("express");
const router = express.Router();
var accountcnotrol = require("../lib/security/accountcontrol.js");
const csrf = require("csrf");
const tokens = new csrf();

const kotoba = require("../model/kotoba_gcloud.js");

// ログイン
router.get("/login", (req, res) => {
  res.render("./admin/login.ejs", { message: req.flash("message") });
});
router.post("/login",accountcnotrol.authenticate());

// ログアウト
router.post("/logout", (req, res) => {
  req.logout();
  res.redirect("/admin/login");
});

//一覧
//
//page：現在のページ数
//value：検索文字列
router.get("/", accountcnotrol.authorize(), (req, res) => {
  if (req.isAuthenticated()) {
    kotoba.findAllForList(req.query.page, req.query.value, (err, retObj) => {
      if (err) {
        throw err;
      }
      // token削除
      delete req.session._csrf;
      res.clearCookie("_csrf");
      res.render("admin/list", retObj);
    });
  } else {
    res.redirect("/admin/login");
  }
});

//一覧より登録画面を開く
//
//page：一覧での表示していたページ数
//q：一覧での検索文字列
router.get("/kotoba/touroku", accountcnotrol.authorize(), (req, res) => {
  tokens.secret((error, secret) => {
    const token = tokens.create(secret);
    req.session._csrf = secret;
    res.cookie("_csrf", token);
    res.render("admin/kotoba_form", {
      mode: "create",
      q: req.query.q,
      page: req.query.page,
      kotoba: {}
    });
  });
});

//一覧より更新画面を開く
//
//no：更新対象のkotoba_no
//page：一覧での表示していたページ数
//q：一覧での検索文字列
router.get("/kotoba/koushin", accountcnotrol.authorize(), (req, res) => {
  if (req.query.no) {
    kotoba.find(req.query.no, (err, retObj) => {
      if (err) {
        throw err;
      }
      tokens.secret((error, secret) => {
        if (error) {
          throw Error("create token error");
        }
        const token = tokens.create(secret);
        req.session._csrf = secret;
        res.cookie("_csrf", token);
        res.render("admin/kotoba_form", {
          mode: "update",
          q: req.query.q,
          page: req.query.page,
          kotoba: retObj[0],
        });
      });
    });
  } else {
    res.redirect("/");
  }
});

//一覧より削除画面を開く
//
//no：削除対象のkotoba_no
//page：一覧での表示していたページ数
//q：一覧での検索文字列
router.get("/kotoba/sakujyo", accountcnotrol.authorize(), (req, res) => {
  if (req.query.no) {
    kotoba.find(req.query.no, (err, retObj) => {
      if (err) {
        throw err;
      }
      tokens.secret((error, secret) => {
        if (error) {
          throw Error("create token error");
        }
        const token = tokens.create(secret);
        req.session._csrf = secret;
        res.cookie("_csrf", token);
        res.render("admin/kotoba_form", {
          mode: "delete",
          q: req.query.q,
          page: req.query.page,
          kotoba: retObj[0],
        });
      });
    });
  } else {
    res.redirect("/");
  }
});

// 登録
router.post("/kotoba/create", accountcnotrol.authorize(), (req, res) => {
  const secret = req.session._csrf;
  const token = req.cookies._csrf;
  if (!tokens.verify(secret, token)) {
    throw Error("invalid token");
  }
  kotoba.create(req.body.kotoba_value, (err, retObj) => {
    if (err) {
      throw err;
    }
    delete req.session._csrf;
    res.clearCookie("_csrf");
    res.redirect("/admin/kotoba/kanryou");
  });
});

// 更新
router.post("/kotoba/update", accountcnotrol.authorize(), (req, res) => {
  const secret = req.session._csrf;
  const token = req.cookies._csrf;
  if (!tokens.verify(secret, token)) {
    throw Error("invalid token");
  }
  kotoba.update(req.body.kotoba_no, req.body.kotoba_value, (err, retObj) => {
    if (err) {
      throw err;
    }
    delete req.session._csrf;
    res.clearCookie("_csrf");
    res.redirect("/admin/kotoba/kanryou");
  });
});

// 削除
router.post("/kotoba/delete", accountcnotrol.authorize(), (req, res) => {
  const secret = req.session._csrf;
  const token = req.cookies._csrf;
  if (!tokens.verify(secret, token)) {
    throw Error("invalid token");
  }
  kotoba.delete(req.body.kotoba_no, (err, retObj) => {
    if (err) {
      throw err;
    }
    delete req.session._csrf;
    res.clearCookie("_csrf");
    res.redirect("/admin/kotoba/kanryou");
  });
});

// 完了
router.get("/kotoba/kanryou", accountcnotrol.authorize(), (req, res) => {
  res.render("admin/kotoba_complete", {});
});

module.exports = router;

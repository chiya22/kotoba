const express = require("express");
const router = express.Router();
const config = require("../config/dbconfig.js");
const { Client } = require("pg");
const csrf = require("csrf");
const tokens = new csrf();

const kotoba = require("../model/kotoba.js");

//一覧
//
//page：現在のページ数
//value：検索文字列
router.get("/", (req, res) => {
  kotoba.findAll(req.query.page, req.query.value, (err, retObj) => {
    if (err) {
      throw err;
    }
    // token削除
    delete req.session._csrf;
    res.clearCookie("_csrf");
    res.render("admin/list", retObj);
  });
});

//一覧より登録画面を開く
//
//page：一覧での表示していたページ数
//q：一覧での検索文字列
router.get("/kotoba/touroku", (req, res) => {
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
router.get("/kotoba/koushin", (req, res) => {
  const client = new Client(config);
  client.connect();
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
          kotoba: retObj
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
router.get("/kotoba/sakujyo", (req, res) => {
  const client = new Client(config);
  client.connect();
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
          kotoba: retObj
        });
      });
    });
  } else {
    res.redirect("/");
  }
});

// 登録
router.post("/kotoba/create", (req, res) => {
  const secret = req.session._csrf;
  const token = req.cookies._csrf;
  if (!tokens.verify(secret, token)) {
    throw Error("invalid token");
  }
  kotoba.create(req.body.kotoba_value, (err, retObj) => {
    if (err){
      throw err;
    }
    delete req.session._csrf;
    res.clearCookie("_csrf");
    res.redirect("/admin/kotoba/kanryou");
  });
});

// 更新
router.post("/kotoba/update",(req,res) => {
  const secret = req.session._csrf;
  const token = req.cookies._csrf;
  if (!tokens.verify(secret, token)) {
    throw Error("invalid token");
  }
  kotoba.update(req.body.kotoba_no, req.body.kotoba_value, (err, retObj) => {
    if (err){
      throw err;
    }
    delete req.session._csrf;
    res.clearCookie("_csrf");
    res.redirect("/admin/kotoba/kanryou");
  });
});

// 削除
router.post("/kotoba/delete", (req,res) => {
  const secret = req.session._csrf;
  const token = req.cookies._csrf;
  if (!tokens.verify(secret, token)) {
    throw Error("invalid token");
  }
  kotoba.delete(req.body.kotoba_no, (err, retObj) => {
    if (err){
      throw err;
    }
    delete req.session._csrf;
    res.clearCookie("_csrf");
    res.redirect("/admin/kotoba/kanryou");
  });
});

// 完了
router.get("/kotoba/kanryou", (req, res) => {
  res.render("admin/kotoba_complete", {});
});

module.exports = router;

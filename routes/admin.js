const express = require('express');
const router = express.Router();
const config = require('../config/dbconfig.js');
const { Client } = require('pg');
const csrf = require('csrf');
const tokens = new csrf();

const MAX_ITEMS_PER_PAGE = 2;

//一覧
//
//page：現在のページ数
//value：検索文字列
router.get('/', (req, res) => {
  const client = new Client(config);
  client.connect();

  let query = {};
  let kotobas = [];
  let page = req.query.page ? parseInt(req.query.page) : 1;
  let offset = (page - 1) * MAX_ITEMS_PER_PAGE;

  if (req.query.value) {
    query.text = 'select * from kotoba where kotoba_value like ' % ' || $1 || ' % '  order by kotoba_no limit $2 offset $3';
    query.values = [req.query.value, MAX_ITEMS_PER_PAGE, offset];
  } else {
    query.text = 'select * from kotoba order by kotoba_no limit $1 offset $2';
    query.values = [MAX_ITEMS_PER_PAGE, offset];
  }

  client.query(query, (err, result) => {
    if (err) {
      throw err;
    }
    if (result.rowCount !== 0) {
      kotobas = result.rows;
    }
  });

  if (req.query.value) {
    query.text = 'select count(*) from kotoba where kotoba_value like ' % ' || $1 || ' % '';
    query.values = [req.query.value];
  } else {
    query.text = 'select count(*) from kotoba';
    query.values = [];
  }

  client.query(query, (err, result) => {
    if (err) {
      throw err;
    }
    client.end()
      .catch((err) => {
        throw err;
      });
    delete req.session._csrf;
    res.clearCookie('_csrf');
    res.render('admin/list', {
      value: req.query.value,
      count: result.rows[0].count,
      kotobas: kotobas,
      pagenation: {
        max: Math.ceil(result.rows[0].count / MAX_ITEMS_PER_PAGE),
        current: page
      }
    });
  });
});

//一覧→＜登録ボタン＞→実行画面
//
//page：一覧での表示していたページ数
//q：一覧での検索文字列
router.get('/kotoba/touroku', (req, res) => {
  tokens.secret((error, secret) => {
    const token = tokens.create(secret);
    req.session._csrf = secret;
    res.cookie('_csrf', token);
    res.render('admin/kotoba_form', {
      mode: 'insert',
      q: req.query.q,
      page: req.query.page,
      kotoba: {}
    });
  });
});

//一覧→＜更新ボタンクリック＞→実行画面
//
//no：更新対象のkotoba_no
//page：一覧での表示していたページ数
//q：一覧での検索文字列
router.get('/kotoba/koushin', (req, res) => {
  const client = new Client(config);
  client.connect();
  let query = {};
  if (req.query.no) {
    query.text = 'select * from kotoba where kotoba_no = $1';
    query.values = [req.query.no];
    client.query(query, (err, result) => {
      if (err) {
        throw err;
      }
      client.end()
        .catch((err) => {
          throw err;
        });
      if (result.rowCount === 0) {
        res.redirect('/');
      } else {
        tokens.secret((error, secret) => {
          if (error) {
            throw Error('create token error');
          }
          const token = tokens.create(secret);
          req.session._csrf = secret;
          res.cookie('_csrf', token);
          res.render('admin/kotoba_form', {
            mode: 'update',
            q: req.query.q,
            page: req.query.page,
            kotoba: result.rows[0]
          });
        });
      }
    });
  } else {
    client.end()
      .catch((err) => {
        throw err;
      });
    res.redirect('/');
  }
});

//一覧→＜削除ボタンクリック＞→実行画面
//
//no：削除対象のkotoba_no
//page：一覧での表示していたページ数
//q：一覧での検索文字列
router.get('/kotoba/sakujyo', (req, res) => {
  const client = new Client(config);
  client.connect();
  let query = {};
  if (req.query.no) {
    query.text = 'select * from kotoba where kotoba_no = $1';
    query.values = [req.query.no];
    client.query(query, (err, result) => {
      if (err) {
        throw err;
      }
      client.end()
        .catch((err) => {
          throw err;
        });
      if (result.rowCount === 0) {
        res.redirect('/');
      } else {
        tokens.secret((error, secret) => {
          const token = tokens.create(secret);
          req.session._csrf = secret;
          res.cookie('_csrf', token);
          res.render('admin/kotoba_form', {
            mode: 'delete',
            q: req.query.q,
            page: req.query.page,
            kotoba: result.rows[0]
          });
        });
      }
    });
  } else {
    client.end()
      .catch((err) => {
        throw err;
      });
    res.redirect('/');
  }
});

//完了
router.post('/kotoba/kanryou', (req, res) => {

  const secret = req.session._csrf;
  const token = req.cookies._csrf;
  if (!tokens.verify(secret, token)) {
    throw Error('invalid token');
  }

  let query = {};
  if (req.body.mode === 'insert') {
    query.text = 'insert into kotoba(kotoba_value) values ($1)';
    query.values = [req.body.kotoba_value];
  } else if (req.body.mode === 'update') {
    query.text = 'update kotoba set kotoba_value = $1 where kotoba_no = $2';
    query.values = [req.body.kotoba_value, req.body.kotoba_no];
  } else if (req.body.mode === 'delete') {
    query.text = 'delete from kotoba where kotoba_no = $1';
    query.values = [req.body.kotoba_no];
  }

  const client = new Client(config);
  client.connect();
  client.query(query, (err, result) => {
    if (err) {
      throw err;
    }
    client.end()
      .catch((err) => {
        throw err;
      });
    delete req.session._csrf;
    res.clearCookie('_csrf');

    res.redirect('/admin/kotoba/kanryou');
  });
});

router.get('/kotoba/kanryou', (req, res) => {
  res.render('admin/kotoba_complete', {});
});

module.exports = router;

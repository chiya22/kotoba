
const config = require("../config/dbconfig.js");
const { Client } = require("pg");
const MAX_ITEMS_PER_PAGE = 2;

// ■ findAll
const findAll = ((callback) => {
  const client = new Client(config);
  client.connect();

  let query = {};
  query.text = "select * from kotoba";
  query.values = [];
  //一覧の取得
  client.query(query, (err, result) => {
    if (err) {
      callback(err, null);
    }
    callback(null, result);
  });
});

// ■ findAllForKList
const findAllForList = ((query_page, query_value, callback) => {
  const client = new Client(config);
  client.connect();

  let query_list = {}; //一覧取得用のquery
  let query_count = {}; //総件数取得用のquery
  let page = query_page ? parseInt(query_page) : 1;
  let offset = (page - 1) * MAX_ITEMS_PER_PAGE;
  let kotobas = [];
  if (query_value) {
    query_list.text = "select * from kotoba where kotoba_value like '%' || $1 || '%'  order by kotoba_no limit $2 offset $3";
    query_list.values = [query_value, MAX_ITEMS_PER_PAGE, offset];
    query_count.text = "select count(*) from kotoba where kotoba_value like '%' || $1 || '%'";
    query_count.values = [query_value];
  } else {
    query_list.text = "select * from kotoba order by kotoba_no limit $1 offset $2";
    query_list.values = [MAX_ITEMS_PER_PAGE, offset];
    query_count.text = "select count(*) from kotoba";
    query_count.values = [];
  }
  //一覧の取得
  client.query(query_list, (err, result) => {
    if (err) {
      callback(err, null);
    }
    if (result.rowCount !== 0) {
      kotobas = result.rows;
    }
  });
  //総件数の取得
  client.query(query_count, (err, result) => {
    if (err) {
      callback(err, null);
    }
    client.end()
      .catch((err) => {
        throw err;
      });
    const retObj = {
      count: result.rows[0].count, // 全体件数
      value: query_value,  // 検索文字列
      kotobas: kotobas, // 一覧情報
      pagenation: {
        max: Math.ceil(result.rows[0].count / MAX_ITEMS_PER_PAGE), // 最大ページ数
        current: page // 現在のページ数
      }
    };
    callback(null, retObj);
  });
});

// ■ find
const find = ((kotoba_no, callback) => {
  let query = {};
  if (kotoba_no) {
    query.text = "select * from kotoba where kotoba_no = $1";
    query.values = [kotoba_no];
  } else {
    callback(new Error("invalid no"), null);
  }
  // connect
  const client = new Client(config);
  client.connect();
  // 1件取得
  client.query(query, (err, result) => {
    if (err) {
      callback(err, null);
    }
    client.end()
      .catch((err) => {
        throw err;
      });
    callback(null, result.rows[0]);
  });
});

// ■ create
const create = ((kotoba_value, callback) => {
  let query = {};
  if (kotoba_value) {
    query.text = "insert into kotoba(kotoba_value) values ($1)";
    query.values = [kotoba_value];
  } else {
    callback(new Error("kotoba_value is invalid"), null);
  }
  // connect
  const client = new Client(config);
  client.connect();
  // INSERT
  client.query(query, (err, result) => {
    if (err) {
      callback(err, null);
    }
    client.end()
      .catch((err) => {
        throw err;
      });
    callback(null, result.rows[0]);
  });
});

// ■ update
const update = ((kotoba_no, kotoba_value, callback) => {
  let query = {};
  if ((kotoba_value) && (kotoba_no)) {
    query.text = "update kotoba set kotoba_value = $1 where kotoba_no = $2";
    query.values = [kotoba_value, kotoba_no];
  } else {
    callback(new Error("kotoba_no or kotoba_value is invalid"), null);
  }
  // connect
  const client = new Client(config);
  client.connect();
  // UPDATE
  client.query(query, (err, result) => {
    if (err) {
      callback(err, null);
    }
    client.end()
      .catch((err) => {
        throw err;
      });
    callback(null, result.rows[0]);
  });
});

// ■ remove
const remove = ((kotoba_no, callback) => {
  let query = {};
  if (kotoba_no) {
    query.text = "delete from kotoba where kotoba_no = $1";
    query.values = [kotoba_no];
  } else {
    callback(new Error("kotoba_no is invalid"), null);
  }
  // connect
  const client = new Client(config);
  client.connect();
  // DELETE
  client.query(query, (err, result) => {
    if (err) {
      callback(err, null);
    }
    client.end()
      .catch((err) => {
        throw err;
      });
    callback(null, result.rows[0]);
  });
});

module.exports = {
  findAll: findAll,
  findAllForList: findAllForList,
  find: find,
  create: create,
  update: update,
  delete: remove
};

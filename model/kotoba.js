
const config = require("../config/dbconfig.js");
const { Client } = require("pg");
const MAX_ITEMS_PER_PAGE = 2;

const findAll = ((query_page, query_value, callback) => {
  const client = new Client(config);
  client.connect();

  let query_list = {};
  let query_count = {};
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

module.exports = {
  findAll: findAll,
  create: "",
  update: "",
  delete: ""
};

const MAX_ITEMS_PER_PAGE = 10;
const knex = require("../lib/db/knex.js");

const getKotobaPK = async (knex, no) => {
  return await knex
    .select("*")
    .from("kotoba")
    .where("kotoba_no", Number(no));
};

const getKotobaAll = async knex => {
  return await knex
    .select("*")
    .from("kotoba")
    .orderBy("kotoba_no");
};

const getKotobaLikeCount = async (knex, text) => {
  if (text) {
    return await knex("kotoba")
      .where("kotoba_value", "like", `%${text}%`)
      .count("kotoba_no");
  } else {
    return await knex("kotoba")
      .count("kotoba_no");
  }
};

const getKotobaLike = async (knex, text, limitcount, offsetcount) => {
  if (text) {
    return await knex
      .select("*")
      .from("kotoba")
      .where("kotoba_value", "like", `%${text}%`)
      .orderBy("kotoba_no")
      .limit(limitcount)
      .offset(offsetcount);
  } else {
    return await knex
      .select("*")
      .from("kotoba")
      .orderBy("kotoba_no")
      .limit(limitcount)
      .offset(offsetcount);
  }
};

const createKotoba = async (knex, value) => {
  return await knex("kotoba")
    .insert({ kotoba_value: value });
};

const updateKotoba = async (knex, no, value) => {
  return await knex("kotoba")
    .where("kotoba_no", no)
    .update({ kotoba_value: value });
};

const deleteKotoba = async (knex, no) => {
  return await knex("kotoba")
    .where("kotoba_no", no)
    .del();
}

// ■ find
const find = ((no, callback) => {
  (async function () {
    const client = knex.connect();
    if (no) {
      let result;
      result = await getKotobaPK(client,no);
      callback(null, result);
    } else {
      callback(new Error("invalid no"), null);
    }
  })();
});

// ■ findAll
const findAll = ((callback) => {
  (async function () {
    const client = knex.connect();
    let result;
    result = await getKotobaAll(client);
    callback(null, result);
  })();
});

// ■ findAllForList
const findAllForList = ((query_page, query_value, callback) => {
  (async function () {
    const client = knex.connect();
    let retObj;
    const page = query_page ? parseInt(query_page) : 1;
    const offset = (page - 1) * MAX_ITEMS_PER_PAGE;
    const kotobas = await getKotobaLike(client, query_value, MAX_ITEMS_PER_PAGE, offset);
    const kotobascount = await getKotobaLikeCount(client, query_value);
    retObj = {
      count: kotobascount[0].count, // 検索対象となっている全体件数
      value: query_value,  // 検索文字列
      kotobas: kotobas, // 一覧情報
      pagenation: {
        max: Math.ceil(kotobascount[0].count / MAX_ITEMS_PER_PAGE), // 最大ページ数
        current: page // 現在のページ数
      }
    }
    callback(null, retObj);
  })();
});

// ■ create
const create = ((kotoba_value, callback) => {
  const client = knex.connect();
  if (kotoba_value) {
    const kotoba = createKotoba(client, kotoba_value);
    callback(null, kotoba);
  } else {
    callback(new Error("kotoba_value is invalid"), null);
  };
});

// ■ update
const update = ((kotoba_no, kotoba_value, callback) => {
  const client = knex.connect();
  if ((kotoba_value) && (kotoba_no)) {
    const kotoba = updateKotoba(client, kotoba_no, kotoba_value);
    callback(null, kotoba);
  } else {
    callback(new Error("kotoba_no or kotoba_value is invalid"), null);
  }
});

// ■ remove
const remove = ((kotoba_no, callback) => {
  const client = knex.connect();
  if (kotoba_no) {
    const kotoba = deleteKotoba(client, kotoba_no);
    callback(null, kotoba);
  } else {
    callback(new Error("kotoba_no is invalid"), null);
  }
});

module.exports = {
  findAll: findAll,
  findAllForList: findAllForList,
  find: find,
  create: create,
  update: update,
  delete: remove,
};

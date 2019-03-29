const config = require("../config/dbconfig.js");
const { Client } = require("pg");


// ■ findAll
const findAll = ((callback) => {
  const client = new Client(config);
  client.connect();

  let query = {};
  query.text = "select * from users";
  query.values = [];
  //一覧の取得
  client.query(query, (err, result) => {
    if (err) {
      callback(err, null);
    }
    client.end()
      .catch((err) => {
        throw err;
      });
    callback(null, result);
  });
});

// ■ find
const find = ((users_name, callback) => {
  let query = {};
  if (users_name) {
    query.text = "select * from users where name = $1";
    query.values = [users_name];
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
const create = ((users_name, users_password, users_role, callback) => {
  let query = {};
  if ((users_name) && (users_password)) {
    query.text = "insert into users ( name, password, role) values ( $1, $2, $3)";
    query.values = [users_name, users_password, users_role];
  } else {
    callback(new Error("[insert]users parameter is invalid"), null);
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
const update = ((users_name, users_password, users_role, callback) => {
  let query = {};
  if ((users_name) && (users_password)) {
    query.text = "update users set password = $1, role = $2 where name = $2";
    query.values = [users_name, users_password, users_role];
  } else {
    callback(new Error("[update]users parameter is invalid"), null);
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
const remove = ((users_name, callback) => {
  let query = {};
  if (users_name) {
    query.text = "delete from users where name = $1";
    query.values = [users_name];
  } else {
    callback(new Error("[delete]users parameter is invalid"), null);
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
  find: find,
  create: create,
  update: update,
  delete: remove
};


const knex = require("../lib/db/knex.js");

const getUserPK = async (knex, pk_value) => {
  return await knex
    .select("*")
    .from("users")
    .where("name", pk_value)
    .limit(1);
};

// ■ find
const find = ((user_name, callback) => {
  const client = knex.connect();
  user = getUserPK(client, user_name);
  callback(null, user);
});

module.exports = {
  find: find,
};


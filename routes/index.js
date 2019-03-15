const router = require("express").Router();
const config = require("../config/dbconfig.js");
const { Client } = require('pg');

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
router.get("/", (req, res) => {

  const client = new Client(config);
  client.connect();

  const maxNo = 1;

  let query = {};
  let kotoba = {};
  query.text = "select * from kotoba";

  client.query(query, (err, result) => {
    if (err) {
      console.log("query", err.stack);
      throw err;
    }

    client.end()
      .catch((err) => {
        console.log("error during disconnection", err.stack);
        throw err;
      });

    if (result.rowCount !== 0) {
      kotoba = result.rows[getRandomInt(result.rowCount)];
    }

    res.render('index', {
      kotoba: kotoba
    });
  });
});

module.exports = router;
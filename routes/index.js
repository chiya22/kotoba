const router = require("express").Router();
const kotoba = require("../model/kotoba.js");

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

router.get("/", (req, res) => {

  kotoba.findAll(0, null, (err, retObj) => {
    let obj = {};
    if (err) {
      throw err;
    }
    // Random表示
    if (retObj.length !== 0) {
      obj = retObj.rows[getRandomInt(retObj.rowCount)];
    }
    res.render("index", {
      kotoba: obj
    });
  });
});

module.exports = router;
const router = require("express").Router();
const kotoba = require("../model/kotoba_gcloud.js");

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

router.get("/", (req, res) => {

  kotoba.findAll((err, retObj) => {
    if (err) {
      throw err;
    }
    if (retObj.length !== 0) {
      const kotoba = retObj[getRandomInt(retObj.length)];
      res.render("index", {
        kotoba: kotoba
      });
    }
  });
});

module.exports = router;
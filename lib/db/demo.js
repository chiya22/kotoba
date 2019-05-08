const config = require("../../config/dbconfig.js");
const hash = require("../security/hash.js").digest;
const { Client } = require("pg");
const client = new Client(config);

client.connect();

client.query("delete from kotoba", (err) => {
  if (err) {
    console.log("query error", err.stack);
  }
});

client.query("delete from users", (err) => {
  if (err) {
    console.log("query error", err.stack);
  }
});

let query = {
  text: "INSERT INTO kotoba(kotoba_value) VALUES($1)",
};

for (let i = 1; i < 10; i++) {
  let values = [];
  values.push("ことば" + i);
  query.values = values;
  client.query(query, (err) => {
    if (err) {
      console.log("query error", err.stack);
    }
  });
}

client.query("select * from kotoba", (err) => {
  if (err) {
    console.log("query error", err.stack);
  }
});

const hasedpassword = hash("testpassword");

client.query("INSERT INTO users ( name, password, role) VALUES ('test1', '" + hasedpassword + "', 'admin')", (err) => {
  if (err) {
    console.log("query error", err.stack);
  }
});


client.query("INSERT INTO users ( name, password, role) VALUES ('test2', '" + hasedpassword + "', 'user')", (err) => {
  if (err) {
    console.log("query error", err.stack);
  }
  client.end()
    .catch((err) => {
      console.log("error during disconnection", err.stack);
    });

});


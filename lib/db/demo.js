const config = require('../../config/dbconfig.js');
const { Client } = require('pg');
const client = new Client(config);

client.connect();

client.query('delete from kotoba', (err, result) => {
  if (err) {
    console.log('query error', err.stack);
  }
});

let query = {
  text: 'INSERT INTO kotoba(kotoba_value) VALUES($1)',
};

for (let i = 1; i < 10; i++) {
  let values = [];
  values.push('ことば' + i);
  query.values = values;
  client.query(query, (err, result) => {
    if (err) {
      console.log('query error', err.stack);
    }
  });
}

for (let i = 10; i < 20; i++) {
  let values = [];
  values.push('言葉' + i);
  query.values = values;
  client.query(query, (err, result) => {
    if (err) {
      console.log('query error', err.stack);
    }
  });
}

client.query('select * from kotoba', (err, result) => {
  if (err) {
    console.log('query error', err.stack);
  }
  client.end()
    .catch((err) => {
      console.log('error during disconnection', err.stack);
    });
});



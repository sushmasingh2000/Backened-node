"user strict";
var sql = require("../Config/db.config");
// const path = require("path");

module.exports = {
 
  queryDb: function (query, param) {
    return new Promise((resolve, reject) => {
      sql.query(query, param, (err, result) => {
        if (err) {
          //return reject(err);
          return console.log(err);
        }
        resolve(result);
      });
    });
  },
};

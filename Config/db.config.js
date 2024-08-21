const mysql = require("mysql");
require('dotenv').config()
// Create a connection to the database
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: '',
    database: process.env.DB_NAME,
    multipleStatements: true
});

// open the MySQL connection
connection.connect(error => {
    if (error){
        console.log(error);
        return;
    }
    console.log("Successfully connected to the database.");
});

module.exports = connection;

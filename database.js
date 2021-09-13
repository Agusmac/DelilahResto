require('dotenv').config()
const mysql = require("mysql");


const { pass, host, user, database } = process.env

// console.log({pass,host,user,database})

const config = {
    host: host,
    user: user,
    password: pass,
    database: database,
};


const pool = mysql.createPool(config);

pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === "PROTOCOL_CONNECTION_LOST") {
            console.error("DATABASE CONNECTION WAS CLOSED");
        }
        if (err.code === "ER_CON_COUNT_ERROR") {
            console.error("DATABASE HAS TOO MANY CONNECTIONS");
        }
        if (err.code === "ECONREFUSED") {
            console.error("DATABASE CONNECTION WAS REFUSED");
        }

    }
    if (connection) connection.release();

    console.log("DB is Connected");
    return
});



module.exports = pool;

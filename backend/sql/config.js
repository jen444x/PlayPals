const path = require('path');
const dotenv = require('dotenv');
const Pool = require("pg").Pool;
const config = require("./../config")

const pool = new Pool({
    host                 : config.DB_HOST,            // Postgres ip address[s] or domain name[s]
    port                 : config.DB_PORT,          // Postgres server port[s]
    database             : config.DATABASE,            // Name of database to connect to
    user                 : config.DB_USER,            // Username of database user
    password             : config.PASSWORD,            // Password of database user
});

/*
(async () => {
    try {
        const result = await pool.query('SELECT current_user');
        console.log(result);
    } catch (err) {
        console.error("Database error:", err);
    }
})();
*/

//Creating a pool
/*
const pool = new Pool({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT
});
*/

//Executing a Query
/*
(async () => {
    try {
        const {rows} = await pool.query('SELECT current_user')
        const currentUser = rows[0]['current_user']
        console.log(currentUser);
        await pool.end();
    } catch (err) {
        console.error(err)
    }
})();
*/

module.exports = pool;
//module.exports = pool;
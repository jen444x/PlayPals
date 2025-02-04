const path = require('path');
const dotenv = require('dotenv');
const Pool = require("pg").Pool;

if (process.env.NODE_ENV === 'dev') {
    dotenv.config({path: path.join(__dirname, './../.env.dev')});
} else {
    dotenv.config({path: path.join(__dirname, './../.env.prod')});
}

const pool = new Pool({
    host                 : process.env.HOST,            // Postgres ip address[s] or domain name[s]
    port                 : process.env.PORT,          // Postgres server port[s]
    database             : process.env.DATABASE,            // Name of database to connect to
    user                 : process.env.USER,            // Username of database user
    password             : process.env.PASSWORD,            // Password of database user
});

(async () => {
    try {
        const result = await pool.query('SELECT current_user');
        console.log(result);
    } catch (err) {
        console.error("Database error:", err);
    }
})();

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
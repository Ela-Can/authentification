import mysql from "mysql2/promise";

const pool = mysql.createPool({
    host: process.env.HOST_DB,
    user: process.env.USER_DB,
    password: process.env.PASS_DB,
    database: process.env.NAME_DB,
    port: process.env.PORT_DB,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
})

pool.getConnection()
    .then((connection) => {
        console.log(`Connected to database ${connection.config.database}`);
        connection.release();
    })
    .catch(error => console.error(`Error connecting to database: ${error.message}`));

export default pool;
/* 
  NOTE: MySQL2
const mysql = require("mysql2");

module.exports = pool.promise(); */
const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USERNAME,
  process.env.DATABASE_PASSWORD,
  {
    dialect: "mysql",
    host: process.env.DATABASE_HOSTNAME,
    port: process.env.DATABASE_PORT
  }
);

module.exports = sequelize;

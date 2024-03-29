/* 
  NOTE: MySQL2
const mysql = require("mysql2");

module.exports = pool.promise(); */
const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
const db = require("../config/database").mongoURI;

const mongoConnect = callback => {
  MongoClient.connect(db, { useNewUrlParser: true })
    .then(result => {
      console.log("connected");
      callback(result);
    })
    .catch(err => {
      console.log("CANNOT CONNECT");
      console.log(err);
      throw err;
    });
};

module.exports = mongoConnect;

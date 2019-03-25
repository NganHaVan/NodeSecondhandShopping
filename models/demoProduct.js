// This is demo how to write database to a file and using mysql2
const fs = require("fs");
const path = require("path");
const rootDir = require("../utils/path");
const db = require("../utils/database");

const dataPath = path.join(rootDir, "data", "products.json");

const getProductsFromFile = cb => {
  fs.readFile(dataPath, (err, fileContent) => {
    if (err) {
      cb([]);
    } else if (!fileContent) {
      cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
};

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    // NOTE: Manually writing data to a file
    /* getProductsFromFile(products => {
      if (this.id) {
        const existingProductIndex = products.findIndex(
          prod => prod.id === this.id
        );
        const updatedProduct = [...products];
        updatedProduct[existingProductIndex] = this;
        fs.writeFile(dataPath, JSON.stringify(updatedProduct), error =>
          console.log(error)
        );
      } else {
        this.id = Math.random().toString();
        products.push(this);
        fs.writeFile(dataPath, JSON.stringify(products), error =>
          console.log(error)
        );
      }
    }); */
    // NOTE: Store data into SQL Database
    return db.execute(
      "INSERT INTO Products (title, description, price, imageUrl) VALUES(?, ?, ?, ?)",
      [this.title, this.description, this.price, this.imageUrl]
    );
  }

  static removeById(id) {
    // NOTE: Manually writing data to a file
    /* // NOTE: remove in both Product and Cart file
    getProductsFromFile(products => {
      const foundProductIndex = products.findIndex(prod => prod.id === id);
      if (foundProductIndex !== -1) {
        let productList = products.filter(prod => prod.id !== id);
        fs.writeFile(dataPath, JSON.stringify(productList), error =>
          console.log(error)
        );
      } else {
        return;
      }
    }); */
  }

  // NOTE: Manually writing data to a file
  /* static fetchAll(cb) {
    getProductsFromFile(cb);
  } */
  static fetchAll() {
    return db.execute("SELECT * FROM Products");
  }

  // NOTE: Manually writing data to a file
  /* 
      static findById(id, cb) {
    getProductsFromFile(products => {
      const product = products.find(prod => prod.id === id);
      cb(product);
    }); 
  }
    */
  static findById(id) {
    return db.execute("SELECT * FROM Products WHERE Products.id = ?", [id]);
  }
};

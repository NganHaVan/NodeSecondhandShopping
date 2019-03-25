const fs = require("fs");
const path = require("path");
const rootDir = require("../utils/path");

const dataPath = path.join(rootDir, "data", "cart.json");

module.exports = class Cart {
  static addCart(id, productPrice) {
    // Fetch the previous cart
    fs.readFile(dataPath, (err, content) => {
      let cart = { products: [], totalPrice: 0 };
      if (!err) {
        cart = JSON.parse(content);
      }
      // Analyze the cart => Find existing product
      const existingProductIndex = cart.products.findIndex(
        prod => prod.id === id
      );
      const existingProduct = cart.products[existingProductIndex];
      let updatedProduct;
      if (existingProduct) {
        updatedProduct = { ...existingProduct };
        updatedProduct.qty = updatedProduct.qty + 1;
        cart.products = [...cart.products];
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = { id, qty: 1 };
        cart.products = [...cart.products, updatedProduct];
      }
      cart.totalPrice = cart.totalPrice + Number(productPrice);
      fs.writeFile(dataPath, JSON.stringify(cart), error => {
        console.log(error);
      });
    });
    // Add new product/ increase the quantity
  }

  static removeCartById(id, productPrice) {
    fs.readFile(dataPath, (error, content) => {
      if (error) {
        console.log(error);
      } else {
        const cartList = JSON.parse(content);
        const deletedCartIndex = cartList.products.findIndex(
          cart => cart.id === id
        );
        if (deletedCartIndex === -1) {
          return;
        } else {
          cartList.totalPrice =
            cartList.totalPrice -
            cartList.products[deletedCartIndex].qty * productPrice;
          console.log({
            totalPrice: cartList.totalPrice,
            id,
            qty: cartList.products[deletedCartIndex].qty,
            productPrice
          });
          let updatedList = {
            products: cartList.products.filter(prod => prod.id !== id),
            totalPrice: cartList.totalPrice
          };
          fs.writeFile(dataPath, JSON.stringify(updatedList), err =>
            console.log(err)
          );
        }
      }
    });
  }

  static getCart(cb) {
    fs.readFile(dataPath, (error, fileContent) => {
      if (!error) {
        cb({ ...JSON.parse(fileContent) });
      }
    });
  }
};

const express = require("express");
const path = require("path");
const isAuth = require("../middleware/is-auth");
// const rootDir = require("../utils/path");
const adminController = require("../controllers/admin");

const router = express.Router();
// GET - /admin/ads-product
router.get("/add-product", adminController.getAddProduct);

// GET - /admin/products
router.get("/products", adminController.getProducts);

// POST - /admin/add-product
router.post("/add-product", adminController.postAddProduct);

// GET - /admin/edit-product/:productId?edit=true
router.get("/edit-product/:productId", adminController.getEditProduct);

// POST - /admin/edit-product
router.post("/edit-product", adminController.postEditProduct);

// POST - /admin/delete-product
router.post("/delete-product/:productId", adminController.deleteProduct);
// Default export
// module.exports = router;

module.exports = router;

const express = require("express");
const path = require("path");
const isAuth = require("../middleware/is-auth");
// const rootDir = require("../utils/path");
const adminController = require("../controllers/admin");

const router = express.Router();
// GET - /admin/ads-product
router.get("/add-product", isAuth, adminController.getAddProduct);

// GET - /admin/products
router.get("/products", isAuth, adminController.getProducts);

// POST - /admin/add-product
router.post("/add-product", isAuth, adminController.postAddProduct);

// GET - /admin/edit-product/:productId?edit=true
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

// POST - /admin/edit-product
router.post("/edit-product", isAuth, adminController.postEditProduct);

// POST - /admin/delete-product
router.post(
  "/delete-product/:productId",
  isAuth,
  adminController.deleteProduct
);
// Default export
// module.exports = router;

module.exports = router;

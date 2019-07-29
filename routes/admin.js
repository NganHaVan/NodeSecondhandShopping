const express = require("express");
const path = require("path");
const isAuth = require("../middleware/is-auth");
const { check, body } = require("express-validator");
// const rootDir = require("../utils/path");
const adminController = require("../controllers/admin");

const router = express.Router();
// GET - /admin/ads-product
router.get("/add-product", isAuth, adminController.getAddProduct);

// GET - /admin/products
router.get("/products", isAuth, adminController.getProducts);

// POST - /admin/add-product
router.post(
  "/add-product",
  [
    check("title")
      .isAlphanumeric()
      .withMessage("Invalid title")
      .trim(),
    check("price")
      .isFloat()
      .withMessage("Invalid price"),
    body("image")
      .isEmpty()
      .custom((value, { req }) => {
        if (!req.file) {
          throw new Error("Invalid or empty image");
        } else {
          return Promise.resolve();
        }
      }),
    check("description")
      .isLength({ min: 5 })
      .withMessage(
        "Your description should have at least 5 character. Please tell us more about your product"
      )
  ],
  isAuth,
  adminController.postAddProduct
);

// GET - /admin/edit-product/:productId?edit=true
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

// POST - /admin/edit-product
router.post(
  "/edit-product",
  [
    check("title")
      .isAlphanumeric()
      .withMessage("Invalid title")
      .trim(),
    check("price")
      .isFloat()
      .withMessage("Invalid price"),
    body("image")
      .isEmpty()
      .custom((value, { req }) => {
        if (!req.file) {
          throw new Error("Invalid or empty image");
        } else {
          return Promise.resolve();
        }
      }),
    check("description")
      .isLength({ min: 5 })
      .withMessage(
        "Your description should have at least 5 character. Please tell us more about your product"
      )
  ],
  isAuth,
  adminController.postEditProduct
);

// POST - /admin/delete-product
router.post(
  "/delete-product/:productId",
  isAuth,
  adminController.deleteProduct
);
// Default export
// module.exports = router;

module.exports = router;

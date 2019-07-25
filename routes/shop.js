const express = require("express");
const path = require("path");
const rootDir = require("../utils/path");
const shopController = require("../controllers/shop");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

// If shop use route.use() to decalre the route, the order of other routes will matter. They must be put above shop, otherwise it never be reached. It'd better use use() for middleware and explicit method when declare the routes
router.get("/", shopController.getIndex);

router.get("/products", shopController.getProducts);

// NOTE: The route below is dynamic when it relates to query or params. That's why when you have a static/ specific route(i.e, /products/delete) and dynamic route, you should write specific route before the dynamic one, otherwise, it will never be reached
router.get("/products/:productId", shopController.getProduct);

router.get("/cart", shopController.getCart);

router.post("/cart", shopController.postCart);

router.post("/cart-delete-item", shopController.deleteCart);

router.get("/orders", shopController.getOrders);

// router.get("/orders/:orderId", isAuth, shopController.getInvoice);

router.post("/create-order", shopController.postOrder);

// router.get("/checkout", isAuth, shopController.getCheckout);

module.exports = router;

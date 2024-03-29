const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const rootDir = require("../utils/path");

const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user");
const errorUtils = require("../utils/errors");

const { stripeCharges } = require("../utils/stripe");

const ITEM_PER_PAGE = 3;

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        csrfToken: res.locals.csrfToken,
        user: req.user ? req.user.name : ""
      });
    })
    .catch(err => errorUtils.handle500Error(err, next));
  /* Product.fetchAll(products => {
    res.render("shop/product-list", {
      prods: products,
      pageTitle: "All Products",
      path: "/products"
    });
  }); */
  /* 
  // mysql2
  Product.fetchAll().then(([rows, fields]) => {
    res.render("shop/product-list", {
      prods: rows,
      pageTitle: "All Products",
      path: "/products"
    });
  }); */
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        // Path in navigation
        path: "/products",
        csrfToken: res.locals.csrfToken,
        user: req.user ? req.user.name : ""
      });
    })
    .catch(err => errorUtils.handle500Error(err, next));
  /* Product.findById(prodId, prod => {
    res.render("shop/product-detail", {
      product: prod,
      pageTitle: prod.title,
      // Path in navigation
      path: "/products"
    });
  }); */
  /* 
  // mysql2
  Product.findById(prodId).then(([product]) => {
    console.log({ product });
    res.render("shop/product-detail", {
      product: product[0],
      pageTitle: product[0].title,
      // Path in navigation
      path: "/products"
    });
  }); */
};

exports.getIndex = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  let totalProducts;
  Product.find()
    .count()
    .then(number => {
      totalProducts = number;
      return Product.find()
        .skip((page - 1) * ITEM_PER_PAGE)
        .limit(ITEM_PER_PAGE);
    })
    .then(products => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        totalProducts,
        currentPage: page,
        hasNextPage: ITEM_PER_PAGE * page < totalProducts,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalProducts / ITEM_PER_PAGE),
        csrfToken: res.locals.csrfToken,
        user: req.user ? req.user.name : ""
      });
    })
    .catch(err => errorUtils.handle500Error(err, next));
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then(user => {
      let products = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
        csrfToken: res.locals.csrfToken,
        user: req.user.name
      });
    })
    .catch(err => errorUtils.handle500Error(err, next));
};

// NOTE: req.body is captured by the name - value attributes from input tag in HTML
exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(prod => {
      return req.user.addToCart(prod);
    })
    .then(result => {
      res.redirect("/cart");
    })
    .catch(err => errorUtils.handle500Error(err, next));
};

exports.deleteCart = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeCart(prodId)
    .then(() => {
      res.redirect("/cart");
    })
    .catch(err => errorUtils.handle500Error(err, next));
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then(orders => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your orders",
        orders,
        csrfToken: res.locals.csrfToken,
        user: req.user.name
      });
    })
    .catch(err => errorUtils.handle500Error(err, next));
};

exports.postOrder = (req, res, next) => {
  console.log("post order");
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then(async user => {
      const products = user.cart.items;
      let total = 0;
      products.forEach(p => {
        total += p.productId.price * p.quantity;
      });

      let totalInCents = total * 100;

      // const result = await stripeCharges(req, totalInCents); //ASYNCHRONOUS FUNCTION created above is used here
      const result = true;
      console.log({ result });

      //this works slightly differently to Maximilians code
      //only if stripe successfully charged the credit card will the orders collection be filled
      if (result) {
        console.log("Got token");
        return user; //we return the user so it can be used in the then block below
      } else {
        return;
      }
    })
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });

      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(result => {
      res.redirect("/orders");
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getInvoice = async (req, res, next) => {
  const { orderId } = req.params;
  // NOTE: Authorization for downloading invoice
  // Order.findByPk(orderId)
  //   .then(async order => {
  //     if (!order) {
  //       return next(new Error("No orders found."));
  //     }
  //     if (order.userId !== req.user.id) {
  //       return next(new Error("Unauthorized download"));
  //     }
  //     const orderItems = await OrderItem.findAll({
  //       include: [Product]
  //     });
  //     if (orderItems.length === 0) {
  //       return next(new Error("No order items found"));
  //     }
  //     console.log({ products: orderItems.title });
  //     /* const invoiceName = `invoice-${orderId}.pdf`;
  //     const invoicePath = path.join(rootDir, "data", "invoices", invoiceName); */
  //     // NOTE: Reading file data into memory and serve it as a response is not a good practice, especially ehen the data is big because it is a burden to server mempry
  //     /* fs.readFile(invoicePath, (err, data) => {
  //       if (err) {
  //         return next(err);
  //       }
  //       res.setHeader("Content-Type", "application/pdf");
  //       // Set filename for the invoice when download
  //       res.setHeader("Content-Disposition", `inline; filename=${invoiceName}`);
  //       res.send(data);
  //     }); */

  //     // Streaming data
  //     /* const file = fs.createReadStream(invoicePath);
  //     res.setHeader("Content-Type", "application/pdf");
  //     res.setHeader("Content-Disposition", `inline; filename=${invoiceName}`);
  //     file.pipe(res); */

  //     // Streaming data by pdfkit
  //     /* const pdfDoc = new PDFDocument();
  //     res.setHeader("Content-Type", "application/pdf");
  //     res.setHeader("Content-Disposition", `inline; filename=${invoiceName}`);
  //     pdfDoc.pipe(fs.createWriteStream(invoicePath));
  //     pdfDoc.pipe(res);

  //     pdfDoc.fontSize(26).text("Invoice", {
  //       underline: true
  //     })
  //     pdfDoc.text('-----------------');
  //     orderItems.forEach(item => )
  //     pdfDoc.text("Hello World!");
  //     pdfDoc.end(); */
  //   });
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("No orders found.");
    }
    if (order.userId !== req.user._id) {
      throw new Error("Unauthorized download");
    }
    const products = await order.find();
    if (products.length === 0) {
      throw new Error("No items found.");
    }
    /* let productInvoice = await products.reduce(async (acc, prod, index) => {
      let collection = await acc;
      const item = await OrderItem.findOne({
        where: { orderId, productId: prod.id }
      });
      if (item) {
        collection = [...collection, { ...prod, quantity: item.quantity }];
      }
      return collection;
    }, Promise.resolve([])); */
    // Streaming data by pdfkit
    const invoiceName = `invoice-${orderId}.pdf`;
    const invoicePath = path.join(rootDir, "data", "invoices", invoiceName);
    const pdfDoc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=${invoiceName}`);
    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);

    pdfDoc.fontSize(26).text("Invoice", {
      underline: true
    });
    pdfDoc.text("-----------------");
    products.forEach(invoice => {
      pdfDoc.text(
        `${invoice.title}(${invoice.price}/each): ${invoice.orderItem.quantity} unit(s)`
      );
    });
    pdfDoc.text("------------------");
    pdfDoc.text(
      "Total: " +
        products.reduce((acc, prod) => {
          acc += prod.price * prod.orderItem.quantity;
          return acc;
        }, 0)
    );
    pdfDoc.end();
  } catch (err) {
    console.log(err);
    return next(err);
  }
};

exports.getCheckout = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then(user => {
      let products = user.cart.items;
      let total = 0;
      products.forEach(prod => {
        total += prod.quantity * prod.productId.price;
      });
      res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        products: products,
        csrfToken: res.locals.csrfToken,
        user: req.user.name,
        totalSum: total
      });
    })
    .catch(err => errorUtils.handle500Error(err, next));
};

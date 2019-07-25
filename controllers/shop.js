const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const rootDir = require("../utils/path");

const Product = require("../models/product");
// const Cart = require("../models/cart");
const Order = require("../models/order");
// const OrderItem = require("../models/order-item");
// const User = require("../models/user");
const errorUtils = require("../utils/errors");

const ITEM_PER_PAGE = 3;

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products"
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
        path: "/products"
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
  /* Product.findAndCountAll({ offset: (page - 1) * ITEM_PER_PAGE, limit: ITEM_PER_PAGE })
    .then(products => {
      console.log({result: products})
      res.render("shop/index", {
        prods: products.rows,
        pageTitle: "Shop",
        path: "/"
      });
    }) */
  Product.countDocuments()
    .then(total => {
      totalProducts = total;
      return Product.find({
        offset: (page - 1) * ITEM_PER_PAGE,
        limit: ITEM_PER_PAGE
      });
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
        lastPage: Math.ceil(totalProducts / ITEM_PER_PAGE)
      });
    })
    .catch(err => errorUtils.handle500Error(err, next));
  /* Product.fetchAll(products => {
    res.render("shop/index", {
      prods: products,
      pageTitle: "Shop",
      path: "/"
    });
  }); */
  /* 
  // mysql2
  Product.fetchAll()
    .then(([rows, fields]) => {
      // console.log({ rows, fields });
      res.render("shop/index", {
        prods: rows,
        pageTitle: "Shop",
        path: "/"
      });
    })
    .catch(err => console.log(err)); */
};

exports.getCart = (req, res, next) => {
  // Manual
  /* Cart.getCart(({ products, totalPrice }) => {
    Product.fetchAll(prods => {
      let cartList = [];
      for (prod of prods) {
        let foundProduct = products.find(product => product.id === prod.id);
        if (foundProduct) {
          cartList = [...cartList, { ...prod, qty: foundProduct.qty }];
        }
      }
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your cart",
        products: cartList,
        totalPrice
      });
    });
  }); */
  /* User.findByPk(req.session.user.id)
    .then(user => user.getCart())
    .then(cart => {
      return cart
        .getProducts()
        .then(products => {
          res.render("shop/cart", {
            path: "/cart",
            pageTitle: "Your Cart",
            products: products,
            isAuthenticated: req.session.isLoggedIn
          });
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err)); */

  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then(user => {
      let products = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products
      });
    })
    .catch(err => errorUtils.handle500Error(err, next));
};

// NOTE: req.body is captured by the name - value attributes from input tag in HTML
exports.postCart = (req, res, next) => {
  // Check name attributes in product-detail.ejs
  /* const prodId = req.body.productId;
  const product = Product.findById(prodId, prod => {
    Cart.addCart(prodId, prod.price);
  });
  res.redirect("/cart"); */

  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(prod => {
      return req.user.addToCart(prod);
    })
    .then(result => {
      res.redirect("/cart");
    });
  /* let fetchedCart;
  let newQuantity = 1;
  let sessionUser;
  User.findByPk(req.session.user.id)
    .then(user => {
      sessionUser = user;
      return user.getCart();
    })
    .then(cart => {
      if (!cart) {
        return sessionUser.createCart();
      }
      return cart;
    })
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: prodId } });
    })
    .then(products => {
      let product;
      if (products.length > 0) {
        product = products[0];
      }

      if (product) {
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        return product;
      }
      return Product.findByPk(prodId);
    })
    .then(product => {
      // addProduct also create and update if product does not exist
      return fetchedCart.addProduct(product, {
        through: { quantity: newQuantity }
      });
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch(err => errorUtils.handle500Error(err, next)); */
};

exports.deleteCart = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeCart(prodId)
    .then(result => res.redirect("/cart"))
    .catch(err => errorUtils.handle500Error(err, next));
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then(orders => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your orders",
        orders
      });
    })
    .catch(err => errorUtils.handle500Error(err, next));
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then(user => {
      let products = user.cart.items.map(item => {
        return {
          productData: { ...item.productId._doc },
          quantity: item.quantity
        };
      });
      const order = new Order({
        user: {
          name: req.user.name,
          userId: req.user
        },
        products
      });
      order.save();
    })
    .then(result => req.user.clearCart())
    .then(result => res.redirect("/orders"))
    .catch(err => errorUtils.handle500Error(err, next));
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
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new Error("No orders found.");
    }
    if (order.userId !== req.user.id) {
      throw new Error("Unauthorized download");
    }
    const products = await order.getProducts();
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
        `${invoice.title}(${invoice.price}/each): ${
          invoice.orderItem.quantity
        } unit(s)`
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
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout"
  });
};

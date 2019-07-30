const { validationResult } = require("express-validator");
const Product = require("../models/product");
// const Cart = require("../models/cart");
const path = require("../utils/path");
const errorUtils = require("../utils/errors");
const fileUtils = require("../utils/file");

exports.getAddProduct = (req, res, next) => {
  // res.sendFile(path.join(rootDir, "views", "add-product.html"));
  // NOTE: Protect route
  /* if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  } */
  res.render("admin/edit-product", {
    pageTitle: "Product form",
    path: "/admin/add-product",
    editing: false,
    product: undefined,
    errorMessage: "",
    csrfToken: res.locals.csrfToken,
    user: req.user.name
  });
};

exports.postAddProduct = (req, res, next) => {
  // console.log(req.body); => {title: 'good'}
  const { title, price, description } = req.body;
  const image = req.file;

  // NOTE: In server.js, you already defined the relationship between Products and Users, Sequelize can now create associated methods with 'get', 'create' + methodName
  // Before
  /* Product.create({
    title,
    imageUrl,
    price,
    description,
    UserId: req.user.id
  })
    .then(() => res.redirect("/"))
    .catch(err => console.log(err)); */

  const errors = validationResult(req);
  if (image && errors.isEmpty()) {
    const imageUrl = image.path;
    const product = new Product({
      title,
      price,
      description,
      imageURL: imageUrl,
      userId: req.user._id
    });
    return product
      .save()
      .then(() => res.redirect("/"))
      .catch(err => {
        errorUtils.handle500Error(err, next);
      });
  } else {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Product form",
      path: "/admin/add-product",
      editing: false,
      product: { title, price, description },
      errorMessage: errors.array(),
      csrfToken: res.locals.csrfToken,
      user: req.user.name
    });
  }
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const productId = req.params.productId;
  /* Product.findById(productId, product => {
    if (!product) {
      return res.redirect("/");
    }
    res.render("admin/edit-product", {
      pageTitle: "Product form",
      path: "/admin/add-product",
      editing: editMode,
      product
    });
  }); */
  // Association method
  /* req.user
    .getProducts({ where: { id: productId } })
    .then(products => {
      if (products.length === 0) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Product form",
        path: "/admin/add-product",
        editing: editMode,
        product: products[0],
        errorMessage: ""
      });
    })
    .catch(err => {
      errorUtils.handle500Error(err, next);
    }); */

  Product.findById(productId)
    .then(product => {
      res.render("admin/edit-product", {
        pageTitle: "Product form",
        path: "/admin/add-product",
        editing: editMode,
        product,
        errorMessage: "",
        csrfToken: res.locals.csrfToken,
        user: req.user.name
      });
    })
    .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const { productId, title, description, price } = req.body;
  const image = req.file;
  /* const editedProduct = new Product(
    productId,
    title,
    imageUrl,
    description,
    price
  );
  editedProduct.save();
  res.redirect("/admin/products"); */
  return Product.findById(productId)
    .then(prod => {
      if (prod.userId.toString() !== req.user._id.toString()) {
        console.log({
          prodUserId: prod.userId.toString(),
          userId: req.user._id.toString()
        });
        return res.redirect("/");
      }
      prod.title = title;
      prod.price = price;
      prod.description = description;
      if (image && image.path !== prod.imageURL) {
        fileUtils.deleteFile(prod.imageURL);
        prod.imageURL = image.path;
      }
      return prod.save();
    })
    .then(() => res.redirect("/admin/products"))
    .catch(err => errorUtils.handle500Error(err, next));
};

exports.getProducts = (req, res, next) => {
  // To render HTML file
  // res.sendFile(path.join(rootDir, "views", "shop.html"));

  // const products = adminData.products;
  // console.log(products);
  /* Product.fetchAll(products => {
    // To render Templating Engine
    res.render("admin/products", {
      prods: products,
      pageTitle: "Admin product",
      path: "/admin/products"
    });
  }); */
  Product.find({ userId: req.user._id })
    .then(products => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Your product",
        path: "/admin/products",
        csrfToken: res.locals.csrfToken,
        user: req.user.name
      });
    })
    .catch(err => errorUtils.handle500Error(err, next));
};

exports.deleteProduct = (req, res, next) => {
  const productId = req.params.productId;
  /* Product.findById(productId, product =>
    Cart.removeCartById(productId, product.price)
  );
  Product.removeById(productId);
  res.redirect("/admin/products"); */
  Product.deleteOne({ _id: productId, userId: req.user._id })
    .then(removedProd => {
      fileUtils.deleteFile(removedProd.imageURL);
      res.redirect("/admin/products");
    })
    .catch(err => {
      errorUtils.handle500Error(err, next);
    });
};

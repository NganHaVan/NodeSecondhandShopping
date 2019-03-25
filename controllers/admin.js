const Product = require("../models/product");
const Cart = require("../models/cart");
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
    errorMessage: ""
  });
};

exports.postAddProduct = (req, res, next) => {
  // console.log(req.body); => {title: 'good'}
  const { title, price, description } = req.body;
  const image = req.file;
  /* const product = new Product(null, title, imageUrl, description, price);
  product
    .save()
    .then(() => res.redirect("/"))
    .catch(err => console.log(err)); */

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
  if (image) {
    const imageUrl = image.path;
    return Product.create({
      title,
      imageUrl,
      price,
      description,
      userId: req.session.user.id
    })
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
      errorMessage: "Attached file is not an image"
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
  req.user
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
    });

  /* Product.findByPk(productId)
    .then(product => {
      res.render("admin/edit-product", {
        pageTitle: "Product form",
        path: "/admin/add-product",
        editing: editMode,
        product
      });
    })
    .catch(err => console.log(err)); */
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
  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Product form",
      path: "/admin/add-product",
      editing: true,
      product: { title, description, price },
      errorMessage: "Attached file is not image"
    });
  }
  return Product.findByPk(productId)
    .then(product => {
      if (product.userId !== req.user.id) {
        return res.redirect("/");
      }
      fileUtils.deleteFile(product.imageUrl);
      const imageUrl = image.path;
      return Product.update(
        { title, imageUrl, description, price },
        {
          where: {
            id: productId
          }
        }
      );
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
  Product.findAll({ where: { userId: req.user.id } })
    .then(products => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin product",
        path: "/admin/products"
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
  Product.findByPk(productId)
    .then(prod => {
      if (prod.userId !== req.user.id) {
        return res.redirect("/");
      }
      fileUtils.deleteFile(prod.imageUrl);
      return prod.destroy();
    })
    .then(() => res.redirect("/admin/products"))
    .catch(err => {
      errorUtils.handle500Error(err, next);
    });
};

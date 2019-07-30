const User = require("../models/user");
const bcrypt = require("bcryptjs");
const authUtils = require("../utils/auth");
const errorUtils = require("../utils/errors");
const crypto = require("crypto");
const Sequelize = require("sequelize");
const { validationResult } = require("express-validator");

exports.getLogin = (req, res, next) => {
  // NOTE: how to get request header
  /* console.log({ cookie: req.get("Cookie"), host: req.get("Host") }); */

  // NOTE: You set cookie in Header in postLogin, below is how you get the value of isLoggedIn
  /* const isLoggedIn = req
    .get("Cookie")
    .split(";")[1]
    .trim()
    .split("=")[1];
  req.session.isLoggedIn = isLoggedIn; */

  authUtils.checkIsLoggedIn(req);
  let message = authUtils.getErrorMessage(req);
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: false,
    errorMessage: message,
    csrfToken: res.locals.csrfToken,
    oldInput: { email: "", password: "" },
    validationErrors: []
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      isAuthenticated: false,
      errorMessage: "Invalid email or password.",
      csrfToken: res.locals.csrfToken,
      validationErrors: errors.array(),
      oldInput: { email, password }
    });
  }
  User.findOne({ email })
    .then(user => {
      if (!user) {
        // NOTE: Flash error message into session
        req.flash("error", "Invalid email or wrong password!");
        return req.session.save(err => {
          res.redirect("/login");
        });
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            // NOTE: You must save session here, because session middleware take a little time to save data in db. redirect() is fired independently. It does not wait until session has been stored in db
            return req.session.save(err => {
              if (err) {
                console.log(err);
              }
              return res.redirect("/");
            });
          } else {
            req.flash("error", "Invalid email or password.");
            return req.session.save(err => {
              res.redirect("/login");
            });
          }
        })
        .catch(err => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch(err => errorUtils.handle500Error(err, next));
};

exports.getSignUp = (req, res, next) => {
  authUtils.checkIsLoggedIn(req);
  let message = authUtils.getErrorMessage(req);
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Sign up",
    isAuthenticated: false,
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
      name: "",
      confirmPassword: ""
    },
    validationErrors: [],
    csrfToken: res.locals.csrfToken
  });
};

exports.postSignup = (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;
  // NOTE: validationResult will take the error form express-validator middleware check
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log({ errors: errors.array() });
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Sign up",
      isAuthenticated: false,
      errorMessage: errors.array(),
      oldInput: { name, email, password, confirmPassword },
      validationErrors: errors.array()
    });
  }
  bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      let newUser = new User({
        name,
        email,
        password: hashedPassword,
        cart: { items: [] }
      });
      return newUser.save();
    })
    .then(user => {
      User.findById(user._id).then(newUser => {
        req.session.isLoggedIn = true;
        req.session.user = newUser;
        // NOTE: You must save session here, because session middleware take a little time to save data in db. redirect() is fired independently. It does not wait until session has been stored in db
        req.session.save(err => {
          if (err) {
            console.log(err);
          }
          res.redirect("/");
        });
      });
    })
    .catch(err => errorUtils.handle500Error(err, next));
};

exports.getResetPassword = (req, res, next) => {
  authUtils.checkIsLoggedIn(req);
  let message = authUtils.getErrorMessage(req);
  res.render("auth/reset", {
    path: "/reset-password",
    pageTitle: "Reset password",
    errorMessage: message,
    token: null,
    email: null,
    env: process.env.NODE_ENV || "development",
    csrfToken: res.locals.csrfToken
  });
};

exports.postResetPassword = (req, res, next) => {
  const { email } = req.body;
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log({ error: err });
      req.flash(
        "error",
        "Sorry, something went wrong. We cannot reset your password. Please try again!"
      );
      return req.session.save(err => {
        res.redirect("/reset-password");
      });
    }
    const token = buffer.toString("hex");
    User.findOne({ email })
      .then(user => {
        if (!user) {
          req.flash("error", "No account found with that email.");
          /* return req.session.save(err => {
            res.redirect("/reset-password");
          }); */
          return res.redirect("/reset-password");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(() => {
        return res.render("auth/reset", {
          path: "/reset-password",
          pageTitle: "Reset password",
          errorMessage: null,
          token,
          email,
          env: process.env.NODE_ENV || "development"
        });
      })
      // TODO: Send email
      .catch(err => errorUtils.handle500Error(err, next));
  });
};

exports.postLogout = (req, res, next) => {
  // Method of express-session
  req.session.destroy(function(err) {
    // cannot access session here
    if (err) {
      console.log(err);
    }
    res.clearCookie("connect.sid", { domain: "localhost", path: "/" });
    res.redirect("/login");
  });
};

exports.getNewPassword = (req, res, next) => {
  const { token } = req.params;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: {
      $gt: Date.now()
    }
  })
    .then(user => {
      if (!user) {
        req.flash("error", "Invalid token or expired token. Please try again");
        return req.session.save(err => res.redirect("/reset-password"));
      }
      return res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New password",
        errorMessage: null,
        userId: user._id.toString(),
        passwordToken: token,
        csrfToken: res.locals.csrfToken
      });
    })
    .catch(err => errorUtils.handle500Error(err, next));
};

exports.postNewPassword = (req, res, next) => {
  const { userId, passwordToken, password } = req.body;
  let resetUser;
  User.findOne({
    _id: userId,
    resetToken: passwordToken,
    resetTokenExpiration: {
      $gt: Date.now()
    }
  })
    .then(user => {
      if (!user) {
        req.flash(
          "error",
          "User does not exist or your request is no longer valid. Please try again!"
        );
        return req.session.save(err => res.redirect("/reset-password"));
      }
      resetUser = user;
      return bcrypt.hash(password, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(() => res.redirect("/login"))
    .catch(error => errorUtils.handle500Error(error, next));
};

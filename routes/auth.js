const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const { check, body } = require("express-validator/check");
const User = require("../models/user");

router.get("/login", authController.getLogin);

router.post("/login", authController.postLogin);

router.post("/logout", authController.postLogout);

router.get("/signup", authController.getSignUp);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email!")
      .normalizeEmail()
      .trim()
      // NOTE: express validator will check if custom return true or false, return throw error or to return a promise (in this case, express validator will wait until it is fulfilled)
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(user => {
          if (user) {
            return Promise.reject("Email exists already. You can login now");
          }
        });
      }),
    body("password", "The password must have at least 5 characters").isLength({
      min: 5
    }),
    body("confirmPassword").custom((value, { req, location, path }) => {
      // console.log({ location, path });
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    })
  ],
  authController.postSignup
);

router.get("/reset-password", authController.getResetPassword);

router.post("/reset-password", authController.postResetPassword);

router.get("/new-password/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);
module.exports = router;

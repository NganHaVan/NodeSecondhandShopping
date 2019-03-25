exports.checkIsLoggedIn = req => {
  if (req.session.isLoggedIn) {
    return res.redirect("/");
  }
};

exports.getErrorMessage = req => {
  let message = req.flash("error"); // It is removed from session
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  return message;
};

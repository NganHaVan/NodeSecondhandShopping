exports.get404 = (req, res, next) => {
  // res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
  res.status(404).render("404", {
    pageTitle: "Not found",
    path: "/404",
    isAuthenticated: req.session.isLoggedIn,
    csrfToken: res.locals.csrfToken
  });
};

exports.get500 = (req, res, next) => {
  res.status(500).render("500", {
    pageTitle: "Page Error",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
    csrfToken: res.locals.csrfToken,
    user: req.user ? req.user.name : ""
  });
};

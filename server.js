// const https = require("https");
// const routes = require("./routes");

// Create server by http package, not express
// First thing: Create a server
// const server = http.createServer(routes);

// server.listen(8080, () => console.log("Server is running on port 8080"));

// Using express package
const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
// const SequelizeStore = require("connect-session-sequelize")(session.Store);
// const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const mongoose = require("mongoose");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
// const authRoutes = require("./routes/auth");
// const errorController = require("./controllers/error");
// const db = require("./utils/database");
const mongoURI = require("./config/database").mongoURI;
const User = require("./models/user");

const envResult = require("dotenv").config({
  path: path.join(__dirname, ".env")
});
if (envResult.error) {
  throw envResult.error;
}

// const store = new SequelizeStore({ db: sequelize });

// const csrfProtection = csrf();

/* const privateKey = fs.readFileSync("server.key");
const certificate = fs.readFileSync("server.cert"); */

const app = express();

app.enable("trust proxy");

// Register templating engine
app.set("view engine", "ejs");
app.set("views", "views");

/* db.execute("SELECT * FROM Products")
  .then(result => console.log(result))
  .catch(err => console.log(err)); */

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));

app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + "-" + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
// NOTE: uploaded images will be saved in the images folder
app.use(multer({ storage: fileStorage, fileFilter }).single("image"));

app.use(
  session({
    secret: "My secret for node project",
    resave: false,
    saveUninitialized: true,
    unset: "destroy"
  })
);

// app.use(csrfProtection);
// NOTE: We can use middleware on the req obj
app.use(flash());

// res.locals => Create local variable for all views(only)
app.use((req, res, next) => {
  res.locals.isAuthenticated = true;
  // res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  User.findById("5d35d11dc2c61018d8e7e2fd")
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => {
      console.log(err);
    });
});

/* app.use((req, res, next) => {
  if (!req.session.user) {
    next();
  } else {
    User.findByPk(req.session.user.id)
      .then(user => {
        if (!user) {
          return next();
        }
        req.user = user;
        next();
      })
      .catch(error => {
        next(new Error(error));
      });
  }
}); */

// NOTE: Middleware runs only when there are any incoming request

// Don't put it under middleware functions (which using app.use()), because it is accessed only when we call next()
app.use("/admin", adminRoutes);
app.use(shopRoutes);
// app.use(authRoutes);

// Handle error pages
// app.get("/500", errorController.get500);
// app.use(errorController.get404);
//  NOTE: Express can detect this is a special kind of middleware and move right away to error handling middleware when next(params) is called
/* app.use((error, req, res, next) => {
  // console.log(error);
  if (error) {
    res.status(500).render("500", {
      pageTitle: "Page Error",
      path: "/500",
      isAuthenticated: req.session.isLoggedIn
    });
    // res.status(500).send("Something went wrong");
  }
}); */

/* // Allow using middleware functions - accept an array of request handlers. It is executed when you access the website
app.use((req, res, next) => {
  console.log("I am in the middleware");
  // Allow the request to continue to the next middleware. We should call next() if we don't send any responses
  next();
});

app.use((req, res, next) => {
  console.log("I am in another middleware");
  res.send("<h1>Hello from Express</h1>");
}); */

mongoose
  .set("useNewUrlParser", true)
  .connect(mongoURI)
  .then(res => {
    console.log("Connected to MLab");
    User.find({ email: "ha@example.com" })
      .then(user => {
        if (!user) {
          const user = new User({
            name: "Ha Van",
            email: "ha@example.com",
            cart: {
              items: []
            }
          });
          user.save();
        }
      })
      .catch(err => console.log(err));
    app.listen(process.env.PORT || 8080, () => {
      console.log(`Server is running on port ${process.env.PORT || 8080}`);
    });
  })
  .catch(err => {
    console.log(err);
    throw err;
  });

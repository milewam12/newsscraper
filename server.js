var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var port = process.env.PORT || 3000;

var app = express();


app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://heroku_f59nkcd9:nbm4h6tm2j89v72hr1ve704ou6@ds135966.mlab.com:35966/heroku_f59nkcd9";
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
  useMongoClient: true
});
// mongoose.Promise = Promise;
// mongoose.connect("mongodb://localhost/eltiempoDB", {
//   useMongoClient: true
// });

// Routes
// This route renders the homepage
app.get("/", function(req, res) {
  res.render("index");
});

// A GET route for scraping website
app.get("/scrape", function(req, res) {
  axios.get("http://www.eltiempo.com/").then(function(response) {
    var $ = cheerio.load(response.data);

    $("article h3").each(function(i, element) {
  
      var result = {};

      result.title = $(this)
        .children("a")
        .text();
       
      result.link = $(this)
        .children("a")
        .attr("href");

      db.Article
        .create(result)
        .then(function(dbArticle) {
          res.send("Scrape Complete");
        })
        .catch(function(err) {
          res.json(err);
        });
    });
  });
});

//save notes to mongo
app.post("/submit", function(req, res) {
  console.log(req.body);

  db.notes.insert(req.body, function(error, saved) {
    if (error) {
      console.log(error);
    }
    else {
      res.send(saved);
    }
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
 
  db.Article
    .find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {

      res.json(err);
    });
});

//grabbing a specific Article by id
app.get("/articles/:id", function(req, res) {
  db.Article
    .findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  db.Note
    .create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});

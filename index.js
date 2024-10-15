const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');
const bodyParser = require("body-parser");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {res.sendFile(__dirname + "/views/index.html");});
app.use("/", bodyParser.urlencoded({ extended: false }));

const ExerciseSchema = new mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: Date,
  _id: String,
});

const UserSchema = new mongoose.Schema({
  username: String,
  _id: String,
});

const LogSchema = new mongoose.Schema({
  username: String,
  count: Number,
  _id: String,
  log: [
    {
      description: String,
      duration: Number,
      date: Date,
    },
  ],
});

const User = mongoose.model("User", UserSchema);
const Log = mongoose.model("User", LogSchema);
const Exercise = mongoose.model("User", ExerciseSchema);

const createUserObject = (username, done) => {
  Url.create(
    {
      username: username,
      _id: uuidv4()
    },
    (err, data) => {
      if (err) {
        return done(err);
      } else {
        done(null, data);
      }
    }
  );
};

app.post("/api/users", (req, res) => {
  createUserObject(req., (err, data) => {
    if (err) return res.json({ error: err });
    res.json({
      username: data.username,
      _id: data._id
    });
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

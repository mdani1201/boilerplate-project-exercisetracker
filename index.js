const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});
app.use("/", bodyParser.urlencoded({ extended: false }));

const ExerciseSchema = new mongoose.Schema({
  description: String,
  duration: Number,
  date: String,
});

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
});

const User = mongoose.model("User", UserSchema);

const Exercise = mongoose.model("Exercise", ExerciseSchema);

const createUserObject = (username, done) => {
  User.create(
    {
      username: username,
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
  createUserObject(req.body.username, (err, data) => {
    if (err) {
      console.log(err);
      return res.json({ error: err });
    }
    res.send({ username: data.username });
  });
});

app.get("/api/users", (req, res) => {
  User.find((err, data) => {
    var dataArray = [];
    if (err) {
      res.json({ error: err });
    } else {
      data.forEach((user) => {
        dataArray.push(`${user.username} ${user._id}`);
      });
      res.send(dataArray);
    }
  });
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  id = req.params._id.toString();
  var user = await User.findById(id);
  if (!req.body.date) {
    dateString = new Date().toDateString();
  } else {
    dateString = req.body.date.toDateString();
  }
  const exercise = await new Exercise({
    description: req.body.description,
    duration: req.body.duration,
    date: dateString,
  });
  await exercise.save();
  const exerciseObject = await Exercise.findOne({
    description: req.body.description,
  });
  const { username, _id } = user;
  const { description, duration, date } = exerciseObject;
  const responseObject = { username, description, duration, date, _id };

  res.send(responseObject);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

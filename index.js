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
  userId: String,
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
const deleteUser = (username, done) => {
  User.remove({ username: username }, (err, data) => {
    if (err) {
      return done(err);
    } else {
      done(null, data);
    }
  });
};

app.post("/api/:username/delete", (req, res) => {
  deleteUser(req.params.username, (err, data) => {
    if (err) console.log(err);
    res.send(data);
  });
});

app.post("/api/users", (req, res) => {
  createUserObject(req.body.username, (err, data) => {
    if (err) {
      console.log(err);
      return res.json({ error: err });
    }
    res.send({ username: data.username, _id: data._id });
  });
});

app.get("/api/users", (req, res) => {
  User.find((err, data) => {
    var dataArray = [];
    if (err) {
      res.json({ error: err });
    } else {
      data.forEach((user) => {
        const { username, _id } = user;
        dataArray.push({ username, _id });
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
    dateString = new Date(req.body.date).toDateString();
  }
  const exercise = await new Exercise({
    userId: user._id,
    description: req.body.description,
    duration: req.body.duration,
    date: dateString,
  });
  await exercise.save();
  const exerciseObject = await Exercise.findById({
    _id: exercise._id,
  });
  const { username, _id } = user;
  const { description, duration, date } = exerciseObject;
  const responseObject = { username, description, duration, date, _id };

  res.send(responseObject);
});

app.get("/api/users/:_id/logs", async (req, res) => {
  const id = req.params._id.toString();
  const { from, to, limit } = req.query;
  const fromDate = from ? new Date(from) : new Date(0);
  const toDate = to ? new Date(to) : new Date();
  const limitLog = limit ? parseInt(limit, 10) : 10000;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    const exerciseList = await Exercise.find({ userId: id })
      .where("date")
      .gte(fromDate)
      .lte(toDate)
      .limit(limitLog)
      .exec();

    const { username, _id } = user;
    const displayExerciseList = exerciseList.map((exercise) => {
      const { description, duration, date } = exercise;
      return { description, duration, date };
    });

    const count = exerciseList.length;
    const completeLog = { username, count, _id, log: displayExerciseList };
    console.log(completeLog);
    res.send(completeLog);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error." });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = require("express").Router();

const { Repo, User } = require("../Models/model");

//util functions
const handleErrors = (err) => {
  if (err.code == 11000) {
    let message = Object.keys(err.keyValue)[0] + " is already taken";
    return message;
  } else {
    let message = "No errors";
    return message;
  }
};

const createToken = (id) => {
  return jwt.sign({ id }, "mySecret", { expiresIn: 60 * 60 }); // expiry in secs
};

router.get("/repos", async (req, res) => {
  try {
    const repos = await Repo.find({});
    res.send(repos);
  } catch (error) {
    console.log(error);
  }
});

router.get("/charts", async (req, res) => {
  try {
    const chartData = await Repo.aggregate([
      { $group: { _id: "$language", count: { $sum: 1 } } },
    ]);
    res.send(chartData);
  } catch (error) {
    console.log(error);
  }
});

router.get("/", (req, res) => {
  res.send("Home Page");
});

//login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user) {
      //compare passwords if user exists in DB
      const auth = await bcrypt.compare(password, user.password);
      if (auth) {
        //* generate jwt
        const token = createToken(user._id);
        //* send jwt as a cookie
        res.cookie("jwt", token, { httpOnly: true, maxAge: 60 * 60 * 1000 }); //maxage in milli secs
        res.status(200).send({ message: "Logged in", user: user.username });
      } else {
        res.status(400).send("Password is Incorrect");
      }
    } else {
      res.status(400).send("Username is Incorrect");
    }
  } catch (error) {
    console.log(error);
  }
});

//signup
router.post("/signup", async (req, res) => {
  const { username, password, email } = req.body;

  //*hash password
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const user = await User.create({
      username,
      password: hashedPassword,
      email,
    });

    //* generate jwt
    const token = createToken(user._id);
    //* send jwt as a cookie
    res.cookie("jwt", token, { httpOnly: true, maxAge: 60 * 60 * 1000 }); //maxage in milli secs
    res
      .status(200)
      .send({ message: "New Admin Created in DB", user: user.username });
  } catch (error) {
    let errorMessage = handleErrors(error);
    res.status(400).send(errorMessage);
  }
});
// logout
router.get("/logout", (req, res) => {
  console.log(req.cookies);
  res.clearCookie("jwt");
  res.send("Logout Successfull");
});

module.exports = router;

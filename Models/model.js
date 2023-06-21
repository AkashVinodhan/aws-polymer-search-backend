const mongoose = require("mongoose");
const { isEmail } = require("validator");

const repoSchema = new mongoose.Schema({
  name: String,
  html_url: String,
  description: String,
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [isEmail, "Enter a valid email"],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
});

// Repositories Model

const Repo = mongoose.model("Repo", repoSchema);
const User = mongoose.model("User", userSchema);

module.exports = { Repo, User };

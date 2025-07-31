const express = require("express");
const FpRouter = express.Router();
const bcrypt = require("bcrypt");
const validator = require("validator");
const { route } = require("./profile");
const { userAuth } = require("../middlewares/auth");


FpRouter.patch("/forgetPassword", userAuth, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!validator.isStrongPassword(newPassword)) {
      throw new Error("Enter Strong password");
    }
    const loggedInUser = req.user;
    loggedInUser.password = await bcrypt.hash(newPassword, 10);
    await loggedInUser.save();
    res.send("Password updated successfully!");
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

module.exports = FpRouter;
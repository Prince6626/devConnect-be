const User = require("../models/user");
const jwt = require("jsonwebtoken");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).send("Please Login!!"); // ✅ return here
    }

    const decodedObj = jwt.verify(token, "DEV@Tinder$790"); // no need await

    const { _id } = decodedObj;
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).send("User not found"); // ✅ return here too
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(400).send("ERROR : " + err.message); // ✅ also return
  }
};

module.exports = {
  userAuth,
};

const { default: mongoose } = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://pscodz:psgamex@ps.mzbmbv0.mongodb.net/"
  );
};

module.exports = connectDB;
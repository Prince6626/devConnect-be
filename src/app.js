const express = require("express");

const app = express();
const { adminAuth } = require("../middlewares/auth");

app.use("/admin", adminAuth);

app.get("/admin/getalldata" , (req ,res) => {
  res.send("data sent");
});

app.get("/admin/deleteUser" , (req , res) => {
  res.send("deleted");
})

app.listen(3000, () => {
  console.log("Server is successfully listening on port 3000...");
});

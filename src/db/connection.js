const mongoose = require("mongoose");

// establishing mongodb connection

mongoose
  .connect("mongodb://localhost:27017/vaccineDB", {})
  .then(() => {
    console.log("connected");
  })
  .catch((err) => {
    console.log(err);
  });

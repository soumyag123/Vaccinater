const bodyParser = require("body-parser");
const express = require("express");
require("./db/connection.js");
require("./notify.js");
const Register = require("./models/registers");
const app = express();
const port = process.env.PORT || 8000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", function (req, res) {
  res.render("index");
});

app.get("/register", function (req, res) {
  res.render("register");
});

// saving registered user data in mongodb

app.post("/register", async function (req, res) {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const state = req.body.state;
    const district = req.body.district;

    if (!name || !email || !phone || !state || !district) {
      res.render("success", { message: "Fill the details properly" });
    } else {
      const existing_user = await Register.findOne({ email: email });

      if (existing_user) {
        res.render("success", { message: "User already exists" });
      } else {
        const user = new Register({ name, email, phone, state, district });
        const registered = await user.save();

        return res.render("success", { message: "Successfully Registered" });
      }
    }
  } catch (error) {
    return res.status(400).send(error);
  }
});

app.get("/success", function (req, res) {
  res.render("success", { message: "" });
});

app.listen(port, function () {
  console.log(`server running on http://localhost:${port}`);
});

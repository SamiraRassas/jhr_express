const express = require("express");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const path = require("path");
const mongoose = require("mongoose");
const User = require("./models/User");
const cors = require("cors");
const bodyParser = require("body-parser");
const validator = require("validator");

const app = express();
app.listen(4000, () => {
  console.log("server started on port 4000");
});

dotenv.config({ path: "./.env" });
var dburl = process.env.DATBASE_URL;

mongoose
  .connect(dburl)
  .then(() => {
    console.log("Connected");
  })
  .catch(() => {
    console.log("Connection Failed");
  });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
// app.use(bodyparser)
// app.set("view engine", "hbs");

// app.get("/", (req, res) => {
//   res.render("index");
// });

app.post("/signup", async (req, res) => {
  const user = req.body;
  if (!validator.isEmail(user.email)) {
    console.log("Email is not valid");
    return res.status(400).send({ message: "Email is not valid" });
  }
  // if (!validator.isStrongPassword(user.password, {
  //   minLength: 5, minLowercase: 1,
  //   minUppercase: 1, minNumbers: 1, minSymbols:0
  // })){
  //   console.log("Choose strong password min 6 characters with numbers and uppercases");
  //   return res.status(400).send({message:"Choose strong password min 6 characters with numbers and uppercases"});
  // }
  const findedUseremail = await getUserEmail(user.email);
  const findedUsername = await getUserName(user.username);
  if (findedUseremail) {
    console.log("This email is already in use");
    return res.status(409).send({ message: "This email exists" });
  }
  if (findedUsername) {
    console.log("This username exists");
    return res.status(409).send({ message: "This username exists" });
  } else if (user.password !== user.confirmpassword) {
    console.log(user.confirmpassword);
    console.log("Password does not match");
    return res.status(400).send({ message: "Password does not match" });
  }
  let hashedPassword = await bcrypt.hash(user.password, 8);
  user.password = hashedPassword;
  const result = await new User(user).save();
  console.log("SignUp successful");
  res.status(200).send({ message: "SignUp successful" });
});

app.post("/login", async (req, res) => {

  const user = req.body;
  if(user.email ===""||user.password ==="")
  {
    return res.status(204).send({message:"Please fill in your details."});
  }
  const findedUser = await User.findOne({ email: user.email });
  if (findedUser) {
    //compare pass and hashedpass
    const validPassword = await bcrypt.compare(user.password, findedUser.password);
    // console.log(validPassword)
    if (!validPassword)
    {
      return res.status(401).send({message:"Invalid Email or Password."});
    }
    return res.status(200).send({message:"Login Successfully."});
  } else {
    return res.status(404).send({message:"User doesn't exist."});
  }
});


const getUserEmail = async (useremail) => {
  const user = await User.exists({ email: useremail });
  return user;
};
const getUserName = async (name) => {
  const user = await User.exists({ username: name });
  return user;
};


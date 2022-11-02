const express = require("express");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const path = require("path");
const mongoose = require("mongoose");
const Owner = require("./models/Owner");
const Buyer = require("./models/Buyer");
const User = require("./models/User");
const app = express();
const cors = require('cors');
const bodyParser = require("body-parser");
const validator= require("validator");
const { response } = require("express");

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
app.use(cors())
// app.use(bodyparser)
// app.set("view engine", "hbs");

// app.get("/", (req, res) => {
//   res.render("index");
// });
// app.get("/register", (req, res) => {
//   res.render("register");
// });

// app.get("/login", (req, res) => {
//   res.render("login");
// });

app.post("/signup", async (req, res) => {
  const user = req.body;
  if(!validator.isEmail(user.email)){
    console.log("Email is not valid");
    return res.status(400).send("Email is not valid");
    //     return res.render("register", {
    //   message: "This email is already in use",
    // });
  }
  if (!validator.isStrongPassword(user.password, {
    minLength: 6, minLowercase: 1,
    minUppercase: 1, minNumbers: 1
  })){
    console.log("Choose strong password min 6 characters with numbers and uppercases");
    return res.status(400).send({message:"Choose strong password min 6 characters with numbers and uppercases"});
  }
  const findedUser = await getUser(user.email);
  if (findedUser) {
    console.log("This email is already in use")
    return res.status(400).send({message:"This email is already in use"});
    // return res.render("register", {
    //   message: "This email is already in use",
    // });
  } 
   else if (validator.equals(user.password,user.confirmpassword)) {
    console.log("Password does not match")
    return res.status(400).send("Password does not match");
    // return res.render("register", {
    //   message: "Password does not match",
    // });
  }
  let hashedPassword = await bcrypt.hash(user.password, 8);
  user.password = hashedPassword;
  const result = await new User(user).save()
  .then(data=>{
    response.json(data)
  })
  .catch(error=>{
    response.json(error)
  })
  console.log("login successful");
  res.status(200).send({message:"login successful"});
});


app.post("/login", (request, response) => {
  // check if email exists
  User.findOne({ email: request.body.email })

    // if email exists
    .then((user) => {
      // compare the password entered and the hashed password found
      console.log(user)
      bcrypt
        .compare(request.body.password, user.password)
        // if the passwords match
        .then((passwordCheck) => {
          // check if password matches
          if(!passwordCheck) {
            console.log("Passwords does not match")
            // return response.status(400).send({
            //   message: "Passwords does not match",
            //   error,
            // });
          }
          //   create JWT token
          const token = jwt.sign(
            {
              userId: user._id,
              userEmail: user.email,
            },
            "RANDOM-TOKEN",
            { expiresIn: "24h" }
          );

          //   return success response
          
          console.log("login successful")
          // response.status(200).send({
          //   message: "Login Successful",
          //   email: user.email,
          //   token,
          // });
        })
        // catch error if password do not match
        .catch((error) => {
          console.log("Passwords does not match")
          // response.status(400).send({
          //   message: "Passwords does not match",
          //   error,
          // });
        });
    })
    // catch error if email does not exist
    console.log("email not found")
    .catch((e) => {
      // response.status(404).send({
      //   message: "Email not found",
      //   e,
      // });
    });
});


app.post("/auth/login", async (req, res) => {
  const user = req.body;
  const findedUser = await User.findOne({ name: user.name });
  console.log(findedUser)
  console.log(user.password)
  if (findedUser) {
    //compare pass and hashedpass
    const validPassword = await bcrypt.compare(user.password, findedUser.password);
    // console.log(validPassword)
    if (!validPassword)
      return res.status(400).send("Invalid Email or Password.");
    //   const token = user.generateAuthToken();
    //   res.send(token);
    return res.render("register", {
      message: "Login successfully",
    });
  } else {
    return res.render("register", {
      message: "this user does  not exist",
    });
  }
});
const getUser = async (useremail) => {
    const user = await User.exists({ email: useremail });
    return user;
  };

// const getOwner = async (useremail) => {
//   const owner = await Owner.exists({ email: useremail });
//   return owner;
// };
// const getBuyer = async (useremail) => {
//     const buyer = await Buyer.exists({ email: useremail });
//     return buyer;
//   };


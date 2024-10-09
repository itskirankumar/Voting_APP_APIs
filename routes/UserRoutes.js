const express = require("express");
const router = express.Router();
const User = require("../models/user");

const { jwtAuthMiddleware, generateToken } = require("../jwt");

//SignUp API
router.post("/signup", async (req, res) => {
  try {
    const data = req.body; // Assuming the request body contains the user data.

    // Check if there is already an admin user
    const adminUser = await User.findOne({ role: "admin" });
    if (data.role === "admin" && adminUser) {
      return res.status(400).json({ error: "Admin user already exist" });
    }
    // Validate Aadhar Card Number must have exactly 12 digit
    if (!/^\d{12}$/.test(data.aadharCardNumber)) {
      return res
        .status(400)
        .json({ error: "Aadhar Card Number must be exactly 12 digits" });
    }

    // Check if a user with the same Aadhar Card Number already exists
    const existingUser = await User.findOne({
      aadharCardNumber: data.aadharCardNumber,
    });
    if (existingUser) {
      return res
        .status(400)
        .json({
          error: "User with the same Aadhar Card Number already exists",
        });
    }
    //Create a new User Document using mongoose model.
    const newUser = new User(data);
    //Save the new user document to the database.
    const response = await newUser.save();
    console.log("Data saved Successfully");

    const payload = {
      id: response.id,
    };
    console.log(JSON.stringify(payload)); // Convert to JSON from Object in Payload
    const token = generateToken(payload); // call the generate token Function by passing payload
    console.log("Token is :", token);
    res.status(200).json({ response: response, token: token });
  } catch (error) {
    console.log("Something went wrong Here", error);
    res.status(500).json({ error: "Internal Server Error", error });
  }
});
//Login API - Switch to POST
router.post("/login", async (req, res) => {
  try {
    // Extract the username and password from the request body
    const { aadharCardNumber, password } = req.body;

    // Find the user by aadharCardNumber
    const user = await User.findOne({ aadharCardNumber });

    // If user not found or password is incorrect, return 401 error
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Generate Token
    const payload = { id: user.id };
    const token = generateToken(payload);

    // Return user data and token in response
    res.status(200).json({
      response: user,
      token,
      message: "Logged In Successfully",
    });
  } catch (error) {
    console.log("Something went wrong", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Profile route
router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    //get the user data from jwt
    const userData = req.user;
    const userId = userData.id;
    const user = await User.findById(userId);
    res.status(200).json({ response: user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // Extract the id from the token
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    // Check if currentPassword and newPassword are present in the request body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both currentPassword and newPassword are required' });
  }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid current password" });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while changing the password",error });
  }
});

module.exports = router;

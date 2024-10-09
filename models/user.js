const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Define the User schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Corrected from 'require' to 'required'
  },
  age: {
    type: Number,
    required: true, // Corrected from 'require' to 'required'
  },
  email: {
    type: String,
  },
  mobile: {
    type: String,
  },
  address: {
    type: String,
    required: true, // Corrected from 'require' to 'required'
  },
  aadharCardNumber: {
    type: Number,
    required: true, // Corrected from 'require' to 'required'
    unique: true,
  },
  password: { // Added the password field
    type: String,
    required: true, // Mark password as required
  },
  role: {
    type: String,
    enum: ["voter", "admin"],
    default: "voter",
  },
  isVoted: {
    type: Boolean,
    default: false,
  },
});

// Pre-save hook to hash the password
userSchema.pre("save", async function (next) {
  const user = this;
  // Hash the password only if it is modified or new
  if (!user.isModified("password")) return next(); // Flipped condition to check if password is not modified

  try {
    // Hash password generation
    const salt = await bcrypt.genSalt(10);
    // Hash password
    const hashedPassword = await bcrypt.hash(user.password, salt);
    // Override the plain password with the hashed one
    user.password = hashedPassword;
    next();
  } catch (error) {
    return next(error);
  }
});

// Compare Password Logic
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model("User", userSchema);
module.exports = User; // Correctly export the User model

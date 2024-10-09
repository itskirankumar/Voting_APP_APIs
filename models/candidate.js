const mongoose = require("mongoose");

// Define the candidateSchema
const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,  // Fixed typo: 'require' -> 'required'
  },
  party: {
    type: String,
    required: true,  // Fixed typo: 'require' -> 'required'
  },
  age: {
    type: Number,
    required: true,  // Fixed typo: 'require' -> 'required'
  },
  votes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,  // Corrected 'objectId' to 'ObjectId'
        ref: "User",
        required: true,
      },
      votedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  voteCount: {
    type: Number,
    default: 0,
  },
});

const Candidate = mongoose.model("Candidate", candidateSchema);
module.exports = Candidate;

const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Candidate = require("../models/candidate");

const { jwtAuthMiddleware, generateToken } = require("../jwt");

//Check Admin

const checkAdminRole = async (userID) => {
  try {
    const user = await User.findById(userID);
    if (user.role === "admin") {
      return true;
    }
  } catch (err) {
    console.log("This is an error ", err);

    return false;
  }
};

//Get List of Candidates or Electors

router.get("/listCandidates", async (req, res) => {
  try {
    const candidate = await Candidate.find().sort({ voteCount: "desc" });
    return res.status(200).json(candidate);
  } catch (err) {
    console.log("Something went wrong Here", err);
    res.status(500).json({ error: "Internal Server Error", err });
  }
});
//Post Route to add a Candidate
router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res.status(403).json({ message: "User not a Admin" });
    const data = req.body; // Assuming the request body contains the user data.
    //Create a new User Document using mongoose model.
    const newCandidate = new Candidate(data);
    //Save the new user document to the database.
    const response = await newCandidate.save();

    res.status(200).json({
      response: response,
      message: "Added New Candidate Successfully",
    });
  } catch (error) {
    console.log("Something went wrong Here", error);
    res.status(500).json({ error: "Internal Server Error", error });
  }
});
//Get by iD
router.get("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    const candidateId = req.params.candidateID;

    // Fetch the candidate by ID
    const candidate = await Candidate.findById(candidateId);

    if (!candidate) {
      return res.status(404).json({ message: "Candidate Not Found" });
    }

    // Send the candidate details as a response
    res.status(200).json(candidate);
  } catch (error) {
    console.log("Something went wrong Here", error);
    res.status(500).json({ error: "Internal Server Error", error });
  }
});

router.put("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res.status(403).json({ message: "User Does not have admin role" });

    const candidateId = req.params.candidateID; // extract the id from URL Parameter
    const updatedCandidateData = req.body; //Updated Data from Admin for a candidate
    const response = await Candidate.findByIdAndUpdate(
      candidateId,
      updatedCandidateData,
      {
        new: true, // Return the updated document
        runValidators: true, // run mongoose validation
      }
    );
    if (!response) {
      return res.status(404).json({ message: "Candidate Not Found" });
    }
    res
      .status(200)
      .json({ response: response, message: "Candidate Updated Successfully" });
  } catch (error) {
    console.log("Something went wrong Here", error);
    res.status(500).json({ error: "Internal Server Error", error });
  }
});

//Delete Candidate API
router.delete("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).json({ message: "User Does not have admin role" });
    }
    const candidateId = req.params.candidateID; // extract the id from URL Parameter
    const response = await Candidate.findByIdAndDelete(candidateId);
    if (!response) {
      return res.status(404).json({ message: "Candidate Not Found" });
    }
    res
      .status(200)
      .json({ response: response, message: "Candidate Deleted Successfully" });
  } catch (error) {
    console.log("Something went wrong Here", error);
    res.status(500).json({ error: "Internal Server Error", error });
  }
});
// let's start voting

router.post("/vote/:candidateID", jwtAuthMiddleware, async (req, res) => {
  //No Admin can vote
  //User only can vote and that only once
  const candidateID = req.params.candidateID;
  const userID = req.user.id;

  try {
    // find the Candidate document with the specified candidateID
    const candidate = await Candidate.findById(candidateID);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    // find the User document with the specified candidateID
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    //Check he is voted or not
    if (user.isVoted) {
      return res.status(403).json({ message: "User has already voted" });
    }
    if (user.role === "admin") {
      return res.status(403).json({ message: "admin is not allowed to vote" });
    }

    //Update the Candidate document to Add the vote
    candidate.votes.push({ user: userID });
    candidate.voteCount++;
    await candidate.save();

    //Update the User Document
    user.isVoted = true;
    await user.save();
    res.status(200).json({
      message: "Vote Added Successfully",
      response: { candidate, user },
    });
  } catch (err) {
    console.log("Something went wrong Here", err);
    res.status(500).json({ error: "Internal Server Error", err });
  }
});

//Get the vote counts for all parties

router.get("/vote/count", async (req, res) => {
  try {
    //Find all candidates and sort them by voteCount in descending order
    const candidate = await Candidate.find().sort({ voteCount: "desc" });
    //Map the candidates to only return their name and voteCount
    const voteCounts = candidate.map((data) => {
      return {
        name:data.name,
        party: data.party,
        count: data.voteCount,
      };
    });
    return res.status(200).json(voteCounts);
  } catch (err) {
    console.log("Something went wrong Here", err);
    res.status(500).json({ error: "Internal Server Error", err });
  }
});

module.exports = router;

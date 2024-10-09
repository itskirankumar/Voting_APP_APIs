const express = require("express");
const app = express();
const cors = require('cors');
require("dotenv").config();
const db=require('./db');
const { jwtAuthMiddleware, generateToken } = require("./jwt");

const bodyParser = require("body-parser");
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;


//cors
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from this origin
}));


// Import the router files
// User Route
const userRoutes=require('./routes/UserRoutes');
// Candidate Route
const candidateRoute=require('./routes/candidateRoute')

//use the Routes
app.use('/user',userRoutes);
app.use('/candidate', candidateRoute);
app.listen(PORT, () => {
  console.log("listening on port 3000");
});

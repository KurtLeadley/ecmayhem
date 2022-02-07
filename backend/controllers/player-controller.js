/***********************************
; Title:  Player API
; Description: CRUD Controller for Stats HTTP requests
***************************************************************/
const mongoose = require('mongoose');
// allow for matching on _id in aggregate db functions
const ObjectId = mongoose.Types.ObjectId;
// Document Object model to query in MongoDB
const Player = require('../models/player');
const Team = require('../models/team');

// Create Player
exports.createPlayer = (req,res) => {
  console.log(req.body);
  const player = new Player({
    first : req.body.first,
    last : req.body.last,
    email : req.body.email
  });
  player.save().then(result => {
    res.status(201).json({
      message: "Player Created",
      result: result
    });
  }).catch(err =>{
    res.status(500).json({
      error:err
    });
  });
};

exports.getPlayers = (req,res) => {
  Player.find()
    .populate({
      path: "stats",
      populate: {
        path : "team",
        model : Team,
        select: {name:1}
      }
    }).then(documents => {
    res.status(200).json({
      message: "Players Fetched Successfully",
      players : documents
    });
  });
};

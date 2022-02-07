/***********************************
; Title:  Team API
; Description: CRUD Controller for Team HTTP requests
***************************************************************/
const mongoose = require('mongoose');
// allow for matching on _id in aggregate db functions
const ObjectId = mongoose.Types.ObjectId;
// Document Object model to query in MongoDB
const Team = require('../models/team');
/////////////////////////////////////////////////////
// Get all Teams
// get all available teams controller
exports.getTeam = (req,res) => {
  console.log(req.params);
  console.log(req.body);

  let pipeline = [
    {$unwind:"$stats"},
    {$match:{
      "$and" : [
        {"stats.season":req.params.season},
        {"_id": ObjectId(req.params.tid)}
      ]}
    },
  ];
  let query = Team.aggregate(pipeline);
  let promise = query.exec();
  promise.then(documents => {
    res.status(200).json({
      message: "Team Fetched Successfully",
      team : documents
    });
  });
};

exports.addPlayer = (req,res) => {
  console.log(req.params);

  const filter = {"_id": ObjectId(req.params.tid), "stats.season" : req.params.season};
  const update = {$push : {"stats.players.$": req.params.pid}};
  Team.findOneAndUpdate(filter,update).exec(function(err,document) {
    if (err) {
      console.log(err);
    } else {
      console.log(document);
      res.status(200).json({
        document : returnObj
      });
    }
  });
};

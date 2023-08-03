const mongoose = require("mongoose");
// stats schema
const gameStatsSchema = mongoose.Schema({
  teamId: { type: String },
  playerId: { type: String },
  // teamId: {type: mongoose.Schema.Types.ObjectId, ref: 'teams'},
  // playerId: {type: mongoose.Schema.Types.ObjectId, ref: 'players'},
  teamName : { type: String },
  firstName : { type: String },
  lastName : { type: String },
  email : { type: String },
  position: { type: String },
  goals: { type: mongoose.Schema.Types.Mixed, default: 0},
  assists: { type: mongoose.Schema.Types.Mixed, default: 0},
  pim: { type: mongoose.Schema.Types.Mixed, default: 0 },
  jersey: { type: mongoose.Schema.Types.Mixed, default: 0}
});
// Game schema including player stats
const gameSchema = mongoose.Schema({
  teamA : { type: String, required:true},
  teamB : { type: String, required:true},
  time: { type: String, required:true},
  week: { type: Number, required:true},
  date: { type: String, required:true},
  season: {type: String, required:true},
  stats : [gameStatsSchema]
});
// export Game model that includes stats model
module.exports =  mongoose.model('Game', gameSchema);

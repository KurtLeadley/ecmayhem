const mongoose = require("mongoose");
// stats schema
const statsSchema = mongoose.Schema({
  season: {type: String, required:true},
  players: [{type: mongoose.Schema.Types.ObjectId, ref: 'players'}],
  wins: {type: Number, default: 0},
  losses: {type: Number, default: 0},
  otl: {type: Number, default: 0},
  gf: {type: Number, default: 0},
  ga: {type: Number, default: 0},
  sf: {type: Number, default: 0},
  sa: {type: Number, default: 0}
});
// player schema including stats
const teamSchema = mongoose.Schema({
  name : { type: String, required:true, unique:true},
  stats : [statsSchema]
});
// export Player model that includes stats model
module.exports =  mongoose.model('Team', teamSchema);

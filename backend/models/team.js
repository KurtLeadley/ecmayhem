const mongoose = require("mongoose");
// stats schema
const statsSchema = mongoose.Schema({
  season: {type: String, required:true},
  players: [{type: mongoose.Schema.Types.ObjectId, ref: 'players'}],
  wins: Number,
  losses: Number,
  otl: Number,
  gf: Number,
  ga: Number
});
// player schema including stats
const teamSchema = mongoose.Schema({
  name : { type: String, required:true},
  stats : [statsSchema]
});
// export Player model that includes stats model
module.exports=  mongoose.model('Team', teamSchema);

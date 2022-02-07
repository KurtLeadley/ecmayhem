const mongoose = require("mongoose");
// stats schema
const statsSchema = mongoose.Schema({
  season: {type: String, required:true},
  team: {type: mongoose.Schema.Types.ObjectId, ref: 'teams'},
  position: String,
  goals: Number,
  assists: Number,
  pim: Number,
  jersey: Number
});
// player schema including stats
const playerSchema = mongoose.Schema({
  first : { type: String, required:true},
  last : { type: String, required:true},
  email: {type: String, required:true, unique:true},
  stats : [statsSchema]
});
// export Player model that includes stats model
module.exports=  mongoose.model('Player', playerSchema);

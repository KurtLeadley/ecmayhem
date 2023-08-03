// game stats model
interface GameStats {
  team: string;
  player: string;
  position?: number;
  goals?: number;
  assists?: number;
  pim?: number;
  jersey?: number;
};
// game model including game stats
export interface Game {
  teamA : string;
  teamB : string;
  time: string;
  week: string;
  date: Date;
  season: string;
  stats? : {[key: string] : GameStats[]};
};

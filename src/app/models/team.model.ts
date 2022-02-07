
import {Player} from './player.model';
interface Stats {
  season : string;
  players: [Player];
  wins: number;
  losses: number;
  otl: number;
  gf: number;
  ga: number;
}
export interface Team{
  id: string;
  name: string;
  stats: {
    [key: string] : Stats
  };
}

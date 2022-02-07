interface Stats {
  season : string;
  team: string;
  position: string
  goals: number;
  assists: number;
  pim: number;
  jersey: number;
}
export interface Player {
  id: string;
  first: string;
  last: string;
  email: string;
  stats: {
    [key: string] : Stats
  };
}

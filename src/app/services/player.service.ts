import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";
import { Player } from "../models/player.model";

@Injectable({ providedIn: "root" })
export class PlayerService {
  private players: Player[] = [];
  private playersUpdated = new Subject<Player[]>();
  private playerStatsUpdated = new Subject<Player[]>();
  constructor(private http: HttpClient) {}
  private baseRoute = "http://localhost:3000/api/players/";

  // CREATE
  createPlayer(first:string, last:string, email:string) {
    const player : Player = {id:null,first:first, last:last, email:email, stats:null}
    return this.http.post("http://localhost:3000/api/players/create", player);
  };
  // CREATE
  createStats(stats) {
    let url = "http://localhost:3000/api/statistics/player/" +stats.id;
    delete stats._id;
    return this.http.put(url, stats);
  }
  createSeasonRosters(data) {
    return this.http.post<{message: string; data: any}>(
      "http://localhost:3000/api/players/create/rosters", data
    );
  };
  // READ
  // get() {
  //   return this.http.get<{ message: string; data: any }>(this.baseRoute + "players");
  // }
  // Read
  getPlayers() {
    this.http.get<{ message: string; data: any }>(
      "http://localhost:3000/api/players/")
      .pipe(map((playerData) => {
        return playerData.data.map(player =>
        {
          return {
            first: player.first,
            last: player.last,
            id: player._id,
            email: player.email,
            stats: player.stats
          };
        });
      })).subscribe(transformedPlayers => {
        this.players = transformedPlayers;
        this.playersUpdated.next([...this.players]);
      });
  };
  getPlayersUpdateListener() {
    return this.playersUpdated.asObservable();
  }
  getPlayerStats() {
    this.http
      .get<{ message: string; data: any }>(
        this.baseRoute + "stats"
      )
      .pipe(map((playerData) => {
        console.log(playerData);
        return playerData.data.map(player =>
        {
          return {
            first: player.first,
            last: player.last,
            id: player._id,
            email: player.email,
            stats: player.stats
          };
        });
      }))
      .subscribe(transformedPlayerStats => {
        console.log(transformedPlayerStats);
        this.players = transformedPlayerStats;
        this.playerStatsUpdated.next([...this.players]);
      });
  }
  getPlayerStatsUpdateListener() {
    return this.playerStatsUpdated.asObservable();
  }
  // delete data
  delete(param) {
    console.log(param);
    return this.http.delete<{message: string; data: any}>(
      'http://localhost:3000/api/players/delete/' + param
    );
  }
  /////////////////////////
  // calculate current season and construct string
  getSeason() {
    let today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth();
    // create the season string using the current month and year
    if (month >= 8 && month <= 12) {
      let otherYear = year + 1;
      let season = year.toString() + "-" + otherYear.toString()
      return season;
    } else {
      let otherYear = year - 1;
      let season = otherYear.toString() + "-" + year.toString();
      return season;
    }
  }
}



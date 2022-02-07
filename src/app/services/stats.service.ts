import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";
import { filter } from 'rxjs/operators';
import {Observable} from "rxjs";
import { Player } from "../models/player.model";

@Injectable({ providedIn: "root" })
export class StatsService {
  private baseRoute = "http://localhost:3000/api/statistics/";
  private players: Player[] = [];
  private statsUpdated = new Subject<Player[]>();
  // construct the HttpClient
  constructor(private http: HttpClient) {}
  // CREATE
  createStats(stats) {
    let url = "http://localhost:3000/api/statistics/player/" +stats.id;
    delete stats._id;
    return this.http.put(url, stats);
  }
  // READ
  getStats(selectedSeason, selectedTeam, selectedPlayer) {
    console.log(selectedSeason +"|"+ selectedTeam + "|" + selectedPlayer);
    this.http
      .get<{ message: string; players: any }>(
        this.baseRoute + "players/" + selectedSeason + "/" + selectedTeam + "/" + selectedPlayer
      )
      .pipe(map((playerData) => {
        console.log(playerData);
        return playerData.players.map(player =>
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
        this.statsUpdated.next([...this.players]);
      });
  }
  // UPDATE
  updateStats(playerId,stats) {
    delete stats.team;
    stats.team = stats.teamId;
    delete stats.teamId;
    let url = "http://localhost:3000/api/statistics/player/" + playerId + "/" + stats._id;
    return this.http.put(url, stats);
  }
  // DELETE
  deletePlayerStats(playerId,statId) {
    let url = this.baseRoute + "player/" +  playerId + "/" + statId;
    this.http.delete<{message:string; documents:any}>(url)
    .subscribe({
      next: data => {
        console.log("Stats Deleted");
      },
      error: error => {
        let errorMessage = error.message;
        console.log(errorMessage);
      }
    });
  }
  // get seasons that exist
  getAvailableStatSeasons() {
    return this.http.get<{message: string; seasons: any }>(
        this.baseRoute + "/seasons"
    );
  }
  getPlayerStatsUpdateListener() {
    return this.statsUpdated.asObservable();
  }
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

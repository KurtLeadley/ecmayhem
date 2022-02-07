import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";
import { filter } from 'rxjs/operators';
import {Observable} from "rxjs";
import { Player } from "../models/player.model";

@Injectable({ providedIn: "root" })
export class PlayerService {
  private players: Player[] = [];
  private playersUpdated = new Subject<Player[]>();
  constructor(private http: HttpClient) {}

  createPlayer(first:string, last:string, email:string) {
    const player : Player = {id:null,first:first, last:last, email:email, stats:null}
    return this.http.post("http://localhost:3000/api/players/create", player);
  };

  getPlayers() {
    this.http.get<{ message: string; players: any }>(
      "http://localhost:3000/api/players/")
      .pipe(map((playerData) => {
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
      })).subscribe(transformedPlayers => {
        this.players = transformedPlayers;
        this.playersUpdated.next([...this.players]);
      });
  };
  getPlayersUpdateListener() {
    return this.playersUpdated.asObservable();
  }
}

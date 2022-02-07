import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";
import { filter } from 'rxjs/operators';
import {Observable} from "rxjs";
import { Team } from "../models/team.model";

@Injectable({ providedIn: "root" })

export class TeamService {
  private baseRoute = "http://localhost:3000/api/team/";
  private team: Team[] = [];
  private teamUpdated = new Subject<Team[]>();
  // construct the HttpClient
  constructor(private http: HttpClient) {}
  // CREATE
  addPlayer(params,teamId) {
    console.log(params);
    let season = params.stats.season;
    let playerId = params.id;
    // let season = team.stats.season
    let url = this.baseRoute + teamId + "/" + season + "/" + playerId;
    console.log(url);
    // delete stats._id;
    console.log("Adding Player to Team");
    return this.http.put(url, playerId);

  }

  getTeam(team, season) {
    let teamId = team._id;
    let url = this.baseRoute + teamId + "/" + season;
    // delete stats._id;
    console.log("Getting Team:");
    return this.http.get(url, team);
  }

}

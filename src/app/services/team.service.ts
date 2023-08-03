import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
@Injectable({ providedIn: "root" })

export class TeamService {
  private baseRoute = "http://localhost:3000/api/teams/";
  // User HttpClient
  constructor(private http: HttpClient) {}
  // Create many teams
  createTeams(data) {
    console.log(data);
    data = data.filter(team => {return team.name != 'bye'});
    console.log(data);
    return this.http.post<{message: string; data: any}>(
      this.baseRoute + 'create', data
    );
  };
  // Get All Teams
  get() {
    return this.http.get<{message: string; data: any }>(
      this.baseRoute
    );
  }
  // Get a team
  getTeam(team, season) {
    console.log("Get Team");
    const teamId = team._id;
    const url = this.baseRoute + teamId + "/" + season;
    return this.http.get(url, team);
  }
  // Get All Teams in season
  getTeams(season) {
    console.log("Get Teams");
    const url = this.baseRoute +  "/" + season;
    return this.http.get<{ message: string; data: any }>(url);
  }
  // Get all seasons where a team exists
  getAvailableSeasons() {
    console.log("Get Available Seasons");
    return this.http.get<{message: string; data: any }>(
      this.baseRoute + "availableseasons/"
    );
  }
  // Get aggregated team standings for a season
  getSeasonStandings(season) {
    return this.http.get<{message: string; data: any }>(
      this.baseRoute + 'standings/' + season
    );
  }
  // Put a single player on a team
  addPlayer(params) {
    console.log(params);
    let season = params.stats.season;
    let playerId = params.id;
    let tid = params.stats.team._id;
    let url = this.baseRoute + tid + "/" + season + "/" + playerId;
    return this.http.put(url, playerId);
  }
  // Put players on a team
  addPlayers(data) {
    console.log("Add Players to team:");
    console.log(data);
    return this.http.put<{message: string; data: any}>(
      this.baseRoute + 'add/players', data
    );
  };
  // Update many teams
  updateManyTeams(stats,season) {
    const statsObj = {
      stats,
      season
    }
    console.log("UPDATE MANY Teams");
    console.log(statsObj);
    const url = this.baseRoute + 'update';
    return this.http.put(url, statsObj);
  }
  // Delete data
  delete(param) {
    console.log(param);
    return this.http.delete<{message: string; data: any}>(
      this.baseRoute + 'delete/' + param
    );
  }
  // Calculate current season, not an api call
  getCurrentSeason() {
    let today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth();
    var season = null;
    // create the season string using the current month and year
    if (month >= 8 && month <= 12) {
      let otherYear = year + 1;
      season = year.toString() + "-" + otherYear.toString()
    } else {
      let otherYear = year - 1;
      season = otherYear.toString() + "-" + year.toString();
    }
    return season;
  }
}

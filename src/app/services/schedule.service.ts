import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: "root" })
export class ScheduleService {
  private baseRoute = "http://localhost:3000/api/schedule";

  // construct the HttpClient
  constructor(private http: HttpClient) {}

  // READ available teams, team stats or available seasons based on route param
  getGoogleRosters(season) {
    return this.http.get<{message: string; data: any}>(
      this.baseRoute + "/create/" + season
    );
  }
  // get Google Schedule Seasons
  getAvailableGoogleSeasons(entity) {
    return this.http.get<{message: string; data:any}>(
      this.baseRoute + "/get/seasons/" + entity
    );
  }
  // Get Seasons already used in games collection
  get() {
    console.log("get");
    return this.http.get<{message: string; data:any}>(
      this.baseRoute + "/get"
    );
  }
  // Create Season Schedule MongoDB
  createSeasonSchedule(data) {
    return this.http.post<{message: string; data: any}>(
      this.baseRoute + "/create", data
    );
  }
  // Create Google Result Sheets
  createGoogleResultsSheets(teamData,schedule,season) {
    const data = {
      teamData,
      schedule,
      season
    }
    return this.http.post<{message: string; data: any}>(
      this.baseRoute + "/create/google/results", data
    );
  }
  // Get Google Result Sheets
  getGoogleResultSheets(season) {
    return this.http.get<{message: string; data: any}>(
      this.baseRoute + "/get/results/" + season
    );
  }
  // Read Season Schedule MongoDB
  // getSeasonSchedule(season) {
  //   return this.http.get<{message: string; data: any}>(
  //     this.baseRoute + "/" + season
  //   );
  // }
  // delete data
  delete(param) {
    console.log(param);
    return this.http.delete<{message: string; data: any}>(
      this.baseRoute + '/delete/' + param
    );
  }
}

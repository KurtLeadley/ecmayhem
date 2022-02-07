import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class StandingsService {
  private baseRoute = "http://localhost:3000/api/standings/";

  // construct the HttpClient
  constructor(private http: HttpClient) {}

  // READ available teams, team stats or available seaons based on route param
  get(route) {
    return this.http.get<{message: string; data: any }>(
      this.baseRoute + route
    );
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

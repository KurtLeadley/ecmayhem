import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: "root" })
export class GameService {
  private baseRoute = "http://localhost:3000/api/games/";

  // construct the HttpClient
  constructor(private http: HttpClient) {}

  // Get Games for a particular season
  // Read Season Schedule MongoDB
  get(season) {
    return this.http.get<{message: string; data: any}>(
      this.baseRoute + "/" + season
    );
  }
  // Update many games
  updateManyGames(stats,season) {
    const statsObj = {
      stats,
      season
    }
    console.log("UPADTE MANY GAMES");
    console.log(statsObj);
    let url = "http://localhost:3000/api/games/update/";
    return this.http.put(url, statsObj);
  }
}

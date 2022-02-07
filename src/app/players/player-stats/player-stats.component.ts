import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { Player } from "../../models/player.model";
import { StatsService } from '../../services/stats.service';
import { StandingsService } from '../../services/standings.service';

@Component({
  selector: 'app-player-stats',
  templateUrl: './player-stats.component.html',
  styleUrls: ['./player-stats.component.css']
})

export class PlayerStatsComponent implements OnInit, OnDestroy {
  // declare class properties
  availableSeasons: Array<any>;
  availableTeams: Array<any>;
  player: Player;
  players: Player[] = [];
  currentSeason : String;
  selectedSeason : String;
  selectedTeam : String;
  selectedPlayer : String;
  showSeasonsTable: Boolean;
  // declare class subscriptions
  private playersSub: Subscription;
  // Inject Services
  constructor(
    public StatsService : StatsService,
    public StandingsService : StandingsService
  ) { }

  ngOnInit(): void {
    // class property defaults
    this.selectedSeason = this.StatsService.getSeason();
    this.selectedTeam = "All";
    this.selectedPlayer = "All"
    this.showSeasonsTable = false;
    // Subscribe to our stats stream
    this.StatsService.getStats(this.selectedSeason, this.selectedTeam, "All");
    this.playersSub = this.StatsService.getPlayerStatsUpdateListener()
      .subscribe((players: Player[]) => {
        this.players = players;
      });
    // get available seasons to select from
    this.StatsService.getAvailableStatSeasons().subscribe((res) => {
      res.seasons.push("All");
      this.availableSeasons = res.seasons;
    });
    // get available teams to select from
    this.StandingsService.get("teams").subscribe((res : any) => {
      console.log(res.data);
      if (res.data.length > 0) {
        res.data.push("All");
        this.availableTeams = res.data ;
        console.log(this.availableTeams);
      }
    });
  };
  filterPlayer(player) {
    console.log(player);
    this.showSeasonsTable = true;
    this.StatsService.getStats("All","All",player.id);
  }
  filterSeasons(seasons) {
    console.log(seasons);
    return seasons != "All";
  }
  // Update the subscribed stream when selecting a drop down choice
  getSelectedStats() {
    this.showSeasonsTable = false;
    this.StatsService.getStats(this.selectedSeason,this.selectedTeam,"All");
  }
  restoreDefaults() {
    this.selectedSeason = this.StatsService.getSeason();
    this.selectedPlayer = "All";
    this.selectedTeam = "All";
    this.StatsService.getStats(this.selectedSeason, this.selectedTeam, "All");
  }
  ngOnDestroy() {
    this.playersSub.unsubscribe();
  }
}

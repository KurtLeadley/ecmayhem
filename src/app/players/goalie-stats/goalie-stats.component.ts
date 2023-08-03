import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { Player } from "../../models/player.model";
import { StatsService } from '../../services/stats.service';
import { PlayerService } from 'src/app/services/player.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-goalie-stats',
  templateUrl: './goalie-stats.component.html',
  styleUrls: ['./goalie-stats.component.css']
})

export class GoalieStatsComponent implements OnInit, OnDestroy {
  // declare class properties
  availableSeasons: Array<any>;
  currentSeason : String;
  selectedSeason : String;
  availableTeams: Array<any>;
  selectedTeam : String;
  filteredTeams : Array<any>;
  player: Player;
  players: Player[] = [];
  filteredPlayers: Player[];
  selectedPlayer : String;
  showSeasonsTable: Boolean;
  seasonStatsExists : Boolean;
  // declare class subscriptions
  private playersSub: Subscription;
  // Inject Services
  constructor(
    public StatsService : StatsService,
    public TeamService : TeamService,
    public PlayerService : PlayerService
  ) { }

  async ngOnInit() {
    // class property defaults
    this.currentSeason = this.TeamService.getCurrentSeason();
    this.selectedSeason = this.currentSeason;
    this.TeamService.getAvailableSeasons().subscribe((res : any) => {
      console.log(res);
      this.availableSeasons = res.data;
      this.availableSeasons.indexOf(this.currentSeason.toString()) === -1
        ? (this.availableSeasons.push(this.currentSeason.toString()), this.seasonStatsExists = false)
        : (this.seasonStatsExists = true);
    });
    this.showSeasonsTable = false;
    // Subscribe to our stats stream
    this.PlayerService.getPlayerStats();
    this.playersSub = this.PlayerService.getPlayerStatsUpdateListener().subscribe((players: Player[]) => {
      this.players = players;
      this.filterPlayers();
    });
    // get available seasons to select from
    this.StatsService.getAvailableStatSeasons().subscribe((res) => {
      console.log(res);
      res.data.push("All");
      this.availableSeasons = res.data;
      //console.log(this.availableSeasons);
    });
    try {
      const teams = await this.TeamService.get().toPromise();
      if (teams.data.length > 0) {
        this.availableTeams = teams.data ;
      }
    } catch {
      this.availableTeams = [];
    }
  };

  filterPlayers() {
    this.filteredPlayers = this.players.filter(player =>
      (player.stats.season == this.selectedSeason  && player.stats.position == "G")
    );
    this.filteredPlayers.forEach(player => {
      var teamObj = this.availableTeams.find(team => team.stats._id === player.stats.team);
      var teamName = teamObj.name;
      player.stats.teamName = teamName;
      let sf = player.stats.shotsFaced;
      let ga = player.stats.goalsAgainst;
      if (Number(sf) != 0) {
        player['savePercentage'] =  ((Number(sf) - Number(ga)) / (Number(sf)));
        player['savePercentage'] = (player['savePercentage'].toFixed(3));
      }
      if (player['savePercentage'] == "" || isNaN(player['savePercentage'])) {
        player['savePercentage'] = 0.00;
      }
    });
    console.log(this.filteredPlayers);
  }
  filterSeasons(seasons) {
    console.log(seasons);
    return seasons != "All";
  }
  // Update the subscribed stream when selecting a drop down choice
  getSelectedStats() {
    this.filterPlayers();
    this.showSeasonsTable = (this.filteredPlayers.length > 0) ? true : false;
  }
  restoreDefaults() {
    this.selectedSeason = this.TeamService.getCurrentSeason();
    this.PlayerService.getPlayerStats();
  }
  ngOnDestroy() {
    this.playersSub.unsubscribe();
  }
}


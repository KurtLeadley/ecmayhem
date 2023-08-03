import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { Player } from "../../models/player.model";
import { StatsService } from '../../services/stats.service';
import { PlayerService } from 'src/app/services/player.service';
import { TeamService } from 'src/app/services/team.service';
@Component({
  selector: 'app-player-stats',
  templateUrl: './player-stats.component.html',
  styleUrls: ['./player-stats.component.css']
})

export class PlayerStatsComponent implements OnInit, OnDestroy {
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
  showTable: Boolean;
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
    this.selectedTeam = "All";
    this.selectedPlayer = "All"
    this.PlayerService.getPlayerStats();
    this.playersSub = this.PlayerService.getPlayerStatsUpdateListener().subscribe((players: Player[]) => {
      this.players = players;
      const clonedArray = [...this.players];
      const clonedTeamArray = [...this.availableTeams];
      clonedArray.forEach(player => {
        var teamObj = clonedTeamArray.find(team => team.stats._id === player.stats.team);
        var teamName = teamObj.name;
        player.stats.teamName = teamName;
      })
      this.filterPlayers();
    });
    // get available seasons to select from
    this.StatsService.getAvailableStatSeasons().subscribe((res) => {
      res.data.push("All");
      res.data.push(this.currentSeason);
      this.availableSeasons = res.data;
    });
    // get all teams and filter for this season
    try {
      const teams = await this.TeamService.get().toPromise();
      if (teams.data.length > 0) {
        let allObj = {_id:"All", name:"All", stats:{ season : "Any", _id:"All"}};
        teams.data.push(allObj);
        this.availableTeams = teams.data ;
        this.filterAvailableTeams();
      }
    } catch {
      this.availableTeams = [];
    }

  };

  filterAvailableTeams() {
    this.filteredTeams = this.availableTeams.filter(team => team.stats.season == this.selectedSeason || team.name == 'All');
  }
  filterPlayers() {
    if (this.selectedTeam != "All") {
      this.filteredPlayers = this.players.filter(player => player.stats.season == this.selectedSeason && player.stats.team == this.selectedTeam);
    } else {
      this.filteredPlayers = this.players.filter(player => player.stats.season == this.selectedSeason);
    }
    console.log(this.filteredPlayers);
    if (this.filteredPlayers.length > 0) {
      this.showTable = true;
    } else {
      this.showTable = false;
    }
  }
  filterPlayer(player) {
    console.log(player);
    this.showTable = true;
  }
  filterSeasons(seasons) {
    console.log(seasons);
    return seasons != "All";
  }
  // Update the subscribed stream when selecting a drop down choice
  getSelectedStats() {
    this.filterAvailableTeams();
    this.filterPlayers();
    //this.showTable = false;
  }
  restoreDefaults() {
    this.selectedPlayer = "All";
    this.selectedTeam = "All";
    this.selectedSeason = this.TeamService.getCurrentSeason();
    this.PlayerService.getPlayerStats();
  }
  ngOnDestroy() {
    this.playersSub.unsubscribe();
  }
}

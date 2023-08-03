import { Component, OnInit } from '@angular/core';
import { TeamService } from '../services/team.service';
import {Team} from '../models/team.model';

@Component({
  selector: 'app-standings',
  templateUrl: './standings.component.html',
  styleUrls: ['./standings.component.css']
})
export class StandingsComponent implements OnInit {
  //Class properties
  availableSeasons: Array<string>;
  currentSeason : String;
  selectedSeason : String;
  teams: Team[] = [];
  // Booleans
  seasonStatsExists : Boolean;
  // Inject services
  constructor(public TeamService : TeamService) { }
  // On component load
  ngOnInit(): void {
    this.currentSeason = this.TeamService.getCurrentSeason();
    this.selectedSeason = this.currentSeason;
    this.TeamService.getAvailableSeasons().subscribe((res : any) => {
      console.log(res);
      this.availableSeasons = res.data;
      this.availableSeasons.indexOf(this.currentSeason.toString()) === -1
        ? (this.availableSeasons.push(this.currentSeason.toString()), this.seasonStatsExists = false)
        : (this.seasonStatsExists = true);
    });
    this.TeamService.getSeasonStandings(this.currentSeason).subscribe((res:any) => {
      if (res.data.length > 0) {
        this.seasonStatsExists = true;
        this.teams = res.data;
      }
    });
  }
  // Select season dropdown
  getSelectedStandings(selectedSeason) {
    this.TeamService.getSeasonStandings(selectedSeason).subscribe((res:any) => {
      res.data.length > 0
      ? (this.seasonStatsExists = true, this.teams = res.data, console.log(res.data))
      :  (this.seasonStatsExists = false);
    });
  }
  // Select season reset
  restoreDefaults() {
    this.selectedSeason = this.TeamService.getCurrentSeason();
    this.getSelectedStandings(this.selectedSeason);
  }
}

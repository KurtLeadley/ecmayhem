import { Component, OnInit } from '@angular/core';
import { StandingsService } from '../services/standings.service';
import {Team} from '../models/team.model';

@Component({
  selector: 'app-standings',
  templateUrl: './standings.component.html',
  styleUrls: ['./standings.component.css']
})
export class StandingsComponent implements OnInit {
  //Class properties
  availableSeasons: Array<string>;
  availableTeams: Array<string>;
  currentSeason : String;
  selectedSeason : String;
  teams: Team[] = [];
  // Booleans
  seasonStatsExists : Boolean;
  // Inject services
  constructor(public standingsService : StandingsService) { }
  // On component load
  ngOnInit(): void {
    this.currentSeason = this.standingsService.getSeason();
    this.selectedSeason = this.currentSeason;
    this.standingsService.get("seasons").subscribe((res : any) => {
      console.log(res);
      this.availableSeasons = res.seasons;
      this.availableSeasons.indexOf(this.currentSeason.toString()) === -1
        ? (this.availableSeasons.push(this.currentSeason.toString()), this.seasonStatsExists = false)
        : (this.seasonStatsExists = true);
    });
    this.standingsService.get(this.currentSeason).subscribe((res:any) => {
      if (res.length > 0) {
        this.seasonStatsExists = true;
        this.teams = res.data;
        console.log(this.teams);
      }
    });
  }
  // Select season dropdown
  getSelectedStandings(selectedSeason) {
    console.log(selectedSeason);
    this.standingsService.get(selectedSeason).subscribe((res:any) => {
      res.stats.length > 0
      ? (this.seasonStatsExists = true, this.teams = res.stats, console.log(res.stats))
      :  (this.seasonStatsExists = false);
    });
  }
  // Select season reset
  restoreDefaults() {
    this.selectedSeason = this.standingsService.getSeason();
    this.getSelectedStandings(this.selectedSeason);
  }
}

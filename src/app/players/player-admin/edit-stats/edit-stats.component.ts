/////////////////////////////////////////////////////////////////////
/////////////////////  Component Dependencies ///////////////////////
/////////////////////////////////////////////////////////////////////
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PlayerService } from 'src/app/services/player.service';
import { StatsService } from '../../../services/stats.service';
import { TeamService } from '../../../services/team.service';
import { Player } from '../../../models/player.model';
/////////////////////////////////////////////////////////////////////
/////////////////////  Component Declarations ///////////////////////
/////////////////////////////////////////////////////////////////////
@Component({
  selector: 'app-edit-stats',
  templateUrl: './edit-stats.component.html',
  styleUrls: ['./edit-stats.component.css']
})
export class EditStatsComponent implements OnInit {
  /////////////////////////////////////////////////////////////////////
  /////////////////////  Class Constructor  ///////////////////////////
  /////////////////////////////////////////////////////////////////////
  constructor(
    private formBuilder: FormBuilder,
    public PlayerService: PlayerService,
    public StatsService: StatsService,
    public TeamService: TeamService
  ) { };
  /////////////////////////////////////////////////////////////////////
  /////////////////////  Class Properties /////////////////////////////
  /////////////////////////////////////////////////////////////////////
  private playersSub: Subscription;
  statsForm  : FormGroup;
  players : Player[] = [];
  searchText: String;
  selectedPlayer : Player;
  selectedPlayerArray: Array<any>;
  positions: Array<string>;
  availableTeams: Array<string>;
  availableSeasons:Array<string>;
  isShowStatsForm: Boolean;
  isShowAddStatisticsButton: Boolean;
  isDuplicateSeasonErrorMessage : Boolean;
  isMissingTeamSeasonErrorMessage : Boolean;
  isCreatePlayerStats: Boolean;
  /////////////////////////////////////////////////////////////////////
  /////////////////////  Initialization  //////////////////////////////
  /////////////////////////////////////////////////////////////////////
  ngOnInit(): void {
    // set component defaults
    this.isShowStatsForm = false;
    this.isCreatePlayerStats = false;
    this.isShowAddStatisticsButton = true;
    this.isDuplicateSeasonErrorMessage = false;
    this.isMissingTeamSeasonErrorMessage = false;
    this.positions = ["C","RW","LW","D"];
    this.selectedPlayerArray = [];
    this.searchText = "";
    // create statsForm
    this.statsForm = this.formBuilder.group({
      "_id": new FormControl(""),
      "season": new FormControl("", Validators.required),
      "jersey": new FormControl("", Validators.required),
      "position": new FormControl("", Validators.required),
      "team" : new FormControl("", Validators.required),
      "teamId" : new FormControl(""),
      "goals": new FormControl("", Validators.required),
      "assists": new FormControl("", Validators.required),
      "pim": new FormControl("", Validators.required),
    });
    // Call our services
    this.PlayerService.getPlayers();
    this.playersSub = this.PlayerService.getPlayersUpdateListener()
    .subscribe((players: Player[]) => {
      this.players = players;
      console.log("Players:");
      console.log(this.players);
    });
    // get available seasons to select from
    this.TeamService.getAvailableSeasons().subscribe((res : any) => {
      console.log("Seasons:");
      console.log(res.data);
      this.availableSeasons = res.data;
    });
    // get available teams to select from
    this.TeamService.get().subscribe((res : any) => {
      console.log("Teams:");
      console.log(res.data);
      this.availableTeams = res.data;
    });
  };
  public ngOnDestroy(): void {
    this.playersSub.unsubscribe();
  }
  /////////////////////////////////////////////////////////////////////
  ///////////////////// Class Methods   ///////////////////////////////
  /////////////////////////////////////////////////////////////////////
  // Player is selected from search query.
  public selectPlayer(player) {
    this.searchText = null;
    this.selectedPlayer = player;
    // turn object into an array containing an object, so we can use the Array.map function
    player = [player];
    // flatten the object so we can place data in table as rows
    this.selectedPlayerArray = player.map(doc => doc.stats.map(stat => ({
      ...doc,
      stats: stat
    }))).flat();
    // add points key-value pair to each object
    for (let i = 0; i < this.selectedPlayerArray.length; i++ ) {
      let goals = this.selectedPlayerArray[i].stats.goals;
      let assists = this.selectedPlayerArray[i].stats.assists;
      let points = goals + assists;
      this.selectedPlayerArray[i].stats.points = points;
    };
    console.log(this.selectedPlayerArray);
  };
  // Add Statistics or Edit Statistics Button Clicked
  public showStatsForm(toggle,stats) {
    console.log("Stats:");
    console.log(stats);
    this.isCreatePlayerStats = toggle;
    if (this.isCreatePlayerStats === true) {
      console.log("Create Stats Form Mode");
      this.statsForm.reset();
      this.statsForm.get('season').enable();
      this.statsForm.get('team').enable();
      this.statsForm.get('teamId').enable();
      this.isShowStatsForm = true;
    } else {
      console.log("Edit Stats Form Mode");
      console.log(stats);
      //console.log(stats.team);
      this.statsForm.get('season').disable();
      this.statsForm.get('team').disable();
      this.statsForm.get('teamId').disable();
      this.statsForm.setValue({
        _id : stats._id,
        season: stats.season,
        jersey : stats.jersey,
        position : stats.position,
        team : stats.team.name,
        teamId : stats.team._id,
        goals : stats.goals,
        assists : stats.assists,
        pim : stats.pim
      });
      console.log(this.statsForm.value);
      this.isShowStatsForm = true;
    }
  };
  public hideStatsForm() {
    this.isShowStatsForm = false;
    this.isCreatePlayerStats = false;
  };
  public reset() {
    this.selectedPlayerArray = [];
    this.searchText = "";
    this.selectedPlayer = null;
    this.isShowStatsForm = false;
    this.isShowAddStatisticsButton = true;
    this.isDuplicateSeasonErrorMessage = false;
    this.isMissingTeamSeasonErrorMessage = false;
    this.isCreatePlayerStats = false;
  };
  // Submit new or edited stats button clicked
  public onSubmit() {
    if (this.isCreatePlayerStats) {
      this.createPlayerStats();
    } else {
      // getRawValue preserves the disabled formControl "season"
      this.updatePlayerStats(this.selectedPlayer.id, this.statsForm.getRawValue());
    }
  };
  // search players filter
  public applyFilter(filterValue: string) {
    if (filterValue.length > 1) {
        filterValue = filterValue.trim().toLowerCase();
    }
  };
  /////////////////////////////////////////////////////////////////////
  /////////////////////  Class CRUD Methods ///////////////////////////
  /////////////////////////////////////////////////////////////////////
  // CREATE
  private createPlayerStats() {
    this.statsForm.value.id = this.selectedPlayer.id;
    let points = this.statsForm.value.goals + this.statsForm.value.assists;
    let newStatsObject = {
      first: this.selectedPlayer.first,
      last: this.selectedPlayer.last,
      email: this.selectedPlayer.email,
      id: this.selectedPlayer.id,
      stats: {
        _id : null,
        season: this.statsForm.value.season,
        position: this.statsForm.value.position,
        jersey: this.statsForm.value.jersey,
        goals: this.statsForm.value.goals,
        assists: this.statsForm.value.assists,
        points: points,
        pim: this.statsForm.value.pim,
        team : {
          _id : this.statsForm.value.team,
          name : null
        }
      }
    }
    let seasonIndex = this.selectedPlayerArray.findIndex(a => a.stats.season === newStatsObject.stats.season);
    // call the stats service to submit new stats
    if (seasonIndex == -1) {
      this.isDuplicateSeasonErrorMessage = false;
      this.StatsService.createStats(this.statsForm.value).subscribe((res : any) => {
        console.log(res);
        newStatsObject.stats._id = res.data.stats[0]._id;
        newStatsObject.stats.team._id = res.data.stats[0].team;
        let playerId = res.data._id;
        let statId = res.data.stats[0]._id;
        this.TeamService.addPlayer(newStatsObject).subscribe((res:any) => {
          if (res.data) {
            console.log("Player Added To Team:");
            console.log(res);
            // return the sub-datas _id so that we can edit and delete without refreshing
            newStatsObject.stats.team.name= res.data.name;
            this.selectedPlayerArray.push(newStatsObject);
            console.log(this.selectedPlayerArray);
            this.isShowStatsForm = false;
            this.isMissingTeamSeasonErrorMessage = false;
          } else {
            this.StatsService.deletePlayerStats(playerId,statId);
            this.isMissingTeamSeasonErrorMessage = true;
          }
        });
      });
    } else {
      this.isDuplicateSeasonErrorMessage = true;
    }
  };
  // UPDATE
  private updatePlayerStats(playerId, stats) {
    // need res:any to allow filter method on result. Everything returned from API is an object
    // https://stackoverflow.com/questions/51657893/property-filter-does-not-exist-on-type-object
    this.StatsService.updateStats(playerId,stats).subscribe((res: any) => {
      console.log(stats);
      console.log(res);
      let updatedStats = res.filter(obj => {
        return obj._id === stats._id
      });
      // Player is updated in DB, now update in selectedPlayerArray for front end
      let index = this.selectedPlayerArray.findIndex(player => player.stats._id ===stats._id);
      this.selectedPlayerArray[index].stats = updatedStats[0];
      this.selectedPlayerArray[index].stats.points = updatedStats[0].goals + updatedStats[0].assists;
      this.isShowStatsForm = false;
    });
  };
  // DELETE
  public deletePlayerStats(playerId,statId) {
    console.log("Deleting Stats");
    this.StatsService.deletePlayerStats(playerId,statId);
    this.selectedPlayerArray.splice(this.selectedPlayerArray.findIndex(a => a.stats._id === statId), 1);
    // console.log(this.selectedPlayerArray);
    // this.players.splice(this.players.findIndex(a => a.stats._id === statId), 1);
    // console.log(this.players);
  };
}

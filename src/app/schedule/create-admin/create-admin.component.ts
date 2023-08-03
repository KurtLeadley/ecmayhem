import { Component, OnInit } from '@angular/core';
import { ScheduleService } from 'src/app/services/schedule.service';
import { PlayerService } from 'src/app/services/player.service';
import {Team} from '../../models/team.model';
import {Player} from '../../models/player.model';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-create-admin',
  templateUrl: './create-admin.component.html',
  styleUrls: ['./create-admin.component.css']
})
export class CreateAdminComponent implements OnInit {

  constructor(public scheduleService : ScheduleService, public playerService : PlayerService, public teamService : TeamService) { }
  // Data Containers
  teamData: Array<any>;
  teamDataDB: any;
  teamRosterDataDB: any;
  seasonScheduleDB: any;
  schedule: Array<any>;
  teamNames: Array<String>;
  selectedSeason: String;
  selectedWeekAmount: Number;
  selectedWeekDateOff: Date;
  selectedStartDate : Date;
  yearFromSelectedStartDate : Date;
  selectedWeekDatesOff: Array<any>;
  weeks : Array<Number>;
  weekDates: Array<any>;
  seasonDates: Array<any>;
  availableSeasons: Array<any>;
  usedSeasons: Array<any>;
  scheduleSummary: Array<any>;
  interval: any;
  waitingMessage: String;
  // Get this data from UI form
  times = ["4:30","6:00","7:30"];
  weekdays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  // UI Booleans
  showTeamsFetched = false;
  showScheduleBuilder = false;
  showSchedule = false;
  showSeasonUsed = false;
  showGenerateSchedule = false;
  showSelectWeeksOff = false;
  showWeeksOff = false;
  disableActions = false;
  showWaitingMessage = false;
  // On page load
  ngOnInit(): void {
    // this.weeks = Array.from({ length: 40 }, (_, i) => i).splice(10,26);
    this.weeks = Array.from({ length: 40 }, (_, i) => i).splice(1,36);
    this.selectedWeekDatesOff = [];
    this.selectedSeason = null;
    this.selectedStartDate = new Date();
    console.log(this.selectedStartDate);
    this.selectedWeekAmount = null;
    this.selectedWeekDateOff = null;
    this.yearFromSelectedStartDate = null;
    this.scheduleService.getAvailableGoogleSeasons('rosters').subscribe((res:any) => {
      const seasonArray = res.data.map(({name}) => (name));
      this.availableSeasons = seasonArray;
    });
    this.scheduleService.get().subscribe((res:any) => {
      console.log(res);
      this.usedSeasons = [...new Set(res.data.map(item => item.season))];
    });
  }
  // When a season is selected, pull in the spreadsheet data
  getGoogleRosters(season) {
    if (this.usedSeasons && this.usedSeasons.includes(season)) {
      console.log("Season Already Used");
      this.showSeasonUsed = true;
    }
    else {
      console.log("Get:" + season);
      this.teamNames = [];
      this.scheduleService.getGoogleRosters(season).subscribe((res:any) => {
        console.log(res.data);
        this.teamData = res.data;
        this.teamData.forEach(team => {
          this.teamNames.push(team.name);
        });
        this.showTeamsFetched = true;
      });
    }
  }
  // If user confirms the displayed teams
  confirmTeams() {
    this.showTeamsFetched = false;
    this.showScheduleBuilder = true;
  }
  // Create Rosters / Schedule and Teams for selected year
  async confirmSchedule() {
    console.log("Schedule Confirmed");
    this.disableActions = true;
    const flatDataSchedule = [];
    const clonedArray = JSON.parse(JSON.stringify(this.schedule));
    clonedArray.forEach((week, index) => {
      week.forEach(game => {
        game.season = this.selectedSeason;
        game.week = index + 1;
        game.teamA = game.teamA.name;
        game.teamB = game.teamB.name;
        game.stats = [];
        flatDataSchedule.push(game);
      });
    });
    console.log(flatDataSchedule);
    // Add games to games collection
    this.seasonScheduleDB = await this.scheduleService.createSeasonSchedule(flatDataSchedule).toPromise();
    // Add teams to teams collection
    this.teamDataDB = await this.createTeams();
    // Add players to teams collection
    this.teamRosterDataDB = await this.createSeasonRosters();
    await this.addPlayerIdsToTeams();
    this.showWaitingMessage = true;
    // this.runProgressBar();
    await this.createGoogleDataSheets();
    this.showWaitingMessage = false;
    clearInterval(this.interval);
    this.usedSeasons.push(this.selectedSeason);
    this.restoreDefaults();
  }
  // Create roster data for "players" collection insertion
  async createSeasonRosters() {
    var clonedTeamData = JSON.parse(JSON.stringify(this.teamData));
    console.log(clonedTeamData);
    clonedTeamData = clonedTeamData.filter(team => {return team.name != 'bye'});
    const flatTeamData = [];
    clonedTeamData.forEach(team => {
      console.log(team);
      const teamName = team.name;
      const teamId = this.findTeamId(teamName);
      team.sheet.data.forEach(player => {
        player.first = player[0];
        player.last = player[1];
        player.email = player[2];
        player.stats = {
          season : this.selectedSeason,
          team : teamId,
          position : player[3],
          jersey : player[4]
        }
        player.splice(0,5);
        flatTeamData.push(Object.assign({},player));
      });
    });
    const rosterDataDB = await this.playerService.createSeasonRosters(flatTeamData).toPromise();
    return rosterDataDB;
  }
  // Create data for "teams" collection
  async createTeams() {
    const clonedTeamData = JSON.parse(JSON.stringify(this.teamData));
    var teamArray = [];
    clonedTeamData.forEach(team => {
      const newTeam = {} as Team;
      newTeam.name = team.name;
      newTeam.stats = [{
        season : this.selectedSeason.toString()
      }];
      console.log(newTeam);
      teamArray.push(newTeam);
    });
    teamArray = teamArray.filter(team => {return team.name != 'bye'});
    console.log(teamArray);
    const teamDataDB = await this.teamService.createTeams(teamArray).toPromise();
    return teamDataDB;
  }
  // Create Google Result Data Sheet
  async createGoogleDataSheets() {
    const clonedTeamData = JSON.parse(JSON.stringify(this.teamDataDB.data));
    const clonedRosterData = JSON.parse(JSON.stringify(this.teamRosterDataDB.data));
    const clonedScheduleData = JSON.parse(JSON.stringify(this.schedule));
    const combinedData = [];
    // loop through each team
    clonedTeamData.forEach(team => {
      let teamSeasonId = team.stats[0]._id;
      // loop through each player of team
      clonedRosterData.forEach(player => {
        let playerSeasonTeamId = player.stats[0].team;
        let playerSeasonId = player.stats[0]._id;
        // ids match, add playerId to obj
        if (teamSeasonId == playerSeasonTeamId) {
          team.stats[0].players.push(playerSeasonId);
        }
      });
      combinedData.push(team);
    });
    let result = await this.scheduleService.createGoogleResultsSheets(combinedData,clonedScheduleData, this.selectedSeason.toString()).toPromise();
    return result;
  }
  // Build / Create Google Result Spreadsheets Data
  async addPlayerIdsToTeams() {
    // clone arrays to prevent mutation
    const clonedTeamData = JSON.parse(JSON.stringify(this.teamDataDB.data));
    const clonedRosterData = JSON.parse(JSON.stringify(this.teamRosterDataDB.data));
    var teamArray = [];
    // loop through each team
    clonedTeamData.forEach(team => {
      console.log(team);
      let playerArray = [];
      let teamSeasonId = team.stats[0]._id;
      // loop through each player of team
      clonedRosterData.forEach(player => {
        // obj for adding player ids to team
        console.log(player);
        let obj = {
          playerId : null,
          teamId : null,
          season: null
        };
        let playerSeasonTeamId = player.stats[0].team;
        let playerSeasonId = player.stats[0]._id;
        // ids match, create and push obj
        if (teamSeasonId == playerSeasonTeamId) {
          // new object for sending to team service
          obj.playerId = playerSeasonId;
          obj.teamId = teamSeasonId;
          obj.season = this.selectedSeason;
          playerArray.push(obj);
        }
      });
      teamArray.push(playerArray);
    });
    console.log(teamArray);
    // remove the phantom team
    teamArray =  teamArray.filter(e => e.length);
    // add players to teams
    const result = await this.teamService.addPlayers(teamArray).toPromise();
    return result;
  }
  // Reset the page
  restoreDefaults() {
    this.selectedSeason = null;
    this.showTeamsFetched = false;
    this.showScheduleBuilder = false;
    this.showSchedule = false;
    this.showSeasonUsed = false;
    this.teamData = null;
    this.teamDataDB = null;
    this.teamRosterDataDB = null;
    this.seasonScheduleDB = null;
    this.schedule = null;
    this.teamNames = null;
    this.selectedSeason = null;
    this.selectedWeekAmount = null;
    this.disableActions = false;
  }
  async deleteSeason() {
    const deleteScheduleResults = await this.scheduleService.delete(this.selectedSeason).toPromise();
    const deleteTeamsResult = await this.teamService.delete(this.selectedSeason).toPromise();
    const deletePlayersResult = await this.playerService.delete(this.selectedSeason).toPromise();
    console.log(this.selectedSeason);
    this.usedSeasons = this.usedSeasons.filter(item => item !== this.selectedSeason);
    console.log(this.usedSeasons);
    this.showSeasonUsed = false;
  }
  ///////////////////////////////////////////////////////
  ////// Schedule Generator Functions ///////////////////
  ///////////////////////////////////////////////////////
  // Make unique team matchups
  matchTeams = (participants) => {
    const p = Array.from(participants);
    const pairings = [];
    while (p.length != 0) {
      const participantA = p.shift();
      const participantB = p.pop();
      if (participantA['name'] != "bye" && participantB['name'] != "bye") {
        pairings.push([participantA,participantB]);
      }
    }
    return pairings;
  };
  // Find team and season id for inserting player to team
  findTeamId(teamName) {
    const clonedTeamData = JSON.parse(JSON.stringify(this.teamDataDB.data));
    const teamObj = clonedTeamData.filter(team => team.name == teamName);
    return teamObj[0].stats[0]._id;
  }
  // First element is static, while the rest of elements rotate. This creates round robin
  rotateTeams = (array) => {
    const p = Array.from(array);
    const firstElement = p.shift();
    const lastElement = p.pop();
    return [firstElement, lastElement, ...p];
  };
  // Create unique weekly matchups (times not rotated)
  generateWeeklyMatches = (teams) => {
    const weeklyMatches = [];
    const rounds = this.selectedWeekAmount;
    if (!teams.some(team => team.name === "bye")) {
      teams.push({sheet: {name: undefined, data: []}, name:"bye"});
    }
    let p = Array.from(teams);
    for (let i = 0; i < rounds; i++) {
      weeklyMatches.push(this.matchTeams(p));
      p = this.rotateTeams(p);
    }
    return weeklyMatches;
  };
  /////////////////////////////////////////////////////////////////////
  ///////////////////////// Shuffle Schedule //////////////////////////
  /////////////////////////////////////////////////////////////////////
  shuffle = (array) => {
    let currentIndex = array.length,  randomIndex;
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  }
  ///////////////////////////////////////////////////////////////////////////////////
  ///////////////////////// Generate Schedule Procedure /////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////
  generateSchedule() {
    // get selected seasonDates
    this.getSeasonDates();
    // reset summary if it exists
    this.scheduleSummary = [];
    let allMatches = this.generateWeeklyMatches(this.teamData);
    // create container for filtered bye weeks
    let allFilteredMatches = [];
    // create new matchup array without bye week matches
    allMatches.forEach(weeklyMatches => {
      // console.log(weeklyMatches);
      let filteredWeeklyMatches = [];
      weeklyMatches.forEach(match => {
        if (!match.includes("Bye")) {
          filteredWeeklyMatches.push(match);
        }
      });
      allFilteredMatches.push(filteredWeeklyMatches);
    });
    // create matches with times
    let matchObjectsArray = [];
    for (var i = 0 ; i < allFilteredMatches.length; i++) {
      let weeklyMatchObjs = [];
      if (i % 3 === 0) {
        let firstEl = this.times.shift();
        this.times.push(firstEl);
      }
      for (var j = 0; j < allFilteredMatches[i].length; j++) {
        let gameObj: any = {};
        gameObj.teamA = allFilteredMatches[i][j][0];
        gameObj.teamB = allFilteredMatches[i][j][1];
        gameObj.time = this.times[j];
        weeklyMatchObjs.push(gameObj);
      }
      matchObjectsArray.push(weeklyMatchObjs);
    }
    this.schedule = this.shuffle(matchObjectsArray);
    var index = 0;
    this.schedule.forEach(week => {
      week.sort((a, b) => (a.time > b.time) ? 1 : -1);
      week.date = this.seasonDates[index];
      week.forEach(game => {
        game.date = this.seasonDates[index];
      });
      index++;
    });
    this.scheduleSummary = this.tallyScheduleStats();
    this.showSchedule = true;
  }
  // Show general stats for the generated schedule
  tallyScheduleStats() {
    const clonedArray = JSON.parse(JSON.stringify(this.schedule));
    const clonedTeamNameArray = JSON.parse(JSON.stringify(this.teamNames));
    const teamSummaryArray = [];
    clonedTeamNameArray.forEach(team => {
      let teamObj = {
        'name' : team,
        '4:30' : 0,
        '6:00' : 0,
        '7:30' : 0
      }
      teamSummaryArray.push(teamObj);
    });
    clonedArray.forEach(week => {
      week.forEach(game => {
        let teamA = game.teamA.name;
        let teamB = game.teamB.name;
        let time = game.time
        var thingA = teamSummaryArray.find(team => team.name === teamA);
        thingA[time] += 1;
        var thingB = teamSummaryArray.find(team => team.name === teamB);
        thingB[time] += 1;
      });
    });
    return teamSummaryArray;
  }
  // Get every week of a weekday in a year
  //https://stackoverflow.com/questions/41194368/how-to-get-all-sundays-mondays-tuesdays-between-two-dates
  getDaysBetweenDates(start, end) {
    var result = [];
    var selectedDate = new Date(start);
    var day = selectedDate.getDay();
    selectedDate.setDate(selectedDate.getDate() + (day - selectedDate.getDay() + 8) % 7);
    while (selectedDate < end) {
      result.push(new Date(+selectedDate));
      selectedDate.setDate(selectedDate.getDate() + 7);
    }
    return result;
  }
  getWeekDates() {
    this.showSelectWeeksOff = true;
    this.weekDates = this.getDaysBetweenDates(this.selectedStartDate,this.yearFromSelectedStartDate);
  }
  checkRequirements() {
    if (this.selectedWeekDatesOff && this.selectedWeekAmount && this.selectedSeason) {
      this.showGenerateSchedule = true;
    } else {
      this.showGenerateSchedule = false;
    }
  }
  addSelectedWeekOff() {
    this.selectedWeekDatesOff.push(this.selectedWeekDateOff);
    this.showWeeksOff = true;
  }
  removeWeekOff(weekDateOff) {
    this.selectedWeekDatesOff = this.selectedWeekDatesOff.filter(item => item !== weekDateOff);
    if (this.selectedWeekDatesOff.length < 1) {
      this.showWeeksOff = false;
    }
  }
  getSeasonDates() {
    this.selectedWeekDatesOff = this.selectedWeekDatesOff.map(week => {
      return week = new Date(week);
    });
    this.seasonDates = this.weekDates.filter((x) => !this.selectedWeekDatesOff.some((y) => x.toDateString() === y.toDateString()));
    this.seasonDates = this.seasonDates.sort((a, b) => b.date - a.date);
  }
  getDatesFromStartDate() {
    console.log(this.selectedStartDate);
    const date = new Date(this.selectedStartDate);
    this.yearFromSelectedStartDate = new Date(date.setFullYear(new Date().getFullYear() + 1));
    this.getWeekDates();
  }
  // runProgressBar () {
  //   const text = ["Creating Google Result Sheets", "Creating Google Result Sheets.", "Creating Google Result Sheets..", "Creating Google Result Sheets..."];
  //   var counter = 0;
  //   this.interval = setInterval(change, 2000);
  //   function change() {
  //     this.waitingMessage = text[counter];
  //     console.log(this.waitingMessage);
  //     counter++;
  //     if (counter >= text.length) {
  //       counter = 0;
  //     }
  //   }
  // };
 }


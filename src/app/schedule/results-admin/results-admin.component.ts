import { Component, OnInit } from '@angular/core';
import { ScheduleService } from 'src/app/services/schedule.service';
import { TeamService } from 'src/app/services/team.service';
import { PlayerService } from 'src/app/services/player.service';
import { StatsService } from 'src/app/services/stats.service';
import { GameService } from 'src/app/services/game.service';
import { Team } from 'src/app/models/team.model';
import { Player } from 'src/app/models/player.model';
import { Game } from 'src/app/models/game.model';

@Component({
  selector: 'app-results-admin',
  templateUrl: './results-admin.component.html',
  styleUrls: ['./results-admin.component.css']
})
export class ResultsAdminComponent implements OnInit {
  allTeams : Array<Team>;
  allPlayers : Array<Player>;
  allGames : Array<Game>;
  availableSeasons : Array<any>;
  statsArray : any;
  selectedSeason : String;
  selectedGame : any;
  selectedGameBoxScore: any;
  showResults : Boolean;
  showSingleResult : Boolean;
  showResultsDD : Boolean;
  constructor(
    public scheduleService : ScheduleService,
    public teamService : TeamService,
    public playerService : PlayerService,
    public statsService : StatsService,
    public gameService : GameService
  ) { }

  ngOnInit(): void {
    this.showResults = false;
    this.showSingleResult = false;
    this.showResultsDD = true;
    this.scheduleService.getAvailableGoogleSeasons("results").subscribe((res:any) => {
      const seasonArray = res.data.map(({name}) => (name));
      this.availableSeasons = seasonArray;
      console.log(this.availableSeasons);
    });
  }
  async getGoogleResultSheets(season) {
    console.log("Upload Results for: " + season);
    this.statsArray = await this.scheduleService.getGoogleResultSheets(this.selectedSeason).toPromise();
    console.log(this.statsArray.data);
    if (this.statsArray.data) {
      this.createInsertObjectArray([...this.statsArray.data],season);
      this.showResults = true;
      this.showResultsDD = false;
    }
  }
  // Create object array for mongoDB insert
  async createInsertObjectArray(stats,season) {
    // Containers for Players and Games collection inserts
    var playerStatArray = [];
    const gameStatArray = [];
    const teamStatArray = [];
    // Get Players Collection
    const players = await this.statsService.get().toPromise();
    const filteredPlayers = players.data.filter(player => player.stats.season == this.selectedSeason);
    // For each week...
    stats.forEach(week => {
      let splitString = week.week.split('_');
      // ...get date and week number
      let date = splitString[1];
      let weekNumber = parseInt(splitString[0].split('Week-')[1]);
      // For each game in a week...
      week['data'].forEach(game => {
        // ...create a gameData object
        console.log(game);
        let gameData = {
          season : this.selectedSeason,
          date : date,
          week : weekNumber,
          time : undefined,
          playerGameStats : []
        }
        let sf1 = isNaN(game.data[0][11],) ? 0 : game.data[0][11];
        let sa1 = isNaN(game.data[1][11]) ? 0 : game.data[1][11];
        let sf2 = isNaN(game.data[1][11]) ? 0 : game.data[1][11];
        let sa2 = isNaN(game.data[0][11]) ? 0 : game.data[0][11];
        let teamAName = game.data[0][10];
        let teamBName = game.data[1][10];
        let goalsForA = game.data[3][11];
        let goalsAgainstA = game.data[4][11];
        let goalsForB = game.data[4][11];
        let goalsAgainstB = game.data[3][11];
        let teamAData = {
          season: this.selectedSeason,
          teamName : teamAName,
          goalsFor: goalsForA,
          goalsAgainst: goalsAgainstA,
          shotsFor: sf1,
          shotsAgainst: sa1,
          win : 0,
          loss: 0,
          otl: 0
        };
        let teamBData = {
          season: this.selectedSeason,
          teamName : teamBName,
          goalsFor: goalsForB,
          goalsAgainst: goalsAgainstB,
          shotsFor: sf2,
          shotsAgainst: sa2,
          win : 0,
          loss: 0,
          otl: 0
        }
        if (parseInt(game.data[3][11]) > parseInt(game.data[4][11])) {
          teamAData.win = teamAData.win + 1;
          teamBData.loss = teamBData.loss + 1;
        } else {
          teamAData.loss = teamAData.loss + 1;
          teamBData.win = teamBData.win + 1;
        }
        teamStatArray.push(teamAData,teamBData);
        // ...get the time
        gameData.time = game.sheetName.replace('.',':');
        // For each player in a game...
        game['data'].forEach(player => {
          console.log(player);
          // ...create a playerStat object
          let position = player[3];
          let goals = isNaN(player[6]) ? 0 : player[6];
          let assists = isNaN(player[7]) ? 0 : player[7];
          let pim = isNaN(player[8]) ? 0 : player[8];
          let teamName = player[5];
          let playerStat = {
            firstName : player[0],
            lastName : player[1],
            email : player[2],
            position,
            jersey : player[4],
            goals,
            assists,
            pim,
            teamName,
            teamId : undefined,
            playerId : undefined,
            goalsAgainst: undefined,
            shotsFaced: undefined
          };
          if (position == "G") {
            console.log("GOALIE");
            let shotsFaced = (teamName == teamAName) ? sa1 : sa2;
            let goalsAgainst = (teamName == teamAName) ? goalsAgainstA : goalsAgainstB;
            playerStat.goalsAgainst = goalsAgainst;
            playerStat.shotsFaced = shotsFaced;
            console.log(playerStat);
          }
          let fullPlayerData = filteredPlayers.filter(dbPlayer => dbPlayer.email == player[2]);
          // if not a sub
          if (fullPlayerData.length > 0) {
            let playerTeamId = fullPlayerData[0].team[0]['_id'];
            playerStat.teamId = playerTeamId
            playerStat.playerId = fullPlayerData[0].stats._id;
          } else {
            // we have a sub
            playerStat.teamId = "Sub"
            playerStat.playerId = "Sub"
          }
          // push player and game data objects to arrays
          playerStatArray.push(playerStat);
          gameData.playerGameStats.push(playerStat);
        });
        gameStatArray.push(gameData);
      });
    });
    console.log(gameStatArray);
    console.log(teamStatArray);
    // Tally up all goals, assists and pim for all games each player has played
    playerStatArray = this.sumObjects(playerStatArray, ['goals','assists','pim','shotsFaced','goalsAgainst']);
    // Insert player stats into Players collection
    await this.statsService.updateManyStats(playerStatArray,season).toPromise();
    // Insert game stats into Games collection
    await this.gameService.updateManyGames(gameStatArray,season).toPromise();
    // Insert team stats into Teams collection
    await this.teamService.updateManyTeams(teamStatArray,season).toPromise();
  }
  // Reset the page
  restoreDefaults() {
    this.selectedSeason = null;
    this.showResults = false;
    this.showSingleResult = false;
    this.showResultsDD = true;
  }
  // Go back to results
  goBackToResults() {
    this.showResults = true;
    this.showSingleResult = false;
  }
  // Show Single Game Stats
  displayGameStats(game,week) {
    this.showResultsDD = false;
    // console.log(game);
    // console.log(week);
    this.selectedGame = JSON.parse(JSON.stringify(game));
    this.selectedGameBoxScore = game.data.filter(el => {
      return ((el[6] > 0) || (el[7] > 0) || (el[8] > 0));
    });
    this.selectedGameBoxScore = Object.values(this.selectedGameBoxScore.reduce((acc, item) => {
      // Append the item to the array for each
      acc[item[5]] = [...(acc[item[5]] || []), item];
      return acc;
    }, {}));
    console.log(this.selectedGameBoxScore);
    this.showSingleResult = true;
    this.showResults = false;
  }
  sumObjects(values, props) {
    const map = values.reduce(function (map, player) {
      map[player.email] = props.map(function (property, i) {
        return +player[property] + ((map[player.email] || [])[i] || 0)
      })
      return map
    }, {})

    const res = Object.keys(map).map(function (k) {
      return map[k].reduce(function (object, player, i) {
        object[props[i]] = player
        return object
      }, { email: k })
    })
    return res
  }
}

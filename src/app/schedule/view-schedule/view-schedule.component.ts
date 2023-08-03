import { Component, OnInit } from '@angular/core';
import { ScheduleService } from '../../services/schedule.service';
import { TeamService } from 'src/app/services/team.service';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-view-schedule',
  templateUrl: './view-schedule.component.html',
  styleUrls: ['./view-schedule.component.css']
})
export class ViewScheduleComponent implements OnInit {

  constructor(public scheduleService : ScheduleService, public TeamService : TeamService, public gameService : GameService ) { }
  seasonSchedule : any;
  selectedSeason : String;
  currentSeason: String;
  availableSeasons: Array<any>
  showSchedule : Boolean;
  seasonScheduleExists: Boolean;
  selectedGame : any;
  selectedGameBoxScoreTeamA: any;
  selectedGameBoxScoreTeamB: any;
  showResults : Boolean;
  showSingleResult : Boolean;

  async ngOnInit(): Promise<void> {
    this.showSchedule = false;
    this.currentSeason = this.TeamService.getCurrentSeason();
    this.selectedSeason = this.currentSeason;
    this.scheduleService.getAvailableGoogleSeasons("results").subscribe((res:any) => {
      const seasonArray = res.data.map(({name}) => (name));
      seasonArray.push(this.currentSeason);
      console.log(seasonArray);
      this.availableSeasons = seasonArray;
    });
    this.seasonSchedule = await this.getSeasonSchedule();
  }
  // Get the selected season schedule
  async getSeasonSchedule() {
    this.gameService.get(this.selectedSeason).subscribe(res => {
      console.log(res);
      if (res.data.length > 0) {
        this.showSchedule = true;
        const result = res.data.reduce((acc, curr) => {
          const arrIndex = curr.week - 1;
          if (acc[arrIndex]) acc[arrIndex].push(curr);
          else acc[arrIndex] = [curr];
          return acc;
        }, []);
        result.forEach(week =>{
          week.date = week[0].date;
          week.week = week[0].week;
          week.forEach(game => {
            // We're going to tally up the goals for each team here
            let teamOneStats = [...game.stats].splice(0,12);
            let teamTwoStats = [...game.stats].splice(13,24);
            teamOneStats = teamOneStats.map(item => {
              return isNaN(parseInt(item.goals)) ? 0 : parseInt(item.goals, 10);
            });
            let teamOneGoals = [...teamOneStats].reduce((accum,item) => accum + item,0);
            teamTwoStats = teamTwoStats.map(item => {
              return isNaN(parseInt(item.goals)) ? 0 : parseInt(item.goals, 10);
            });
            let teamTwoGoals = [...teamTwoStats].reduce((accum,item) => accum + item);
            game.teamAGoals = teamOneGoals;
            game.teamBGoals = teamTwoGoals;
          });
        });
        console.log(result);
        this.seasonScheduleExists = true;
        this.seasonSchedule = result;
      } else {
        this.seasonScheduleExists = false;
        this.seasonSchedule = null;
      }
      return this.seasonSchedule;
    })
  }
    // Show Single Game Stats
    displayGameStats(game) {
      //this.showResultsDD = false;
      console.log(game);
      this.selectedGame = game;
      let teamOneStats = [...game.stats].splice(0,12);
      // filter team one stats
      this.selectedGameBoxScoreTeamA = teamOneStats.filter((player) => {
        return (player.goals != '' || player.assists != '' || player.pim != '');
      });
      let teamTwoStats = [...game.stats].splice(13,24);
      this.selectedGameBoxScoreTeamB= teamTwoStats.filter((player) => {
        return (player.goals != '' || player.assists != '' || player.pim != '');
      });
      this.showSingleResult = true;
      this.showSchedule = false;
    }
    goBackToSchedule() {
      this.showSingleResult = false;
      this.showSchedule = true;
    }
}

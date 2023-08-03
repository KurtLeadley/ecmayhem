import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PlayerStatsComponent } from './players/player-stats/player-stats.component';
import { GoalieStatsComponent } from './players/goalie-stats/goalie-stats.component';
import { PlayerAdminComponent } from './players/player-admin/player-admin.component';
import { StandingsComponent } from './standings/standings.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { ImportStatsComponent } from './players/player-admin/import-stats/import-stats.component';
import { EditStatsComponent } from './players/player-admin/edit-stats/edit-stats.component';
import { ImportPlayersComponent } from './players/player-admin/import-players/import-players.component';
import { CreatePlayerComponent } from './players/player-admin/create-player/create-player.component';
import { ResultsAdminComponent } from './schedule/results-admin/results-admin.component';
import { CreateAdminComponent } from './schedule/create-admin/create-admin.component';
import { ViewScheduleComponent } from './schedule/view-schedule/view-schedule.component';
import { LoginComponent } from './auth/login/login.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'players', component: PlayerStatsComponent},
  { path: 'players/player-stats', component: PlayerStatsComponent },
  { path: 'players/goalie-stats' , component: GoalieStatsComponent },
  { path: 'players/player-admin' , component: PlayerAdminComponent,
    children: [
      { path: 'create-player', component: CreatePlayerComponent},
      { path: 'import-players', component: ImportPlayersComponent},
      { path: 'edit-stats', component: EditStatsComponent},
      { path: 'import-stats', component: ImportStatsComponent},
    ]},
  { path: 'standings' , component: StandingsComponent },
  { path: 'schedule', component: ScheduleComponent },
  { path: 'schedule/results-admin', component: ResultsAdminComponent },
  { path: 'schedule/create-admin', component: CreateAdminComponent },
  { path: 'schedule/view', component: ViewScheduleComponent },
  { path: 'login', component: LoginComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

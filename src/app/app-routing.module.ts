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
  { path: 'schedule', component: ScheduleComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

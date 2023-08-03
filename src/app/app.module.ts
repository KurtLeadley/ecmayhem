import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import {MatInputModule} from '@angular/material/input';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { PlayerStatsComponent } from './players/player-stats/player-stats.component';
import { StandingsComponent } from './standings/standings.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { SortPipe } from './pipes/sort.pipe';
import { FilterPipe } from './pipes/filter.pipe';
import { SearchFilterPipe } from './pipes/search.filter.pipe';
import { GoalieStatsComponent } from './players/goalie-stats/goalie-stats.component';
import { PlayerAdminComponent } from './players/player-admin/player-admin.component';
import { CreatePlayerComponent } from './players/player-admin/create-player/create-player.component';
import { ImportPlayersComponent } from './players/player-admin/import-players/import-players.component';
import { EditStatsComponent } from './players/player-admin/edit-stats/edit-stats.component';
import { ImportStatsComponent } from './players/player-admin/import-stats/import-stats.component';
import { FooterComponent } from './footer/footer.component';
import { ResultsAdminComponent } from './schedule/results-admin/results-admin.component';
import { CreateAdminComponent } from './schedule/create-admin/create-admin.component';
import { ViewScheduleComponent } from './schedule/view-schedule/view-schedule.component';
import { LoginComponent } from './auth/login/login.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    PlayerStatsComponent,
    StandingsComponent,
    ScheduleComponent,
    SortPipe,
    FilterPipe,
    GoalieStatsComponent,
    PlayerAdminComponent,
    CreatePlayerComponent,
    ImportPlayersComponent,
    EditStatsComponent,
    ImportStatsComponent,
    SearchFilterPipe,
    FooterComponent,
    ResultsAdminComponent,
    CreateAdminComponent,
    ViewScheduleComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatToolbarModule,
    MatExpansionModule,
    MatFormFieldModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

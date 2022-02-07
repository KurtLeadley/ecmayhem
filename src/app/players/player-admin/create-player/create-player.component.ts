import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { min } from 'rxjs/operators';
import { PlayerService } from 'src/app/services/player.service';
import { Player } from '../../../models/player.model'

@Component({
  selector: 'app-create-player',
  templateUrl: './create-player.component.html',
  styleUrls: ['./create-player.component.css']
})
export class CreatePlayerComponent implements OnInit {
  errorMessage: boolean;
  successMessage: boolean;
  searchText : String;
  players : Player[] = [];
  private playersSub: Subscription;
  constructor(private formBuilder: FormBuilder, public PlayerService: PlayerService) { }

  createPlayerForm = this.formBuilder.group({
    firstName: '',
    lastName: '',
    email: ''
  });

  ngOnInit(): void {
    this.searchText = "";
    this.errorMessage = false;
    this.successMessage = false;
    this.PlayerService.getPlayers();
    this.playersSub = this.PlayerService.getPlayersUpdateListener()
    .subscribe((players: Player[]) => {
      this.players = players;
      console.log(this.players);
    });
  }
  ngOnDestroy(): void {
    this.playersSub.unsubscribe();
  }
  applyFilter(filterValue: string) {
    if (filterValue.length > 1) {
        filterValue = filterValue.trim();
        filterValue = filterValue.toLowerCase();
        //this.players.filter = filterValue;
    }
  }
  onSubmit(): void {
    console.log(this.createPlayerForm.value);
    let first = this.createPlayerForm.value.firstName;
    let last = this.createPlayerForm.value.lastName;
    let email = this.createPlayerForm.value.email;
    let newPlayer = {
      id: null,
      first,
      last,
      email,
      stats: null
    };
    this.PlayerService.createPlayer(first,last,email).subscribe(res => {
      this.successMessage = true;
      setTimeout(()=> {
        this.createPlayerForm.reset();
        this.successMessage = false;
      },5000);
      this.players.push(newPlayer);
      console.log(this.players);
    }, (error) => {
      this.errorMessage = true;
      setTimeout(()=> {
        this.errorMessage = false;
      },5000);
      console.log(error);
    });
  }
}

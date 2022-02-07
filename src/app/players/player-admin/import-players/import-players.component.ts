import { Component, OnInit } from '@angular/core';
import { PlayerService } from 'src/app/services/player.service';
import { Player } from '../../../models/player.model';

@Component({
  selector: 'app-import-players',
  templateUrl: './import-players.component.html',
  styleUrls: ['./import-players.component.css']
})
export class ImportPlayersComponent implements OnInit {
  csvSubmitted: Boolean;
  csvPlayers: Array<any>;
  existingPlayers: Player[] = [];
  uniqueCsvPlayers = [];
  notImported = [];
  imported = [];
  constructor(public PlayerService : PlayerService) { }

  ngOnInit(): void {
    this.csvPlayers = [];
    this.PlayerService.getPlayers();
    this.PlayerService.getPlayersUpdateListener().subscribe((players: Player[]) => {
      this.existingPlayers = players;
    });
  }

  uploadChangeListener(files: FileList){
    if(files && files.length > 0) {
       let file : File = files.item(0);
         let reader: FileReader = new FileReader();
         reader.readAsText(file);
         reader.onload = (e) => {
            let csv: string = reader.result as string;
            this.csvPlayers = this.csvJSON(csv);
            console.log(this.csvPlayers);
         }
      }
  }
  // convert csv to json
  csvJSON(csvText) {
    let lines = [];
    const linesArray = csvText.split('\n');
    // for trimming and deleting extra space
    linesArray.forEach((e: any) => {
      const row = e.replace(/[\s]+[,]+|[,]+[\s]+/g, ',').trim();
      lines.push(row);
    });
    const result = [];
    const headers = lines[0].split(",");
    for (let i = 1; i < lines.length; i++) {
        const obj = {};
        const currentline = lines[i].split(",");

        for (let j = 0; j < headers.length; j++) {
          obj[headers[j]] = currentline[j];
        }
        result.push(obj);
    }
    return result;
  }

  dupeCheck(csvPlayers,existingPlayers) {
    this.uniqueCsvPlayers = [];
    for (let i = 0; i < csvPlayers.length; i++) {
      console.log(csvPlayers[i].Email);
      let email = csvPlayers[i].Email;
      console.log(this.playerExists(email,existingPlayers));
      if (this.playerExists(email,existingPlayers)) {
        console.log("True");
        this.uniqueCsvPlayers.push(csvPlayers[i]);
      }
    }
    console.log(this.uniqueCsvPlayers);
  }
  playerExists(email,array) {
    console.log(email);
    return array.some(function(el) {
      console.log(el);
      return el.email === email;
    });
  }
  onImport() {
    this.imported = [];
    this.notImported = [];
    this.dupeCheck(this.csvPlayers,this.existingPlayers);
    for (let i = 0; i < this.csvPlayers.length; i++) {
      let first = this.csvPlayers[i].First;
      let last = this.csvPlayers[i].Last;
      let email = this.csvPlayers[i].Email;
      let csvPlayer = {
        first,
        last,
        email
      }
      this.PlayerService.createPlayer(first,last,email).subscribe(res => {
        console.log(res);
        this.imported.push(csvPlayer);
      }, (error) => {
        console.log(error);
        this.notImported.push(csvPlayer);
      });
    }
    this.csvSubmitted = true;
  };

  reset() {
    this.csvSubmitted = false;
    this.imported = [];
    this.notImported = [];
    this.uniqueCsvPlayers = [];
    this.csvPlayers = [];
  }
}

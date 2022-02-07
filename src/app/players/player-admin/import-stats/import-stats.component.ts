import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-import-stats',
  templateUrl: './import-stats.component.html',
  styleUrls: ['./import-stats.component.css']
})
export class ImportStatsComponent implements OnInit {

  players: any;
  //csv: File;

  constructor() { }

  ngOnInit(): void {
  }
  public changeListener(files: FileList){
    console.log(files);
    if(files && files.length > 0) {
       let file : File = files.item(0);
         console.log(file.name);
         console.log(file.size);
         console.log(file.type);
         let reader: FileReader = new FileReader();
         reader.readAsText(file);
         reader.onload = (e) => {
            let csv: string = reader.result as string;
            console.log(csv);
            this.players = this.csvJSON(csv);
            console.log(this.players);
         }
      }
  }
  csvJSON(csv) {

    let lines=csv.split("\n");
    let result = [];
    let headers=lines[0].split(",");

    for(var i=1;i<lines.length;i++){
        let obj = {};
        let currentline=lines[i].split(",");
        for(var j=0;j<headers.length;j++){
            obj[headers[j]] = currentline[j];
        }
        result.push(obj);
    }
    return result; //JavaScript object
    //return JSON.stringify(result); //JSON
  }
}

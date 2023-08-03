
///////////////////////////////////////////////////
///////////// Requires ////////////////////////////
///////////////////////////////////////////////////
const {google} = require('googleapis');
const privatekey = require('../../google-api.json');
const Game = require('../models/game');
///////////////////////////////////////////////////
///////////// Authenticate ////////////////////////
///////////////////////////////////////////////////
// configure a JWT auth client
let jwtClient = new google.auth.JWT(
  privatekey.client_email,
  null,
  privatekey.private_key,
  ['https://www.googleapis.com/auth/spreadsheets',
   'https://www.googleapis.com/auth/drive',
   'https://www.googleapis.com/auth/calendar']);
//authenticate request
jwtClient.authorize(function (err, tokens) {
  if (err) {
    console.log(err);
  return;
  } else {
    console.log("Successfully connected!");
  }
});
///////////////////////////////////////////////////
///////////// Constants ///////////////////////////
///////////////////////////////////////////////////
const drive = google.drive('v3');
const sheets = google.sheets({version: 'v4', auth: jwtClient});
const teamParentFolderID = '1FbQmg22x51J39dhHfDnOKojHRQYck4oD';
const resultParentFolderID = '1hjsabxDQV3H5ZCRLHL6Nbaa74_mX-weD';
////////////////////////////////////////////////////
///////////// Create Result Sheets///////////////////
/////////////////////////////////////////////////////
exports.createGoogleResultsSheets = async (req,res) => {
  console.log("Create Google Results Sheets");
  // Get season from req.body
  const season = req.body.season;
  const resultSeasonFolders = await getChildFiles(resultParentFolderID);
  const exists = propertyExists(resultSeasonFolders,'name',season);
  // Create season folder if it does not exist yet and get its id
  let seasonResultsFolderId = null;
  if (exists) {
    // Get season folder id
    const result = resultSeasonFolders.filter(folder=>folder.name == season).map(folder=>folder.id);
    seasonResultsFolderId = result[0];
  } else {
    // Create Season Folder and get its id
    let fileMetadata = {
      'name': season,
      'mimeType': 'application/vnd.google-apps.folder',
      'parents' : [resultParentFolderID]
    };
    const result = await drive.files.create({auth: jwtClient, resource: fileMetadata});
    seasonResultsFolderId = result.data.id;
  }
  var i = 0;
  for (const week of req.body.schedule) {
    i++;
    var dateString = new Date(week[0].date).toISOString().replace(/T.*/,'');
    // Create meta data for each spreadsheet
    let fileMetadata = {
      name: "Week-" + i +"_" + dateString,
      mimeType: "application/vnd.google-apps.spreadsheet",
      parents: [seasonResultsFolderId],
    };
    // Create each spreadsheet
    let result = await drive.files.create({auth: jwtClient, resource: fileMetadata});
    let spreadsheetId = result.data.id;
    console.log("Created Result Sheet: " + spreadsheetId);
    // Rename each sheet
    const sheetNames = week.map((game) =>
      game.time.toString().replace(":", ".").trim()
    );
    // Add sheets and delete 1st tab.
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          ...sheetNames.map((title) => ({
            addSheet: {
              properties: { title }
            },
          })),
          { deleteSheet: { sheetId: 0 } }
        ],
      },
    });
    // Put values to each sheet.
    const data = week.map((game, i) => {
      let subPlayersA = ["Subs","NA","NA","NA","NA",game.teamA.name];
      let subPlayersB = ["Subs","NA","NA","NA","NA",game.teamB.name];
      game.teamA.sheet.data.forEach((player) => {
        player.push(game.teamA.name);
      });
      game.teamB.sheet.data.forEach((player) => {
        player.push(game.teamB.name);
      });
      game.teamA.sheet.data.push(subPlayersA);
      game.teamB.sheet.data.push(subPlayersB);
      return [
        {
          range: "'" + sheetNames[i] + "'!A1:I1",
          values: [["First","Last","Email","Position","Number","Team","Goals","Assists","Penalties"]],
        },
        {
          range: "'" + sheetNames[i] + "'!K1:L1",
          values: [["Team", "Shots"]]
        },
        {
          range: "'" + sheetNames[i] + "'!K2:L3",
          values: [
            [game.teamA.name, ""],
            [game.teamB.name, ""]
          ],
        },
        {
          range: "'" + sheetNames[i] + "'!K4:L4",
          values: [["Team", "Goals"]]
        },
        {
          range: "'" + sheetNames[i] + "'!K5:L6",
          values: [
            [game.teamA.name, ""],
            [game.teamB.name, ""]
          ],
        },
        {
          range: "'" + sheetNames[i] + "'!A2:F13",
          values: game.teamA.sheet.data
        },
        {
          range: "'" + sheetNames[i] + "'!A15:F26",
          values: game.teamB.sheet.data
        },
      ];
    });
    // Make the data write request to Sheets Api
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: spreadsheetId,
      resource: { valueInputOption: "RAW", data }
    });
    // Format cells for each sheet
    const formatDataArray = [];
    for (var j = 0; j < sheetNames.length; j++) {
      // for every game
      let sheetId = await getSheetId(spreadsheetId,sheetNames[j]);
      // format the header
      let formatHeader = {
        repeatCell: {
          range: {
            sheetId: sheetId,
            startRowIndex: 0,
            endRowIndex:1
          },
          cell: {
            userEnteredFormat: {
              horizontalAlignment : "LEFT",
              textFormat: {
                bold: true,
                foregroundColor: {
                  red : 255/255,
                  green : 255/255,
                  blue : 255/255
                }
              },
              backgroundColor: {
                red : 61/255,
                green : 133/255,
                blue : 198/255
              },
            },
          },
          fields: "userEnteredFormat",
        }
      };
      // format score header
      let formatScoreHeader = {
        repeatCell: {
          range: {
            sheetId: sheetId,
            startRowIndex: 3,
            endRowIndex:4,
            startColumnIndex: 10,
            endColumnIndex: 12
          },
          cell: {
            userEnteredFormat: {
              horizontalAlignment : "LEFT",
              textFormat: {
                bold: true,
                foregroundColor: {
                  red : 255/255,
                  green : 255/255,
                  blue : 255/255
                }
              },
              backgroundColor: {
                red : 61/255,
                green : 133/255,
                blue : 198/255
              },
            },
          },
          fields: "userEnteredFormat",
        }
      };
      // format row separator
      let formatRowSeparator = {
        repeatCell: {
          range: {
            sheetId: sheetId,
            startRowIndex: 13,
            endRowIndex:14,
            startColumnIndex: 0,
            endColumnIndex: 12
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: {
                red : 102/255,
                green : 102/255,
                blue : 102/255
              }
            }
          },
          fields: "userEnteredFormat.backgroundColor",
        }
      };
      // format column separator
      let formatColumnSeparator = {
        repeatCell: {
          range: {
            sheetId: sheetId,
            startRowIndex: 0,
            endRowIndex: 26,
            startColumnIndex: 9,
            endColumnIndex: 10
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: {
                red : 102/255,
                green : 102/255,
                blue : 102/255
              }
            }
          },
          fields: "userEnteredFormat.backgroundColor",
        },
      };
      // color unused range
      let unusedRange = {
        repeatCell: {
          range: {
            sheetId: sheetId,
            startRowIndex: 6,
            endRowIndex: 27,
            startColumnIndex: 10,
            endColumnIndex: 12
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: {
                red : 207/255,
                green : 226/255,
                blue : 243/255
              }
            }
          },
          fields: "userEnteredFormat.backgroundColor",
        }
      };
      // set dimensions of column separator
      let columnSeparatorDimensions = {
        updateDimensionProperties: {
          range: {
            "sheetId": sheetId,
            "dimension": "COLUMNS",
            "startIndex": 9,
            "endIndex": 10
          },
          properties: {
            "pixelSize": 21
          },
          fields: "pixelSize"
        }
      };
      // delete extra columns
      let deleteColumns = {
        deleteDimension: {
          range: {
            "sheetId": sheetId,
            "dimension": "COLUMNS",
            "startIndex": 12,
            "endIndex": 26
          }
        }
      };
      // delete extra rows
      let deleteRows = {
        deleteDimension: {
          range: {
            "sheetId": sheetId,
            "dimension": "ROWS",
            "startIndex": 26,
            "endIndex": 10000
          }
        }
      };
      let protectedRange1 = {
        "addProtectedRange": {
          "protectedRange": {
              "range": {
                  "sheetId": sheetId,
                  "startRowIndex": 0,
                  "endRowIndex": 27,
                  "startColumnIndex": 0,
                  "endColumnIndex": 6,
              },
              "description": "Static Data",
              "warningOnly": false,
              "editors": {
                "users": [
                  "ecmayhem@ecmayhem.iam.gserviceaccount.com"
                ]
              }
          }
        }
      };
      let protectedRange2 = {
        "addProtectedRange": {
          "protectedRange": {
              "range": {
                  "sheetId": sheetId,
                  "startRowIndex": 3,
                  "endRowIndex": 27,
                  "startColumnIndex": 10,
                  "endColumnIndex": 12,
              },
              "description": "Static Data",
              "warningOnly": false,
              "editors": {
                "users": [
                  "ecmayhem@ecmayhem.iam.gserviceaccount.com"
                ]
              }
          }
        }
      };
      let teamAScoreFormula = {
        "repeatCell": {
          "range": {
            "sheetId": sheetId,
            "startRowIndex": 4,
            "endRowIndex": 5,
            "startColumnIndex": 11,
            "endColumnIndex": 12
          },
          "cell": {
            "userEnteredValue": {
                "formulaValue": "=SUM(G2:G13)"
            }
          },
          "fields": "userEnteredValue"
        }
      };
      let teamBScoreFormula = {
        "repeatCell": {
          "range": {
            "sheetId": sheetId,
            "startRowIndex": 5,
            "endRowIndex": 6,
            "startColumnIndex": 11,
            "endColumnIndex": 12
          },
          "cell": {
            "userEnteredValue": {
                "formulaValue": "=SUM(G15:G26)"
            }
          },
          "fields": "userEnteredValue"
        }
      };
      formatDataArray.push(formatHeader,formatScoreHeader,formatRowSeparator,formatColumnSeparator,columnSeparatorDimensions,
        deleteColumns,deleteRows,protectedRange1,protectedRange2,unusedRange,teamAScoreFormula,teamBScoreFormula);
    }
    // Make the format write request to Sheets Api
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheetId,
      resource: { requests: formatDataArray }
    });
    // delay
    await sleep(1000);
  }
};
////////////////////////////////////////////////////
/////////////// Get sheetId by name ////////////////
////////////////////////////////////////////////////
async function getSheetId(spreadsheetId,sheetName) {
  try {
    const request = {
        spreadsheetId: spreadsheetId,
        ranges: [sheetName],
        includeGridData: false,
        auth: jwtClient,
    };
    const res = await sheets.spreadsheets.get(request);
    return res.data.sheets[0].properties.sheetId;
  } catch (error) {
    console.log("Error get sheetId");
  }
}
// folder or file exists
function propertyExists(array,prop,value) {
  return array.some(el => el.name === value);
}
// Generic function..Gets folders / files in a parent folder
async function getChildFiles(parentId) {
  const res = await drive.files.list({
    auth: jwtClient,
    q: "'"+parentId+"' in parents"
  });
  let files = res.data.files;
  return files;
}
// Get Google Spreadsheets
async function getSpreadsheets(season,entity) {
  console.log("Get " + entity + ' spreadsheets');
  if (entity == 'rosters') {
    parentFolderId = teamParentFolderID;
  }
  if (entity == 'results') {
    parentFolderId = resultParentFolderID;
  }
  const availableSeasons = await getChildFiles(parentFolderId);
  const seasonFolderId = availableSeasons.filter(folder => {
    return folder.name == season;
  }).map(({id}) => id);
  const spreadsheets = await getChildFiles(seasonFolderId[0]);
  return spreadsheets;
}
// Get sheet data from roster sheets
async function getSheetData(spreadsheetId,ranges) {
  console.log("Getting Data for : " + spreadsheetId  + " ranges:" + ranges);
  const res = await sheets.spreadsheets.values.batchGet({
    spreadsheetId : spreadsheetId,
    ranges : ranges
  });
  let dataArray = [];
  let dataObj = {};
  let index = 0;
  res.data.valueRanges.forEach(sheet =>{
    let sheetName = ranges[index].toString().split('!')[0].replace("'",'');
    sheet.values.shift();
    dataObj = {
      data : sheet.values,
      sheetName
    };
    dataArray.push(dataObj);
    index++;
  });
  return dataArray;
}
// Actually get the team rosters
async function getGoogleRosters(season) {
  // console.log(season);
  const teamRosterFiles = await getSpreadsheets(season,'rosters');
  const teamRosterDataArray = [];
  for (const file of teamRosterFiles) {
    let ranges = ["'Sheet'!A1:E12"];
    let teamObj = {};
    let teamData = await getSheetData(file.id, ranges);
    let teamName = file.name;
    teamObj.sheet = teamData[0];
    teamObj.name = teamName;
    teamRosterDataArray.push(teamObj);
  }
  return teamRosterDataArray;
}
async function getGoogleResultSheets(season) {
  console.log("getGoogleResultSheets");
  const dataArray = [];
  const resultFiles =  await getSpreadsheets(season,'results');
  for (const file of resultFiles) {
    await sleep(1500);
    let ss = await sheets.spreadsheets.get({spreadsheetId : file.id});
    let ranges = [];
    ss.data.sheets.forEach(sheet => {
      ranges.push(sheet.properties.title+'!A1:L26');
    });
    let data = await getSheetData(file.id,ranges);
    let dataObj = {
      week: file.name,
      data : data
    };
    dataArray.push(dataObj);
  }
  return dataArray;
}
// delay
async function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}
//////////////////////////////////////////////////
//////////////// Route Methods ///////////////////
//////////////////////////////////////////////////
// Get available Google Sheet seasons
exports.getGoogleSeasons = async (req, res) => {
  const entity = req.params.entity;
  if (entity == "rosters") {
    parentFolderId = teamParentFolderID;
  }
  if (entity == "results") {
    parentFolderId = resultParentFolderID;
  }
  try {
    const availableSeasons = await getChildFiles(parentFolderId);
    return res.status(200).send({
      message: "Available Seasons Fetched",
      data: availableSeasons
    });
  } catch (err) {
    return res.status(500).send({
      message: err.message
    });
  }
};
// Get Google Result Sheets
exports.getGoogleResultSheets = async (req, res) => {
  console.log("Get Google Result Sheets");
  const data = await getGoogleResultSheets(req.params.season);
  try {
    return res.status(200).send({
      message: "Retrieved Result Sheet Data:",
      data: data
    });
  } catch (err) {
    return res.status(500).send({
      message: err.message
    });
  }
};
// Get used DB seasons
exports.get = async (req, res) => {
  try {
    const data = await Game.find();
    return res.status(200).send({
      message: "DB Schedule Fetched",
      data: data
    });
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    });
  }
};
// Get Rosters from Google Drive
exports.getGoogleRosters = async (req,res) => {
  let season = req.params.season;
  try {
    const data = await getGoogleRosters(season);
    return res.status(200).json({
      message: "Google Sheets Rosters Fetched",
      data : data
    });
  } catch (err) {
    return res.status(500).send({
      message: err.message
    });
  }
};
// Create a schedule
exports.createSeasonSchedule = async (req,res) => {
  console.log("Creating Schedule");
  let data = req.body;
  let bulkOperations = [];
  for (const game of data) {
    //Game does not exist
    let filterCase1 = {$and:[{'week' : {$ne : game.week}},{'season': {$ne : game.season}},{'teamA' : {$ne : game.teamA}},{'teamB' : {$ne : game.teamB}}]};
    let updateCase1 =  {$setOnInsert: {date: game.date, time: game.time, week: game.week, season: game.season, teamA: game.teamA, teamB: game.teamB, stats: game.stats}};
    let updateObjectCase1 = {
      'updateOne' : {
        'filter' : filterCase1,
        'update' : updateCase1,
        'upsert' : true
      }
    };
    bulkOperations.push(updateObjectCase1);
  }
  try {
    let result = await Game.collection.bulkWrite(bulkOperations);
    let games = await Game.find();
    return res.status(200).send({
      message: "Games Created",
      data: games,
      result: result
    });
  } catch (err) {
    return res.status(500).send({
      message: err.message
    });
  }
};
// Get Season Schedule MongoDB
// exports.getSeasonSchedule = async (req,res) => {
//   let season = req.params.season;
//   try {
//     data = await Game.find({season:season});
//     return res.status(200).json({
//       message: "Season Data Fetched",
//       data : data
//     });
//   } catch (err) {
//     return res.status(500).send({
//       message: err.message
//     });
//   }
// };
// delete
exports.delete = async (req,res) => {
  try {
    const result = await Game.deleteMany({ 'season': req.params.param });
    return res.status(200).json({
      message: "Schedule Data Deleted",
      data : result
    });
  } catch (err) {
    return res.status(500).send({
      message: err.message
    });
  }
};


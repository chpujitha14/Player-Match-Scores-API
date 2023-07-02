const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

//accept json data
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
//get list Players API 1
app.get("/players/", async (request, response) => {
  const sqlQuery = `SELECT player_id as playerId,player_name as playerName FROM player_details;`;
  const listResponse = await db.all(sqlQuery);
  response.send(listResponse);
});

//2 API save data
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const sqlQuery = `SELECT player_id as playerId,player_name as playerName FROM player_details where player_id='${playerId}';`;
  const listResponse = await db.get(sqlQuery);
  response.send(listResponse);
});

//3 API update(put)
app.put("/players/:playerId/", async (request, response) => {
  const requestDetails = request.body;
  const { playerId } = request.params;
  const { playerName } = requestDetails;
  const updateQuery = `update player_details set player_name='${playerName}' where player_id='${playerId}'`;
  const dbResponse = await db.run(updateQuery);
  response.send("Player Details Updated");
});

//4 API
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;

  const sqlQuery = `SELECT match_id as matchId,match,year FROM match_details  where match_id='${matchId}';`;
  const listResponse = await db.get(sqlQuery);
  response.send(listResponse);
});

//5 API
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;

  const sqlQuery2 = `SELECT
	      match_details.match_id AS matchId,
          match_details.match AS match,
          match_details.year AS year
	    FROM player_match_score NATURAL JOIN match_details
        WHERE player_id=${playerId};`;
  const listResponse2 = await db.all(sqlQuery2);

  response.send(listResponse2);
});

//6 API Get single value

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;

  const sqlQuery2 = `SELECT
	      player_details.player_id AS playerId,
	      player_details.player_name AS playerName
	    FROM player_match_score NATURAL JOIN player_details
        WHERE match_id=${matchId};`;
  const listResponse2 = await db.all(sqlQuery2);

  response.send(listResponse2);
});

//7 API
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const sqlQuery = `SELECT player_match_score.player_id as playerId,player_details.player_name as playerName,sum(player_match_score.score) as totalScore,
  sum(player_match_score.fours) as totalFours,
  sum(player_match_score.sixes) as totalSixes FROM player_match_score INNER JOIN player_details on  player_details.player_id=player_match_score.player_id where
   player_details.player_id='${playerId}';`;
  const listResponse = await db.get(sqlQuery);

  response.send(listResponse);
});

module.exports = app;

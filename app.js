const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost/3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDBObjectToResponseObj = (dbObj) => {
  return {
    movieId: dbObj.movie_id,
    directorId: dbObj.director_id,
    movieName: dbObj.movie_name,
    leadActor: dbObj.lead_actor,
  };
};

const convertArrOfDBObjectToResponseObj = (arrOfObjects) => {
  const newArrOfObjects = [];

  for (const eachObj of arrOfObjects) {
    newObj = {
      movieId: eachObj.movie_id,
      movieName: eachObj.movie_name,
      directorId: eachObj.director_id,
      directorName: eachObj.director_name,
    };
    newArrOfObjects.push(newObj);
  }
  return newArrOfObjects;
};

//API 1

app.get("/movies/", async (request, response) => {
  const moviesQuery = `
    SELECT movie_name FROM movie;
    `;

  const moviesArray = await db.all(moviesQuery);
  const moviesArrResObj = convertArrOfDBObjectToResponseObj(moviesArray);
  response.send(moviesArrResObj);
});

//API 2

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;

  const { directorId, movieName, leadActor } = movieDetails;

  const addMovieQuery = `
        INSERT INTO
            movie(director_id,movie_name,lead_actor)
        VALUES(
            '${directorId}',
            '${movieName}',
            '${leadActor}'
        );    
    `;

  const movieResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//API 3

app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const requiredMovieQuery = `
    SELECT
        *
    FROM
        movie
    WHERE
        movie_id = '${movieId}';
    `;

  const requiredMovieResponse = await db.get(requiredMovieQuery);
  const reqMovieResObj = convertDBObjectToResponseObj(requiredMovieResponse);
  response.send(reqMovieResObj);
});

//API 4

app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const updateQuery = `
    UPDATE 
        movie
    SET 
        director_id = '${directorId}',
        movie_name = '${movieName}',
        lead_actor = '${leadActor}';
    `;

  await db.run(updateQuery);
  response.send("Movie Details Updated");
});

//API 5

app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;

  const deleteQuery = `
    DELETE FROM 
        movie
    WHERE 
        movie_id = '${movieId}';    
    `;

  await db.run(deleteQuery);
  response.send("Movie Removed");
});

//API 6

app.get("/directors", async (request, response) => {
  const getAllDirectors = `
    SELECT
        *
    FROM 
        director;
    `;
  const directorsArray = await db.all(getAllDirectors);
  const dirArrResObj = convertArrOfDBObjectToResponseObj(directorsArray);
  response.send(dirArrResObj);
});

//API 7

app.get("/directors/:directorId/movies", async (request, response) => {
  const { directorId } = request.params;
  const getAllMoviesOfDirector = `
    SELECT
        movie_name
    FROM
        movie   
    WHERE 
        director_id = '${directorId}';      
    `;

  const moviesOfDirectorArray = await db.all(getAllMoviesOfDirector);
  response.send(
    moviesOfDirectorArray.map((eachMovieObj) => ({
      movieName: eachMovieObj.movie_name,
    }))
  );
});

//movie table

// app.get("/movies/", async (request, response) => {
//   const getMovieTableQuery = `
//     SELECT * FROM movie;
//     `;

//   const movieTableRes = await db.all(getMovieTableQuery);
//   response.send(movieTableRes);
// });

// //director table

// app.get("/directors/", async (request, response) => {
//   const getDirectorTableQuery = `
//     SELECT * FROM director;
//     `;

//   const directorTableRes = await db.all(getMovieTableQuery);
//   response.send(directorTableRes);
// });

module.exports = app;

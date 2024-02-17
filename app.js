const express = require('express')
const app = express()
app.use(express.json())

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')
const dbPath = path.join(__dirname, 'moviesData.db')

let db = null
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server is Running at http://localhost:3000/'),
    )
  } catch (err) {
    console.log(`DB Error ${err.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

function snake_caseToCamelCase(dbObject) {
  try {
    return {
      movieId: dbObject.movie_id,
      directorId: dbObject.director_id,
      movieName: dbObject.movie_name,
      leadActor: dbObject.lead_actor,
    }
  } catch (error) {
    return 'Resource Not found'
  }
}

// Get API for movies
app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `
        SELECT * FROM movie;
    `
  const moviesDetails = await db.all(getMoviesQuery)
  console.log(moviesDetails)
  response.send(
    moviesDetails.map(eachMovies => snake_caseToCamelCase(eachMovies)),
  )
})

// Post API
app.post('/movies/', async (request, response) => {
  const moviesDetails = request.body
  console.log(moviesDetails)
  const {directorId, movieName, leadActor} = moviesDetails
  const postMoviesQuery = `
      INSERT INTO movie(
        director_id,
        movie_name,
        lead_actor
        ) 
      VALUES 
      (
      ${directorId},
      '${movieName}',
      '${leadActor}'
      ); 
  `
  console.log(postMoviesQuery)
  const dbResposne = await db.run(postMoviesQuery)
  response.send('Movie Successfully Added')
})

// Get Movie Based on Movie_id
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  console.log(movieId)
  const movieDetailsQuery = `
    SELECT * FROM movie WHERE movie_id = ${movieId}; 
  `
  const movieArray = await db.get(movieDetailsQuery)
  console.log(movieArray)

  const desiredREsult = movieArray.map((eachMovie, index, arr) =>
    snake_caseToCamelCase(eachMovie),
  )
  for (let result of desiredREsult) {
    response.send(result)
  }
})

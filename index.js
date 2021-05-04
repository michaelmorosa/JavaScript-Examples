'use strict'

// A server that uses a database. 

// express provides basic server functions
const express = require("express");

// our database operations
const dbo = require('./databaseOps');

// object that provides interface for express
const app = express();

// use this instead of the older body-parser
app.use(express.json());

// make all the files in 'public' available on the Web
app.use(express.static('public'));

// when there is nothing following the slash in the url, return the main page of the app.
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/public/FitnessLog.html");
});

/* Original code of section below
// This is where the server recieves and responds to POST requests
app.post('*', function(request, response, next) {
  console.log("Server recieved a post request at", request.url);
  // console.log("body",request.body);
  response.send("I got your POST request");
});*/

/////////////edited by michael////////////
// This is where the server recieves and responds to POST requests
app.post('/store_future', function(request, response, next) {
  console.log("Server recieved a post request at", request.url);
  console.log("body",request.body);
  let message = {msg: "I got your POST request"}
  response.send(JSON.stringify(message));
  //send request to database from server
  dbo.store_future_activity(request.body.activity, request.body.date, -1).catch(
  function (error) {
    console.log("error:",error);}
);
});

app.post('/store_past', function(request, response, next) {
  console.log("Server recieved a post request at", request.url);
  console.log("body",request.body);
  let message = {msg: "I got your POST request"}
  response.send(JSON.stringify(message));
  //send request to database from server
  dbo.store_past_activity(request.body.activity, request.body.date, request.body.scalar).catch(
  function (error) {
    console.log("error:",error);}
);
});

//gets data for reminder
app.get('/reminder', function (request, response){
  dbo.extract_future_activity()
  .then(function (result){
      response.send(JSON.stringify(result));
  })
  .catch(
  function (error) {
    console.log("error:",error);}
  );
});

//deletes activity
app.post('/no', function(request, response, next) {
  console.log("Server recieved a post request at", request.url);
  console.log("body",request.body);
  let message = {msg: "I got your POST request"}
  response.send(JSON.stringify(message));
  //send request to database from server
  dbo.delete_activity(request.body.rowIdNum, request.body.activity, request.body.date, -1).catch(
  function (error) {
    console.log("error:",error);}
);
});


//gets data for reminder
app.post('/go', function (request, response){
  dbo.get_list_of_activities(request.body.activity, request.body.date)
  .then(function (result){
      response.send(JSON.stringify(result));
  })
  .catch(
  function (error) {
    console.log("error:",error);}
  );
});

/////////////edited by michael////////////

// listen for requests :)
const listener = app.listen(3000, () => {
  console.log("The static server is listening on port " + listener.address().port);
});


// call the async test function for the database
// this is an example showing how the database is used
// you will eventually delete this call.



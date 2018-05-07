var express = require('express');
var path = require('path');
var router = express.Router();

var rand = require("generate-key");

//connect to mysql server
var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user	   : 'haoychen',
  password : 'password',
  database : 'Travel_Agency'
	
});
connection.connect(function(err){
	if(err) throw err;

	console.log("mysql connected");
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/login', function(req, res){
  res.render('login');
});

router.get('/signup', function(req,res){
  res.render('signup');
});

router.post('/login', function(req, res){
  var user = req.body.username;
  var pass = req.body.password;

	console.log("LOGIN --> user: " + user + " pass: " + pass);
	
	if(user === 'test' && pass === 'pass')
		res.render('home');
	else if(user === 'admin' && pass === 'pass')
		res.render('management');
	else
		res.send({status: "error", message: "could not find user"});
  
});

router.post('/signup', function(req, res){
  var name = req.body.name;
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;
  
  console.log("SIGNUP --> user: " + username + " name: " + name + " email: " + email + " pass: " + password);

  var sql = "INSERT INTO Users (username, name, email, password) VALUES (?, ?, ?, ?)";
  var params = [username, name, email, password];
  connection.query(sql, params, function (err, result) {
		if (err) {
			// throw err;
			res.render('error');
		}else{
			console.log("users inserted: " + result.affectRows);
			res.render('login');
		}
  });
});

router.get('/home', function(req, res){
	res.render('home');
});

router.get('/search', function(req, res){
	res.render('search');
});

router.get('/hotel', function(req, res){
	res.render('hotel');
});

router.get('/payment', function(req, res){
	res.render('payment');
});

router.post('/search', function(req, res){
	//Query (required params)
	var table = req.body.transportation;	//Transportation type
	var start = req.body.start;
	var dest = req.body.destination;

	var query = "SELECT StartLocation, Destination FROM ? WHERE StartLocation = ? AND Destination = ?";
	var params = [table, start, dest];
	connection.query(query, params, function(err, result){
		if(err){
			res.send({status: "error"}, "Could not find flights");
		}else{
			res.render('results', {results: result});
		}


	});
});

router.post('/bookflight', function(req,res){
	// var type = req.body.type; //what the user is booking (hotel, flight, cruise, etc.)
	var flightID = req.body.flightID;
	var name = req.body.name;
	var age = req.body.age;
	var confirmation = rand.generatekey();

	/*Trip information*/
	var tripID = rand.generatekey();
	var cost = req.body.dest;
	var size = req.body.size;
	//Dates
	var start = req.body.start;
	var end = req.body.end;
	//Locations
	var source = req.body.source;
	var dest = req.body.dest;


	if(size === 1){
		insertPassenger(name, age, tripID);
		insertTrip(tripID, start, end, source, dest, cost, size);
		res.render('book', {size: size, tripID: tripID, name: name, age: age});
	}else{

	}
});

router.post('/book2', function(req,res){
	var size = req.body.size; 		//party size
	var tripID = req.body.tripID;	//group's trip ID

	var passengers = [];
	for(var i=0; i<size; i++){
		passengers.push()
	}
});

function insertPassenger(name, age, tripID){
	var passengerID = rand.generatekey();

}

function insertTrip(tripID, start, end, source, dest, cost, size){
	var sql = "INSERT INTO Trip (TripID, StartDate, EndDate, StartLocation, Destination, TransportationID, AccommodationID, Cost, Size) VALUES (?, ?, ?, ?)";
  var params = [username, name, email, password];
  connection.query(sql, params, function (err, result) {
		if (err) {
			// throw err;
			res.send({status: "error"});
		}else{
			console.log("users inserted: " + result.affectRows);
			res.send({status: "OK"});
		}
  });
}
module.exports = router;


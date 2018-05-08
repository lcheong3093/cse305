var express = require('express');
var path = require('path');
var router = express.Router();

var rand = require('random-number-generator');

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

router.get('/viewtrips', function(req,res){
  res.render('viewtrips');
});

router.get('/confirmation', function(req,res){
	res.render('confirmation');
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
		// if (err) {
		// 	// throw err;
		// 	res.render('error');
		// }else{
		// 	console.log("users inserted: " + result.affectRows);
		// 	res.render('login');
		// }
		res.render('login');
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
	console.log("/search");
	
	var table = req.body.traveltype;	//Transportation type
	table = table.replace(/'/g,'');
	var start = parseInt(req.body.from);
	var dest = parseInt(req.body.to);

	var query = "'SELECT StartLocation, Destination FROM" + table + "WHERE StartLocation = " + start + " AND Destination = " + dest + "'";
	var params = [start, dest];
	connection.query(query, params, function(err, result){
		if(err){
			throw err;
			res.send({status: "error", message: "could not perform search"});
		}else{
			console.log("RESULTS: ", result);
			res.render('results');
		}


	});
});

router.post('/bookflight', function(req,res){
	/*Flight information*/
	var flightID = req.body.flightID;
	var cost = req.body.cost;
	//Locations
	var source = req.body.source;
	var dest = req.body.dest;

	/*Trip information*/
	var tripID = rand.generatekey();
	var cost = req.body.dest;
	var size = req.body.size;
	//Dates
	var start = req.body.start;
	var end = req.body.end;
	
	var trip = {id:tripID, start:start, end:end, source:source, dest:dest, transportationID:flightID, accommodationID:null, cost:cost}

	res.render('hotel', trip);
});

router.post('/bookhotel', function(req, res){
	var trip = req.body.trip;		//trip object so far
	console.log("TRIP INSERT (/bookhotel): ", trip);

	/*Hotel Information*/
	var id = req.body.hotelID;
	var cost = req.body.cost;

	trip.accommodationID = id;
	trip.cost = trip.cost + cost;

	var trip = trip

	res.render('passengers', trip);

});

//Add rest of passengers in party & pay for trip
router.post('/confirmation', function(req, res){
	var trip = req.body.trip;

	/*Main Passenger Information*/
	var name = req.body.name;
	var numOfPassengers = req.body.partySize;

	/*Payment Information*/
	var paymentID = req.body.paymentID;
	var card = req.body.cardNumber;

	trip.cost = trip.cost*numOfPassengers;
	console.log("FINAL TRIP INSERT: ", trip);

	insertPayment(paymentID, card, trip.cost);
	insertTrip(trip);
	insertPassenger(name, numOfPassengers, trip.id);
});

router.post('/addreview', function(req, res){
	var comment = req.body.comment; 
	var rating = req.body.rating;
	var passengerID = req.body.passengerID;
	var tripID = req.body.tripID;

	insertReview(passengerID, tripID, rating, comment);
});

function insertPassenger(name, num, tripID){
	var sql = "INSERT INTO Passenger (PassengerID, Name, TripID) VALUES (?, ?, ?)";
	var params;
  for(var i = 0; i <= num; i++){
		var id = rand.generatekey();
		if(i === 0){
			params = [id, name, tripID];
		}else{
			params = [id, null, tripID];
		}

		connection.query(sql, params, function(err, result){
			if(err){
				res.send({status: "error", message: "could not insert passengers"});
			}else{
				console.log("inserted passengers");
			}
		});
	}
}

function insertTrip(trip){
	console.log("INSERTING TRIP: ", trip);
	var sql = "INSERT INTO Trip (TripID, StartDate, EndDate, StartLocation, EndLocation, TransportationID, AccommodationID, Cost) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  var params = [trip.id, trip.start, trip.end, trip.source, trip.dest, trip.transportationID, trip.accommodationID, trip.cost];
  connection.query(sql, params, function (err, result) {
		if (err) {
			// throw err;
			res.send({status: "error", message: "could not insert trip"});
		}else{
			console.log("trip inserted: " + result.affectRows);
		}
  });
}

function insertReview(passengerID, tripID, rating, comment){
	console.log("inserting review for TRIP " + tripID + " by PASSENGER " + passengerID);
	var sql = "INSERT INTO Review (PassengerID, TripID, Rating, Comment) VALUES (?, ?, ?, ?)";
  var params = [passengerID, tripID, rating, comment];
  connection.query(sql, params, function (err, result) {
		if (err) {
			// throw err;
			res.send({status: "error", message: "could not insert review"});
		}else{
			console.log("review inserted: " + result.affectRows);
		}
  });
}

function insertPayment(paymentID, cardNumber, amount){
	console.log("inserting payment");
	var sql = "INSERT INTO Payment (PaymentID, CardNumber, Amount) VALUES (?, ?, ?)";
  var params = [paymentID, cardNumber, amount];
  connection.query(sql, params, function (err, result) {
		if (err) {
			// throw err;
			res.send({status: "error", message: "could not insert payment"});
		}else{
			console.log("payment inserted: " + result.affectRows);
		}
  });
}
module.exports = router;


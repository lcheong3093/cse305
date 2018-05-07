var express = require('express');
var path = require('path');
var router = express.Router();

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

//NEED TO TEST
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


		}


	});
});

// router.post('/book', function(req,res){
// 	var type = req.body.type; //What the user is booking (hotel, flight, cruise, etc.)

// });

// router.post('/book2', function(req,res){
// 	var size = req.body.size; //party size

// 	var passengers = [];
// 	for(var i=0; i<size; i++){
// 		passengers.push()
// 	}
// });



module.exports = router;


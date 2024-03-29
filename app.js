// Зависимости
var express  = require( 'express' );
var http     = require( 'http' );
var path     = require( 'path' );
var mongoose = require( 'mongoose' );
var socketIO = require( 'socket.io' );
var app      = express();
var server   = http.Server(app);
var io       = socketIO(server);

var mysql    = require( 'mysql' );

//var client = mysql.createClient();
//client.host='test.kpnn.ru';
//client.port='3306';
//client.user='energy2d';
//client.password='1CS6-Steam';
//client.database='Energy2D';

var connection = mysql.createConnection({
  host     : '192.168.11.10',           //test.kpnn.ru   192.168.11.10
  user     : 'energy3d',
  password : '12345678',                        //1CS6-Steam     12345678
  database : 'Energy2D'
});

//connection.connect();

app.set('port', 5000);

app.use('/static', express.static(__dirname + '/static'));

// Маршруты
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, '/views/index.html'));
});
app.get('/index.html', function(request, response) {
    response.sendFile(path.join(__dirname, '/views/index.html'));
});
app.get('/main.html', function(request, response) {
    response.sendFile(path.join(__dirname, '/views/main.html'));
});

app.get('/main', function(request, response) {
    response.sendFile(path.join(__dirname, '/views/main.html'));
});

// Запуск сервера
server.listen(5000, function() {
    console.log('Запускаю сервер на порте 5000');
});

// Обработчик веб-сокетов
io.on('connection', function(socket) {
});




var players = {};
var passes = {};
var kount_of_players = 0;

var mapArray = [
  [0,0,0,0,3,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  [0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  [0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,4,4,4,4,4,4,4,4,4,4,4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,4,4,4,4,4,4,4,4,4,4,4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,1,4,4,4,1,1,4,4,4,4,4,4,4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,0,0,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,4,4,4,4,4,4,1,1,4,4,4,1,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,1,4,4,4,1,1,4,4,4,4,4,4,4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,0,0,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,4,4,4,4,4,4,1,1,4,4,4,1,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,4,4,4,4,4,4,1,4,4,4,2,2,4,4,4,4,4,4,4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,4,4,4,4,4,4,2,2,4,4,4,1,4,4,4,4,4,4,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,4,4,4,4,4,4,2,4,4,4,4,4,4,4,4,4,4,4,4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,4,4,4,4,4,4,4,4,4,4,4,2,4,4,4,4,4,4,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,4,4,4,2,4,4,4,4,4,4,4,4,4,7,7,7,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,6,6,6,6,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,8,8,8,4,4,4,4,4,4,4,4,4,2,4,4,4,4,4,4,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,0,0,4,4,4,4,4,4,4,4,4,4,4,4,7,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,6,1,1,6,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,8,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,0,0,4,4,4,4,4,4,4,4,4,4,4,4,7,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,6,1,1,6,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,8,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,4,4,4,4,4,4,1,4,4,4,4,4,4,4,4,4,7,7,7,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,6,6,6,6,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,8,8,8,4,4,4,4,4,4,4,4,4,1,4,4,4,4,4,4,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,4,4,4,4,4,4,1,4,4,4,1,1,4,4,4,4,4,4,4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,4,4,4,4,4,4,1,1,4,4,4,1,4,4,4,4,4,4,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,4,4,4,4,4,4,1,4,4,4,1,1,4,4,4,4,4,4,4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,4,4,4,4,4,4,1,1,4,4,4,1,4,4,4,4,4,4,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,4,4,2,2,4,4,4,4,4,4,4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,4,4,4,4,4,4,2,2,4,4,4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,4,4,4,4,4,4,4,4,4,4,4,4,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,4,4,4,4,4,4,4,4,4,4,4,4,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,4,4,4,4,4,4,4,4,4,4,4,4,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,4,4,4,4,4,4,4,4,4,4,4,4,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  [0,0,0,0,3,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  [0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  [0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ];
  connection.connect(function(){
    console.log('Connecting to DB to Check');
  });

function isUserExist(username, callback1) {
//  connection.connect(function(){
//    console.log('Connecting to DB to Check');
//  });
  connection.query('SELECT username FROM Users WHERE username='+ username, function(err, rows, fields) {
    var isEx = false;
    console.log('Check nick existing');
    for(var i in rows) {
      isEx = true;
    }
    console.log(rows);
    console.log('Nick is '+isEx);
    callback1(isEx);
  });
//  connection.end(function(){
//    console.log('End Checking');
//  });
}

function checkUserPass(username, password, callback2){
  return connection.query('SELECT username, password FROM Users WHERE username='+ username, function(err, rows, fields) {
    var isT = false;
    console.log('Check pass existing');
    for(var i in rows) {
      if(username == rows[i].username){
        if(password == rows[i].password){
          isT = true;

    //      break;
        }
      }
    }
    callback2(isT);

  });

}

var createNewUser = function (username, password){
//  connection.connect(function(err) {
//    console.log("Connected to DB to SignUp");
//  });
  connection.query('INSERT INTO Users (username, password) VALUES ('+username+', '+password+')', function(err, result) {
    console.log(err);
    console.log('Add user to DB');
    console.log(result);
  });
//  connection.end(function(){
//    console.log('SignUped!');
//  });
}

io.on('connection', function(socket) {
  socket.on('new_player', function(nick_name, password)  {
    isUserExist(nick_name, function(res){
      if(res){
        checkUserPass(nick_name, password, function(res2){
          if(res2){
            kount_of_players = kount_of_players+1;
            players[socket.id] = {
              x: 300,
              y: 300,
              id: nick_name,
              error: 0
            };
            console.log('User connected');
          }else{
            console.log('Pass is valid');
          }
        });
      }else{
        console.log('User is valid');
      }
    });
    if(nick_name != ''){



    }

  });
  socket.on('sign_in', function(nick_name, password)  {
    isUserExist(nick_name, function(res){
      if(res){
        checkUserPass(nick_name, password, function(res2){
          if(res2){
            socket.emit('errorIn', 0);
            console.log('User connected');
          }else{
            socket.emit('errorIn', 1);
            console.log('Pass is valid');
          }
        });
      }else{
        socket.emit('errorIn', 1);
        console.log('User is valid');
      }
    });
  });


  socket.on('sign_up', function(nick_name, password1, password2)  {
    if(password1 == password2){
      if(!isUserExist(nick_name)){
        createNewUser(nick_name,password1);
        socket.emit('errorUp', 0);
        console.log('User created');
      }else{
        socket.emit('errorUp', 1);
      }
    }else{
      socket.emit('errorUp', 2);
    }

  });

  socket.on('movement', function(data) {
    var player = players[socket.id] || {};
    if (data.left && (player.x>95) && ( mapArray[(player.y/25) >> 0][((player.x+225)/25) >> 0]==4 || mapArray[(player.y/25) >> 0][((player.x+225)/25) >> 0]==0 || mapArray[(player.y/25) >> 0][((player.x+225)/25) >> 0]==5)) {
      player.x -= 5;
    }
    if (data.up && (player.y>0) && ( mapArray[((player.y-5)/25) >> 0][((player.x+230)/25) >> 0]==4 || mapArray[((player.y-5)/25) >> 0][((player.x+230)/25) >> 0]==0 || mapArray[((player.y-5)/25) >> 0][((player.x+230)/25) >> 0]==5)) {
      player.y -= 5;
    }
    if (data.right && (player.x<2275) && ( mapArray[((player.y)/25) >> 0][((player.x+250)/25) >> 0]==4 || mapArray[((player.y)/25) >> 0][((player.x+250)/25) >> 0]==0 || mapArray[((player.y)/25) >> 0][((player.x+250)/25) >> 0]==5)) {
      player.x += 5;
    }
    if (data.down && ( mapArray[((player.y+15)/25) >> 0][((player.x+230)/25) >> 0]==4 || mapArray[((player.y+15)/25) >> 0][((player.x+230)/25) >> 0]==0 || mapArray[((player.y+15)/25) >> 0][((player.x+230)/25) >> 0]==5)) {
      player.y += 5;
    }
  });
  socket.on('disconnect', function() {
    kount_of_players = kount_of_players - 1;
    delete players[socket.id];
    //players.splice(socket.id, 1);
  });
});
setInterval(function() {
  io.sockets.emit('state', players);
}, 1000 / 60);

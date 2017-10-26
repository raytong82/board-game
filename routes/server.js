var express = require('express');
var router = express.Router();
//var app = express();
var app = require('../app');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var _ = require('lodash');



var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://ray:ray@ds023613.mlab.com:23613/ray-board-game', {useMongoClient:true})
  .then(() =>  console.log('connection successful'))
  .catch((err) => console.error(err));
var GameSchema = new mongoose.Schema({
  game: String,
  epoch: Number,
  player: String,
  action: String,
  useTradeCard: {
    from: {
      yellow: Number,
      red: Number,
      green: Number,
      brown: Number
    },
    to: {
      yellow: Number,
      red: Number,
      green: Number,
      brown: Number
    },
    free: {
      yellow: Number,
      red: Number,
      green: Number,
      brown: Number
    },
    up: Number
  },
  pickTradeCard: {
    yellow: Number,
    red: Number,
    green: Number,
    brown: Number
  },
  pickScoreCard: {
    yellow: Number,
    red: Number,
    green: Number,
    brown: Number
  },
  preTotalScore: Number,
  totalScore: Number
});
var Game = mongoose.model('Game', GameSchema);


// set the port of our application
// process.env.PORT_EXPRESS lets the port be set by Heroku
//var port = process.env.PORT || 4000;

//if (!process.env.SERVER) {
//  console.log('not a server, assign different port:' + 4000);
//  port = 4000;
//}

//server.listen(port, function() {
//  console.log('socket io is running on port ' + port)
//});

var SCORE_CARDS = [
{id:1, yellow:2,red:2,green:0,brown:0,score:6},
{id:2, yellow:3,red:2,green:0,brown:0,score:7},
{id:3, yellow:0,red:4,green:0,brown:0,score:8},
{id:4, yellow:2,red:0,green:2,brown:0,score:8},
{id:5, yellow:2,red:3,green:0,brown:0,score:8},
{id:6, yellow:2,red:1,green:0,brown:1,score:9},
{id:7, yellow:3,red:0,green:2,brown:0,score:9},
{id:8, yellow:0,red:5,green:0,brown:0,score:10},
{id:9, yellow:2,red:0,green:0,brown:2,score:10},
{id:10, yellow:0,red:2,green:2,brown:0,score:10},
{id:11, yellow:2,red:0,green:3,brown:0,score:11},
{id:12, yellow:3,red:0,green:0,brown:2,score:11},
{id:13, yellow:0,red:2,green:0,brown:2,score:12},
{id:14, yellow:1,red:1,green:1,brown:1,score:12},
{id:15, yellow:0,red:3,green:2,brown:0,score:12},
{id:16, yellow:0,red:0,green:4,brown:0,score:12},
{id:17, yellow:0,red:2,green:1,brown:1,score:12},
{id:18, yellow:1,red:0,green:2,brown:1,score:12},
{id:19, yellow:0,red:2,green:3,brown:0,score:13},
{id:20, yellow:2,red:2,green:2,brown:0,score:13},
{id:21, yellow:0,red:0,green:2,brown:2,score:14},
{id:22, yellow:2,red:0,green:0,brown:3,score:14},
{id:23, yellow:0,red:3,green:0,brown:2,score:14},
{id:24, yellow:3,red:1,green:1,brown:1,score:14},
{id:25, yellow:0,red:0,green:5,brown:0,score:15},
{id:26, yellow:2,red:2,green:0,brown:2,score:15},
{id:27, yellow:0,red:2,green:0,brown:3,score:16},
{id:28, yellow:0,red:0,green:0,brown:4,score:16},
{id:29, yellow:1,red:3,green:1,brown:1,score:16},
{id:30, yellow:2,red:0,green:2,brown:2,score:17},
{id:31, yellow:0,red:0,green:3,brown:2,score:17},
{id:32, yellow:0,red:0,green:2,brown:3,score:18},
{id:33, yellow:1,red:1,green:3,brown:1,score:18},
{id:34, yellow:0,red:2,green:2,brown:2,score:19},
{id:35, yellow:1,red:1,green:1,brown:3,score:20},
{id:36, yellow:0,red:0,green:0,brown:5,score:20},
];

var TRADE_CARDS = [
{id:1, from:{yellow:0,red:3,green:0,brown:0},to:{yellow:1,red:0,green:1,brown:1},free:{yellow:0,red:0,green:0,brown:0},up:0},
{id:2, from:{yellow:0,red:0,green:0,brown:0},to:{yellow:0,red:0,green:0,brown:0},free:{yellow:0,red:0,green:0,brown:1},up:0},
{id:3, from:{yellow:0,red:0,green:0,brown:0},to:{yellow:0,red:0,green:0,brown:0},free:{yellow:0,red:2,green:0,brown:0},up:0},
{id:4, from:{yellow:0,red:0,green:3,brown:0},to:{yellow:0,red:0,green:0,brown:3},free:{yellow:0,red:0,green:0,brown:0},up:0},
{id:5, from:{yellow:5,red:0,green:0,brown:0},to:{yellow:0,red:0,green:3,brown:0},free:{yellow:0,red:0,green:0,brown:0},up:0},
{id:6, from:{yellow:2,red:0,green:1,brown:0},to:{yellow:0,red:0,green:0,brown:2},free:{yellow:0,red:0,green:0,brown:0},up:0},
{id:7, from:{yellow:0,red:2,green:0,brown:0},to:{yellow:0,red:0,green:2,brown:0},free:{yellow:0,red:0,green:0,brown:0},up:0},
{id:8, from:{yellow:0,red:0,green:2,brown:0},to:{yellow:0,red:2,green:0,brown:1},free:{yellow:0,red:0,green:0,brown:0},up:0},
{id:9, from:{yellow:0,red:0,green:0,brown:1},to:{yellow:0,red:0,green:2,brown:0},free:{yellow:0,red:0,green:0,brown:0},up:0},
{id:10, from:{yellow:0,red:0,green:0,brown:0},to:{yellow:0,red:0,green:0,brown:0},free:{yellow:1,red:1,green:0,brown:0},up:0},
{id:11, from:{yellow:3,red:0,green:0,brown:0},to:{yellow:0,red:0,green:0,brown:1},free:{yellow:0,red:0,green:0,brown:0},up:0},
{id:12, from:{yellow:0,red:2,green:0,brown:0},to:{yellow:3,red:0,green:1,brown:0},free:{yellow:0,red:0,green:0,brown:0},up:0},
{id:13, from:{yellow:0,red:0,green:0,brown:1},to:{yellow:0,red:3,green:0,brown:0},free:{yellow:0,red:0,green:0,brown:0},up:0},
{id:14, from:{yellow:4,red:0,green:0,brown:0},to:{yellow:0,red:0,green:1,brown:1},free:{yellow:0,red:0,green:0,brown:0},up:0},
{id:15, from:{yellow:0,red:1,green:0,brown:0},to:{yellow:3,red:0,green:0,brown:0},free:{yellow:0,red:0,green:0,brown:0},up:0},
{id:16, from:{yellow:0,red:0,green:0,brown:0},to:{yellow:0,red:0,green:0,brown:0},free:{yellow:0,red:0,green:1,brown:0},up:0},
{id:17, from:{yellow:3,red:0,green:0,brown:0},to:{yellow:0,red:1,green:1,brown:0},free:{yellow:0,red:0,green:0,brown:0},up:0},
{id:18, from:{yellow:2,red:0,green:0,brown:0},to:{yellow:0,red:0,green:1,brown:0},free:{yellow:0,red:0,green:0,brown:0},up:0},
{id:19, from:{yellow:0,red:0,green:0,brown:0},to:{yellow:0,red:0,green:0,brown:0},free:{yellow:2,red:1,green:0,brown:0},up:0},
{id:20, from:{yellow:0,red:0,green:1,brown:0},to:{yellow:1,red:2,green:0,brown:0},free:{yellow:0,red:0,green:0,brown:0},up:0},
{id:21, from:{yellow:0,red:3,green:0,brown:0},to:{yellow:2,red:0,green:2,brown:0},free:{yellow:0,red:0,green:0,brown:0},up:0},
{id:22, from:{yellow:0,red:0,green:2,brown:0},to:{yellow:2,red:1,green:0,brown:1},free:{yellow:0,red:0,green:0,brown:0},up:0},
{id:23, from:{yellow:0,red:0,green:1,brown:0},to:{yellow:0,red:2,green:0,brown:0},free:{yellow:0,red:0,green:0,brown:0},up:0},
{id:24, from:{yellow:2,red:0,green:0,brown:0},to:{yellow:0,red:2,green:0,brown:0},free:{yellow:0,red:0,green:0,brown:0},up:0},
{id:25, from:{yellow:0,red:0,green:0,brown:2},to:{yellow:1,red:1,green:3,brown:0},free:{yellow:0,red:0,green:0,brown:0},up:0},
{id:26, from:{yellow:0,red:0,green:0,brown:2},to:{yellow:0,red:3,green:2,brown:0},free:{yellow:0,red:0,green:0,brown:0},up:0},
{id:27, from:{yellow:0,red:0,green:0,brown:0},to:{yellow:0,red:0,green:0,brown:0},free:{yellow:3,red:0,green:0,brown:0},up:0},
{id:28, from:{yellow:0,red:3,green:0,brown:0},to:{yellow:0,red:0,green:0,brown:2},free:{yellow:0,red:0,green:0,brown:0},up:0},
{id:29, from:{yellow:1,red:1,green:0,brown:0},to:{yellow:0,red:0,green:0,brown:1},free:{yellow:0,red:0,green:0,brown:0},up:0},
{id:30, from:{yellow:0,red:0,green:0,brown:1},to:{yellow:3,red:0,green:1,brown:0},free:{yellow:0,red:0,green:0,brown:0},up:0},
{id:31, from:{yellow:0,red:0,green:0,brown:1},to:{yellow:2,red:2,green:0,brown:0},free:{yellow:0,red:0,green:0,brown:0},up:0},
{id:32, from:{yellow:0,red:0,green:2,brown:0},to:{yellow:2,red:3,green:0,brown:0},free:{yellow:0,red:0,green:0,brown:0},up:0},
{id:33, from:{yellow:0,red:0,green:0,brown:1},to:{yellow:1,red:1,green:1,brown:0},free:{yellow:0,red:0,green:0,brown:0},up:0},
{id:34, from:{yellow:5,red:0,green:0,brown:0},to:{yellow:0,red:0,green:0,brown:2},free:{yellow:0,red:0,green:0,brown:0},up:0},
{id:35, from:{yellow:0,red:0,green:2,brown:0},to:{yellow:0,red:0,green:0,brown:2},free:{yellow:0,red:0,green:0,brown:0},up:0},
{id:36, from:{yellow:4,red:0,green:0,brown:0},to:{yellow:0,red:0,green:2,brown:0},free:{yellow:0,red:0,green:0,brown:0},up:0},
{id:37, from:{yellow:0,red:0,green:0,brown:0},to:{yellow:0,red:0,green:0,brown:0},free:{yellow:4,red:0,green:0,brown:0},up:0},
{id:38, from:{yellow:3,red:0,green:0,brown:0},to:{yellow:0,red:3,green:0,brown:0},free:{yellow:0,red:0,green:0,brown:0},up:0},
{id:39, from:{yellow:0,red:0,green:1,brown:0},to:{yellow:4,red:1,green:0,brown:0},free:{yellow:0,red:0,green:0,brown:0},up:0},
{id:40, from:{yellow:0,red:0,green:0,brown:0},to:{yellow:0,red:0,green:0,brown:0},free:{yellow:0,red:0,green:0,brown:0},up:3},
{id:41, from:{yellow:0,red:3,green:0,brown:0},to:{yellow:0,red:0,green:3,brown:0},free:{yellow:0,red:0,green:0,brown:0},up:0},
{id:42, from:{yellow:0,red:2,green:0,brown:0},to:{yellow:2,red:0,green:0,brown:1},free:{yellow:0,red:0,green:0,brown:0},up:0},
{id:43, from:{yellow:0,red:0,green:0,brown:0},to:{yellow:0,red:0,green:0,brown:0},free:{yellow:1,red:0,green:1,brown:0},up:0},

];

var START_TRADE_CARDS = [
{id: -1, free:{yellow:2, red:0, green:0, brown:0}},
{id: -2, up:2},
];

//var scoreCards = _.shuffle(SCORE_CARDS);
//var tradeCards = _.shuffle(TRADE_CARDS);

//console.log("scoreCards:" + JSON.stringify(scoreCards));
//console.log("");
//console.log("tradeCards:" + JSON.stringify(tradeCards));
//console.log("");

//var goldCoins = 4;
//var silverCoins = 4;

//var players = [];
//var playerTurn = "";

var game = {
  players: [],
  histories: [],
};

function initGame() {
  var scoreCards = _.shuffle(SCORE_CARDS);
  var tradeCards = _.shuffle(TRADE_CARDS);
  var goldCoins = 4;
  var silverCoins = 4;
  var players = _.shuffle(game.players);
  var playerTurn = players[0].user;
  var hideScoreCards = false;
  var hideTradeCards = false;
  for (var i=0; i<players.length; i++) {
    var player = players[i];
    if (player.user == playerTurn) {
      player.spice = {yellow: 3, red: 0, green: 0, brown: 0};
    } else {
      player.spice = {yellow: 4, red: 0, green: 0, brown: 0};
    }
    player.goldCoins = 0;
    player.silverCoins = 0;
    player.scoreCards = [];
    player.tradeCards = _.map(_.cloneDeep(START_TRADE_CARDS), function(tradeCard) {
      tradeCard.id += player.user;
      return tradeCard;
    });
    player.usedTradeCards = [];
    hideScoreCards = hideScoreCards || player.hideScoreCards;
    hideTradeCards = hideTradeCards || player.hideTradeCards;
  }

  game = {
    id: Math.round(new Date().getTime() / 1000),
    scoreCards: _.take(scoreCards, 5),
    tradeCards: _.take(tradeCards, 6),
    publicScoreCards: _.drop(scoreCards, 5),
    publicTradeCards: _.drop(tradeCards, 6),
    goldCoins: 4,
    silverCoins: 4,
    players: players,
    playerTurn: playerTurn,
    histories: game.histories,
    hideScoreCards: hideScoreCards,
    hideTradeCards: hideTradeCards,
    hasEnd: false,
  };
}

/*var game = {
  players: [
    {
      goldCoins: 0,
      silverCoins: 0,
      scoreCards: [],
      tradeCards: [],
      usedTradeCards: [],
      spice: {
        yellow: 0,
        red: 0,
        green: 0,
        brown: 0,
      }
    },
    {
      goldCoins: 0,
      silverCoins: 0,
      scoreCards: [],
      tradeCards: [],
      usedTradeCards: [],
      spice: {
        yellow: 0,
        red: 0,
        green: 0,
        brown: 0,
      }
    },
  ]
};*/

function tradeCardType(tradeCard) {
  if (tradeCard.up > 0) {
    return 'up';
  } else if (tradeCard.free.yellow > 0 || tradeCard.free.red > 0 || tradeCard.free.green > 0 || tradeCard.free.brown > 0) {
    return 'free';
  } else {
    return 'from-to';
  }
}

function nextPlayerTurn(players, currentPlayer) {
  var playerIndex = _.findIndex(players, function(player) {
    return player.user == currentPlayer;
  });
  playerIndex += 1;
  if (playerIndex >= players.length) {
    playerIndex = 0;
  }
  return players[playerIndex].user;
}

function calTotalScore(player) {
  var total = 0;
  total += player.goldCoins * 3;
  total += player.silverCoins;
  for (var i=0; i<player.scoreCards.length; i++) {
    total += player.scoreCards[i].score;
  }
  total += player.spice.red;
  total += player.spice.green;
  total += player.spice.brown;
  return total;
}

// socket io
io.on('connection', function (socket) {
  console.log('User connected');
  socket.on('disconnect', function() {
    console.log('User disconnected');
  });

  socket.on('join-game', function (data) {
    console.log('join-game:' + JSON.stringify(data));
    if (!_.includes(_.map(game.players, 'user'), data.user)) {
      game.players.push(data);
      game.histories.push({player: data.user, action: 'join game'});
      io.emit('join-game', game);
    }
    if (game.players.length == 2) {
      initGame();
      io.emit('update-game', game);
    }
  });

  socket.on('rejoin-game', function (data) {
    console.log('rejoin-game:' + JSON.stringify(data));
    game.histories.push({player: data.user, action: 'rejoin game'});
    io.emit('join-game', game);
    if (game.players.length == 2) {
      io.emit('update-game', game);
    }
  });

  socket.on('view-game', function (data) {
    console.log('view-game:' + JSON.stringify(data));
    if (game.players.length == 2 && !_.includes(_.map(game.players, 'user'), data.user)) {
      console.log('game is playing, view mode');
      game.histories.push({player: data.user, action: 'view game'});
      io.emit('view-game', game);
    }
  });

  socket.on('reset-game', function (data) {
    console.log('reset-game:' + JSON.stringify(data));
//    players = [];
    game = {players: [], histories: []};
    io.emit('reset-game', game);
  });

  socket.on('clear-trade-cards', function (data) {
    console.log('clear-trade-cards:' + JSON.stringify(data));
    var player = _.find(game.players, function (p) {
      return p.user == data.user;
    });

    player.tradeCards = player.tradeCards.concat(player.usedTradeCards);
    player.usedTradeCards = [];

    var turn = nextPlayerTurn(game.players, data.user);
    game.playerTurn = turn;

    game.histories.push({player: data.user, action: 'clear trade card'});
    io.emit('update-game', game);

    // save to mongo
    Game.create({
      game: game.id,
      epoch: Math.round(new Date().getTime() / 1000),
      player: player.user,
      action: 'clear-trade-cards',
      totalScore: calTotalScore(player)
    }, function (err, res) {
      if (err) {
        console.log('ERR: ' + err);
      } else {
        console.log('OK: ' + res);
      }
    });
  });

  socket.on('use-trade-card', function (data) {
    console.log('use-trade-card:' + JSON.stringify(data));
    var player = _.find(game.players, function (p) {
      return p.user == data.user;
    });

    var preTotalScore = calTotalScore(player);
    var type = tradeCardType(data.tradeCard);
    if (type == 'free') {
      player.spice = data.spice;
    } else if (type == 'up') {
      player.spice = data.spice;
    } else {
      player.spice = data.spice;
    }

    player.usedTradeCards.push(data.tradeCard);
    player.tradeCards = _.remove(player.tradeCards, function(tradeCard) {
      return tradeCard.id != data.tradeCard.id;
    });

    var turn = nextPlayerTurn(game.players, data.user);
    game.playerTurn = turn;

    game.histories.push({player: data.user, action: 'use trade card'});
    io.emit('update-game', game);

    // save to mongo
    Game.create({
      game: game.id,
      epoch: Math.round(new Date().getTime() / 1000),
      player: player.user,
      action: 'use-trade-card',
      preTotalScore: preTotalScore,
      totalScore: calTotalScore(player),
      useTradeCard: data.tradeCard
    }, function (err, res) {
      if (err) {
        console.log('ERR: ' + err);
      } else {
        console.log('OK: ' + res);
      }
    });
  });

  socket.on('pick-trade-card', function (data) {
    console.log('pick-trade-cards:' + JSON.stringify(data));
    var player = _.find(game.players, function (p) {
      return p.user == data.user;
    });

    player.tradeCards.push(data.tradeCard);
    game.tradeCards = _.remove(game.tradeCards, function(tradeCard) {
      return tradeCard.id != data.tradeCard.id;
    });
    if (game.publicTradeCards.length > 0) {
      game.tradeCards.push(game.publicTradeCards[0]);
      game.publicTradeCards = _.drop(game.publicTradeCards, 1);
    }

    if (data.spice) {
      player.spice = data.spice;
    }
    if (data.handicapSpices) {
      for (var i=0; i<data.handicapSpices.length; i++) {
        var tradeCard = game.tradeCards[i];
        if (tradeCard.bonusSpices == null) {
          tradeCard.bonusSpices = {};
        }
        if (data.handicapSpices[i] == 'yellow') {
          if (tradeCard.bonusSpices.yellow == null) {
            tradeCard.bonusSpices.yellow = 1;
          } else {
            tradeCard.bonusSpices.yellow += 1;
          }
        } else if (data.handicapSpices[i] == 'red') {
          if (tradeCard.bonusSpices.red == null) {
            tradeCard.bonusSpices.red = 1;
          } else {
            tradeCard.bonusSpices.red += 1;
          }
        } else if (data.handicapSpices[i] == 'green') {
          if (tradeCard.bonusSpices.green == null) {
            tradeCard.bonusSpices.green = 1;
          } else {
            tradeCard.bonusSpices.green += 1;
          }
        } else if (data.handicapSpices[i] == 'brown') {
          if (tradeCard.bonusSpices.brown == null) {
            tradeCard.bonusSpices.brown = 1;
          } else {
            tradeCard.bonusSpices.brown += 1;
          }
        }
      }
    }

    var turn = nextPlayerTurn(game.players, data.user);
    game.playerTurn = turn;

    game.histories.push({player: data.user, action: 'pick trade card'});
    io.emit('update-game', game);

    // save to mongo
    Game.create({
      game: game.id,
      epoch: Math.round(new Date().getTime() / 1000),
      player: player.user,
      action: 'pick-trade-card',
      totalScore: calTotalScore(player),
      pickTradeCard: data.tradeCard
    }, function (err, res) {
      if (err) {
        console.log('ERR: ' + err);
      } else {
        console.log('OK: ' + res);
      }
    });
  });

  socket.on('pick-score-card', function (data) {
    console.log('pick-score-cards:' + JSON.stringify(data));
    var player = _.find(game.players, function (p) {
      return p.user == data.user;
    });

    player.spice.yellow -= data.scoreCard.yellow;
    player.spice.red -= data.scoreCard.red;
    player.spice.green -= data.scoreCard.green;
    player.spice.brown -= data.scoreCard.brown;

    var scoreCardIndex = _.findIndex(game.scoreCards, function(scoreCard) {
      return scoreCard.id == data.scoreCard.id;
    });
    if (scoreCardIndex == 0) {
      if (game.goldCoins > 0) {
        game.goldCoins -= 1;
        player.goldCoins += 1;
      } else if (game.silverCoins > 0) {
        game.silverCoins -= 1;
        player.silverCoins += 1;
      }
    } else if (scoreCardIndex == 1) {
      if (game.goldCoins > 0 && game.silverCoins > 0) {
        game.silverCoins -= 1;
        player.silverCoins += 1;
      }
    }

    player.scoreCards.push(data.scoreCard);
    game.scoreCards = _.remove(game.scoreCards, function(scoreCard) {
      return scoreCard.id != data.scoreCard.id;
    });
    if (game.publicScoreCards.length > 0) {
      game.scoreCards.push(game.publicScoreCards[0]);
      game.publicScoreCards = _.drop(game.publicScoreCards, 1);
    }

    var turn = nextPlayerTurn(game.players, data.user);
    game.playerTurn = turn;

    game.histories.push({player: data.user, action: 'pick score card'});
    io.emit('update-game', game);

    // save to mongo
    Game.create({
      game: game.id,
      epoch: Math.round(new Date().getTime() / 1000),
      player: player.user,
      action: 'pick-score-card',
      totalScore: calTotalScore(player),
      pickScoreCard: data.scoreCard
    }, function (err, res) {
      if (err) {
        console.log('ERR: ' + err);
      } else {
        console.log('OK: ' + res);
      }
    });
  });

  socket.on('send-chat', function (data) {
    game.histories.push(data);
    io.emit('send-chat', {histories: game.histories});
  });

  socket.on('get-all-players', function (query) {
    Game.distinct('player', function (err, result) {
      if (err) {
        console.log('get-all-players error:' + err);
      } else {
        socket.emit('get-all-players', result);
      }
    });
  });

  socket.on('query-stat', function (query) {
    Game.find(query, function (err, result) {
      if (err) {
        console.log('query-stat error:' + err);
      } else {
        socket.emit('query-stat', result);
      }
    });
  });

});


router.get('/', function(req, res, next) {
  res.send('Express REST API');
});

router.get('/test', function(req, res, next) {
  res.send('Express REST API');
});

router.post('/stat', function(req, res, next) {
  res.json({a: 1, b: 2});
});

app.use('/server', router);

module.exports = server;

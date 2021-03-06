import { Component, OnInit } from '@angular/core';
import { GameService } from '../game.service';
import * as io from 'socket.io-client';
import _ from 'lodash';
import { environment } from '../../environments/environment';

import { MatDialog, MatDialogRef } from '@angular/material';
import { GameActionDialog } from './game.action.dialog';
import { GameChatDialog } from './game.chat.dialog';
import { GameConfirmDialog } from './game.confirm.dialog';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  socket = io(location.origin.startsWith('https') ? environment.serverUrl.replace(/^http:/, 'https') : environment.serverUrl);
  user: any;
  joined: boolean = false;
  waiting: boolean = true;
  game: any = {scoreCards:[], tradeCards:[], publicScoreCards:[], publicTradeCards:[]};
  hideScoreCards: boolean = false;
  hideTradeCards: boolean = false;
  popUpOnAction: boolean = true;
  popUpOnChat: boolean = true;
  popUpOnConfirm: boolean = false;
  message: string = '';
  upCount: number = 0; // free upgrade
  maxTo: number = 0; // set to transform
  handicapSpices: any = [];
  requiredHandicap = 0;
  pendingUseTradeCard: any;
  pendingPickTradeCard: any;
  chatMessage: any;

  constructor(private gameService: GameService, public dialog: MatDialog) {
  }

  ngOnInit() {
    this.user = localStorage.getItem('user');

    this.socket.on('join-game', function (data) {
      console.log('join-game:' + JSON.stringify(data.players));
      if (_.includes(_.map(data.players, 'user'), this.user)) {
        console.log('joined');
        this.joined = true;
      }
      if (data.players.length == 2) {
        this.waiting = false;
      }
    }.bind(this));

    this.socket.on('update-game', function (data) {
      console.log('update-game:' + JSON.stringify(data));
      this.game = data;

      var lastHistory = _.last(this.game.histories);
      if (lastHistory.player != this.user && this.joined && this.popUpOnAction) {
        if (lastHistory.action) {
          this.openActionDialog(lastHistory);
        }
      }
      this.checkEndGame();
    }.bind(this));

    if (this.user !== null) {
      this.socket.emit('rejoin-game', {user: this.user});
    }

    this.socket.on('reset-game', function (data) {
      console.log('reset-game:' + JSON.stringify(data));
      this.joined = false;
      this.waiting = true;
      location.reload();
    }.bind(this));

    this.socket.on('view-game', function (data) {
      console.log('view-game:' + JSON.stringify(data));
      this.joined = true;
      this.waiting = false;
      this.game = data;
    }.bind(this));

    this.socket.on('reload-game', function (data) {
      console.log('reload-game:' + JSON.stringify(data));
      this.game = data;
      this.clearActionData();
    }.bind(this));

    this.socket.on('send-chat', function (data) {
      console.log('send-chat:' + JSON.stringify(data));
      this.game.histories = data.histories;

      var lastHistory = _.last(this.game.histories);
      if (lastHistory.player != this.user && this.joined) {
        if (lastHistory.action && this.popUpOnAction) {
          this.openActionDialog(lastHistory);
        } else if ((lastHistory.chat || lastHistory.emoji) && this.popUpOnChat) {
          this.openChatDialog(lastHistory);
        }
      }
    }.bind(this));

    this.socket.emit('view-game', {user: this.user});
  }

  joinGame() {
    localStorage.setItem('user', this.user);
    this.socket.emit('join-game', {user: this.user, hideScoreCards: this.hideScoreCards, hideTradeCards: this.hideTradeCards});
  }

  resetGame() {
    console.log('reset-game');
    if (_.includes(_.map(this.game.players, 'user'), this.user) || this.game.hasEnd || this.waiting) {
      this.socket.emit('reset-game', {});
    } else {
      console.log('only players in game can reset game');
      return;
    }
  }

  pickScoreCard(data) {
    console.log('pickScoreCard:' + JSON.stringify(data));
    if (this.user != this.game.playerTurn) {
      return;
    }
    var that = this;
    var player = _.find(this.game.players, function(player) {
      return player.user == that.game.playerTurn;
    });

    if (this.pendingUseTradeCard != null || this.pendingPickTradeCard != null) {
      console.log('pendingUseTradeCard=' + this.pendingUseTradeCard + ', pendingPickTradeCard=' + this.pendingPickTradeCard);
      return;
    }

    if (data.yellow > player.spice.yellow || data.red > player.spice.red
    || data.green > player.spice.green || data.brown > player.spice.brown) {
      return;
    }

    this.socket.emit('pick-score-card', {user: this.user, scoreCard: data});
    this.clearActionData();
  }

  pickTradeCard(data) {
    console.log('pickTradeCard:' + JSON.stringify(data));
    if (this.user != this.game.playerTurn) {
      return;
    }
    var that = this;
    var player = _.find(this.game.players, function(player) {
      return player.user == that.game.playerTurn;
    });

    if (this.pendingUseTradeCard != null || this.pendingPickTradeCard != null) {
      console.log('pendingUseTradeCard=' + this.pendingUseTradeCard + ', pendingPickTradeCard=' + this.pendingPickTradeCard);
      return;
    }

    var tradeCardIndex = _.findIndex(this.game.tradeCards, function(tradeCard) {
      return tradeCard.id == data.id;
    });
    if (this.sumOfProperty(player.spice) < tradeCardIndex) {
      console.log('not enough spice to handicap for picking trade card');
      return;
    }
    this.pendingPickTradeCard = data;
    if (tradeCardIndex != 0) {
      this.requiredHandicap = tradeCardIndex;
      return;
    }

    if (data.bonusSpices) {
      if (data.bonusSpices.yellow) {
        player.spice.yellow += data.bonusSpices.yellow;
      }
      if (data.bonusSpices.red) {
        player.spice.red += data.bonusSpices.red;
      }
      if (data.bonusSpices.green) {
        player.spice.green += data.bonusSpices.green;
      }
      if (data.bonusSpices.brown) {
        player.spice.brown += data.bonusSpices.brown;
      }
      data.bonusSpices = null;
    }

    var sumOfSpice = this.sumOfProperty(player.spice);
    if (sumOfSpice > 10) {
      return;
    }

    if (this.popUpOnConfirm) {
      this.openConfirmDialog('pick-trade-card', {user: this.user, tradeCard: data, spice: player.spice});
    } else {
      this.socket.emit('pick-trade-card', {user: this.user, tradeCard: data, spice: player.spice});
      this.clearActionData();
    }
  }

  useTradeCard(data) {
    console.log('useTradeCard:' + JSON.stringify(data));
    if (this.user != this.game.playerTurn) {
      return;
    }
    var that = this;
    var player = _.find(this.game.players, function(player) {
      return player.user == that.user;
    });

    if (this.pendingUseTradeCard != null || this.pendingPickTradeCard != null) {
      console.log('pendingUseTradeCard=' + this.pendingUseTradeCard + ', pendingPickTradeCard=' + this.pendingPickTradeCard);
      return;
    }

    if (!_.includes(_.map(player.tradeCards, function(tradeCard) {
      return tradeCard.id;
    }), data.id)) {
      return;
    }

    var type = this.tradeCardType(data);
    console.log('tradeCardType:' + type);
    if (type == 'free') {
      player.spice.yellow += data.free.yellow;
      player.spice.red += data.free.red;
      player.spice.green += data.free.green;
      player.spice.brown += data.free.brown;

      var sumOfSpice = this.sumOfProperty(player.spice);
      if (sumOfSpice > 10) {
        this.pendingUseTradeCard = data;
        return;
      }
    } else if (type == 'up') {
      this.upCount = data.up;
      this.pendingUseTradeCard = data;
      return;
    } else if (type == 'from-to') {
      this.maxTo = this.findMaxTo(data, player);
      this.pendingUseTradeCard = data;
      return;
    }

    if (this.popUpOnConfirm) {
      this.openConfirmDialog('use-trade-card', {user: this.user, tradeCard: data, spice: player.spice});
    } else {
      this.socket.emit('use-trade-card', {user: this.user, tradeCard: data, spice: player.spice});
      this.clearActionData();
    }
  }

  clickSpice(data) {
    console.log('clickSpice:' + JSON.stringify(data));
    if (this.user != this.game.playerTurn) {
      return;
    }
    var that = this;
    var player = _.find(this.game.players, function(player) {
      return player.user == that.game.playerTurn;
    });

    var sumOfSpice = this.sumOfProperty(player.spice);
    if (this.upCount > 0) {
      this.upSpice(data, player);
    } else if (sumOfSpice > 10) {
      this.discardSpice(data, player);
    } else if (this.requiredHandicap > 0) {
      this.handicapSpice(data, player);
    }
  }

  doneUpSpice() {
    console.log('doneUpSpice:');
    if (this.user != this.game.playerTurn) {
      return;
    }
    var that = this;
    var player = _.find(this.game.players, function(player) {
      return player.user == that.game.playerTurn;
    });

    this.upCount = 0;
    if (this.popUpOnConfirm) {
      this.openConfirmDialog('use-trade-card', {user: this.user, tradeCard: this.pendingUseTradeCard, spice: player.spice});
    } else {
      this.socket.emit('use-trade-card', {user: this.user, tradeCard: this.pendingUseTradeCard, spice: player.spice});
      this.clearActionData();
    }
  }

  sendEmoji(code) {
    console.log('sendEmoji:');
    this.socket.emit('send-chat', {player: this.user, emoji: code});
  }

  sendChat() {
    console.log('sendChat:');
    this.socket.emit('send-chat', {player: this.user, chat: this.chatMessage});
    this.chatMessage = null;
  }

  openActionDialog(history) {
    var data = _.cloneDeep(history);
    data.user = this.user;
    let dialogRef = this.dialog.open(GameActionDialog, {
      width: '250px',
      data: data
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('action dialog closed');
    });
  }

  openChatDialog(history) {
    var data = _.cloneDeep(history);
    data.user = this.user;
    let dialogRef = this.dialog.open(GameChatDialog, {
      width: '250px',
      data: data
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('chat dialog closed');
    });
  }

  openConfirmDialog(action, gameData) {
    var data = {
      user: this.user,
      action: action,
      gameData: gameData
    };
    let dialogRef = this.dialog.open(GameConfirmDialog, {
      width: '250px',
      data: data
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('confirm dialog closed: ' + JSON.stringify(result));
        this.socket.emit(result.action, result.gameData);
      } else {
        this.socket.emit('reload-game', {});
      }
    });
  }


  private clearActionData() {
      this.message = '';
      this.upCount = 0;
      this.maxTo = 0;
      this.handicapSpices = [];
      this.requiredHandicap = 0;
      this.pendingUseTradeCard = null;
      this.pendingPickTradeCard = null;
  }

  private upSpice(data, player) {
    console.log('upSpice:' + JSON.stringify(data));
    if (this.upCount <= 0) {
      return;
    }

    if (data == 'yellow') {
      player.spice.yellow -= 1;
      player.spice.red += 1;
    } else if (data == 'red') {
      player.spice.red -= 1;
      player.spice.green += 1;
    } else if (data == 'green') {
      player.spice.green -= 1;
      player.spice.brown += 1;
    } else {
      return;
    }
    this.upCount -= 1;

    if (this.upCount <= 0) {
      if (this.popUpOnConfirm) {
        this.openConfirmDialog('use-trade-card', {user: this.user, tradeCard: this.pendingUseTradeCard, spice: player.spice});
      } else {
        this.socket.emit('use-trade-card', {user: this.user, tradeCard: this.pendingUseTradeCard, spice: player.spice});
        this.clearActionData();
      }
    }
  }

  private discardSpice(data, player) {
    console.log('discardSpice:' + JSON.stringify(data));

    var sumOfSpice = this.sumOfProperty(player.spice);

    if (data == 'yellow') {
      player.spice.yellow -= 1;
    } else if (data == 'red') {
      player.spice.red -= 1;
    } else if (data == 'green') {
      player.spice.green -= 1;
    } else if (data == 'brown') {
      player.spice.brown -= 1;
    } else {
      return;
    }
    sumOfSpice -= 1;

    if (sumOfSpice <= 10) {
      if (this.pendingPickTradeCard != null) {
        if (this.popUpOnConfirm) {
          this.openConfirmDialog('pick-trade-card', {user: this.user, tradeCard: this.pendingPickTradeCard, handicapSpices: this.handicapSpices, spice: player.spice});
        } else {
          this.socket.emit('pick-trade-card', {user: this.user, tradeCard: this.pendingPickTradeCard, handicapSpices: this.handicapSpices, spice: player.spice});
          this.handicapSpices = [];
        }
      } else {
        if (this.popUpOnConfirm) {
          this.openConfirmDialog('use-trade-card', {user: this.user, tradeCard: this.pendingUseTradeCard, spice: player.spice});
        } else {
          this.socket.emit('use-trade-card', {user: this.user, tradeCard: this.pendingUseTradeCard, spice: player.spice});
        }
      }
      this.clearActionData();
    }
  }

  private handicapSpice(data, player) {
    console.log('handicapSpice:' + JSON.stringify(data));

    if (data == 'yellow') {
      player.spice.yellow -= 1;
    } else if (data == 'red') {
      player.spice.red -= 1;
    } else if (data == 'green') {
      player.spice.green -= 1;
    } else if (data == 'brown') {
      player.spice.brown -= 1;
    } else {
      return;
    }
    this.requiredHandicap -= 1;
    this.handicapSpices.push(data);

    if (this.requiredHandicap <= 0) {
      if (this.pendingPickTradeCard.bonusSpices) {
        if (this.pendingPickTradeCard.bonusSpices.yellow) {
          player.spice.yellow += this.pendingPickTradeCard.bonusSpices.yellow;
        }
        if (this.pendingPickTradeCard.bonusSpices.red) {
          player.spice.red += this.pendingPickTradeCard.bonusSpices.red;
        }
        if (this.pendingPickTradeCard.bonusSpices.green) {
          player.spice.green += this.pendingPickTradeCard.bonusSpices.green;
        }
        if (this.pendingPickTradeCard.bonusSpices.brown) {
          player.spice.brown += this.pendingPickTradeCard.bonusSpices.brown;
        }
      }

      var sumOfSpice = this.sumOfProperty(player.spice);
      if (sumOfSpice > 10) {
        return;
      }

      if (this.popUpOnConfirm) {
        this.openConfirmDialog('pick-trade-card', {user: this.user, tradeCard: this.pendingPickTradeCard, handicapSpices: this.handicapSpices, spice: player.spice});
      } else {
        this.socket.emit('pick-trade-card', {user: this.user, tradeCard: this.pendingPickTradeCard, handicapSpices: this.handicapSpices, spice: player.spice});
        this.clearActionData();
      }
    }
  }

  toSpice(data) {
    console.log('toSpice:' + JSON.stringify(data));
    if (this.user != this.game.playerTurn) {
      return;
    }
    var that = this;
    var player = _.find(this.game.players, function(player) {
      return player.user == that.game.playerTurn;
    });

    for (var i=0; i<data; i++) {
      player.spice.yellow -= this.pendingUseTradeCard.from.yellow;
      player.spice.red -= this.pendingUseTradeCard.from.red;
      player.spice.green -= this.pendingUseTradeCard.from.green;
      player.spice.brown -= this.pendingUseTradeCard.from.brown;

      player.spice.yellow += this.pendingUseTradeCard.to.yellow;
      player.spice.red += this.pendingUseTradeCard.to.red;
      player.spice.green += this.pendingUseTradeCard.to.green;
      player.spice.brown += this.pendingUseTradeCard.to.brown;
    }

    this.maxTo = 0;
    var sumOfSpice = this.sumOfProperty(player.spice);
    if (sumOfSpice > 10) {
      return;
    }

    if (this.popUpOnConfirm) {
      this.openConfirmDialog('use-trade-card', {user: this.user, tradeCard: this.pendingUseTradeCard, spice: player.spice});
    } else {
      this.socket.emit('use-trade-card', {user: this.user, tradeCard: this.pendingUseTradeCard, spice: player.spice});
      this.clearActionData();
    }
  }

  clearTradeCards() {
    if (this.user != this.game.playerTurn) {
      return;
    }

    if (this.popUpOnConfirm) {
      this.openConfirmDialog('clear-trade-cards', {user: this.user});
    } else {
      this.socket.emit('clear-trade-cards', {user: this.user});
      this.clearActionData();
    }
  }

  calTotalScore(player) {
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

  moreThan10Spice(spice) {
    return this.sumOfProperty(spice) > 10;
  }

  private findMaxTo(tradeCard, player) {
    this.maxTo = 0;
    var yellow = tradeCard.from.yellow == 0 ? Number.MAX_VALUE : Math.floor(player.spice.yellow / tradeCard.from.yellow);
    var red = tradeCard.from.red == 0 ? Number.MAX_VALUE : Math.floor(player.spice.red / tradeCard.from.red);
    var green = tradeCard.from.green == 0 ? Number.MAX_VALUE : Math.floor(player.spice.green / tradeCard.from.green);
    var brown =tradeCard.from.brown == 0 ? Number.MAX_VALUE : Math.floor(player.spice.brown / tradeCard.from.brown);
    return Math.min(yellow, red, green, brown);
  }

  private tradeCardType(tradeCard) {
    if (tradeCard.up > 0) {
      return 'up';
    } else if (tradeCard.free.yellow > 0 || tradeCard.free.red > 0 || tradeCard.free.green > 0 || tradeCard.free.brown > 0) {
      return 'free';
    } else {
      return 'from-to';
    }
  }

  private checkEndGame() {
    var hasEndGame = _.some(this.game.players, function (player) {
      return player.scoreCards.length >= 6;
    });
    if (hasEndGame && this.game.playerTurn == this.game.players[0].user) {
      var maxScore = 0;
      var maxScorePlayer = null;
      for (var i=0; i<this.game.players.length; i++) {
        var totalScore = this.calTotalScore(this.game.players[i]);
        if (totalScore > maxScore) {
          maxScore = totalScore;
          maxScorePlayer = this.game.players[i].user;
        }
      }
      this.game.hasEnd = true;
      this.game.playerTurn = null;
      this.game.winner = maxScorePlayer;
    }
  }

  private sumOfProperty(value): any {
    var total = 0;
    for (var prop in value) {
      // check also if property is not inherited from prototype
      if (value.hasOwnProperty(prop)) {
        var propValue = value[prop];
        total += propValue;
      }
    }
    return total;
  }
}



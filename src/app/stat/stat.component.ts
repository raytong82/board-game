import { Component, OnInit } from '@angular/core';
import { GameService } from '../game.service';
import * as io from 'socket.io-client';
import _ from 'lodash';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-game',
  templateUrl: './stat.component.html',
  styleUrls: ['./stat.component.css']
})
export class StatComponent implements OnInit {

  socket = io(location.origin.startsWith('https') ? environment.serverUrl.replace(/^http:/, 'https') : environment.serverUrl);
  user: any;

  allActions: Array<string> = ['use-trade-card', 'pick-trade-card', 'pick-score-card'];
  selectedAction: string = 'Filter User Action';
  allPlayers: Array<string> = [];
  selectedPlayer: string = 'Filter Player';

  constructor(private gameService: GameService) { }

  ngOnInit() {
    this.user = localStorage.getItem('user');

    this.socket.on('query-stat', function (result) {
      console.log('query-stat:' + JSON.stringify(result));
    }.bind(this));

    this.socket.on('get-all-players', function (result) {
      console.log('get-all-players:' + JSON.stringify(result));
      this.allPlayers = result;
    }.bind(this));

    this.socket.emit('get-all-players', {});
  }

  selectAction(action) {
    this.selectedAction = action;
  }

  selectPlayer(player) {
    this.selectedPlayer = player;
  }

  search() {
    var query = {};
    if (_.includes(this.allActions, this.selectedAction)) {
      query['action'] = this.selectedAction;
    }
    if (_.includes(this.allPlayers, this.selectedPlayer)) {
      query['player'] = this.selectedPlayer;
    }

    this.socket.emit('query-stat', query);
  }
}

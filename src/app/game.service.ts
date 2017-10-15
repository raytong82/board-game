import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class GameService {

  constructor(private http: Http) { }
  
  joinGame(data) {
    return new Promise((resolve, reject) => {
      this.http.post('/server/join', data)
        .map(res => res.json())
        .subscribe(res => {
          resolve(res);
        }, (err) => {
          reject(err);
        });
    });
  }
  
  pickScoreCard(data) {
    return new Promise((resolve, reject) => {
      this.http.post('/server/score-card', data)
        .map(res => res.json())
        .subscribe(res => {
          resolve(res);
        }, (err) => {
          reject(err);
        });
    });
  }

  pickTradeCard(data) {
    return new Promise((resolve, reject) => {
      this.http.post('/server/trade-card', data)
        .map(res => res.json())
        .subscribe(res => {
          resolve(res);
        }, (err) => {
          reject(err);
        });
    });
  }
  
  useTradeCard(data) {
  }
  
  clearTradeCard() {
  }
}

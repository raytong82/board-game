import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class GameService {

  constructor(private http: Http) { }

  search(query) {
    this.http.post('/server/stat', query)
      .map(res => res.json())
      .subscribe(res => {
        console.log('success:' + JSON.stringify(res));
      }, err => {
        console.log('error:' +JSON.stringify(err));
      });
  }
}

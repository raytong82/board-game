/* tslint:disable use-pipe-transform-interface */
import { Pipe, PipeTransform } from '@angular/core';
import _ from 'lodash';

@Pipe({name: 'num2Array'})
export class Num2ArrayPipe implements PipeTransform {
  transform(value, args: string[]): any {
//    console.log('num2Array' + value);
    if (value <= 0) {
      return [];
    }
    return _.range(value);
  }
}

@Pipe({name: 'hasNonZeroProperty'})
export class HasNonZeroPropertyPipe implements PipeTransform {
  transform(value, args: string[]): any {
    for (var prop in value) {
      // check also if property is not inherited from prototype
      if (value.hasOwnProperty(prop)) {
        var propValue = value[prop];
        if (propValue > 0) {
          return true;
        }
      }
    }
    return false;
  }
}

@Pipe({name: 'sumOfProperty'})
export class SumOfPropertyPipe implements PipeTransform {
  transform(value, args: string[]): any {
    var total = 0;
    for (var prop in value) {
      // check also if property is not inherited from prototype
      if (value.hasOwnProperty(prop)) {
        var propValue = value[prop];
        total += propValue;
      }
    }
//    console.log('sumOfProperty' + total + ', for:' + value);
    return total;
  }
}

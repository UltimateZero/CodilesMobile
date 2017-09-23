import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the AccountServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AccountServiceProvider {
  accounts: any;
  constructor(public http: Http) {
    console.log('Hello AccountServiceProvider Provider');
  }

  getAccounts(skip: number, search: string) {
    this.accounts = [];
    return new Promise(resolve => {
      // We're using Angular HTTP provider to request the data,
      // then on the response, it'll map the JSON data to a parsed JS object.
      // Next, we process the data and resolve the promise with the new data.
      this.http.get('https://codiles-mkh.herokuapp.com/getAccounts?limit=20&skip=' + skip + '&search=' + search)
        .map(res => <Array<{ id: string, total_services: number, total_bill: number }>>res.json())
        .subscribe(data => {
          // we've got back the raw data, now generate the core schedule data
          // and save the data for later reference
          this.accounts = data;
          resolve(this.accounts);
        });
    });
  }

}

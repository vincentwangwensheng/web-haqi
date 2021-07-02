import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataAnalyticsService {

  constructor(public http: HttpClient) { }

  searchData(params){
    let conditions = {};
    if (params) {
      conditions = {'paramday': params};
    }
   return this.http.post('http://172.31.19.72:8083/api/get-pentaho' , conditions);
  }
}


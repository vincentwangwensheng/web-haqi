import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Utils} from '../utils';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment.hmr';

@Injectable({
  providedIn: 'root'
})
export class IntegralHistoryService {

  constructor(public http: HttpClient, private utils: Utils) { }


  // 多条件查询常旅客列表
  multiSearchStoreLists(page, size, sort, search?): Observable<any> {
    const searchApi = this.utils.getMultiSearch(page, size, sort, search);
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.getPointHistory + searchApi
        , {observe: 'response'});
  }

  // 根据开始时间与结束时间分页查询
  searchIntegralListByTime(param){
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.getPointHistory + param
        , {observe: 'response'});
  }
}



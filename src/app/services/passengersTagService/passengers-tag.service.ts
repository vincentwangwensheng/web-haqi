import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Utils} from '../utils';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment.hmr';

@Injectable({
  providedIn: 'root'
})
export class PassengersTagService {

  constructor(private http: HttpClient, private utils: Utils) { }

  // 多条件查询常旅客列表

  multiSearchMemberLists(page, size, sort, search?): Observable<any> {
    const searchApi = this.utils.getMultiSearch(page, size, sort, search);
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.passengersTag + searchApi
        , {observe: 'response'});
  }

  // 根据id获取详情页
  getDetailById(id): Observable<any> {
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.passengersTag + '/' + id);
  }

  // 新增常旅客标签
  createPassengerTagList(param){
    return this.http.post(sessionStorage.getItem('baseUrl') + environment.passengersTag, param);
  }

  // update常旅客标签
  updatePassengerTagList(param){
    return this.http.put(sessionStorage.getItem('baseUrl') + environment.passengersTag, param);
  }
}

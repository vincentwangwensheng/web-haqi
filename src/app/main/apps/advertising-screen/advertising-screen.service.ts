import { Injectable } from '@angular/core';
import {environment} from '../../../../environments/environment.hmr';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Utils} from '../../../services/utils';

@Injectable({
  providedIn: 'root'
})
export class AdvertisingScreenService {

  constructor(public http: HttpClient, private utils: Utils) { }

  createAdvertising(data) {
    return this.http.post(sessionStorage.getItem('baseUrl') + environment.getAdvertising, data, {observe: 'response'});
  }

  updateAdvertising(data){
    return this.http.put(sessionStorage.getItem('baseUrl') + environment.getAdvertising, data, {observe: 'response'});
  }

  //  获取列表
  multiSearchAdvertisingLists(page, size, sort, search?): Observable<any> {
    const searchApi = this.utils.getMultiSearch(page, size, sort, search);
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.getAdvertisingList + searchApi
        , {observe: 'response'});
  }

  // 获取商场
  getMall(id) {
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.getMall + '/' + id);
  }

  getAdvertisingDetail(id) {
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.getAdvertising + '/' + id);
  }
}

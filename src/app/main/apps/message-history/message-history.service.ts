import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../../environments/environment.hmr';
import {HttpClient} from '@angular/common/http';
import {Utils} from '../../../services/utils';

@Injectable({
  providedIn: 'root'
})
export class MessageHistoryService {

  constructor(public http: HttpClient, private utils: Utils) { }

  // 已发短信列表
  searchMessageHistoryList(page, size, sort, search?): Observable<any> {
    const searchApi = this.utils.getMultiSearch(page, size, sort, search);
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.messageHistoryList + searchApi
        , {observe: 'response'});
  }

}

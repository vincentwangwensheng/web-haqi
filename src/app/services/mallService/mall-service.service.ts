import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment.hmr';
import {HttpClient} from '@angular/common/http';
import {Utils} from '../utils';

@Injectable({
  providedIn: 'root'
})
export class MallService {

  constructor(private http: HttpClient, private utils: Utils) { }


  multiSearchMemberLists(page, size, sort, search? , filter?): Observable<any> {
    const searchApi = this.utils.getMultiSearch(page, size, sort, search , filter);
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.getBasicsMallList + searchApi
        , {observe: 'response'});
  }

  getMallById(id): Observable<any> {
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.getMallById + '?id=' + id
        , {observe: 'response'});
  }
}

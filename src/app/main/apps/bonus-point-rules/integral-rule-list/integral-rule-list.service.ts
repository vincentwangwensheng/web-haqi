import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Utils} from '../../../../services/utils';
import {Observable} from 'rxjs';
import {environment} from '../../../../../environments/environment.hmr';

@Injectable({
  providedIn: 'root'
})
export class IntegralRuleListService {

  constructor(public http: HttpClient, private utils: Utils) { }


  //  获取品牌列表
  multiSearchBrandLists(page, size, sort, search?): Observable<any> {
    const searchApi = this.utils.getMultiSearch(page, size, sort, search);
    // return this.http.get(sessionStorage.getItem('baseUrl') + environment.getPointRuleList + searchApi
    //     , {observe: 'response'});
    return this.http.get(sessionStorage.getItem('baseUrl') + 'backend/api/point-rules' + searchApi
        , {observe: 'response'});
  }

}

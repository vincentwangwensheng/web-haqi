import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Utils} from '../utils';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment.hmr';

@Injectable({
  providedIn: 'root'
})
export class MarketingTagService {

  constructor(private http: HttpClient, private utils: Utils) { }

  // 多条件查询常旅客列表

  multiSearchMemberLists(page, size, sort, search?): Observable<any> {
    const searchApi = this.utils.getMultiSearch(page, size, sort, search);
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.marketingTag + searchApi
        , {observe: 'response'});
  }

  // 根据id获取详情
  getDetailById(id): Observable<any>{
      return this.http.get(sessionStorage.getItem('baseUrl') + environment.marketingTag + '/' + id);
  }

  // 新增一条营销标签数据
  createMarketingTagList(param){
    return this.http.post(sessionStorage.getItem('baseUrl') + environment.marketingTag, param);
  }

  // update营销标签数据
  updateMarketingTag(param){
    return this.http.put(sessionStorage.getItem('baseUrl') + environment.marketingTag, param);
  }
}

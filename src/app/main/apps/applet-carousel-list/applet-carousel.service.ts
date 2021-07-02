import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Utils} from '../../../services/utils';
import {environment} from '../../../../environments/environment.hmr';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppletCarouselService {

  constructor(public http: HttpClient, private utils: Utils) { }

  createAppletCarousePhoto(data) {
    return this.http.post(sessionStorage.getItem('baseUrl') + environment.loopInfo, data, {observe: 'response'});
  }

  updateAppletCarousePhoto(data){
    return this.http.put(sessionStorage.getItem('baseUrl') + environment.loopInfo, data, {observe: 'response'});
  }

  //  获取列表
  multiSearchBrandLists(page, size, sort, search?): Observable<any> {
    const searchApi = this.utils.getMultiSearch(page, size, sort, search);
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.allLoopInfo + searchApi
        , {observe: 'response'});
  }

  getAppletCarousePhotoDetail(id) {
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.loopInfo + '/' + id);
  }

  deleteLoopInfoDetailedById(id){
    return this.http.delete(sessionStorage.getItem('baseUrl') + environment.loopInfoDetailed + '/' + id);
  }

}

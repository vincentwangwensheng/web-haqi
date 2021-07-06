import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Utils} from '../../../../../../services/utils';
import {environment} from '../../../../../../../environments/environment.hmr';

@Injectable({
  providedIn: 'root'
})
export class SecondTypeService {
  constructor(private http: HttpClient,
              private utils: Utils) {
  }

  searchBusinessTypes(page, size, sort, search?, filter?) {
    const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
    return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.searchTypes + searchApi, {observe: 'response'});
  }

  getBsTypeById(id) {
    return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getTypeById + '?id=' + id);
  }

  searchTypes(page, size, sort, search?, filter?) {
    const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
    return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.secondType + searchApi, {observe: 'response'});
  }

  getTypeById(id) {
    return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.secondType + '/' + id);
  }

  postType(data) {
    return this.http.post(sessionStorage.getItem('baseUrl') + environment.secondType, data);
  }

  putType(data) {
    return this.http.put(sessionStorage.getItem('baseUrl') + environment.secondType, data);
  }

  deleteTypeById(id) {
    return this.http.delete(sessionStorage.getItem('baseUrl') + environment.secondType + '/' + id);
  }
}

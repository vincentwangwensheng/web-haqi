import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Utils} from '../../../services/utils';
import {Observable} from 'rxjs';
import {environment} from '../../../../environments/environment.hmr';

@Injectable({
  providedIn: 'root'
})
export class MessageTemplateService {

  constructor(public http: HttpClient, private utils: Utils) { }

  // 模板列表
  searchArticleList(page, size, sort, search?): Observable<any> {
    const searchApi = this.utils.getMultiSearch(page, size, sort, search);
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.messageTemplateList + searchApi
        , {observe: 'response'});
  }

  createMessageTemplate(model) {
    return this.http.post(sessionStorage.getItem('baseUrl') + environment.messageTemplateList, model);
  }

  getTemplateById(id) {
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.messageTemplateList + '/' + id);
  }

  updateMessageTemplate(model) {
    return this.http.put(sessionStorage.getItem('baseUrl') + environment.messageTemplateList, model);
  }

}

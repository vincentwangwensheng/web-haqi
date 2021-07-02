import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {couponManageApi} from '../coupon-manage/coupon-manage-api';
import {HttpClient} from '@angular/common/http';
import {Utils} from '../../../services/utils';
import {ContentManageApi} from './content-manage.api';
import {environment} from '../../../../environments/environment.hmr';

@Injectable()
export class ContentManageService {

  constructor(
      public http: HttpClient,
      public utils: Utils
  ) { }

  /*****************商户反馈*****************/
  // 商户反馈列表（get）
  feedbackStoresList(page, size, sort, search?, filter?): Observable<any> {
    const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
    return this.http.get(sessionStorage.getItem('baseUrl') + ContentManageApi.feedbackStoresList + searchApi
        , {observe: 'response'});
  }

  // 商户反馈编辑保存（put）
  updateFeedbackStores(data): Observable<any> {
    return this.http.put(sessionStorage.getItem('baseUrl') + ContentManageApi.updateFeedbackStores, data);
  }

  // 商户反馈编辑保存(已经回复过）（put）
  updateFeedbackStoresReplyed(data): Observable<any> {
    return this.http.put(sessionStorage.getItem('baseUrl') + ContentManageApi.updateFeedbackStoresReplyed, data);
  }

  /*****************常见问题*****************/
  // 常见问题（get）
  questionsList(page, size, sort, search?, filter?): Observable<any> {
    const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
    return this.http.get(sessionStorage.getItem('baseUrl') + ContentManageApi.questionsList + searchApi
        , {observe: 'response'});
  }

  // 常见问题新建（post）
  addQuestions(data): Observable<any> {
    return this.http.post(sessionStorage.getItem('baseUrl') + ContentManageApi.addQuestions, data);
  }

  // 常见问题编辑保存（put）
  updateQuestions(data): Observable<any> {
    return this.http.put(sessionStorage.getItem('baseUrl') + ContentManageApi.updateQuestions, data);
  }

  getMallList(page, size, sort, search?, filter?): Observable<any> {
    const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
    return this.http.get(sessionStorage.getItem('baseUrl') + ContentManageApi.getMallList + searchApi);
  }

  // 多条件查询
  multiSearchStoreLists(page, size, sort, search? , filter?): Observable<any> {
    const searchApi = this.utils.getMultiSearch(page, size, sort, search , filter);
    return this.http.get(sessionStorage.getItem('baseUrl') + ContentManageApi.searchStoreLists + searchApi
    );
  }

  /*****************会员反馈*****************/
  // 会员反馈列表（get）
  feedbacksList(page, size, sort, search?, filter?): Observable<any> {
    const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
    return this.http.get(sessionStorage.getItem('baseUrl') + ContentManageApi.feedbacksList + searchApi
        , {observe: 'response'});
  }

  // 会员反馈编辑保存（put）
  updateFeedbacks(data): Observable<any> {
    return this.http.put(sessionStorage.getItem('baseUrl') + ContentManageApi.updateFeedbacks, data);
  }

  // 会员反馈编辑保存（put）
  updateFeedbacksReplyed(data): Observable<any> {
    return this.http.put(sessionStorage.getItem('baseUrl') + ContentManageApi.updateFeedbacksReplyed, data);
  }


  /*****************商户公告*****************/
  // 商户公告列表（get）
  informsList(page, size, sort, search?, filter?): Observable<any> {
    const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
    return this.http.get(sessionStorage.getItem('baseUrl') + ContentManageApi.informsList + searchApi
        , {observe: 'response'});
  }

  // 商户公告新建（get）
  addInforms(data): Observable<any> {
    return this.http.post(sessionStorage.getItem('baseUrl') + ContentManageApi.addInforms, data);
  }

  // 商户公告编辑保存（put）
  updateInforms(data): Observable<any> {
    return this.http.put(sessionStorage.getItem('baseUrl') + ContentManageApi.updateInforms, data);
  }

}

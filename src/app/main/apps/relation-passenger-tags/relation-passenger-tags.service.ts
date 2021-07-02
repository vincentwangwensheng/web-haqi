import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Utils} from '../../../services/utils';
import {environment} from '../../../../environments/environment.hmr';
import {Observable} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class RelationPassengerTagsService {

  constructor(public http: HttpClient, private utils: Utils) { }

  // 标签列表
  searchPassengerTagsList(page, size, sort, search?): Observable<any>{
    const searchApi = this.utils.getMultiSearch(page, size, sort, search);
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.passengerTags + searchApi, {observe: 'response'});
  }

  // 查询关联的标签
  searchPassengerSelectedTags(mobile): Observable<any> {
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.passengerSelectedTags + '?mobile=' + mobile);
  }

  // 根据手机号和mallId查询会员当前积分
  getMemberPoint(mallId, mobile) {
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.getMemberPoint + '?mallId=' + mallId + '&mobile=' + mobile);
  }

  // 根据手机号和mallId查询会员积分历史清单
  getPointHistory(mobile) {
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.getPointHistory
        + '?page=0&size=0x3f3f3f3f&sort=lastModifiedDate,desc&mobile.equals=' + mobile);
  }

  // 积分流水类型
  getPointHistoryType() {
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.toPointHistoryType);
  }


  // 获取会员卡列表的数据
  searchMemberCardList(page, size, sort, search?): Observable<any> {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search);
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.memberLevel + searchApi
            , {observe: 'response'});
    }

}

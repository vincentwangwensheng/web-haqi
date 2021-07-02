import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment.hmr';
import {Utils} from '../utils';

@Injectable({
    providedIn: 'root'
})
export class PassengersManageService {

    constructor(private http: HttpClient, private utils: Utils) {
    }

    // 多条件查询常旅客列表
    multiSearchMemberLists(page, size, sort, search?): Observable<any> {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search);
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.membersApiList + searchApi
            , {observe: 'response'});
    }

    getByCondition(condition): Observable<any> {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.membersApiList + condition
            , {observe: 'response'});
    }


    // 常旅客详情
    getMembersById(id): Observable<any> {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.membersApi + '/' + id);
    }

    // 获取会员基本信息
    getVipDis(vipDisRequest, mallId): Observable<any> {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.getVipDis, vipDisRequest,
            {headers: new HttpHeaders().append('UrlId', mallId)});
    }

    // 更新
    updateMembers(memberDTO) {
        return this.http.put(sessionStorage.getItem('baseUrl') + environment.membersApi, memberDTO);
    }

    // 会员当前积分列表
    getMemberPoints(data) {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.getMemberPoints, data);
    }

    //  更新关联标签
    updatePassengerTags(model) {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.updatePassengerTags, model);
    }

    // 获取标签列表
    searchTagList(page, size, sort, search?, filter?): Observable<any> {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.searchLabelList + searchApi, {observe: 'response'});
    }
}

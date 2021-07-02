import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Utils} from '../../../services/utils';
import {environment} from '../../../../environments/environment.hmr';

@Injectable({
    providedIn: 'root'
})
export class MarketingManageService {

    constructor(public http: HttpClient, private utils: Utils) {
    }

    // 新增一条活动数据
    creatMarketingManageList(param) {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.getMarketingManageList, param, {observe: 'response'});
    }

    // 查询营销管理列表
    searchMarketingManageList(param) {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.getMarketingManageList + param, {observe: 'response'});
    }

    // 根据id查询活动
    searchActivityListById(param) {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.getMarketingManageList + '/' + param, {observe: 'response'});
    }


    findMarketingManageList(id){
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchMarketingManageList + '/' + id);
    }


    /*// 获取营销列表总数
    searchActivityCount(param?){
      if (param){
        return this.http.get(sessionStorage.getItem('baseUrl') + 'coupon/api/activities/count' + param, {observe: 'response'});
      } else {
        return this.http.get(sessionStorage.getItem('baseUrl') + 'coupon/api/activities/count', {observe: 'response'});
      }
    }*/

    // 更新营销列表数据
    updateActivityDetailData(param) {
        return this.http.put(sessionStorage.getItem('baseUrl') + environment.getMarketingManageList, param, {observe: 'response'});
    }

    // 添加活动阶段数据
    createCouponSatgeData(param) {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.searchActivityStagesList, param, {observe: 'response'});
    }

    // 查询活动数据
    searchActiveityStageData(param?) {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchActivityStagesList + param, {observe: 'response'});
    }

    // 更新活动阶段数据
    updateActivityStagesData(param) {
        return this.http.put(sessionStorage.getItem('baseUrl') + environment.searchActivityStagesList, param, {observe: 'response'});
    }

    // 根据id删除活动阶段
    deleteActivityStagesData(id) {
        return this.http.delete(sessionStorage.getItem('baseUrl') + environment.searchActivityStagesList + '/' + id, {observe: 'response'});
    }


    // 商户数据查询
    searchCouponMaintainList(outId, page, size, sort, search?, input?, filed?, defaultValue?): Observable<any> {
        const tSearch = outId ? 'outId.contains=' + outId + '&' : '';
        const pSearch = 'page=' + page + '&';
        const sSearch = 'size=' + size + '&';
        const sortSearch = sort ? 'sort=' + sort : '';
        const itemSearch = search ? '&' + search + '.contains=' + input : '';
        const defaultSearch = filed ? '&' + filed + '.equals=' + defaultValue : '';
        const searchApi = '?' +
            tSearch
            + pSearch
            + sSearch
            + sortSearch
            + itemSearch
            + defaultSearch
        ;
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.getCouponMaintainList + searchApi,
            {observe: 'response'});
    }


    // 多条件查询常旅客列表
    multiSearchStoreLists(page, size, sort, search?, filter?): Observable<any> {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.getMarketingManageList + searchApi
            , {observe: 'response'});
    }

    // 分组活动新增
    createCouponGroupsData(param) {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.createCouponGroupsData, param, {observe: 'response'});
    }

    // 根据参数获取分组活动数据
    getCouponGroupsData(param) {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.createCouponGroupsData + param, {observe: 'response'});
    }

    // 更新活动分组数据
    updateCouponGroupsData(param) {
        return this.http.put(sessionStorage.getItem('baseUrl') + environment.createCouponGroupsData, param, {observe: 'response'});
    }

    // 根据id删除分组数据
    deleteCouponGroupsData(id) {
        return this.http.delete(sessionStorage.getItem('baseUrl') + environment.createCouponGroupsData + '/' + id, {observe: 'response'});
    }

    // 根据活动识别号获取其拥有的所有标签
    getTagsByActivity(acId) {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.getTagsByActivity + '?activityId=' + acId);
    }

    // 根据活动识别号设置其所需要的标签
    setActivityTags(activityTagVM) {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.setActivityTags, activityTagVM, {observe: 'response'});
    }

    // 活动审核
    activitiesReview(id, ReviewVm) {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.activitiesReview + '/' + id + '/review'
            , ReviewVm);
    }

    getStoreByIdAC(id) {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getStoreByIdAC + '?id=' + id);
    }

    // 导出对账单
    exportReconciliation(acId){
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.exportReconciliation + '?activityid.equals=' + acId,
            {responseType: 'blob', reportProgress: true, observe: 'events' });
    }

}


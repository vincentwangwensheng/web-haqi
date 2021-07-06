import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Utils} from '../../../../services/utils';
import {Observable} from 'rxjs';
import {couponManageApi} from './coupon-manage-api';
import {environment} from '../../../../../environments/environment.hmr';

@Injectable()
export class CouponManageService {

    constructor(
        public http: HttpClient,
        public utils: Utils
    ) {
    }

    /******************优惠券列表*****************/
    // 获取优惠券列表
    toGetCouponList(page, size, sort, search?, filter?): Observable<any> {
        let searchApi = '';
        if (search && search.length !== 0) {
            const info = search.map(item => {
                            if (item['name'] === 'clearBy') {
                                item = 'clearBy.specified=' + item['value'];
                            } else if (item['name'] === 'enabled'){
                                item = 'enabled.equals=' + item['value'];
                            } else if (item['name'] === 'userId'){
                                item = 'userId.contains=' + item['value'];
                            }
                            return item;
                        }).join('&');
            searchApi = `?page=${page}&size=${size}&sort=${sort}&` + info;
        } else {
            searchApi = `?page=${page}&size=${size}&sort=${sort}`;
        }
        return this.http.get(sessionStorage.getItem('baseUrl') + couponManageApi.getCouponList + searchApi
            , {observe: 'response'});
    }

    // 导出优惠券列表
    toExportCouponList(page, size, sort, search?) {
        let searchApi = '';
        if (search && search.length !== 0) {
            const info = search.map(item => {
                if (item['name'] === 'clearBy') {
                    item = 'clearBy.specified=' + item['value'];
                } else if (item['name'] === 'enabled'){
                    item = 'enabled.equals=' + item['value'];
                } else if (item['name'] === 'userId'){
                    item = 'userId.contains=' + item['value'];
                }
                return item;
            }).join('&');
            searchApi = `?page=${page}&size=${size}&sort=${sort}&` + info + '&rereviewStatus.equals=true';
        } else {
            searchApi = `?page=${page}&size=${size}&sort=${sort}` + '&reviewStatus.equals=true';
        }
        return this.http.get(sessionStorage.getItem('baseUrl') + couponManageApi.exportCouponList + searchApi,
            {observe: 'response', responseType: 'blob'});
    }

    /******************优惠券规则*****************/
    // 获取优惠券批次列表
    toGetCouponBatchList(page, size, sort, search?): Observable<any> {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search);
        return this.http.get(sessionStorage.getItem('baseUrl') + couponManageApi.getCouponBatchList + searchApi
            , {observe: 'response'});
    }

    // 新建优惠券批次(post)
    toCreateCouponBatch(data): Observable<any> {
        return this.http.post(sessionStorage.getItem('baseUrl') + couponManageApi.createCouponBatch, data);
    }

    // 根据id获取优惠券批次详情(get)
    getCouponBatchDetailById(id): Observable<any> {
        return this.http.get(sessionStorage.getItem('baseUrl') + couponManageApi.getCouponBatchDetailById + id);
    }

    // 开关优惠券批次(put)
    closeOpenEnabled(batchNumber, data): Observable<any> {
        return this.http.put(sessionStorage.getItem('baseUrl') + couponManageApi.closeOpenEnabled + batchNumber + '/enabled', data);
    }

    // 获取优惠券批次类型(get)
    toGetBatchTypeList(): Observable<any> {
        return this.http.get(sessionStorage.getItem('baseUrl') + couponManageApi.batchType);
    }

    /******************优惠券规则*****************/
    // 获取优惠券规则列表
    toGetCouponRuleList(page, size, sort, search?, filter?, flag?): Observable<any> {
        let searchApi = '';
        if (flag !== '') {
            searchApi = `?page=${page}&size=${size}&sort=${sort}&query=couponType:${flag}`;
        } else {
            searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
        }
        return this.http.get(sessionStorage.getItem('baseUrl') + couponManageApi.getCouponRuleList + searchApi
            , {observe: 'response'});
    }

    // 新建优惠券规则(post)
    toCreateCouponRule(data): Observable<any> {
        return this.http.post(sessionStorage.getItem('baseUrl') + couponManageApi.createCouponRule, data);
    }

    // 根据id获取优惠券规则详情(get)
    toGetCouponRuleDetailById(id): Observable<any> {
        return this.http.get(sessionStorage.getItem('baseUrl') + couponManageApi.getCouponRuleDetailById + id);
    }

    // 根据id更新优惠券规则(put)
    toUpdateCouponRuleDetailById(id, data): Observable<any> {
        return this.http.put(sessionStorage.getItem('baseUrl') + couponManageApi.updateCouponRuleDetailById + id, data);
    }

    // 优惠券类型(get)
    toGetCouponType(): Observable<any> {
        return this.http.get(sessionStorage.getItem('baseUrl') + couponManageApi.getCouponType);
    }

    // 更新优惠券状态(put)
    toUpdateCouponStatus(id, data): Observable<any> {
        return this.http.put(sessionStorage.getItem('baseUrl') + couponManageApi.updateCouponStatus + id + '/enabled', data);
    }

    /*******优惠券发放*****/
    // 获取优惠券发放列表
    toGetCouponPushList(page, size, sort, search?, filter?): Observable<any> {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter) + `&activityNumber.equals=后台发券`; // query微服务
        return this.http.get(sessionStorage.getItem('baseUrl') + couponManageApi.getCouponList + searchApi
            , {observe: 'response'});
        // let couponName = '';
        // let beginTime = '';
        // let endTime = '';
        // if (search){
        //   search.forEach(item => {
        //     if (item['name'] === 'couponName'){
        //       couponName = '&couponName=' + item['value'];
        //     } else if (item['name'] === 'lastModifiedDate' && item.type === 'date'){
        //       if (item.startDate && !item.endDate) {
        //         beginTime = '&beginTime=' + new Date(item.startDate).toISOString() + '&endTime=2100-08-23T16:00:00.000Z';
        //       } else if (!item.startDate && item.endDate) {
        //         endTime = '&beginTime=2000-08-23T16:00:00.000Z&endTime=' + new Date(item.endDate).toISOString();
        //       } else if (item.startDate && item.endDate){
        //         endTime = '&beginTime=' + new Date(item.startDate).toISOString() + '&endTime=' + new Date(item.endDate).toISOString();
        //       }
        //     }
        //   });
        // }
        // const searchApi = `?page=${page}&size=${size}&sort=${sort}${couponName}${beginTime}${endTime}`;
        // return this.http.get(sessionStorage.getItem('baseUrl') + couponManageApi.getCouponPushList + searchApi
        //     , {observe: 'response'});
    }

    toGiveCoupon(data) {
        return this.http.post(sessionStorage.getItem('baseUrl') + couponManageApi.giveCoupon, data);
    }

    /*********************共用接口***********************/
    // 文件上传接口
    uploadFile(formData): Observable<any> {
        return this.http.post(sessionStorage.getItem('baseUrl') + couponManageApi.fileUpload, formData, {
            responseType: 'text',
            reportProgress: true,
            observe: 'events'
        });
    }

    // 文件预览
    previewFile(saveId): Observable<any> {
        return this.http.get(sessionStorage.getItem('baseUrl') + couponManageApi.preImg + '?saveId=' + saveId, {responseType: 'blob'});
    }

    /************************* 活动列表和活动审核接口 ****************************/
    toExportActivityList(page, size, sort, search?) {
        let searchApi = '';
        if (search && search.length !== 0) {
            const info = search.map(item => {
                if (item['name'] === 'clearBy') {
                    item = 'clearBy.specified=' + item['value'];
                } else if (item['name'] === 'enabled'){
                    item = 'enabled.equals=' + item['value'];
                } else if (item['name'] === 'userId'){
                    item = 'userId.contains=' + item['value'];
                }
                return item;
            }).join('&');
            searchApi = `?page=${page}&size=${size}&sort=${sort}&` + info;
        } else {
            searchApi = `?page=${page}&size=${size}&sort=${sort}`;
        }
        return this.http.get(sessionStorage.getItem('baseUrl') + couponManageApi.exportActivityList + searchApi,
            {observe: 'response', responseType: 'blob'});
    }
    // // 获取活动列表
    // toGetActivityList(page, size, sort, search?, flag?, list?): Observable<any> {
    //   const queryFront = `?page=${page}&size=${size}&sort=${sort}`;
    //   let packageTypeFilter = '';
    //   if (list && list.length !== 0) {
    //     if (list.length === 1){
    //       packageTypeFilter = 'type:(' + list[0] + ' OR string)';
    //     } else {
    //       packageTypeFilter = 'type:(' + list.join(' OR ') + ' OR string)';
    //     }
    //   }
    //   let searchApi;
    //   if (flag === 'activityList') { // 活动列表
    //     if (search && search.length !== 0 && search[0]['name'] === 'reviewResult' && search[0]['value'] === true ) { // 已驳回
    //       searchApi = queryFront + '&query=reviewStatus:true AND ' + packageTypeFilter + ' AND reviewResult:true';
    //     } else if (search && search.length !== 0 && search[0]['name'] === 'reviewResult' && search[0]['value'] === false){ // 已通过
    //       searchApi = queryFront + '&query=reviewStatus:true AND ' + packageTypeFilter + ' AND NOT reviewResult:true'; // reviewResult可能存在null
    //     } else {
    //       searchApi = queryFront + '&query=reviewStatus:true AND ' + packageTypeFilter; // 已审核
    //     }
    //   } else if (flag === 'activityReview'){ // 活动审核
    //     searchApi = queryFront + '&query=NOT reviewStatus:true AND ' + packageTypeFilter; // reviewStatus可能存在null 待审核
    //   }
    //   console.log(sessionStorage.getItem('baseUrl') + couponManageApi.getActivityList + searchApi);
    //   return this.http.get(sessionStorage.getItem('baseUrl') + couponManageApi.getActivityList + searchApi
    //       , {observe: 'response'});
    // }

    // 获取活动列表
    toGetActivityList(page, size, sort, search?, filter?): Observable<any> {
        // const queryFront = `?page=${page}&size=${size}&sort=${sort}`;
        // let searchApi;
        // if (flag === 'activityList') { // 活动列表
        //   searchApi = queryFront + '&reviewStatus.equals=true'; // // reviewStatus为true 已审核
        // } else if (flag === 'activityReview'){ // 活动审核
        //   searchApi = queryFront + '&reviewStatus.equals=false'; // reviewStatus为false 待审核
        // }
        const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter); // query微服务
        console.log(sessionStorage.getItem('baseUrl') + couponManageApi.getActivityList + searchApi);
        return this.http.get(sessionStorage.getItem('baseUrl') + couponManageApi.getActivityList + searchApi
            , {observe: 'response'});
    }

    // 新增套餐(post)
    toCreateActivity(data): Observable<any> {
        return this.http.post(sessionStorage.getItem('baseUrl') + couponManageApi.createActivity, data);
    }

    // 根据id获取套餐详情(get)
    toGetActivityDetailById(id): Observable<any> {
        return this.http.get(sessionStorage.getItem('baseUrl') + couponManageApi.getActivityDetailById + id  + '?withJoinedCount=true');
    }

    // 根据id更新套餐详情(put)
    toUpdateActivityById(id, data): Observable<any> {
        return this.http.put(sessionStorage.getItem('baseUrl') + couponManageApi.updateActivityById + id, data);
    }

    // 获取活动类型活动类型(get)
    toGetActivityTypeList(): Observable<any> {
        return this.http.get(sessionStorage.getItem('baseUrl') + couponManageApi.getActivityTypeList);
    }

    // 活动通过/驳回
    toPassOrRejectActivity(id, data): Observable<any> {
        return this.http.post(sessionStorage.getItem('baseUrl') + couponManageApi.passOrRejectActivity + id + '/review', data);
    }

    // 获取卡等级列表
    searchMemberCardList(): Observable<any> {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.memberLevel, {observe: 'response'});
    }

    getMallList(page, size, sort, search?): Observable<any> {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search);
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.getBasicsMallList + searchApi);
    }

    multiSearchStoreLists(page, size, sort, search?, filter?): Observable<any> {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchBasicsStoreLists + searchApi
        );
    }

    // 获取核销时间类型(get)
    toGetPeriodType(): Observable<any> {
        return this.http.get(sessionStorage.getItem('baseUrl') + couponManageApi.getPeriodType);
    }

    // 多条件查询常旅客列表
    multiSearchMemberLists(page, size, sort, search?): Observable<any> {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search);
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.membersApiList + searchApi
            , {observe: 'response'});
    }

    // 查询商场
    searchMall(page, size, sort, search?, filter?) {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getBasicsMallList + searchApi);
    }

    searchStores(storeId) {
        const searchApi = '?page=0&size=10&sort=lastModifiedDate,desc&storeId.contains=' + storeId;
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + couponManageApi.searchStoreLists + searchApi);
    }
}

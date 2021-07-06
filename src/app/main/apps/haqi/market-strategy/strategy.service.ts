import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../../../environments/environment.hmr';
import {Utils} from '../../../../services/utils';
import {map} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class StrategyService {

    couponRule = 'expenses/api/coupon';


    constructor(
        private http: HttpClient,
        private utils: Utils
    ) {
    }

    // 根据id查询活动
    searchActivityListById(param) {
        return this.http.get(sessionStorage.getItem('baseUrl') +  'expenses/api/activity/' + param, {observe: 'response'});
    }

    // 营销策略列表
    getAllProcesses(page, size, sort, isViewPage, search?) {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search);
        if (isViewPage){
            return this.http.get(sessionStorage.getItem('baseUrl') + environment.processesView + searchApi, {observe: 'response'});
        } else {
            return this.http.get(sessionStorage.getItem('baseUrl') + environment.processes + searchApi + '&auditStatus.in=REVIEWED,REJECT', {observe: 'response'});
        }
    }

    // 创建营销策略
    createProcess(processDTO): Observable<any> {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.processes, processDTO);
    }

    // 更新营销策略
    updateProcess(processDTO): Observable<any> {
        return this.http.put(sessionStorage.getItem('baseUrl') + environment.processes, processDTO);
    }

    // 删除营销策略
    deleteProcess(id) {
        return this.http.delete(sessionStorage.getItem('baseUrl') + environment.processes + '/' + id);
    }

    // 查询营销策略
    getProcess(id) {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.processes + '/' + id);
    }

    // 券规则
    getCouponRuleById(id) {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + this.couponRule + '/' + id);
    }

    // 根据id数组查券规则
    getCoupons(page, size, sort, ids) {
        const searchApi = this.utils.getMultiSearch(page, size, sort);
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getCouponAllList + searchApi + '&id.in=' + ids);
    }

    // 常旅客标签
    getTagById(id): Observable<any> {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.passengersTag + '/' + id);
    }

    // 获取节点参数标签
    getTags(page, size, sort, ids) {
        const searchApi = this.utils.getMultiSearch(page, size, sort);
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.tags + searchApi + '&id.in=' + ids);
    }

    // 获取消息模板详情
    getMsgTemplates(ids) {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.messageTemplateList + '?id.in=' + ids);
    }

    getTemplateById(id) {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.messageTemplateList + '/' + id);
    }

    // 获取引擎可用节点
    getMemberNode() {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getMemberNode);
    }

    // 订单引擎节点
    getOrderNode() {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getOrderNode);
    }

    // 获取会员等级
    getMemberLevels() {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.memberLevel);
    }

    searchStore(page, size, sort, search?, filter?) {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.searchStoreLists + searchApi);
    }

    getMallList(page, size, sort, search? , filter? ): Observable<any> {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
        const url = environment.getMallList;
        return this.http.get(sessionStorage.getItem('baseUrl') + url + searchApi);
    }
}

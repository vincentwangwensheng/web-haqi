import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment.hmr';
import {Observable} from 'rxjs';
import {Utils} from '../utils';
import {CouponEntity} from '../EcouponService/ecoupon-service.service';

@Injectable({
    providedIn: 'root'
})
export class IntegralAdjustmentService {

    constructor(private httpservice: HttpClient,
                private utils: Utils) {
    }

    // 获取商场列表
    toGetMallList() {
        return this.httpservice.get(sessionStorage.getItem('baseUrl') + environment.getMallList + '?enabled.equals=true');
    }

    // 根据商场编号获取商户列表
    getStoreListByMallId(mallId) {
        return this.httpservice.get(sessionStorage.getItem('baseUrl') + environment.searchStoreLists +
            '?page=0&size=0x3f3f3f3f&mallId.contains=' + mallId);
    }

    // 保存积分调整明细
    toSaveAdjustPoint(data) {
        return this.httpservice.post(sessionStorage.getItem('baseUrl') + environment.saveAdjustPoint, data);
    }

    // 会员积分历史清单
    toGetPointHistory(page, size, sort, search?): Observable<any> {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search) + '&type.in=REPLENISH,ADJUST';
        return this.httpservice.get<CouponEntity[]>(sessionStorage.getItem('baseUrl') + environment.getPointHistory + searchApi, {observe: 'response'});
    }

    // 会员积分历史清单中指定的流水单号
    toGetPointHistorySerialNumber(serialNumber): Observable<any> {
        return this.httpservice.get(sessionStorage.getItem('baseUrl') + environment.getPointHistory + '?serialNumber.contains=' + serialNumber, {observe: 'response'});
    }

    // 根据商户编号获取积分规则
    toGetRuleByStoreNo(storeNo) {
        return this.httpservice.get(sessionStorage.getItem('baseUrl') + environment.getRuleByStoreNo + '?storeNo=' + storeNo);
    }

    // 获取积分供应商列表
    getProviderList(): Observable<any> {
        return this.httpservice.get<any>(sessionStorage.getItem('baseUrl') + environment.getMemberListPoint );
    }

}

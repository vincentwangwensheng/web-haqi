import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Utils} from '../../../../services/utils';
import {CouponListApi} from './coupon-list.api';

@Injectable({
    providedIn: 'root'
})
export class CouponListService {

    constructor(private http: HttpClient,
                private utils: Utils) {
    }

    searchCouponList(page, size, sort, search?, filter?) {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
        return this.http.get(sessionStorage.getItem('baseUrl') + CouponListApi.searchCoupon + searchApi, {observe: 'response'});
    }

    getCouponType() {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + CouponListApi.getCouponType);
    }
}

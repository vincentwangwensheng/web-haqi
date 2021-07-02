import {Injectable} from '@angular/core';
import {Utils} from '../../../services/utils';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment.hmr';

@Injectable({
    providedIn: 'root'
})
export class BusinessForecastService {

    constructor(private utils: Utils,
                private http: HttpClient) {
    }

    // 查询活动
    getActivities(page, size, sort, search?, filter?) {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.searchMarketingManageList + searchApi);
    }

    getSaikuData(param) {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=' + param);
    }

    // 分组活动下获取券
    getCouponGroups(page, size, sort, search?, filter?) {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.createCouponGroupsData + searchApi);
    }
}

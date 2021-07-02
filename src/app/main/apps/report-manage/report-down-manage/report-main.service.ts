import {Injectable} from '@angular/core';
import {Utils} from '../../../../services/utils';
import {HttpClient} from '@angular/common/http';
import {ReportIn} from './AllReportSource/base/interImpl/reportIn';
import {ReportMain} from './ReportMain';



@Injectable({
    providedIn: 'root'
})
export class ReportMainService implements  ReportIn{

    constructor(
        private http: HttpClient,
        private utils: Utils
    ) {
    }


    createData(data) {
    }

    delData(id) {
    }

    getDataById(id) {
    }

    getDataList(page, size, sort, search?, filter?) {
    }

    getDataListOther(page, size, sort, search?, filter?, type? , itemIds?) {
        if (!filter) {
            filter = [{name: 'enabled', value: true}];
        }
        let searchApi: any;
        const url = this.getUrl(type);
        const type_s = type.split('_');
        if (type_s[0] !== 'es') {
            searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
        } else {
            if ('es_project' === type){
                // 查询项目列表， 添加权限筛选
                if (itemIds.length === 1 ) {
                    filter = [{name: 'id', value: itemIds[0]}];
                } else if (itemIds.length > 1) {
                    const value = [];
                    itemIds.forEach( id => {
                        const v_ =  '"' + id + '"';
                        value.push(v_);
                    });
                    const search_v = this.ArrayToStr(value);
                    const filter_value = '(' + search_v + ')';
                    filter = [{name: 'id', value: filter_value}];
                }
            }
            searchApi = this.utils.getELMultiSearch(page, size, sort, search, filter);
        }
        return this.http.get(sessionStorage.getItem('baseUrl') + url + searchApi, {observe: 'response'});
    }

    updateData(data) {
    }



    getUrl(key){
        // type 需要添加一个前缀。 如果从es 中拿就是 es_  如果不是从es中拿就是 notEs_
        const map = new Map([
            ['notEs_memberBirthday' , ReportMain.memberBirthday], // 会员生日报表
            ['notEs_memberConsume' , ReportMain.memberConsume], // 会员消费明细报表
            ['notEs_memberException' , ReportMain.memberException], // 会员积分异常报表
            ['notEs_memberReplenish' , ReportMain.memberReplenish],  // 会员积分补录报表
            ['five' , ReportMain.five],  // 5
        ]);
        return map.get(key) ? map.get(key) : ReportMain.siteList;
    }

    // 导出
    dataTemplateExport(page, size, sort, search?, filter?, type?) {
        const url = this.getExportUrl(type);
        const searchApi = this.utils.getELMultiSearch(page, size, sort, search, filter);
        return this.http.get(sessionStorage.getItem('baseUrl') + url + searchApi,
            {responseType: 'blob' , reportProgress: true, observe: 'events'});
    }


    getExportUrl(key){
        const map = new Map([
            ['oneExport' , ReportMain.oneExport], //
            ['twoExport' , ReportMain.twoExport], //
            ['threeExport' , ReportMain.threeExport], //
            ['fourExport' , ReportMain.fourExport], //
            ['fiveExport' , ReportMain.fiveExport], //
        ]);
        return map.get(key) ? map.get(key) : '';
    }


    // 登陆成功后获取用户权限
    getUserAuth(username){
        return this.http.get<any>(sessionStorage.getItem('baseUrl') +  ReportMain.getAuth + username);
    }


    ArrayToStr(arr , filed? ,  separator?){
        if (arr.length > 0){
            const result =   arr.map( a_a => {
                if (filed) {
                    return a_a[filed];
                } else {
                    return a_a;
                }
            }).join( (separator ? separator : ','));
            return result;
        }
    }

    getBlocList() {
        const searchApi = this.utils.getELMultiSearch(0, 0x3f3f3f3f, 'id,desc', null, null);
        return this.http.get<any>(sessionStorage.getItem('baseUrl') +  ReportMain.getBlocList + searchApi);
    }

    getMallList() {
        const searchApi = this.utils.getELMultiSearch(0, 0x3f3f3f3f, 'id,desc', null, null);
        return this.http.get<any>(sessionStorage.getItem('baseUrl') +  ReportMain.getMallList + searchApi);
    }

    getMouthList(){
        const mouth = [
            {value: 1 , CNValue: '一月'},
            {value: 2 , CNValue: '二月'},
            {value: 3 , CNValue: '三月'},
            {value: 4 , CNValue: '四月'},
            {value: 5 , CNValue: '五月'},
            {value: 6 , CNValue: '六月'},
            {value: 7 , CNValue: '七月'},
            {value: 8 , CNValue: '八月'},
            {value: 9 , CNValue: '九月'},
            {value: 10 , CNValue: '十月'},
            {value: 11 , CNValue: '十一月'},
            {value: 12 , CNValue: '十二月'},
        ];
        return mouth;
    }
}

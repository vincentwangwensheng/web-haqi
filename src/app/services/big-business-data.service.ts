import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment.hmr';

@Injectable({
    providedIn: 'root'
})
export class BigBusinessDataService {

    constructor(public http: HttpClient) {
    }

    // 获取销售额业态占比数据
    searchSalesRatioData() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=itemcatdescisalesbylastmonth_bcia');
    }

    // 获取支付方式占比数据
    searchPaymentMethod() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=tendersales_bcia');
    }

    // 业态客单价分析
    searchUnitPrice() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=itemcatdescipersales_bcia');
    }

    // 零售品牌TOP5
    searchBrandRank() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=brandsales_bcia');
    }

    // 常旅客年龄层
    searchPassengersAge() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=vipagegroupcount_bcia');
    }

    // 常旅客性别比
    searchPassengersSexRatio() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=vipsexcount_bcia');
    }

    // 会员贡献
    searchMembersContribute() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=allvipsales_bcia');
    }

    // 常旅客会员
    searchPassengersMembers() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=allvipcount_bcia');
    }

    // 销售额
    searchSalesCount() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=allsales_bcia');
    }

    // 销售额业态占比月
    searchSalesCountByMouth() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=itemcatdescisalesbylastmonth_bcia');
    }


    // 获取常旅客总量
    searchPassengersCount() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=flightdatabylastmonth_bcia');
    }

    // 获取常旅客总量(折线图)
    searchPassengersCountData() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=newvipcountbyleiji_bcia', {observe: 'response'});
    }

    // 获取常旅客贡献数据
    searchPassengersContribute() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=vipsalesbymonth_bcia');
    }

    // 获取活跃常旅客数据
    searchActivePassengers() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=activevipcountbydate_bcia');
    }

    // 获取会员性别比数据
    searchSexRatio() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=vipsexcount_bcia');
    }

    // 获取品牌偏好数据
    searchBrandPreference() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=branddoccount_bcia');
    }

    // 获取常旅客增长曲线
    searchPassengerGrowthCurve() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=addnewvipcountbydlastmonth_bcia');
    }

    // 获取常旅客增长数据
    serchPassengersGrowth() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=newvipcount_bcia');
    }

    // 获取常旅客等级结构
    searchPassengersRank() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=vipgradecount_bcia');
    }

    // 获取常旅客贡献数据
    searchPassengersContribution() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=vipsalesbylastmonth_bcia');
    }

    // 获取活跃常旅客数据
    searchActivePassnegers() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=activevipcountbylastmonth_bcia');
    }

    // 获取商业数据总销售金额
    searchSalesCountData() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=storesalesbylastmonth_bcia');
    }

    // 综合客单价
    searchUnitPriceData() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=storekedanjiabylastmonth_bcia');
    }

    // 销售金额柱状图 按天
    searchSalesChartCount() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=storesalesbydate_bcia');
    }

    // 销售金额柱状图 按周
    searchSalesChartCountByWeek() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=allsalesbyweek_bcia');
    }


    // 旅客总量折线图
    searchPassengerCountChart() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=flightdatabydate_bcia');
    }

    // 综合客单价折线图  按天
    searchIntegratedUnitPrice() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=kedanjiabydate_bcia');
    }

    // 综合客单价折线图 按周
    searchIntegratedUnitPriceByWeek() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=allkdjbyweek_bcia');
    }

    // 销售额占比饼图
    searchSalesRatio() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=itemcatdescisales_bcia');
    }

    // 旅客量饼图
    searchPassengersVolume() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=flightdatabyday_bcia');
    }

    // 销售额分时统计折线图
    searchTimeSharingSales() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=allsalesbyhour_bcia');
    }

    // 客单价按年月统计12个月数据
    searchPassengersUnitPriceYear() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=kedanjiabydate_bcia');
    }

    // 客单价与提袋率中提袋率
    searchBaggingRateWithPrice() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=itemcatdesbaggingrate_bcia');
    }

    // 提袋率数据
    searchBaggingRate() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=flightbaggingrate_bcia');
    }

    // 会员增长曲线天数据
    searchMembersGrowthDays() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=addnewvipcountbydate');
    }

    // 会员增长曲线月数据
    searchMembersGrowthMonth() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=adaddnewvipcountbymonth');
    }

    // 会员增长曲线年数据
    searchMembersGrowthYear() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=addnewvipcountbyyear');
    }

    // 店铺排行
    SearchShopRankBySaiku() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=salesrank_bcia');
    }

    // 综合提袋率 按周  直接从saiku获取
    getsearchComprehensiveBaggingRateBySaiku(){
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=allbaggingbyweek_bcia');
    }

    // 获取综合提袋率的单个提袋率
    getsearchComprehensiveBaggingRate_S(){
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=baggingratebylastmonth_bcia');
    }

    // 获取会员贡献率
    getMembersContribute() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=vipsalesratebydate_bcia');
    }

    // 销售金额曲线月查询
    getSalesCountMonth(){
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=storesalesbylastmonth12_bcia');
    }

    // 销售金额曲线年查询
    getSalesCountYear(){
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=storesalesbylastyear2_bcia');
    }
    // 客单价月数据
    getUnitPriceMonth(){
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=storekdjbylastmonth12_bcia');
    }

    // 客单价年数据
    getUnitPriceYear(){
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=storekdjbylastyear2_bcia');
    }
    // 提袋率月数据
    getComprehensiveBaggingRateMonth(){
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=baggingratelastmonth12_bcia');
    }
    // 提袋率年数据
    getComprehensiveBaggingRateYear(){
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=baggingratelastyear2_bcia');
    }

    // 获取经营情况列表
    getOperationalSituation(){
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=itemcatdescisalebyweek_bcia');
    }

    // saiku接口
    getSaikuData(args){
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchSaikuData, {observe: 'response', params: {param: args}});
    }

    // 获取时间标题
    getTimeTitle(){
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.getServersLastMonth, {observe: 'response'});
    }


    // 获取常旅客画像
    getMemberProfile(para){
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getMemberProfile + '?activityId=' + para );
    }
}


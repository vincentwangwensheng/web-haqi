import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {dashboardApi} from './dashboard.api';
import {ReportMain} from '../report-manage/report-down-manage/ReportMain';
import {Utils} from '../../../services/utils';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(
      private http: HttpClient,
      private utils: Utils
  ) { }

  /********************** 小程序统计 ***********************/
  // 柱状图：访问人户，新增用户，老用户
  getAppletUserInfo() {
    return this.http.get(sessionStorage.getItem('baseUrl') + dashboardApi.appletUserInfo);
  }

  // 小程序统计--图表趋势(复用):访问人户，访问次数，访问时长
  getAppletChartLine(metrics, startDate, endDate) {
    return this.http.get(sessionStorage.getItem('baseUrl') + dashboardApi.appletChartLine + `?metrics=${metrics}&startDate=${startDate}&endDate=${endDate}`);
  }

  // 小程序统计--用户活跃(日、周)
  getAppletChartActive(metrics, startDate, endDate) {
    return this.http.get(sessionStorage.getItem('baseUrl') + dashboardApi.appletChartActive + `?metrics=${metrics}&startDate=${startDate}&endDate=${endDate}`);
  }

  // 小程序统计--终端统计
  getAppletTerminal(metrics, startDate, endDate) {
    return this.http.get(sessionStorage.getItem('baseUrl') + dashboardApi.appletTerminal + `?metrics=${metrics}&startDate=${startDate}&endDate=${endDate}`);
  }

  /********************** 会员统计 ***********************/
  // 会员累计+销售+活跃
  getMemberTotalSalesActivity(mallId) {
    return this.http.get(sessionStorage.getItem('baseUrl') + dashboardApi.memberTotalSalesActivity + `?mallId=${mallId}`);
  }

  // 会员组成性别占比+等级结构
  getMemberRolePercent(mallId) {
    return this.http.get(sessionStorage.getItem('baseUrl') + dashboardApi.memberRolePercent + `?mallId=${mallId}`);
  }

  // 会员注册人数
  getMemberRegister(mallId, startTime, endTime) {
    return this.http.get(sessionStorage.getItem('baseUrl') + dashboardApi.memberRegister + `?mallId=${mallId}&startTime=${startTime}&endTime=${endTime}`);
  }

  // 会员价值+会员年龄
  getMemberTagAge(firstLevel, secondLevel, mallId) {
    return this.http.get(sessionStorage.getItem('baseUrl') + dashboardApi.memberTagAge + `?firstLevel=${firstLevel}&secondLevel=${secondLevel}&mallId=${mallId}`);
  }

  // 获取商场列表
  getMallList() {
    const searchApi = this.utils.getELMultiSearch(0, 0x3f3f3f3f, 'id,desc', null, null);
    return this.http.get<any>(sessionStorage.getItem('baseUrl') +  ReportMain.getMallList + searchApi);
  }
}

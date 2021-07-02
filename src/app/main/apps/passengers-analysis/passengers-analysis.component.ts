import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NgZone} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {DatePipe} from '@angular/common';
import {SidebarService} from '../../../../@fuse/components/sidebar/sidebar.service';
import {DateTransformPipe} from '../../../pipes/date-transform/date-transform.pipe';
import {DashboardService} from './dashboard.service';

@Component({
    selector: 'app-passengers-analysis',
    templateUrl: './passengers-analysis.component.html',
    styleUrls: ['./passengers-analysis.component.scss']
})
export class PassengersAnalysisComponent implements OnInit, OnDestroy {
    eCharts: any;
    allEChart: AllMemberECharts;
    mallList = [];
    mallId = '';
    // 会员累计-柱状
    @ViewChild('memberTotalEle', {static: true})
    memberTotalEle: ElementRef;
    memberTotalNumber = 0;
    // 会员销售-柱状
    @ViewChild('memberSalesEle', {static: true})
    memberSalesEle: ElementRef;
    memberSale = 0;
    // 会员活跃-柱状
    @ViewChild('memberActivityEle', {static: true})
    memberActivityEle: ElementRef;
    memberActivity = 0;

    // 性别占比
    @ViewChild('rolePercentEle', {static: true})
    rolePercentEle: ElementRef;
    // 等级结构
    @ViewChild('gradeOrganizationEle', {static: true})
    gradeOrganizationEle: ElementRef;

    // 会员年龄结构
    @ViewChild('memberAgeEle', {static: true})
    memberAgeEle: ElementRef;
    // 会员价值
    @ViewChild('memberValueEle', {static: true})
    memberValueEle: ElementRef;

    // 注册人数-折线
    @ViewChild('registerNumberLineEle', {static: true})
    registerNumberLineEle: ElementRef;
    visitPersonIndex = 6;
    visitPersonForm: FormGroup; // 注册人数-折线(时间选择)

    // 日期选择
    configStartTime: any;
    configEndTime: any;

    constructor(
        private zone: NgZone,
        private datePipe: DatePipe,
        private sidebarService: SidebarService,
        private dateTransformPipe: DateTransformPipe,
        private dashboardService: DashboardService,
    ){
        this.visitPersonForm = new FormGroup({
            beginTime: new FormControl('', Validators.required),
            endTime: new FormControl('', Validators.required),
        });
    }

    ngOnInit(): void {
        this.initECharts();
        this.initTimeConfig();
        this.dashboardService.getMallList().subscribe(res => {
            if (res){
                this.mallList = res['content'];
                if (this.mallList.length !== 0){
                    this.mallId = this.mallList[0]['mallId'];
                    this.getEChartDetail();
                }
            }
        });

    }

    mallChange() {
        this.getEChartDetail();
    }

    getEChartDetail(){
        this.getPersonNumberChange(); // 柱状图：访问人户，新增用户，老用户
        this.getMemberRolePercentPort(); // 性别占比+等级结构
        this.getPersonNumberChangeLine('user_count', 'days', 6);  // 访问人数-折线
        this.getMemberTagAgePort(); // 会员年龄结构 + 会员价值
    }

    /************************* 柱状图：会员累计，会员销售，会员活跃 ***************************/
    getPersonNumberChange() {
        this.dashboardService.getMemberTotalSalesActivity(this.mallId).subscribe(res => {
            if (res) {
                setTimeout(() => {
                    this.getPersonNumberChangeChart(res);
                }, 100);
            }
        });
    }

    getPersonNumberChangeChart(res) {
        this.zone.runOutsideAngular(() => {
            this.allEChart.memberTotal = this.eCharts.init(this.memberTotalEle.nativeElement);
            this.allEChart.memberSales = this.eCharts.init(this.memberSalesEle.nativeElement);
            this.allEChart.memberActivity = this.eCharts.init(this.memberActivityEle.nativeElement);
        });
        const option = {
            color: ['#3398DB'],
            title: {
                show: false
            },
            tooltip : {
                trigger: 'axis',
                axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                    type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                }
            },
            grid: {
                left: '12px',
                right: '12px',
                bottom: '18px',
                top: '2px',
                containLabel: false
            },
            xAxis : [
                {
                    type : 'category',
                    data: [],
                    show: false
                }
            ],
            yAxis : [{
                type : 'value',
                show: false
            }],
            series : [
                {
                    name: '总人数',
                    type: 'bar',
                    barWidth: '60%',
                    data:  [],
                }
            ]
        };
        // 会员累计
        const monthCountVMS = JSON.parse(JSON.stringify(option));
        monthCountVMS['xAxis'][0]['data'] = res['monthCountVMS'].reverse().map(item => item['date']);
        monthCountVMS['series'][0]['data'] = res['monthCountVMS'].reverse().map(item => Number(item['count']));
        monthCountVMS['series'][0]['name'] = '总人数';
        this.memberTotalNumber = res['monthCountVMS'].reverse()[res['monthCountVMS'].length - 1]['count'];
        // 会员销售
        const countVMS = JSON.parse(JSON.stringify(option));
        countVMS['xAxis'][0]['data'] = res['countVMS'].reverse().map(item => item['date']);
        countVMS['series'][0]['data'] = res['countVMS'].reverse().map(item => Number(item['count']));
        countVMS['series'][0]['name'] = '总金额';
        this.memberSale = res['countVMS'].reverse()[res['countVMS'].length - 1]['count'];
        // 会员活跃
        const saleVMS = JSON.parse(JSON.stringify(option));
        saleVMS['xAxis'][0]['data'] = res['saleVMS'].reverse().map(item => item['date']);
        saleVMS['series'][0]['data'] = res['saleVMS'].reverse().map(item => Number(item['amount'] ? item['amount'] : 0));
        saleVMS['series'][0]['name'] = '总次数';
        this.memberActivity = res['saleVMS'].reverse()[res['saleVMS'].length - 1]['count'];
        setTimeout(() => {
            this.zone.runOutsideAngular(() => {
                this.allEChart.memberTotal.setOption(monthCountVMS);
                this.allEChart.memberSales.setOption(countVMS);
                this.allEChart.memberActivity.setOption(saleVMS);
            });
        }, 100);
    }

    /************************* 性别占比+等级结构 ***************************/
    getMemberRolePercentPort(){
        this.dashboardService.getMemberRolePercent(this.mallId).subscribe(res => {
            if (res) {
                setTimeout(() => {
                    this.toGetMemberRolePercent(res);
                }, 100);
            }
        });
    }

    toGetMemberRolePercent(res){
        this.zone.runOutsideAngular(() => {
            this.allEChart.rolePercent = this.eCharts.init(this.rolePercentEle.nativeElement);
            this.allEChart.gradeOrganization = this.eCharts.init(this.gradeOrganizationEle.nativeElement);
        });
        // 性别数据
        const roleDate = [{value: res['gender']['男'], name: '男'}, {value: res['gender']['女'], name: '女'}];
        const rolePercentOption = {
            color: ['#5B8FF9', '#FFD9D9'],
            tooltip : {
                trigger: 'item',
                formatter: '{a} <br/>{b} : {c} ({d}%)'
            },
            legend: {
                orient: 'horizontal',
                bottom: 0,
                formatter: function(name) {
                    // 获取legend显示内容
                    const data = rolePercentOption.series[0].data;
                    let total = 0;
                    let tarValue = 0;
                    for (let i = 0, l = data.length; i < l; i++) {
                        total += data[i].value;
                        if (data[i].name === name) {
                            tarValue = data[i].value;
                        }
                    }
                    const p = (tarValue / total * 100).toFixed(2);
                    return name + ' ' + ' ' + p + '%';
                },
                data: ['男', '女']
            },
            series : [
                {
                    name: '人数(人)',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['50%', '42%'],
                    data: roleDate,
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
        const gradeOrganizationData = [];
        const keyList = [];
        // tslint:disable-next-line:forin
        for (const key in res['level']) {
            gradeOrganizationData.push({value: res['level'][key], name: key});
            keyList.push(key);
        }
        const gradeOrganizationOption = {
            tooltip : {
                trigger: 'item',
                formatter: '{a} <br/>{b} : {c} ({d}%)'
            },
            legend: {
                orient: 'horizontal',
                bottom: 0,
                itemWidth: 16,
                formatter: function(name) {
                    // 获取legend显示内容
                    const data = gradeOrganizationOption.series[0].data;
                    let total = 0;
                    let tarValue = 0;
                    for (let i = 0, l = data.length; i < l; i++) {
                        total += data[i].value;
                        if (data[i].name === name) {
                            tarValue = data[i].value;
                        }
                    }
                    const p = (tarValue / total * 100).toFixed(2);
                    return name + ' ' + ' ' + p + '%';
                },
                data: keyList
            },
            series : [
                {
                    name: '等级',
                    type: 'pie',
                    radius : '55%',
                    center: ['50%', '42%'],
                    data: gradeOrganizationData,
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
        this.zone.runOutsideAngular(() => {
            this.allEChart.rolePercent.setOption(rolePercentOption);
            this.allEChart.gradeOrganization.setOption(gradeOrganizationOption);
        });
    }

    /************************* 图表趋势(复用)-折线图:注册人数 ***************************/
    getPersonNumberChangeLine(flag, timeType, start, end?) {
        // 访问人数
        let startDate = '';
        let endDate = '';
        if (timeType === 'days'){
            startDate = this.dateTransformPipe.getBeforeDate(start).substring(0, 8) + '000000'; // 20210101000000
            this.visitPersonIndex = start;
            this.visitPersonForm.reset();
        } else {
            startDate = start;
        }
        end ? endDate = end : endDate = this.datePipe.transform(new Date(), 'yyyyMMddHHmmss').substring(0, 10) + '5959'; // 20210129155959
        this.dashboardService.getMemberRegister(this.mallId, startDate, endDate).subscribe(res => {
            if (res) {
                setTimeout(() => {
                    this.getPersonNumberChangeChartLine(res, flag);
                }, 100);
            }
        });
    }

    getPersonNumberChangeChartLine(res, flag) {
        const option = {
            color: ['#3398DB'],
            xAxis: {
                type: 'category',
                data: []
            },
            yAxis: {
                name: '',
                type : 'value',
                show: true,
                nameGap: 10,
                axisLabel: {}
            },
            tooltip : {
                trigger: 'axis',
                axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                    type : 'line'        // 默认为直线，可选为：'line' | 'shadow'
                }
            },
            grid: {
                left: '36px',
                right: '24px',
                bottom: '24px',
                top: '42px',
                containLabel: true
            },
            series: [{
                name: '',
                data: [],
                type: 'line'
            }]
        };
        if (flag === 'user_count'){ // 访问人数-折线
            this.zone.runOutsideAngular(() => {
                this.allEChart.registerNumber = this.eCharts.init(this.registerNumberLineEle.nativeElement);
            });
            const userCount = JSON.parse(JSON.stringify(option));
            console.log('res:', res);
            userCount['xAxis']['data'] = res.map(item => item['days']);
            userCount['series'][0]['data'] = res.map(item => Number(item['counts']));
            userCount['series'][0]['name'] = '总人数';
            userCount['yAxis']['name'] = '人数(人)';
            const yAsixTitle = this.checkDateSalesRange(res);
            userCount['yAxis']['axisLabel'] = yAsixTitle;
            this.zone.runOutsideAngular(() => {
                this.allEChart.registerNumber.setOption(userCount);
            });
        }
    }

    // 判断访问人数是否大于一千人
    checkDateSalesRange(res): any {
        let flag = false;
        res.forEach((item => {
            if (Math.abs(Number(item['data'])) > 1000) {
                flag = true;
            }
        }));
        let yAsixTitle;
        if (flag) {
            yAsixTitle = {
                formatter: function (value) {
                    return (Number(value) / 1000).toFixed(1) + 'K';
                }
            };
        } else {
            yAsixTitle = {};
        }
        return yAsixTitle;
    }

    /************************* 会员年龄结构 + 会员价值 ***************************/
    getMemberTagAgePort(){
        this.dashboardService.getMemberTagAge('事实', '年龄', this.mallId).subscribe(res => {
            if (res) {
                setTimeout(() => {
                    this.toGetMemberTagAge(res);
                }, 100);
            }
        });
        this.dashboardService.getMemberTagAge('模型', '会员价值', this.mallId).subscribe(ref => {
            if (ref) {
                setTimeout(() => {
                    this.toGetMemberValue(ref);
                }, 100);
            }
        });
    }

    // 会员年龄结构
    toGetMemberTagAge(res) {
        this.zone.runOutsideAngular(() => {
            this.allEChart.memberAge = this.eCharts.init(this.memberAgeEle.nativeElement);
        });
        const memberAgeData = [];
        const memberAgeList = [];
        res.forEach(item => {
            memberAgeData.push({value: item['memberTotal'], name: item['tagName']});
            memberAgeList.push(item['tagName']);
        });
        const memberAgeOption = {
            tooltip : {
                trigger: 'item',
                formatter: '{a} <br/>{b} : {c} ({d}%)'
            },
            legend: {
                orient: 'vertical',
                right: 0,
                formatter: function(name) {
                    const data = memberAgeOption.series[0].data;
                    let total = 0;
                    let tarValue = 0;
                    for (let i = 0, l = data.length; i < l; i++) {
                        total += data[i].value;
                        if (data[i].name === name) {
                            tarValue = data[i].value;
                        }
                    }
                    const p = (tarValue / total * 100).toFixed(2);
                    return name + ' ' + ' ' + p + '%';
                },
                data: memberAgeList
            },
            series : [
                {
                    name: '年龄结构',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['40%', '50%'],
                    data: memberAgeData,
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
        this.zone.runOutsideAngular(() => {
            this.allEChart.memberAge.setOption(memberAgeOption);
        });
    }

    // 会员价值
    toGetMemberValue(ref) {
        this.zone.runOutsideAngular(() => {
            this.allEChart.memberValue = this.eCharts.init(this.memberValueEle.nativeElement);
        });
        // 性别数据
        const memberValueData = [];
        const memberValueList = [];
        ref.forEach(item => {
            memberValueData.push({value: item['memberTotal'], name: item['tagName']});
            memberValueList.push(item['tagName']);
        });
        const memberValueOption = {
            tooltip : {
                trigger: 'item',
                formatter: '{a} <br/>{b} : {c} ({d}%)'
            },
            legend: {
                orient: 'vertical',
                right: 0,
                formatter: function(name) {
                    const data = memberValueOption.series[0].data;
                    let total = 0;
                    let tarValue = 0;
                    for (let i = 0, l = data.length; i < l; i++) {
                        total += data[i].value;
                        if (data[i].name === name) {
                            tarValue = data[i].value;
                        }
                    }
                    const p = (tarValue / total * 100).toFixed(2);
                    return name + ' ' + ' ' + p + '%';
                },
                data: memberValueList
            },
            series : [
                {
                    name: '年龄结构',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['40%', '50%'],
                    data: memberValueData,
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
        this.zone.runOutsideAngular(() => {
            this.allEChart.memberValue.setOption(memberValueOption);
        });
    }

    /***********日期选择************/
    initTimeConfig() {
        this.configStartTime = {
            enableTime: false,
            time_24hr: false,
            enableSeconds: false,
            defaultHour: '0',
            defaultMinute: '0',
            defaultSeconds: '0'
        };
        this.configEndTime = {
            enableTime: false,
            time_24hr: false,
            enableSeconds: false,
            defaultHour: '23',
            defaultMinute: '59',
            defaultSeconds: '59'
        };
    }

    // 访问人数时间变化
    onSourceDate1(e, endTime, startTime, p) {
        if (p === 'startTime') {
            e.setHours(23);
            e.setMinutes(59);
            e.setSeconds(59);
        }
        'startTime' === p ? endTime.picker.set('minDate', e) : startTime.picker.set('maxDate', e);
        setTimeout(() => {
            if (this.visitPersonForm.valid){
                const start = this.datePipe.transform(new Date(this.visitPersonForm.get('beginTime').value), 'yyyyMMddHHmmss');
                const end = this.datePipe.transform(new Date(this.visitPersonForm.get('endTime').value), 'yyyyMMddHHmmss');
                this.getPersonNumberChangeLine('user_count', 'string', start, end);
            }
        }, 100);
    }

    initECharts() {
        this.allEChart = new AllMemberECharts();
        this.zone.runOutsideAngular(() => {
            this.eCharts = require('echarts');
        });
        // windows窗口改变时触发echart自适应
        window.addEventListener('resize', () => {
            setTimeout(() => {
                for (const key in this.allEChart) {
                    if (this.allEChart[key] && !this.allEChart[key].isDisposed()){
                        this.allEChart[key].resize();
                    }
                }
            }, 500);
        });
        // 功能菜单收缩但windows窗口未改变时触发echart自适应
        this.sidebarService.sideObservable.subscribe(res => {
            setTimeout(() => {
                for (const key in this.allEChart) {
                    if (this.allEChart[key] && !this.allEChart[key].isDisposed()){
                        this.allEChart[key].resize();
                    }
                }
            });
        });
    }

    ngOnDestroy(): void {
        for (const key in this.allEChart) {
            if (this.allEChart[key]){
                this.allEChart[key].dispose();
            }
        }
    }


}

export class AllMemberECharts {
    memberTotal: any; // 会员累计-柱状
    memberSales: any; // 会员销售-柱状
    memberActivity: any; // 会员活跃-柱状
    rolePercent: any; // 性别占比
    gradeOrganization: any; // 等级结构
    registerNumber: any; // 注册人数-折线
    memberAge: any; // 会员年龄结构
    memberValue: any; // 会员价值
}

// const opts = {
//     lines: 8,
//     length: 8,
//     width: 4,
//     radius: 6,
//     scale: 0.8,
//     corners: 1,
//     speed: 1,
//     rotate: 0,
//     animation: 'spinner-line-fade-default',
//     direction: 1,
//     color: '#23a6e5',
//     fadeColor: 'transparent',
//     top: '50%',
//     left: '50%',
//     shadow: '0 0 1px transparent',
//     zIndex: 2000000000,
//     className: 'spinner',
//     position: 'absolute',
// };
// this.Spinner = new Spinner(opts);

import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NgZone} from '@angular/core';
import {DashboardService} from '../dashboard.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {DatePipe} from '@angular/common';
import {SidebarService} from '../../../../../@fuse/components/sidebar/sidebar.service';
import {DateTransformPipe} from '../../../../pipes/date-transform/date-transform.pipe';

@Component({
    selector: 'app-business-data-analysis',
    templateUrl: './business-data-analysis.component.html',
    styleUrls: ['./business-data-analysis.component.scss']
})
export class BusinessDataAnalysisComponent implements OnInit, OnDestroy {
    eCharts: any;
    allEChart: AllHomeECharts;
    appletUserInfo: any; // 访问人数+新增访问+老用户
    // 访问人数-柱状
    @ViewChild('visitPersonNumberEle', {static: true})
    visitPersonNumberEle: ElementRef;
    // 新增访问-柱状
    @ViewChild('addVisitPersonNumberEle', {static: true})
    addVisitPersonNumberEle: ElementRef;
    // 老用户-柱状
    @ViewChild('oldVisitPersonNumberEle', {static: true})
    oldVisitPersonNumberEle: ElementRef;

    // 访问人数-折线
    @ViewChild('visitPersonNumberLineEle', {static: true})
    visitPersonNumberLineEle: ElementRef;
    // 访问次数-折线
    @ViewChild('visitNumberLineEle', {static: true})
    visitNumberLineEle: ElementRef;
    // 访问时长-折线
    @ViewChild('visitTimeLineEle', {static: true})
    visitTimeLineEle: ElementRef;
    visitPersonIndex = 6;
    visitNumberIndex = 6;
    visitTimeIndex = 6;
    visitPersonForm: FormGroup; // 访问人数-折线(时间选择)
    visitNumberForm: FormGroup; // 访问次数-折线(时间选择)
    visitTimeForm: FormGroup; // 访问时长-折线(时间选择)

    // 用户活跃-天
    @ViewChild('personActivityDAUEle', {static: true})
    personActivityDAUEle: ElementRef;
    activityDayNumber = 0;
    // 用户活跃-周
    @ViewChild('personActivityWAUEle', {static: true})
    personActivityWAUEle: ElementRef;
    activityWeekNumber = 0;
    nowDate = null;

    terminalList = []; // 终端型号

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
        this.visitNumberForm = new FormGroup({
            beginTime: new FormControl('', Validators.required),
            endTime: new FormControl('', Validators.required),
        });
        this.visitTimeForm = new FormGroup({
            beginTime: new FormControl('', Validators.required),
            endTime: new FormControl('', Validators.required),
        });
    }


    ngOnInit(): void {
        this.initECharts();
        this.initTimeConfig();
        this.getPersonNumberChange();
        this.getPersonNumberChangeLine('user_count', 'days', 6);  // 访问人数-折线
        this.getPersonNumberChangeLine('session_count', 'days', 6);  // 访问次数-折线
        this.getPersonNumberChangeLine('session_time_per_person', 'days', 6);  // 访问时长-折线
        this.nowDate = new Date();
        this.getActivityChangeLine('day_month_activity_degree', 7); // 用户活跃-日
        this.getActivityChangeLine('weekly_activity_degree', 30); // 用户活跃-周
        this.toGetAppletTerminal(); // 小程序统计--终端统计
    }

    /************************* 柱状图：访问人户，新增用户，老用户 ***************************/
    getPersonNumberChange() {
        this.dashboardService.getAppletUserInfo().subscribe(res => {
            if (res) {
                this.appletUserInfo = res;
                setTimeout(() => {
                    this.getPersonNumberChangeChart(res);
                }, 100);
            }
        });
    }

    getPersonNumberChangeChart(res) {
        this.zone.runOutsideAngular(() => {
            this.allEChart.visitPersonNumber = this.eCharts.init(this.visitPersonNumberEle.nativeElement);
            this.allEChart.addVisitPersonNumber = this.eCharts.init(this.addVisitPersonNumberEle.nativeElement);
            this.allEChart.oldVisitPersonNumber = this.eCharts.init(this.oldVisitPersonNumberEle.nativeElement);
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
        // 访问人数
        const userCounts = JSON.parse(JSON.stringify(option));
        userCounts['xAxis'][0]['data'] = res['userCounts'].reverse().map(item => item['day']);
        userCounts['series'][0]['data'] = res['userCounts'].reverse().map(item => Number(item['data']));
        userCounts['series'][0]['name'] = '总人数';
        // 新增访问
        const newCounts = JSON.parse(JSON.stringify(option));
        newCounts['xAxis'][0]['data'] = res['newCounts'].reverse().map(item => item['day']);
        newCounts['series'][0]['data'] = res['newCounts'].reverse().map(item => Number(item['data']));
        newCounts['series'][0]['name'] = '总次数';
        // 老用户
        const oldCounts = JSON.parse(JSON.stringify(option));
        oldCounts['xAxis'][0]['data'] = res['oldCounts'].reverse().map(item => item['day']);
        oldCounts['series'][0]['data'] = res['oldCounts'].reverse().map(item => Number(item['data']));
        oldCounts['series'][0]['name'] = '总人数';
        this.zone.runOutsideAngular(() => {
            this.allEChart.visitPersonNumber.setOption(userCounts);
            this.allEChart.addVisitPersonNumber.setOption(newCounts);
            this.allEChart.oldVisitPersonNumber.setOption(oldCounts);
        });
    }

    /************************* 图表趋势(复用)-折线图:访问人数，访问次数，访问时长 ***************************/
    getPersonNumberChangeLine(flag, timeType, start, end?) {
        // 访问人数
        let startDate = '';
        let endDate = '';
        if (timeType === 'days'){
            startDate = this.dateTransformPipe.getBeforeDate(start);
            switch (flag) {
                case 'user_count':
                    this.visitPersonIndex = start;
                    this.visitPersonForm.reset();
                    break;
                case 'session_count':
                    this.visitNumberIndex = start;
                    this.visitNumberForm.reset();
                    break;
                case 'session_time_per_person':
                    this.visitTimeIndex = start;
                    this.visitTimeForm.reset();
                    break;
            }
        } else {
            startDate = start;
        }
        end ? endDate = end : endDate = this.datePipe.transform(new Date(), 'yyyyMMddHHmmss');
        this.dashboardService.getAppletChartLine(flag, startDate, endDate).subscribe(res => {
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
                this.allEChart.visitPersonNumberLine = this.eCharts.init(this.visitPersonNumberLineEle.nativeElement);
            });
            const userCount = JSON.parse(JSON.stringify(option));
            userCount['xAxis']['data'] = res.map(item => item['day']);
            userCount['series'][0]['data'] = res.map(item => Number(item['data']));
            userCount['series'][0]['name'] = '总人数';
            userCount['yAxis']['name'] = '人数(人)';
            const yAsixTitle = this.checkDateSalesRange(res);
            userCount['yAxis']['axisLabel'] = yAsixTitle;
            this.zone.runOutsideAngular(() => {
                this.allEChart.visitPersonNumberLine.setOption(userCount);
            });
        } else if (flag === 'session_count'){ // 访问次数-折线
            this.zone.runOutsideAngular(() => {
                this.allEChart.visitNumberLine = this.eCharts.init(this.visitNumberLineEle.nativeElement);
            });
            const sessionCount = JSON.parse(JSON.stringify(option));
            sessionCount['xAxis']['data'] = res.map(item => item['day']);
            sessionCount['series'][0]['data'] = res.map(item => Number(item['data']));
            sessionCount['series'][0]['name'] = '总次数';
            sessionCount['yAxis']['name'] = '次数(次)';
            const yAsixTitle = this.checkDateSalesRange(res);
            sessionCount['yAxis']['axisLabel'] = yAsixTitle;
            this.zone.runOutsideAngular(() => {
                this.allEChart.visitNumberLine.setOption(sessionCount);
            });
        } else if (flag === 'session_time_per_person'){ // 访问时长-折线
            this.zone.runOutsideAngular(() => {
                this.allEChart.visitTimeLine = this.eCharts.init(this.visitTimeLineEle.nativeElement);
            });
            const sessionTimePerPerson = JSON.parse(JSON.stringify(option));
            sessionTimePerPerson['xAxis']['data'] = res.map(item => item['day']);
            sessionTimePerPerson['series'][0]['data'] = res.map(item => Number(item['data']));
            sessionTimePerPerson['series'][0]['name'] = '总时长';
            sessionTimePerPerson['yAxis']['name'] = '时长(s)';
            const yAsixTitle = this.checkDateSalesRange(res);
            sessionTimePerPerson['yAxis']['axisLabel'] = yAsixTitle;
            this.zone.runOutsideAngular(() => {
                this.allEChart.visitTimeLine.setOption(sessionTimePerPerson);
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
            console.log('flag:', flag);
            yAsixTitle = {
                formatter: function (value) {
                    return (Number(value) / 1000).toFixed(1) + 'K';
                }
            };
        } else {
            yAsixTitle = {};
        }
        console.log('yAsixTitle:', yAsixTitle);
        return yAsixTitle;
    }

    /************************* 图表趋势(复用)-折线图:用户活跃(日、周) ***************************/
    getActivityChangeLine(flag, days) {
        const startDate = this.dateTransformPipe.getBeforeDate(days);
        // 访问人数
        this.dashboardService.getAppletChartActive(flag, startDate, this.datePipe.transform(new Date(), 'yyyyMMddHHmmss')).subscribe(res => {
            if (res) {
                if (flag === 'day_month_activity_degree'){ // 用户活跃-天
                    if (res instanceof Array){
                        this.activityDayNumber = Number(res[res.length - 1]['data']);
                    }
                } else if (flag === 'weekly_activity_degree'){ // 用户活跃-周
                    if (res instanceof Array){
                        this.activityWeekNumber = Number(res[res.length - 1]['data']);
                    }
                }
                setTimeout(() => {
                    this.getActivityChangeChartLine(res, flag);
                }, 100);
            }
        });
    }

    getActivityChangeChartLine(res, flag) {
        const option = {
            color: ['#3398DB'],
            xAxis: {
                type: 'category',
                data: [],
                show: false
            },
            yAxis: {
                type: 'value',
                show: false
            },
            tooltip : {
                trigger: 'axis',
                axisPointer : {
                    type : 'line'
                }
            },
            grid: {
                left: '16px',
                right: '22px',
                bottom: '12px',
                top: '8px',
                containLabel: false
            },
            series: [{
                name: '总人数',
                data: [],
                type: 'line'
            }]
        };
        if (flag === 'day_month_activity_degree'){ // 用户活跃-天
            this.zone.runOutsideAngular(() => {
                this.allEChart.personActivityDAU = this.eCharts.init(this.personActivityDAUEle.nativeElement);
            });
            const dayMonthActivityDegree = JSON.parse(JSON.stringify(option));
            dayMonthActivityDegree['xAxis']['data'] = res.map(item => item['day']);
            dayMonthActivityDegree['series'][0]['data'] = res.map(item => Number(item['data']));
            this.zone.runOutsideAngular(() => {
                this.allEChart.personActivityDAU.setOption(dayMonthActivityDegree);
            });
        } else if (flag === 'weekly_activity_degree'){ // 用户活跃-周
            this.zone.runOutsideAngular(() => {
                this.allEChart.personActivityWAU = this.eCharts.init(this.personActivityWAUEle.nativeElement);
            });
            const weeklyActivityDegree = JSON.parse(JSON.stringify(option));
            weeklyActivityDegree['xAxis']['data'] = res.map(item => item['day']);
            weeklyActivityDegree['series'][0]['data'] = res.map(item => Number(item['data']));
            this.zone.runOutsideAngular(() => {
                this.allEChart.personActivityWAU.setOption(weeklyActivityDegree);
            });
        }
    }

    /************************* 终端型号 ***************************/
    toGetAppletTerminal() {
        // 访问人数
        const startDate = this.dateTransformPipe.getBeforeDate(30);
        this.dashboardService.getAppletTerminal('accumulative_session_count', startDate, this.datePipe.transform(new Date(), 'yyyyMMddHHmmss')).subscribe(res => {
            if (res) {
                if (res instanceof Array){
                    this.terminalList = res;
                }
            }
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

    // 访问次数时间变化
    onSourceDate2(e, endTime, startTime, p) {
        if (p === 'startTime') {
            e.setHours(23);
            e.setMinutes(59);
            e.setSeconds(59);
        }
        'startTime' === p ? endTime.picker.set('minDate', e) : startTime.picker.set('maxDate', e);
        setTimeout(() => {
            if (this.visitNumberForm.valid){
                const start = this.datePipe.transform(new Date(this.visitNumberForm.get('beginTime').value), 'yyyyMMddHHmmss');
                const end = this.datePipe.transform(new Date(this.visitNumberForm.get('endTime').value), 'yyyyMMddHHmmss');
                this.getPersonNumberChangeLine('session_count', 'string', start, end);
            }
        }, 100);
    }

    // 访问时长时间变化
    onSourceDate3(e, endTime, startTime, p) {
        if (p === 'startTime') {
            e.setHours(23);
            e.setMinutes(59);
            e.setSeconds(59);
        }
        'startTime' === p ? endTime.picker.set('minDate', e) : startTime.picker.set('maxDate', e);
        setTimeout(() => {
            if (this.visitTimeForm.valid){
                const start = this.datePipe.transform(new Date(this.visitTimeForm.get('beginTime').value), 'yyyyMMddHHmmss');
                const end = this.datePipe.transform(new Date(this.visitTimeForm.get('endTime').value), 'yyyyMMddHHmmss');
                this.getPersonNumberChangeLine('session_time_per_person', 'string', start, end);
            }
        }, 100);
    }

    initECharts() {
        this.allEChart = new AllHomeECharts();
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

export class AllHomeECharts {
    visitPersonNumber: any; // 访问人数-柱状
    addVisitPersonNumber: any; // 新增访问
    oldVisitPersonNumber: any; // 老用户
    visitPersonNumberLine: any; // 访问人数-折线
    visitNumberLine: any; // 访问次数
    visitTimeLine: any; // 访问时长
    personActivityDAU: any; // 用户活跃-天
    personActivityWAU: any; // 用户活跃-周
}

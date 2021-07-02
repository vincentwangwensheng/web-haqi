import {Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import {ChartDataSets, ChartPoint} from 'chart.js';
import {Subject} from 'rxjs';
import {BigBusinessDataService} from '../../../../services/big-business-data.service';
import {HttpClient} from '@angular/common/http';
import {takeUntil} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Mandarin} from 'flatpickr/dist/l10n/zh';
import flatpickr from 'flatpickr';
import {MatPaginator, MatSnackBar, MatTableDataSource} from '@angular/material';
import {Utils} from '../../../../services/utils';

@Component({
    selector: 'app-analysis-of-marketing-data',
    templateUrl: './analysis-of-marketing-data.component.html',
    styleUrls: ['./analysis-of-marketing-data.component.scss']
})
export class AnalysisOfMarketingDataComponent implements OnInit, OnDestroy {
    // 参与会员性别比
    @ViewChild('GenderOfParticipatingMember', {static: true}) GenderOfParticipatingMember: ElementRef;
    // 参与会员类型
    @ViewChild('TypesOfParticipatingMembers', {static: true}) TypesOfParticipatingMembers: ElementRef;
    // 参与会员年龄分布
    @ViewChild('AgeDistributionOfParticipatingMember', {static: true}) AgeDistributionOfParticipatingMember: ElementRef;
    // 销售券核销业态占比
    @ViewChild('SalesVoucherWriteOffProfessionalFormProportion', {static: true}) SalesVoucherWriteOffProfessionalFormProportion: ElementRef;
    // 业态关联销售占比
    @ViewChild('FormatRelatedSalesP', {static: true}) FormatRelatedSalesP: ElementRef;
    // 订单金额分布
    @ViewChild('OrderAmountDisChart', {static: true}) OrderAmountDisChart: ElementRef;


    @ViewChild('startTime', {static: true}) startTime;
    @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
    @ViewChild('endTime', {static: true}) endTime;
    private _unsubscribeAll: Subject<any> = new Subject();
    ResponsiveStruts: boolean;
    HeaderTitle: boolean;
    widgets: any;
    elements_: any;
    echarts: any;
    showHourTable = false; // 设置图表是否显示
    headerSelect: HeaderSelect; // 头部选择框
    MembershipGrowth: MembershipGrowth; // 会员增长
    AccessPeriod: AccessPeriodE; // 访问时段
    OrderAmountDis: OrderAmountDisE; // 订单金额分布
    allECharts: AllEChartsE; // 所有eChart图表集合
    GenderOfParticipatingMembers: GenderOfParticipatingMembersE; // 参与会员性别
    TypesOfParticipatingMember: TypesOfParticipatingMembersE; // 参与会员类型
    SalesVoucherWriteOffProfessionalFormProportion_: SalesVoucherWriteOffProfessionalFormProportionE; // 销售券核销业态占比
    AgeDistributionOfParticipatingMembers: AgeDistributionOfParticipatingMemberE; // 参与会员年龄分布
    formatRelatedSalesP: FormatRelatedSalesP; // 业态关联销售占比
    surveyParameter: SurveyParameter; // 概览参数
    widget_MembershipGrowth_DS: ChartDataSets[] = []; // 会员增长
    widget_AccessPeriod_DS: ChartDataSets[] = []; // 访问时段
   // OrderAmountDis_DS: ChartDataSets[] = []; // 订单金额分布
    public lineChartPlugins = [pluginDataLabels];
    ac_id: string; // N_ACID
    receiveWriteOffNum: ReceiveWriteOffNum; // 优惠券领取量与核销量 表格
    timeDateSelect: TimeDateSelect;    // 时间选择框
    FirstMembershipNum = this.translate.instant('BusinessDataAnalysis.FirstMembershipNum');
    FirstMembers = this.translate.instant('BusinessDataAnalysis.FirstMembers');
    millionPeople = this.translate.instant('BusinessDataAnalysis.millionPeople');
    notFirstMembers = this.translate.instant('BusinessDataAnalysis.notFirstMembers');

    showReturnBut = false ; // 显示返回按钮
    constructor(private zone: NgZone,
                private routeInfo: ActivatedRoute,
                private snackBar: MatSnackBar,
                private utils: Utils,
                private bigBusinessDataService: BigBusinessDataService,
                private http: HttpClient,
                private translate: TranslateService,
    ) {
    }

    ngOnInit() {

        this.routeInfo.params.pipe(takeUntil(this._unsubscribeAll)).subscribe((param: Params) => this.ac_id = param.id);
        // 相应式
        this.reSw();
        this.addWindowListener();
        // 初始化我自己创建的图表的类
        this.initChartEntity();
        // 初始化widget的公共部分
        this.initWidgetElement();
        // 设置关于echarts
        this.intiAllEcharts();
        // 初始化widget
        this.initWidget();
        // 初始化所有数据
        this.initAllData();
    }


    compareData(data1 , data2 ){
        // const data1 = [120, 121, 124];
        // const data2 = [1, 300, 500];
        const len = data1.length;
        let sign = 0;
        const array = {};
        for (let i = 0 ; i < len ; i++) {
            if (data1[i] > data2[i]){
                sign = sign + 1;
            }
        }
        const twoLen = len / 2 ;
        if (sign >= twoLen) {
            array[0] = data1;
            array[1] = data2;
            return true;
        } else {
            array[0] = data2;
            array[1] = data1;
            return false;
        }

    }



    // 初始化所有数据
    initAllData() {
        this.utils.getBaseUrl().then(project => {
                const baseUrl = project.baseUrl;
                sessionStorage.setItem('baseUrl', baseUrl);
                // 获取所有的活动名称
                this.getActivityName();
            },
            error1 => {
                console.log(this.translate.instant('BusinessDataAnalysis.tips_1'), error1);  // 获取令牌失败----
            });
    }


    getChartsTitle(Value) {
        let title;
        try {
            title = Value[0]['value'];
        } catch (e) {
            title = this.translate.instant('BusinessDataAnalysis.tipsDataError'); // '数据出错' ;
        }
        return title;
    }

    getChartsValue(Value, i) {
        let val;
        try {
            val = Value[i]['value'].replace(/,/g, '');
        } catch (e) {
            val = 'null';
        }
        if (val.includes('null')) {
            val = 0;
        }
        return val;
    }

    // 获取活动名称
    getActivityName() {
        // 根据活动改图表信息。拿到活动的数据后，将以活动--数据的格式将信息存起来，切换的时候根据这个数据进行切换
        this.bigBusinessDataService.getSaikuData('activityname_bcia').pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                const cellsetJson = res.body['cellset'];
                for (let i = 1; i < cellsetJson.length; i++) {
                    const title = this.getChartsTitle(cellsetJson[i]) + '      '
                        + this.getChartsValue(cellsetJson[i], 1).replace('-', '.').replace('-', '.')
                        + ' - ' + this.getChartsValue(cellsetJson[i], 2).replace('-', '.').replace('-', '.') + '';
                    const startTime = this.getChartsValue(cellsetJson[i], 1);
                    const endTime = this.getChartsValue(cellsetJson[i], 2);
                    this.headerSelect.ActivityName[i - 1] = {
                        id: this.getChartsValue(cellsetJson[i], 3),
                        viewValue: title,
                        selectStart: startTime,
                        selectEnd: endTime
                    };
                }
                if (this.ac_id === 'N_ACID') {
                    this.headerSelect.selectName = (this.headerSelect.ActivityName[0].id).toString();
                    const start = Date.parse(this.headerSelect.ActivityName[0].selectStart);
                    const end = Date.parse(this.headerSelect.ActivityName[0].selectEnd);
                    const start_date = new Date(start);
                    const end_date = new Date(end);
                    this.headerSelect.startTime = this.headerSelect.ActivityName[0].selectStart;
                    this.headerSelect.endTime = this.headerSelect.ActivityName[0].selectEnd;
                    this.timeDateSelect.pickerStart.setDate(start_date, false);
                    this.timeDateSelect.pickerStart.set('minDate', start_date);
                    this.timeDateSelect.pickerStart.set('maxDate', end_date);
                    this.timeDateSelect.pickerEnd.setDate(end_date, false);
                    this.timeDateSelect.pickerEnd.set('minDate', start_date);
                    this.timeDateSelect.pickerEnd.set('maxDate', end_date);
                    this.showReturnBut = false;
                } else {
                    this.headerSelect.selectName = this.ac_id;
                    this.headerSelect.ActivityName.forEach(res_i => {
                        if (res_i.id === this.ac_id) {
                            const start = Date.parse(res_i.selectStart);
                            const end = Date.parse(res_i.selectEnd);
                            const start_date = new Date(start);
                            const end_date = new Date(end);
                            this.headerSelect.startTime = res_i.selectStart;
                            this.headerSelect.endTime = res_i.selectEnd;
                            this.timeDateSelect.pickerStart.setDate(start_date, false);
                            this.timeDateSelect.pickerStart.set('minDate', start_date);
                            this.timeDateSelect.pickerStart.set('maxDate', end_date);
                            this.timeDateSelect.pickerEnd.setDate(end_date, false);
                            this.timeDateSelect.pickerEnd.set('minDate', start_date);
                            this.timeDateSelect.pickerEnd.set('maxDate', end_date);
                        }
                    });
                    this.showReturnBut = true;
                }

                this.headerSelect.selectedType = this.translate.instant('BusinessDataAnalysis.activity');  //  '活动';
                this.headerSelect.ActivityType = [{
                    value: this.translate.instant('BusinessDataAnalysis.activity'),
                    viewValue: this.translate.instant('BusinessDataAnalysis.activity')
                }]; // 活动活动

                this.setData();

            }
        );
    }


    setData() {
        // 获取活动浏览人数
        this.getActivityBrowsingNum();
        // 获取常旅客会员比率
        this.getActivityBrowsingPercent();
        // 获取会员转化人数
        this.getMembershipConversionNum();
        // 获取占活动浏览量
        this.getMembershipConversionPercent();
        // 获取活动参与人数
        this.getNumberOfParticipantsNum();
        // 获取旅客活动参与度
        this.getNumberOfParticipantsPercent();
        // 活动分享
        this.getActivitySharingNum();
        // 获取优惠券发放
        this.getCouponGrantNum();
        // 获取核销转化率
        this.getCouponGrantPercent();
        // 销售金额
        this.getSalesAmountNum();
        // 占活动期间销售额
        this.getSalesAmountPercent();
        // 销售金额同比增长
        this.CustomerUnitAC('SalesAmountInNum' , 'activitysumamountyoy_bcia');
        // 营销基金使用金额
        this.getAmountMarketingFund();
        // 参与活动的客单价
        this.CustomerUnitAC('UnitPriceACNum' , 'activityticketkdj_bcia');
        // 参与活动的客单价同比
        this.CustomerUnitAC('UnitPriceACPercent1' , 'activityticketkdjyoy_bcia');
        // 整体客单价同比
        this.CustomerUnitAC('UnitPriceACPercent2' , 'activitysumkdjyoy_bcia');
        // 日均增加人数
        this.CustomerUnitAC('DailyIncreaseNum' , 'activityaddvipavgbyday_bcia');
        // DailyIncreasePercent
        this.CustomerUnitAC('DailyIncreasePercent' , 'activityaddvipavgyoybyday_bcia');
        // 会员增长
        this.initMembershipGrowthData();
        // 访问时段
        this.initAccessPeriodData();
        // 订单金额分布
        this.initOrderAmountDisData();
        // 参与会员性别分析
        this.initGenderOfParticipatingMembersData();
        // 参与会员类型
        this.initTypesOfParticipatingMembersData();
        // 参与会员年龄分布
        this.initAgeDistributionOfParticipatingMembersData();
        // 销售券核销业态占比
        this.initSalesVoucherWriteOffProfessionalFormProportionData();
        // 业态关联销售占比
        this.initFormatRelatedSalesP();
        // 优惠券领取量与核销量 日期 按天算
        this.initReceiveWriteOffNumDayData();
        // 优惠券领取量与核销量 日期 按小时算
        this.initReceiveWriteOffNumHourData();
        // 生成常旅客画像
        this.generatePortrait();
    }


    // 获取活动浏览人数
    getActivityBrowsingNum() {
        this.bigBusinessDataService.getSaikuData('activebrowsevipcount_bcia').pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                const cellsetJson = res.body['cellset'];
                const surveyArray: Array<{ selectID: number | null | undefined | string, number: number | null | undefined | string }> = [];
                for (let i = 0; i < cellsetJson.length; i++) {
                    if (i === 0) {

                    } else {
                        if (this.getChartsTitle(cellsetJson[i]) === this.headerSelect.selectName) {
                            this.surveyParameter.ActivityBrowsingNum = ((Number(this.getChartsValue(cellsetJson[i], 1)) / 10000).toFixed(2)).toString();
                        }
                        const num = ((Number(this.getChartsValue(cellsetJson[i], 1)) / 10000).toFixed(2)).toString();
                        surveyArray.push({selectID: this.getChartsTitle(cellsetJson[i]), number: num});
                    }
                }
                this.surveyParameter.ParameterActivityArray.push({
                    title: 'activebrowsevipcount_bcia',
                    value: surveyArray
                });
            },
            error1 => {
                console.log(this.translate.instant('BusinessDataAnalysis.tips_2'), error1); // 获取活动浏览人数失败
                this.surveyParameter.ParameterActivityArray.push({title: 'activebrowsevipcount_bcia', value: []});
            }
        );
    }


    // 获取占常旅客会员比率
    getActivityBrowsingPercent() {
        this.bigBusinessDataService.getSaikuData('activebrowsevipcountrate_bcia').pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                const cellsetJson = res.body['cellset'];
                const surveyArray: Array<{
                    selectID: number | null | undefined | string, number: number | null | undefined | string
                }> = [];
                for (let i = 0; i < cellsetJson.length; i++) {
                    if (i === 0) {
                    } else {
                        if (this.getChartsTitle(cellsetJson[i]) === this.headerSelect.selectName) {
                            this.surveyParameter.ActivityBrowsingPercent = this.getChartsValue(cellsetJson[i], 1);
                        }

                        surveyArray.push({
                            selectID: this.getChartsTitle(cellsetJson[i]),
                            number: this.getChartsValue(cellsetJson[i], 1)
                        });
                    }
                }
                this.surveyParameter.ParameterActivityArray.push({
                    title: 'activebrowsevipcountrate_bcia',
                    value: surveyArray
                });
            },
            error1 => {
                this.surveyParameter.ParameterActivityArray.push({title: 'activebrowsevipcountrate_bcia', value: []});
            }
        );
    }


    // 获取会员转化人数
    getMembershipConversionNum() {
        this.bigBusinessDataService.getSaikuData('addsumwxmembers_bcia').pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                const cellsetJson = res.body['cellset'];
                const surveyArray: Array<{ selectID: number | null | undefined | string, number: number | null | undefined | string }> = [];
                for (let i = 0; i < cellsetJson.length; i++) {
                    if (i === 0) {
                    } else {
                        if (this.getChartsTitle(cellsetJson[i]) === this.headerSelect.selectName) {
                            this.surveyParameter.MembershipConversionNum = ((Number(this.getChartsValue(cellsetJson[i], 1)) / 10000).toFixed(2)).toString();
                        }
                        const num = ((Number(this.getChartsValue(cellsetJson[i], 1)) / 10000).toFixed(2)).toString();
                        surveyArray.push({selectID: this.getChartsTitle(cellsetJson[i]), number: num});
                    }
                }
                this.surveyParameter.ParameterActivityArray.push({title: 'addsumwxmembers_bcia', value: surveyArray});
            },
            error1 => {
                console.log(this.translate.instant('BusinessDataAnalysis.tips_3'), error1); //  获取会员转化人数出错---
                this.surveyParameter.ParameterActivityArray.push({title: 'addsumwxmembers_bcia', value: []});
            }
        );
    }

    // 获取占活动浏览量百分比
    getMembershipConversionPercent() {
        this.bigBusinessDataService.getSaikuData('addsumwxmembersrate_bcia').pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                const cellsetJson = res.body['cellset'];
                const surveyArray: Array<{ selectID: number | null | undefined | string, number: number | null | undefined | string }> = [];
                for (let i = 0; i < cellsetJson.length; i++) {
                    if (i === 0) {
                    } else {
                        if (this.getChartsTitle(cellsetJson[i]) === this.headerSelect.selectName) {
                            this.surveyParameter.MembershipConversionPercent = this.getChartsValue(cellsetJson[i], 1);
                        }
                        surveyArray.push({
                            selectID: this.getChartsTitle(cellsetJson[i]),
                            number: this.getChartsValue(cellsetJson[i], 1)
                        });
                    }
                }
                this.surveyParameter.ParameterActivityArray.push({
                    title: 'addsumwxmembersrate_bcia',
                    value: surveyArray
                });
            },
            error1 => {
                console.log(this.translate.instant('BusinessDataAnalysis.tips_4'), error1); //  获取占活动浏览量百分比出错---
                this.surveyParameter.ParameterActivityArray.push({title: 'addsumwxmembersrate_bcia', value: []});
            }
        );
    }

    // 获取活动参与人数
    getNumberOfParticipantsNum() {
        this.bigBusinessDataService.getSaikuData('sumactivevipcoupon_bcia').pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                const cellsetJson = res.body['cellset'];
                const surveyArray: Array<{ selectID: number | null | undefined | string, number: number | null | undefined | string }> = [];
                for (let i = 0; i < cellsetJson.length; i++) {
                    if (i === 0) {
                    } else {
                        if (this.getChartsTitle(cellsetJson[i]) === this.headerSelect.selectName) {
                            this.surveyParameter.NumberOfParticipantsNum = ((Number(this.getChartsValue(cellsetJson[i], 1)) / 10000).toFixed(2)).toString();
                        }
                        const num = ((Number(this.getChartsValue(cellsetJson[i], 1)) / 10000).toFixed(2)).toString();
                        surveyArray.push({selectID: this.getChartsTitle(cellsetJson[i]), number: num});
                    }
                }
                this.surveyParameter.ParameterActivityArray.push({
                    title: 'sumactivevipcoupon_bcia',
                    value: surveyArray
                });
            },
            error1 => {
                console.log(this.translate.instant('BusinessDataAnalysis.tips_5'), error1); //  // 获取活动参与人数出错---
                this.surveyParameter.ParameterActivityArray.push({title: 'sumactivevipcoupon_bcia', value: []});
            }
        );
    }

    // 获取旅客活动参与度
    getNumberOfParticipantsPercent() {
        this.bigBusinessDataService.getSaikuData('ticketvipcountrate_bcia').pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                const cellsetJson = res.body['cellset'];
                const surveyArray: Array<{ selectID: number | null | undefined | string, number: number | null | undefined | string }> = [];
                for (let i = 0; i < cellsetJson.length; i++) {
                    if (i === 0) {
                    } else {
                        if (this.getChartsTitle(cellsetJson[i]) === this.headerSelect.selectName) {
                            this.surveyParameter.NumberOfParticipantsPercent = this.getChartsValue(cellsetJson[i], 1);
                        }

                        surveyArray.push({
                            selectID: this.getChartsTitle(cellsetJson[i]),
                            number: this.getChartsValue(cellsetJson[i], 1)
                        });
                    }
                }
                this.surveyParameter.ParameterActivityArray.push({
                    title: 'ticketvipcountrate_bcia',
                    value: surveyArray
                });
            },
            error1 => {
                console.log(this.translate.instant('BusinessDataAnalysis.tips_6'), error1); //  获取旅客活动参与度出错---
                this.surveyParameter.ParameterActivityArray.push({title: 'ticketvipcountrate_bcia', value: []});
            }
        );
    }

    // 活动分享
    getActivitySharingNum() {
        this.bigBusinessDataService.getSaikuData('sharecountbyactivity_bcia').pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                const cellsetJson = res.body['cellset'];
                const surveyArray: Array<{ selectID: number | null | undefined | string, number: number | null | undefined | string }> = [];
                for (let i = 0; i < cellsetJson.length; i++) {
                    if (i === 0) {
                    } else {
                        if (this.getChartsTitle(cellsetJson[i]) === this.headerSelect.selectName) {
                            this.surveyParameter.ActivitySharingNum = ((Number(this.getChartsValue(cellsetJson[i], 1)) / 10000).toFixed(2)).toString();
                        }
                        const num = ((Number(this.getChartsValue(cellsetJson[i], 1)) / 10000).toFixed(2)).toString();
                        surveyArray.push({selectID: this.getChartsTitle(cellsetJson[i]), number: num});
                    }
                }
                this.surveyParameter.ParameterActivityArray.push({
                    title: 'sharecountbyactivity_bcia',
                    value: surveyArray
                });
            },
            error1 => {
                console.log(this.translate.instant('BusinessDataAnalysis.tips_7'), error1);  //   获取 活动分享出错---
                this.surveyParameter.ParameterActivityArray.push({title: 'sharecountbyactivity_bcia', value: []});
            }
        );
    }

    // 获取优惠券发放张数
    getCouponGrantNum() {
        this.bigBusinessDataService.getSaikuData('sumticketcount_bcia').pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                const cellsetJson = res.body['cellset'];
                const surveyArray: Array<{ selectID: number | null | undefined | string, number: number | null | undefined | string }> = [];
                for (let i = 0; i < cellsetJson.length; i++) {
                    if (i === 0) {
                    } else {
                        if (this.getChartsTitle(cellsetJson[i]) === this.headerSelect.selectName) {
                            this.surveyParameter.CouponGrantNum = ((this.getChartsValue(cellsetJson[i], 1) / 10000).toFixed(2)).toString();
                        }
                        const num = ((this.getChartsValue(cellsetJson[i], 1) / 10000).toFixed(2)).toString();
                        surveyArray.push({selectID: this.getChartsTitle(cellsetJson[i]), number: num});
                    }
                }
                this.surveyParameter.ParameterActivityArray.push({title: 'sumticketcount_bcia', value: surveyArray});
            },
            error1 => {
                console.log(this.translate.instant('BusinessDataAnalysis.tips_8'), error1); //  获取优惠券发放张数出错---
                this.surveyParameter.ParameterActivityArray.push({title: 'sumticketcount_bcia', value: []});
            }
        );
    }

    // 获取核销转化率
    getCouponGrantPercent() {
        this.bigBusinessDataService.getSaikuData('ticketpaycountrate_bcia').pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                const cellsetJson = res.body['cellset'];
                const surveyArray: Array<{ selectID: number | null | undefined | string, number: number | null | undefined | string }> = [];
                for (let i = 0; i < cellsetJson.length; i++) {
                    if (i === 0) {
                    } else {

                        if (this.getChartsTitle(cellsetJson[i]) === this.headerSelect.selectName) {
                            this.surveyParameter.CouponGrantPercent = this.getChartsValue(cellsetJson[i], 1);
                        }
                        surveyArray.push({
                            selectID: this.getChartsTitle(cellsetJson[i]),
                            number: this.getChartsValue(cellsetJson[i], 1)
                        });
                    }
                }
                this.surveyParameter.ParameterActivityArray.push({
                    title: 'ticketpaycountrate_bcia',
                    value: surveyArray
                });
            },
            error1 => {
                console.log(this.translate.instant('BusinessDataAnalysis.tips_9'), error1); //  获取核销转化率出错---
                this.surveyParameter.ParameterActivityArray.push({title: 'ticketpaycountrate_bcia', value: []});
            }
        );
    }


    // 销售金额
    getSalesAmountNum() {
        this.bigBusinessDataService.getSaikuData('ticketnetamount_bcia').pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                const cellsetJson = res.body['cellset'];
                const surveyArray: Array<{ selectID: number | null | undefined | string, number: number | null | undefined | string }> = [];
                for (let i = 0; i < cellsetJson.length; i++) {
                    if (i === 0) {
                    } else {
                        if (this.getChartsTitle(cellsetJson[i]) === this.headerSelect.selectName) {
                            this.surveyParameter.SalesAmountNum = ((Number(this.getChartsValue(cellsetJson[i], 1)) / 10000).toFixed(2)).toString();
                        }
                        const num = ((Number(this.getChartsValue(cellsetJson[i], 1)) / 10000).toFixed(2)).toString();
                        surveyArray.push({selectID: this.getChartsTitle(cellsetJson[i]), number: num});
                    }
                }
                this.surveyParameter.ParameterActivityArray.push({title: 'ticketnetamount_bcia', value: surveyArray});
            },
            error1 => {
                console.log(this.translate.instant('BusinessDataAnalysis.tips_10'), error1); // 获销售金额出错---
                this.surveyParameter.ParameterActivityArray.push({title: 'ticketnetamount_bcia', value: []});
            }
        );
    }

    // 占活动期间销售额
    getSalesAmountPercent() {
        this.bigBusinessDataService.getSaikuData('sumactivitynetamount_bcia').pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                const cellsetJson = res.body['cellset'];
                const surveyArray: Array<{ selectID: number | null | undefined | string, number: number | null | undefined | string }> = [];
                for (let i = 0; i < cellsetJson.length; i++) {
                    if (i === 0) {
                    } else {
                        if (this.getChartsTitle(cellsetJson[i]) === this.headerSelect.selectName) {
                            this.surveyParameter.SalesAmountPercent = this.getChartsValue(cellsetJson[i], 1);
                        }
                        surveyArray.push({
                            selectID: this.getChartsTitle(cellsetJson[i]),
                            number: this.getChartsValue(cellsetJson[i], 1)
                        });
                    }
                }
                this.surveyParameter.ParameterActivityArray.push({
                    title: 'sumactivitynetamount_bcia',
                    value: surveyArray
                });
            },
            error1 => {
                console.log(this.translate.instant('BusinessDataAnalysis.tips_11'), error1); // 获取占活动期间销售额出错---
                this.surveyParameter.ParameterActivityArray.push({title: 'sumactivitynetamount_bcia', value: []});
            }
        );
    }

    //  营销基金使用金额
    getAmountMarketingFund(){
        this.bigBusinessDataService.getSaikuData('activityusumamount_bcia').pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                const cellsetJson = res.body['cellset'];
                const surveyArray: Array<{ selectID: number | null | undefined | string, number: number | null | undefined | string }> = [];
                for (let i = 0; i < cellsetJson.length; i++) {
                    if (i === 0) {
                    } else {
                        if (this.getChartsTitle(cellsetJson[i]) === this.headerSelect.selectName) {
                            this.surveyParameter.AmountMarketingFundNum = (Number(this.getChartsValue(cellsetJson[i], 1)) / 10000).toFixed(2).toString() ;
                        }
                        surveyArray.push({
                            selectID: this.getChartsTitle(cellsetJson[i]),
                            number: (Number(this.getChartsValue(cellsetJson[i], 1)) / 10000).toFixed(2).toString()
                        });
                    }
                }
                this.surveyParameter.ParameterActivityArray.push({
                    title: 'activityusumamount_bcia',
                    value: surveyArray
                });
            },
            error1 => {
                console.log(this.translate.instant('BusinessDataAnalysis.tips_11'), error1); // 获取营销基金使用金额---
                this.surveyParameter.ParameterActivityArray.push({title: 'activityusumamount_bcia', value: []});
            }
        );
    }


    // 参与活动的客单价  和  日均增加人数
    CustomerUnitAC(P , inter){
        this.bigBusinessDataService.getSaikuData(inter).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                const cellsetJson = res.body['cellset'];
                const surveyArray: Array<{ selectID: number | null | undefined | string, number: number | null | undefined | string }> = [];
                for (let i = 0; i < cellsetJson.length; i++) {
                    if (i === 0) {
                    } else {
                        if (this.getChartsTitle(cellsetJson[i]) === this.headerSelect.selectName) {
                            this.surveyParameter[P] = this.getChartsValue(cellsetJson[i], 1) ;
                        }
                        surveyArray.push({
                            selectID: this.getChartsTitle(cellsetJson[i]),
                            number:  this.getChartsValue(cellsetJson[i], 1)
                        });
                    }
                }
                this.surveyParameter.ParameterActivityArray.push({
                    title: inter,
                    value: surveyArray
                });
            },
            error1 => {
                console.log(this.translate.instant('BusinessDataAnalysis.tips_23'), error1); // 获取营销基金使用金额---
                this.surveyParameter.ParameterActivityArray.push({title: inter, value: []});
            }
        );
    }



    // 会员增长
    initMembershipGrowthData() {
        // 会员增长
        this.bigBusinessDataService.getSaikuData('membersgrowthcountbyday_bcia').pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                const surveyArray: Array<{
                    selectID: number | null | undefined | string, title: number | null | undefined | string,
                    NaturalGrowth_value_one: number | null | undefined | string, IncreaseByActivity_value_one: number | null | undefined | string
                }> = [];
                const cellsetJson = res.body['cellset'];
                for (let i = 1; i < cellsetJson.length; i++) {
                    const id = this.getChartsTitle(cellsetJson[i]);
                    const title = this.getChartsValue(cellsetJson[i], 1);
                    const NaturalGrowth_value_one = this.getChartsValue(cellsetJson[i], 2);
                    const IncreaseByActivity_value_one = this.getChartsValue(cellsetJson[i], 3);
                    surveyArray.push({
                        selectID: id,
                        title: title,
                        NaturalGrowth_value_one: NaturalGrowth_value_one,
                        IncreaseByActivity_value_one: IncreaseByActivity_value_one
                    });
                }
                this.surveyParameter.ParameterActivityArray.push({
                    title: 'membersgrowthcountbyday_bcia',
                    value: surveyArray
                });
                for (let y = 0; y < surveyArray.length; y++) {
                    if (surveyArray[y].selectID === this.headerSelect.selectName) {
                        this.MembershipGrowth.NaturalGrowth_title_one.push(surveyArray[y].title);
                        this.MembershipGrowth.NaturalGrowth_value_one.push(Number(surveyArray[y].NaturalGrowth_value_one));
                        this.MembershipGrowth.IncreaseByActivity_value_one.push(Number(surveyArray[y].IncreaseByActivity_value_one));
                    }
                }
                this.changeGrowthData();
            },
            error1 => {
                console.log(this.translate.instant('BusinessDataAnalysis.tips_12'), error1);
            } //  日会员增长数据获取失败---
        );
    }

    // 访问时段
    initAccessPeriodData() {
        // 访问时段
        this.bigBusinessDataService.getSaikuData('pageviewcountbyhour_bcia').pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                const cellsetJson = res.body['cellset'];
                const surveyArray: Array<{
                    selectID: number | null | undefined | string, title_one: number | null | undefined | string, value_one: number | null | undefined | string,
                    value_two: number | null | undefined | string
                }> = [];
                for (let i = 1; i < cellsetJson.length; i++) {
                    const selectID = this.getChartsTitle(cellsetJson[i]);
                    const title_one = this.getChartsValue(cellsetJson[i], 1);
                    const value_one = this.getChartsValue(cellsetJson[i], 2); // 小程序访问人次
                    const value_two = this.getChartsValue(cellsetJson[i], 3); // 活动访问人次
                    surveyArray.push({
                        selectID: selectID,
                        title_one: title_one,
                        value_one: value_one,
                        value_two: value_two
                    });
                }
                this.surveyParameter.ParameterActivityArray.push({
                    title: 'pageviewcountbyhour_bcia',
                    value: surveyArray
                });
                for (let y = 0; y < surveyArray.length; y++) {
                    if (surveyArray[y].selectID === this.headerSelect.selectName) {
                        this.AccessPeriod.title_one.push(surveyArray[y].title_one);
                        this.AccessPeriod.value_one.push(Number(surveyArray[y].value_one));
                        this.AccessPeriod.value_two.push(Number(surveyArray[y].value_two));
                    }
                }
                this.AccessPeriodDS();
            },
            error1 => {
                console.log(this.translate.instant('BusinessDataAnalysis.tips_13'), error1);
            } // 访问时段数据获取失败
        );
    }


    // 订单金额分布
    initOrderAmountDisData() {
        // 订单金额分布
        this.bigBusinessDataService.getSaikuData('activitystoresalegroup_bcia').pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                const cellsetJson = res.body['cellset'];
                const surveyArray: Array<{
                    selectID: number | null | undefined | string, xAxis: number | null | undefined | string, yAxis: number | null | undefined | string
                    , p: number | null | undefined | string}> = [];
                const m = [] ;
                for (let i = 1; i < cellsetJson.length; i++) {
                    const selectID = this.getChartsTitle(cellsetJson[i]); // 活动ID
                    const x = this.getChartsValue(cellsetJson[i], 1); // 区间段
                    const y = this.getChartsValue(cellsetJson[i], 2); //  订单数量
                    const p = this.getChartsValue(cellsetJson[i], 3); //  占比
                    surveyArray.push({
                        selectID: selectID,
                        xAxis: x,
                        yAxis: y,
                        p: p
                    });
                }
                this.surveyParameter.ParameterActivityArray.push({
                    title: 'activitystoresalegroup_bcia',
                    value: surveyArray
                });
                for (let y = 0; y < surveyArray.length; y++) {
                    if (surveyArray[y].selectID === this.headerSelect.selectName) {
                        this.OrderAmountDis.xAxis.push(surveyArray[y].xAxis);
                        this.OrderAmountDis.yAxis.push(Number(surveyArray[y].yAxis));
                        m.push({key: surveyArray[y].xAxis, value: surveyArray[y].p});
                    }
                }
                this.OrderAmountDis.label = JSON.stringify(m);
                // this.OrderAmountDis_DS = [
                //     {
                //         label: this.translate.instant('BusinessDataAnalysis.number'), // '人数',
                //         data: this.OrderAmountDis.value,
                //         fill: 'start'
                //     }
                // ];
                // this.widgets.OrderAmountDis.datasets = this.OrderAmountDis_DS;
                // this.widgets.OrderAmountDis.labels = this.OrderAmountDis.title;
                this.createAnnularChart();

            },
            error1 => {
                console.log(this.translate.instant('BusinessDataAnalysis.tips_23'), error1);
            } // 访问时段数据获取失败
        );
    }



    // 参与会员性别
    initGenderOfParticipatingMembersData() {
        // 参与会员性别
        this.bigBusinessDataService.getSaikuData('vipsexcouponcount_bcia').pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                const cellsetJson = res.body['cellset'];
                const surveyArray: Array<{ selectID: number | null | undefined | string, sex: number | null | undefined | string, num: number | null | undefined | string }> = [];
                let male;
                let female;
                for (let i = 1; i < cellsetJson.length; i++) {
                    const selectID = this.getChartsTitle(cellsetJson[i]);
                    const sex = this.getChartsValue(cellsetJson[i], 1);
                    const value = this.getChartsValue(cellsetJson[i], 2);
                    surveyArray.push({selectID: selectID, sex: sex, num: value});
                }
                this.surveyParameter.ParameterActivityArray.push({title: 'vipsexcouponcount_bcia', value: surveyArray});
                for (let y = 0; y < surveyArray.length; y++) {
                    if (surveyArray[y].selectID === this.headerSelect.selectName) {
                        if (surveyArray[y].sex === this.translate.instant('BusinessDataAnalysis.male')) { // 男
                            male = surveyArray[y].num;
                        } else if (surveyArray[y].sex === this.translate.instant('BusinessDataAnalysis.female')) { // 女
                            female = surveyArray[y].num;
                        }
                    }
                }

                if (male || female) {
                    if (!male) {
                        male = 0;
                    }
                    if (!female) {
                        female = 0;
                    }
                    const maleRatio = ((Number(male) / (Number(male) + Number(female))) * 100).toFixed(0);
                    const femaleRatio = (100 - Number(maleRatio)).toFixed(0);
                    this.surveyParameter.GenderRatioOfMembersMale = maleRatio + '%';
                    this.surveyParameter.GenderRatioOfMembersFemale = femaleRatio + '%';
                    // 女  男
                    this.GenderOfParticipatingMembers.value = [{
                        value: female,
                        name: this.translate.instant('BusinessDataAnalysis.female')
                    }, {value: male, name: this.translate.instant('BusinessDataAnalysis.male')}];
                    this.initGenderOfParticipatingMemberChart();
                }


            },
            error1 => {
                console.log(this.translate.instant('BusinessDataAnalysis.tips_14'), error1);
            } // 参与会员性别分析获取数据失败--
        );
    }

    // 参与会员类型
    initTypesOfParticipatingMembersData() {
        // 参与会员类型
        this.bigBusinessDataService.getSaikuData('vipfirstbonuscountrate_bcia').pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                const cellsetJson = res.body['cellset'];
                let title_one;
                let title_two;
                let value_one;
                let value_two;
                const surveyArray: Array<{
                    selectID: number | null | undefined | string, value_one: number | null | undefined | string, value_two: number | null | undefined | string,
                    title_one: number | null | undefined | string, title_two: number | null | undefined | string
                }> = [];
                for (let i = 0; i < cellsetJson.length; i++) {

                    if (i === 0) {
                        title_one = this.getChartsValue(cellsetJson[i], 1);
                        title_two = this.getChartsValue(cellsetJson[i], 2);
                    } else {
                        const selectID = this.getChartsTitle(cellsetJson[i]);
                        const value_1 = this.getChartsValue(cellsetJson[i], 1);
                        const value_2 = this.getChartsValue(cellsetJson[i], 2);
                        surveyArray.push({
                            selectID: selectID,
                            value_one: value_1,
                            value_two: value_2,
                            title_one: title_one,
                            title_two: title_two
                        });
                    }
                }
                this.surveyParameter.ParameterActivityArray.push({
                    title: 'vipfirstbonuscountrate_bcia',
                    value: surveyArray
                });
                for (let y = 0; y < surveyArray.length; y++) {
                    if (surveyArray[y].selectID === this.headerSelect.selectName) {
                        value_one = Number(surveyArray[y].value_one) / 10000;
                        value_two = Number(surveyArray[y].value_two) / 10000;
                    }
                }
                if (value_one || value_two) {
                    if (!value_one) {
                        value_one = 0;
                    }
                    if (!value_two) {
                        value_two = 0;
                    }
                    const other_people = (value_one - value_two).toFixed(2);
                    this.surveyParameter.FirstMembershipNum = value_two.toFixed(2);
                    //
                    this.TypesOfParticipatingMember.value =
                        [{
                            value: this.surveyParameter.FirstMembershipNum,
                            name: this.translate.instant('BusinessDataAnalysis.FirstMembershipNum')
                        }
                            , {
                            value: other_people,
                            name: this.translate.instant('BusinessDataAnalysis.FirstMembershipNumOther'),
                            label: {normal: {show: false}}
                        }];
                    this.initTypesOfParticipatingMembersChart();
                }


            },
            error1 => {
                console.log(this.translate.instant('BusinessDataAnalysis.tips_15'), error1); // 获取占活动期间销售额出错---
            }
        );

    }

    // 参与会员年龄分布数据图表
    initAgeDistributionOfParticipatingMembersData() {
        // 参与会员年龄分布数据图表
        this.bigBusinessDataService.getSaikuData('vipagegroupcouponcount_bcia').pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                const surveyArray: Array<{
                    selectID: number | null | undefined | string, name: number | null | undefined | string, value: number | null | undefined | string,
                    color: number | null | undefined | string
                }> = [];

                const cellsetJson = res.body['cellset'];
                for (let i = 1; i < cellsetJson.length; i++) {
                    const selectID = this.getChartsTitle(cellsetJson[i]);
                    const title = this.getChartsValue(cellsetJson[i], 1);
                    const value = this.getChartsValue(cellsetJson[i], 2);
                    let color = '46A8EE';
                    if (title === this.translate.instant('BusinessDataAnalysis.018')) {
                        color = '#46A8EE';
                    }
                    if (title === this.translate.instant('BusinessDataAnalysis.1928')) {
                        color = '#8ED7FF';
                    }
                    if (title === this.translate.instant('BusinessDataAnalysis.2938')) {
                        color = '#126DAE';
                    }

                    if (title === this.translate.instant('BusinessDataAnalysis.3948')) {
                        color = '#D92F56';
                    }
                    if (title === this.translate.instant('BusinessDataAnalysis.4958')) {
                        color = 'rgba(217,47,86,0.6)';
                    }
                    if (title === this.translate.instant('BusinessDataAnalysis.59up')) {
                        color = '#f79000';
                    }
                    surveyArray.push({selectID: selectID, name: title, value: value, color: color});
                }
                this.surveyParameter.ParameterActivityArray.push({
                    title: 'vipagegroupcouponcount_bcia',
                    value: surveyArray
                });
                for (let y = 0; y < surveyArray.length; y++) {
                    if (surveyArray[y].selectID === this.headerSelect.selectName) {
                        this.AgeDistributionOfParticipatingMembers.legend.push({name: surveyArray[y].name});
                        this.AgeDistributionOfParticipatingMembers.value.push({
                            value: surveyArray[y].value,
                            name: surveyArray[y].name,
                            itemStyle: {color: surveyArray[y].color}
                        });
                    }
                }
                this.initAgeDistributionOfParticipatingMemberChart();
            },
            error1 => {
                console.log(this.translate.instant('BusinessDataAnalysis.tips_16'), error1);
            } // 参与会员年龄分析获取数据失败--
        );
    }

    // 销售券核销业态占比数据图表
    initSalesVoucherWriteOffProfessionalFormProportionData() {
        // 销售券核销业态占比数据图表
        this.bigBusinessDataService.getSaikuData('tickettypecountrate_bcia').pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                // batchNum 批次数量 == 发放量  grantNum 优惠券发放张数===领取量  writeOffNum核销总量 == 核销量
                const surveyArray: Array<{
                    selectID: number | null | undefined | string, title: number | null | undefined | string, batchNum: number | null | undefined | string,
                    grantNum: number | null | undefined | string, writeOffNum: number | null | undefined | string
                }> = [];
                const cellsetJson = res.body['cellset'];
                const len = cellsetJson.length - 1;
                for (let i = 1; i < cellsetJson.length; i++) {
                    const selectID = this.getChartsTitle(cellsetJson[i]);
                    const title = this.getChartsValue(cellsetJson[i], 1);
                    const value_one = this.getChartsValue(cellsetJson[i], 2); // 发放量 ==
                    const value_two = this.getChartsValue(cellsetJson[i], 3); // 领取量
                    const value_three = this.getChartsValue(cellsetJson[i], 4); // 核销量
                    surveyArray.push({
                        selectID: selectID,
                        title: title,
                        batchNum: value_two,
                        grantNum: value_three,
                        writeOffNum: value_one
                    });
                }
                this.surveyParameter.ParameterActivityArray.push({
                    title: 'tickettypecountrate_bcia',
                    value: surveyArray
                });
                const cou_Array: any = [];
                for (let y = 0; y < surveyArray.length; y++) {
                    if (surveyArray[y].selectID === this.headerSelect.selectName) {
                        cou_Array.push(surveyArray[y]);
                    }
                }
                // batchNum 批次数量 == 发放量  grantNum 优惠券发放张数===领取量  writeOffNum核销总量 == 核销量
                if (cou_Array.length > 0) {
                    this.setCouponBarWidth(cou_Array);
                    //  this.orderBy_Two(cou_Array , 'batchNum');
                    for (let r = (cou_Array.length - 1); r >= 0; r--) {
                        const num = cou_Array.length - r - 1;
                        this.SalesVoucherWriteOffProfessionalFormProportion_.title [num] = cou_Array[r].title;
                        const batchNum = cou_Array[r].batchNum; // 领取
                        const grantNum = cou_Array[r].grantNum;  // 核销
                        const WriteOffNum = cou_Array[r].writeOffNum; // 发放量

                        /* if (r === 0) {
                             batchNum = '2';
                             grantNum = '1';
                             WriteOffNum = '300';
                         }*/

                        const p_w_g = Number((Number(grantNum) / Number(batchNum)).toFixed(2));
                        let could_true = false;
                        if (p_w_g > 0.94) {
                            could_true = true;
                        }

                        this.setValueCouponCount(batchNum, num, batchNum, could_true);
                        this.setValueProportion(grantNum, num, grantNum);
                        this.setValueWriteOffData(WriteOffNum, num, WriteOffNum);

                    }
                    this.SalesVoucherWriteOffProfessionalFormProportion_.barMinHeight = 55;
                    this.SalesVoucherWriteOffProfessionalFormProportion_.barMinHeight_three = 75;
                    this.SalesVoucherWriteOffProfessionalFormProportion_.barMinHeight_two = 25;
                    this.initSalesVoucherWriteOffProfessionalFormProportionChart();
                }

            }, error1 => {
                console.log(this.translate.instant('BusinessDataAnalysis.tips_17'), error1);
            } // this.translate.instant('BusinessDataAnalysis.tips_17')
        );
    }

    setValueCouponCount(p, num, batchNum, could_true) {

        if ('0' === p || '' === p || 0 === p) { // p === false 说明当前为0
            this.SalesVoucherWriteOffProfessionalFormProportion_.CouponCount[num] = {
                value: batchNum, label: {normal: {show: false}},
                itemStyle: {color: 'rgba(255 ,255 ,255 , 0)'}
            };
        } else {
            if (could_true) {
                // 百分比在95到100%之间
                this.SalesVoucherWriteOffProfessionalFormProportion_.CouponCount[num] = {
                    value: batchNum,
                    label: {normal: {show: false}}
                };
            } else {
                // 其他
                this.SalesVoucherWriteOffProfessionalFormProportion_.CouponCount[num] = {value: batchNum};
            }
        }

    }

    setValueProportion(p, num, grantNum) {
        if ('0' === p || '' === p || 0 === p) {  // 为0 与不为0
            this.SalesVoucherWriteOffProfessionalFormProportion_.Proportion[num] = {
                value: grantNum,
                itemStyle: {color: 'rgba(255 ,255 ,255 , 0)'},
                label: {normal: {show: false}}
            };
        } else {
            this.SalesVoucherWriteOffProfessionalFormProportion_.Proportion[num] = {value: grantNum};
        }

    }

    setValueWriteOffData(p, num, WriteOffNum) {
        if ('0' === p || '' === p || 0 === p) { // 为0 与不为0
            this.SalesVoucherWriteOffProfessionalFormProportion_.WriteOffData[num] = {
                value: WriteOffNum,
                label: {normal: {show: false}},
                itemStyle: {color: 'rgba(255 ,255 ,255 , 0)'}
            };
        } else {
            this.SalesVoucherWriteOffProfessionalFormProportion_.WriteOffData[num] = {value: WriteOffNum};
        }
    }

    labelParameter(value, show, p) {
        let label_v;
        if (p === 'not') {
            label_v = {
                normal: {
                    formatter: function () {
                        return value;
                    },
                    show: show,
                    distance: -36,
                    position: 'insideRight',
                    // borderColor: 'auto',
                    color: '#004C66', // '#004C66', //
                    fontSize: 10
                }
            };
        } else {
            label_v = {
                normal: {
                    formatter: function () {
                        return value;
                    },
                    show: show,
                    distance: -36,
                    position: 'insideRight',
                    // borderColor: 'auto',
                    color: '#004C66', //  '#004C66',
                    fontSize: 10
                }
            };
        }
        return label_v;
    }


    // 业态关联销售占比
    initFormatRelatedSalesP() {
        this.bigBusinessDataService.getSaikuData('activityleasemodeamount_bcia').pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                const surveyArray: Array<{
                    selectID: number | null | undefined | string, bizType: number | null | undefined | string, allSaleNum: number | null | undefined | string,
                    SaleNum: number | null | undefined | string, color: number | null | undefined | string
                }> = [];
                const cellsetJson = res.body['cellset'];
                for (let i = 1; i < cellsetJson.length; i++) {
                    const selectID = this.getChartsTitle(cellsetJson[i]); // 活动ID
                    const bizType = this.getChartsValue(cellsetJson[i], 1); // 业态
                    const allSaleNum = Number(this.getChartsValue(cellsetJson[i], 2)) / 10000;   //  业态总销售金额
                    const SaleNum = Number(this.getChartsValue(cellsetJson[i], 3)) / 10000;   //  业态总销售金额
                    let color = '46A8EE';
                    if (bizType === this.translate.instant('BusinessDataAnalysis.dutyFree')) {
                        color = '#8ED7FF'; // 免税
                    }
                    if (bizType === this.translate.instant('BusinessDataAnalysis.retail')) {
                        color = '#1783D1'; // 零售
                    }
                    if (bizType === this.translate.instant('BusinessDataAnalysis.Restaurant')) {
                        color = '#C63862'; // 餐饮
                    }

                    surveyArray.push({
                        selectID: selectID,
                        bizType: bizType,
                        allSaleNum: allSaleNum,
                        SaleNum: SaleNum,
                        color: color
                    });
                }
                this.surveyParameter.ParameterActivityArray.push({
                    title: 'activityleasemodeamount_bcia',
                    value: surveyArray
                });
                this.setOrChangeSeries(surveyArray, 'first');
            }
        );
    }

    setOrChangeSeries(surveyArray, p) {
        const array_ = [];
        this.formatRelatedSalesP.dutyFreeValue = [];
        this.formatRelatedSalesP.retailValue = [];
        this.formatRelatedSalesP.RestaurantValue = [];

        this.formatRelatedSalesP.legendName = [this.translate.instant('BusinessDataAnalysis.dutyFree'), this.translate.instant('BusinessDataAnalysis.retail'), this.translate.instant('BusinessDataAnalysis.Restaurant')];  //  '免税' , '零售' , '餐饮'
        if (p === 'first') {
            for (let y = 0; y < surveyArray.length; y++) {
                if (surveyArray[y].selectID === this.headerSelect.selectName) {
                    array_.push(surveyArray[y]);
                }
            }
        } else {
            surveyArray.value.forEach(res => {
                if (res.selectID === this.headerSelect.selectName) {
                    array_.push(res);
                }
            });
        }
        if (array_.length === 0) {
            this.formatRelatedSalesP.tipsSource = [
                {title: this.translate.instant('BusinessDataAnalysis.dutyFree'), num: 0, p: '0.00'}, // 免税
                {title: this.translate.instant('BusinessDataAnalysis.retail'), num: 0, p: '0.00'}, // 零售
                {title: this.translate.instant('BusinessDataAnalysis.Restaurant'), num: 0, p: '0.00'} // 餐饮
            ];
        } else {
            this.formatRelatedSalesP.tipsSource = [];
        }

        array_.forEach(r => {
            let real_value = 0;
            let other_value = 2.5;
            const all_p = (Number(r.allSaleNum) * 0.75).toFixed(2);
            if (r.SaleNum === r.allSaleNum) {
                real_value = 7.5;
                other_value = 2.5;
            }
            if (r.SaleNum !== r.allSaleNum) {
                const sale_num = (Number(r.SaleNum) * 0.75).toFixed(2);
                real_value = Number((Number((Number(sale_num) / Number(all_p)) * 10)).toFixed(2));
                if (real_value > 7) {
                    real_value = Number(real_value) - 2.5;
                } else {
                    real_value = Number(real_value) - 1;
                }
                other_value = 10 - (Number(real_value));
            }
            if (r.SaleNum === 0) {
                real_value = 0;
                other_value = 10;
            }
            let p_num: any;
            if (r.SaleNum === 0 || r.SaleNum === '0') {
                p_num = '0.00';
            } else {
                p_num = ((Number(r.SaleNum) / Number(r.allSaleNum)) * 100).toFixed(2);
            }
            this.formatRelatedSalesP.tipsSource.push({title: r.bizType, num: r.SaleNum, p: p_num});
            if (r.bizType === this.translate.instant('BusinessDataAnalysis.dutyFree')) {
                // 免税
                if (real_value === 0) {
                    this.formatRelatedSalesP.dutyFreeValue = [
                        {
                            value: real_value,
                            name: this.translate.instant('BusinessDataAnalysis.dutyFree'),
                            itemStyle: {color: r.color, borderWidth: 5, borderColor: '#EEEEEE'},
                            tooltip: {show: false}
                        }, // 免税
                        {
                            value: other_value,
                            name: this.translate.instant('BusinessDataAnalysis.allSalesMount'),
                            itemStyle: {color: 'rgba(0,0,0,0)', borderWidth: 0},
                            tooltip: {show: false}
                        }   // 总销售额
                    ];
                } else {
                    this.formatRelatedSalesP.dutyFreeValue = [
                        {
                            value: real_value,
                            name: this.translate.instant('BusinessDataAnalysis.dutyFree'),
                            itemStyle: {color: r.color, borderWidth: 5, borderColor: r.color},
                            tooltip: {show: false}
                        }, // 免税
                        {
                            value: other_value,
                            name: this.translate.instant('BusinessDataAnalysis.allSalesMount'),
                            itemStyle: {color: 'rgba(0,0,0,0)', borderWidth: 0},
                            tooltip: {show: false}
                        } // 总销售额
                    ];
                }

            }
            if (r.bizType === this.translate.instant('BusinessDataAnalysis.retail')) {
                // 零售
                if (real_value === 0) {
                    this.formatRelatedSalesP.retailValue = [
                        {
                            value: real_value,
                            name: this.translate.instant('BusinessDataAnalysis.retail'),
                            itemStyle: {color: r.color, borderWidth: 5, borderColor: '#EEEEEE'},
                            tooltip: {show: false}
                        }, // 零售
                        {
                            value: other_value,
                            name: this.translate.instant('BusinessDataAnalysis.allSalesMount'),
                            itemStyle: {color: 'rgba(0,0,0,0)', borderWidth: 0},
                            tooltip: {show: false}
                        }  // 总销售额
                    ];
                } else {
                    this.formatRelatedSalesP.retailValue = [
                        {
                            value: real_value,
                            name: this.translate.instant('BusinessDataAnalysis.retail'),
                            itemStyle: {color: r.color, borderWidth: 5, borderColor: r.color},
                            tooltip: {show: false}
                        }, // 零售
                        {
                            value: other_value,
                            name: this.translate.instant('BusinessDataAnalysis.allSalesMount'),
                            itemStyle: {color: 'rgba(0,0,0,0)', borderWidth: 0},
                            tooltip: {show: false}
                        }  // 总销售额
                    ];
                }

            }
            if (r.bizType === this.translate.instant('BusinessDataAnalysis.Restaurant')) {
                // 餐饮
                if (real_value === 0) {
                    this.formatRelatedSalesP.RestaurantValue = [
                        {
                            value: real_value,
                            name: this.translate.instant('BusinessDataAnalysis.Restaurant'),
                            itemStyle: {color: r.color, borderWidth: 5, borderColor: '#EEEEEE'},
                            tooltip: {show: false}
                        }, // 餐饮
                        {
                            value: other_value,
                            name: this.translate.instant('BusinessDataAnalysis.allSalesMount'),
                            itemStyle: {color: 'rgba(0,0,0,0)', borderWidth: 0},
                            tooltip: {show: false}
                        } // 总销售额
                    ];
                } else {
                    this.formatRelatedSalesP.RestaurantValue = [
                        {
                            value: real_value,
                            name: this.translate.instant('BusinessDataAnalysis.Restaurant'),
                            itemStyle: {color: r.color, borderWidth: 5, borderColor: r.color},
                            tooltip: {show: false}
                        }, // 餐饮
                        {
                            value: other_value,
                            name: this.translate.instant('BusinessDataAnalysis.allSalesMount'),
                            itemStyle: {color: 'rgba(0,0,0,0)', borderWidth: 0},
                            tooltip: {show: false}
                        } // 总销售额
                    ];
                }

            }
        });

        // this.formatRelatedSalesP.legendName,
        this.initFormatRelatedSalesPChart();
    }


    // 优惠券领取量与核销量 按天
    initReceiveWriteOffNumDayData() {
        this.bigBusinessDataService.getSaikuData('activityticketcountbydate_bcia').pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                // 活动ID，日期，券类型【名称】，领取数量，核销数量
                const surveyArray: Array<{
                    selectID: number | null | undefined | string, Date: number | null | undefined | string, couponType: number | null | undefined | string,
                    Receive: number | null | undefined | string, WriteOff: number | null | undefined | string
                }> = [];
                const cellsetJson = res.body['cellset'];
                for (let i = 1; i < cellsetJson.length; i++) {
                    const selectID = this.getChartsTitle(cellsetJson[i]); // 活动ID
                    const Date = this.getChartsValue(cellsetJson[i], 1); // 日期
                    const couponType = this.getChartsValue(cellsetJson[i], 2);   //  券类型
                    const Receive = this.getChartsValue(cellsetJson[i], 3);   //  领取数量
                    const WriteOff = this.getChartsValue(cellsetJson[i], 4);   //  核销数量
                    surveyArray.push({
                        selectID: selectID
                        , Date: Date, couponType: couponType,
                        Receive: Receive, WriteOff: WriteOff
                    });
                }
                this.surveyParameter.ParameterActivityArray.push({
                    title: 'activityticketcountbydate_bcia',
                    value: surveyArray
                });
                this.setReceiveWriteOffTable(surveyArray, 'first');
            }
        );
    }

    // 优惠券领取量与核销量 按小时
    initReceiveWriteOffNumHourData() {
        this.bigBusinessDataService.getSaikuData('activityticketcountbyhour_bcia').pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                // 活动ID，日期每小时，券类型【名称】，领取数量，核销数量
                const surveyArray: Array<{
                    selectID: number | null | undefined | string, Date: number | null | undefined | string, couponType: number | null | undefined | string, Hour: number | null | undefined | string,
                    Receive: number | null | undefined | string, WriteOff: number | null | undefined | string
                }> = [];
                const cellsetJson = res.body['cellset'];
                for (let i = 1; i < cellsetJson.length; i++) {
                    const selectID = this.getChartsTitle(cellsetJson[i]); // 活动ID
                    const Date_ = this.getChartsValue(cellsetJson[i], 1); // 日期每小时
                    const couponType = this.getChartsValue(cellsetJson[i], 2);   //  券类型
                    const Hour = this.getChartsValue(cellsetJson[i], 3); // 时段
                    const Receive = this.getChartsValue(cellsetJson[i], 4);   //  领取数量
                    const WriteOff = this.getChartsValue(cellsetJson[i], 5);   //  核销数量
                    surveyArray.push({
                        selectID: selectID
                        , Date: Date_, couponType: couponType, Hour: Hour,
                        Receive: Receive, WriteOff: WriteOff
                    });
                }
                this.surveyParameter.ParameterActivityArray.push({
                    title: 'activityticketcountbyhour_bcia',
                    value: surveyArray
                });
            }
        );
    }

    // 先给接受到的数组进行分组
    groupData(arr, value) {
        const map = {},
            dest = [];
        for (let i = 0; i < arr.length; i++) {
            const ai = arr[i];
            if (!map[ai[value]]) {
                dest.push({
                    couponType: ai[value],
                    item: [ai]
                });
                map[ai[value]] = ai;
            } else {
                for (let j = 0; j < dest.length; j++) {
                    const dj = dest[j];
                    if (dj[value] === ai[value]) {
                        dj.item.push(ai);
                        break;
                    }
                }
            }
        }
        return dest;
    }


    // 操作日期数据
    setReceiveWriteOffTable(surveyArray, p) {
        const array_ = [];
        this.receiveWriteOffNum.displayedColumns = [];
        this.receiveWriteOffNum.TableHer = [];
        this.receiveWriteOffNum.dataSource.data = [];
        this.receiveWriteOffNum.pageSize = 0;
        // 先拿到所有的日期集合，也就是表头.
        // 对数据进行分类，相同类型的放在一起。
        // 再把相同类型的数据进行业态排查。整合成一条数据。并行程列表集合
        if (p === 'first') {
            for (let y = 0; y < surveyArray.length; y++) {
                if (surveyArray[y].selectID === this.headerSelect.selectName) {
                    array_.push(surveyArray[y]);
                }
            }
        } else {
            surveyArray.value.forEach(res => {
                if (res.selectID === this.headerSelect.selectName) {
                    array_.push(res);
                }
            });
        }
        const type_source = this.groupData(array_, 'couponType');
        const coum = []; // 表头
        const date = {}; // 日期
        const source = []; // 储存临时数组
        const Receive = {}; // 领取数量
        const WriteOff = {}; //  核销数量
        for (let i = 0; i < type_source.length; i++) {
            const biz_type = type_source[i].couponType;
            const item = type_source[i].item;
            date['0'] = '';
            Receive['0'] = biz_type;
            WriteOff['0'] = '';
            date['1'] = '';
            Receive['1'] = this.translate.instant('BusinessDataAnalysis.Receive'); // '领取量'; // 领取量
            WriteOff['1'] = this.translate.instant('BusinessDataAnalysis.WriteOff'); //  '核销量';
            coum[0] = '0';
            coum[1] = '1';
            let io = 0;
            for (let y = 0; y < item.length; y++) {
                const y_s = (Number(y) + 2).toString();
                coum[io + 2] = y_s;
                io++;
                if (item[y].Date.includes('-')) {
                    date[y_s] = this.setYearDay(item[y].Date);
                } else {
                    date[y_s] = item[y].Date;
                }
                WriteOff[y_s] = item[y].WriteOff;
                Receive[y_s] = item[y].Receive;
            }
            const re_ = JSON.stringify(Receive);
            const wr = JSON.stringify(WriteOff);
            source.push(JSON.parse(re_));
            source.push(JSON.parse(wr));
        }
        if (coum.length <= 2) {
            this.receiveWriteOffNum.displayedColumns = [];
            this.receiveWriteOffNum.TableHer = [];
            this.receiveWriteOffNum.dataSource.data = [];
            this.receiveWriteOffNum.pageSize = 0;
            this.paginator.pageSize = 0;
            this.receiveWriteOffNum.dataSource.paginator = this.paginator;
            this.showHourTable = true;
        } else {
            this.showHourTable = false;
            this.receiveWriteOffNum.displayedColumns = coum;
            this.receiveWriteOffNum.TableHer.push(date);
            if (coum.length <= 10) {
                this.receiveWriteOffNum.dataSource.data = source;
                this.receiveWriteOffNum.pageSize = source.length;
                this.paginator.pageSize = source.length;
                this.receiveWriteOffNum.dataSource.paginator = this.paginator;
            }

        }

        this.setSourcePaginator(coum, source, 'date');
    }

    // 分页
    setSourcePaginator(coum, source, p) {
        // 日期是10
        // 时段是 15 min-w=46
        if (source) {
            const sourceBefore = []; // 10条前的数据
            const sourceAfter = [];  // 10条后的数据
            let totalPage = 0;   // 总页数
            let size = 8; // 当前显示页数
            if (p === 'hour') {
                size = 9;
            } else {
                size = 8;
            }
            const sou_new = []; // 新数组
            const columns_new = {}; // 新表头
            if (coum.length <= size) {
                totalPage = 1;
            } else {
                if ((coum.length) % size === 0) {  // 每页显示11纵列
                    totalPage = Number(((coum.length) / size).toFixed(0)); // 用总长除于每页要显示的数量，得到总页数
                } else {
                    totalPage = Number(((coum.length) / size).toFixed(0)) + 1; // 用总长除于每页要显示的数量，得到总页数
                }
            }
            if (totalPage > 1) {
                const data_copy = JSON.stringify(source);
                const date_c = JSON.parse(data_copy);
                for (let page = 0; page < totalPage; page++) {
                    for (let y = 0; y < date_c.length; y = y + 2) {
                        const single_date1 = JSON.stringify(date_c[y]); // 第一条数据
                        const single_d_j = JSON.parse(single_date1);
                        const sing_arr = JSON.stringify(single_d_j);
                        const sing_arr_ = sing_arr.split(',');
                        const single_date2 = JSON.stringify(date_c[y + 1]); // 第二条数据
                        const single_d_j2 = JSON.parse(single_date2);
                        const sing_arr2 = JSON.stringify(single_d_j2);
                        const sing_arr2_ = sing_arr2.split(',');

                        const c_ = JSON.stringify(coum);
                        const c_json = JSON.parse(c_);
                        const c_json_s = (JSON.stringify(c_json)).split(',');


                        // 显示的数据
                        if (page === 0) {
                            const str_arr = '{' + '"0": "' + single_d_j[0] + '", "1": "' + single_d_j[1] + '",' + sing_arr_.slice(page + 2, size) + '}';
                            // console.log(str_arr  , 'str_arr');
                            sourceBefore.push(JSON.parse(str_arr.toString()));
                            const str_arr2 = '{' + '"0": "' + single_d_j2[0] + '", "1": "' + single_d_j2[1] + '",' + sing_arr2_.slice(page + 2, size) + '}';
                            //  console.log(str_arr2  , 'str_arr2');
                            sourceBefore.push(JSON.parse(str_arr2.toString()));

                            // 表头
                            const ten_1 = c_json_s.slice(page, size) + ']'; // 前 10
                            columns_new[page] = JSON.parse(ten_1);
                        } else {
                            if (page === (totalPage - 1)) {
                                const start_p = (page) * size;
                                const sing_arr_slice = sing_arr_.slice(start_p, sing_arr_.length);
                                if (sing_arr_slice.length !== 0) {
                                    const str_arr2 = '{' + '"0": "' + single_d_j[0] + '", "1": "' + single_d_j[1] + '",' + sing_arr_slice;
                                    sourceAfter.push(JSON.parse(str_arr2.toString()));
                                }

                                const sing_arr_slice2 = sing_arr2_.slice(start_p, sing_arr_.length);
                                if (sing_arr_slice2.length !== 0) {
                                    const str_arr2 = '{' + '"0": "' + single_d_j2[0] + '", "1": "' + single_d_j2[1] + '",' + sing_arr_slice2;
                                    sourceAfter.push(JSON.parse(str_arr2.toString()));
                                }

                                // 表头
                                const c_json_s_slice = c_json_s.slice(start_p, c_json_s.length);
                                if (c_json_s_slice.length !== 0) {
                                    const ten_2 = '[' + '"0", "1",' + c_json_s_slice; // 后 10
                                    columns_new[page] = JSON.parse(ten_2);
                                    //  ColumnsAfter.push(JSON.parse(ten_2));
                                }
                            } else {
                                const start_p = (page) * size;
                                const start_end = (start_p) + size;
                                let str_arr2 = '{' + '"0": "' + single_d_j[0] + '", "1": "' + single_d_j[1] + '",' + sing_arr_.slice(start_p, start_end);
                                if (!str_arr2.includes('}')) {
                                    str_arr2 = str_arr2 + '}';
                                }
                                sourceAfter.push(JSON.parse(str_arr2.toString()));
                                let str_arr2_ = '{' + '"0": "' + single_d_j2[0] + '", "1": "' + single_d_j2[1] + '",' + sing_arr2_.slice(start_p, start_end);
                                if (!str_arr2_.includes('}')) {
                                    str_arr2_ = str_arr2_ + '}';
                                }
                                sourceAfter.push(JSON.parse(str_arr2_.toString()));

                                // 表头
                                let ten_2 = '[' + '"0", "1",' + c_json_s.slice(start_p, start_end); // 后 10
                                if (!ten_2.includes(']')) {
                                    ten_2 = ten_2 + ']';
                                }
                                columns_new[page] = JSON.parse(ten_2);
                                //  ColumnsAfter.push(JSON.parse(ten_2));
                            }
                        }


                    }
                }

                // console.log('sourceBefore', sourceBefore);
                // console.log('sourceAfter', sourceAfter);
                sourceBefore.forEach(
                    res => {
                        sou_new.push(res);
                    }
                );
                sourceAfter.forEach(
                    res => {
                        sou_new.push(res);
                    }
                );
                //  console.log('sou_new', sou_new);
                // console.log('columns_new', columns_new);
                this.receiveWriteOffNum.dataSource.data = sou_new;
                this.receiveWriteOffNum.pageSize = source.length;
                this.paginator.pageSize = source.length;
                this.receiveWriteOffNum.dataSource.paginator = this.paginator;
                this.receiveWriteOffNum.displayedColumns_Copy = columns_new;
                const cou_ = JSON.stringify(columns_new[0]);
                this.receiveWriteOffNum.displayedColumns = JSON.parse(cou_);

            }

        }
    }

    // 翻页事件
    nextP(e) {
        //  console.log(e);
        if (this.receiveWriteOffNum.displayedColumns_Copy) {
            const cou_ = JSON.stringify(this.receiveWriteOffNum.displayedColumns_Copy[e.pageIndex]);
            this.receiveWriteOffNum.displayedColumns = JSON.parse(cou_);
            const cou_1 = JSON.stringify(this.receiveWriteOffNum.displayedColumns);
            this.receiveWriteOffNum.displayedColumns_otherCopy = JSON.parse(cou_1);
        }
    }


    //  操作时段数据
    setReceiveWriteOffTableHour(surveyArray, dateStart, dateEnd) {
        this.receiveWriteOffNum.displayedColumns = [];
        this.receiveWriteOffNum.TableHer = [];
        this.receiveWriteOffNum.dataSource.data = [];
        this.receiveWriteOffNum.pageSize = 0;
        const array_ = [];
        surveyArray.value.forEach(res => {
            if (res.selectID === this.headerSelect.selectName) {
                array_.push(res);
            }
        });
        const type_source_type = this.groupData(array_, 'couponType');
        let coum = []; // 表头
        let source = []; // 储存临时数组
        const coum_source = []; // 储存临时数组2
        let date = {}; // 时段
        let Receive = {}; // 领取数量
        let WriteOff = {}; //  核销数量
        for (let i = 0; i < type_source_type.length; i++) {
            const biz_type = type_source_type[i].couponType;
            const item = type_source_type[i].item;

            date['0'] = '';
            Receive['0'] = biz_type;
            WriteOff['0'] = '';
            date['1'] = '';
            Receive['1'] = this.translate.instant('BusinessDataAnalysis.Receive'); // '领取量';
            WriteOff['1'] = this.translate.instant('BusinessDataAnalysis.WriteOff'); // '核销量';
            coum[0] = '0';
            coum[1] = '1';
            let io = 0;
            let date_center = null;
            for (let y = 0; y < item.length; y++) {
                const start_ = Date.parse(dateStart);
                const end_ = Date.parse(dateEnd);
                const center = Date.parse(item[y].Date);
                const center_start = center - start_;
                const end_center = end_ - center;

                if (center_start < 0 || end_center < 0) {
                    continue;
                }
                if (date_center === null) {
                    date_center = item[y].Date;
                } else {
                    if (date_center !== item[y].Date) {
                        date_center = item[y].Date;
                        const re_1 = JSON.stringify(Receive);
                        const wr1 = JSON.stringify(WriteOff);
                        source.push(JSON.parse(re_1));
                        source.push(JSON.parse(wr1));
                        coum = [];
                        date = {};
                        Receive = {}; // 领取数量
                        WriteOff = {}; //  核销数量
                        date['0'] = '';
                        Receive['0'] = biz_type;
                        WriteOff['0'] = '';
                        date['1'] = '';
                        Receive['1'] = this.translate.instant('BusinessDataAnalysis.Receive');  // '领取量';
                        WriteOff['1'] = this.translate.instant('BusinessDataAnalysis.WriteOff');  // '核销量';
                        coum[0] = '0';
                        coum[1] = '1';
                        io = 0;
                    }
                }
                const y_s = (Number(y) + 2).toString();
                coum[io + 2] = y_s;
                io++;
                date[y_s] = this.setTimHour(item[y].Hour);
                WriteOff[y_s] = item[y].WriteOff;
                Receive[y_s] = item[y].Receive;
            }

            const re_ = JSON.stringify(Receive);
            const wr = JSON.stringify(WriteOff);
            source.push(JSON.parse(re_));
            source.push(JSON.parse(wr));
            coum_source.push({biz: biz_type, item: source});
            source = [];
            coum = [];
            date = {};
            Receive = {}; // 领取数量
            WriteOff = {}; //  核销数量

        }
        // this.setSourcePaginator(coum , source , 'hour'); 分页
        // 合并变量
        this.mergeNum(coum_source);
    }


    // 合并变量
    mergeNum(coum_source) {
        if (coum_source) {
            let source_one = {};
            let source_two = {};
            const real_s = [];
            //  console.log(coum_source , 'coum_source');
            for (let i = 0; i < coum_source.length; i++) {
                const biz_item = coum_source[i].item;
                for (let y = 0; y < biz_item.length; y++) {
                    const biz_item_s = biz_item[y];
                    const keys = Object.keys(biz_item_s);
                    if (keys.length <= 2) {
                        continue;
                    }
                    // 领取量
                    if (this.translate.instant('BusinessDataAnalysis.Receive') === biz_item_s[1]) {
                        source_one = this.setSourceChild(source_one, biz_item_s);
                    }
                    // 核销量
                    if (this.translate.instant('BusinessDataAnalysis.WriteOff') === biz_item_s[1]) {
                        source_two = this.setSourceChild(source_two, biz_item_s);
                    }
                }
                const source_one_json = JSON.stringify(source_one);
                const source_two_json = JSON.stringify(source_two);
                if (source_one_json !== '{}') {
                    real_s.push(JSON.parse(source_one_json));
                }
                if (source_two_json !== '{}') {
                    real_s.push(JSON.parse(source_two_json));
                }
                source_one = {};
                source_two = {};
            }
            // console.log(real_s);
            if (real_s.length !== 0) {
                const coum = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25'];
                const coum_her = {
                    0: '',
                    1: '',
                    2: '00:00',
                    3: '01:00',
                    4: '02:00',
                    5: '03:00',
                    6: '04:00',
                    7: '05:00',
                    8: '06:00',
                    9: '07:00',
                    10: '08:00',
                    11: '09:00',
                    12: '10:00',
                    13: '11:00',
                    14: '12:00',
                    15: '13:00',
                    16: '14:00',
                    17: '15:00',
                    18: '16:00',
                    19: '17:00',
                    20: '18:00',
                    21: '19:00',
                    22: '20:00',
                    23: '21:00',
                    24: '22:00',
                    25: '23:00'
                };
                this.receiveWriteOffNum.displayedColumns = coum;
                this.receiveWriteOffNum.TableHer.push(coum_her);
                this.receiveWriteOffNum.dataSource.data = real_s;
                this.receiveWriteOffNum.pageSize = real_s.length;
                this.paginator.pageSize = real_s.length;
                this.receiveWriteOffNum.dataSource.paginator = this.paginator;
            }

        }
    }


    setSourceChild(s, biz_item_s) {
        const s_json = JSON.stringify(s);
        const source_one = JSON.parse(s_json);
        const result = Object.keys(biz_item_s);
        source_one['0'] = biz_item_s[result[0]];
        source_one['1'] = biz_item_s[result[1]];
        source_one['2'] = this.getSourceNum(source_one['2']) + Number(biz_item_s[result[2]]);
        source_one['3'] = this.getSourceNum(source_one['3']) + Number(biz_item_s[result[3]]);
        source_one['4'] = this.getSourceNum(source_one['4']) + Number(biz_item_s[result[4]]);
        source_one['5'] = this.getSourceNum(source_one['5']) + Number(biz_item_s[result[5]]);
        source_one['6'] = this.getSourceNum(source_one['6']) + Number(biz_item_s[result[6]]);
        source_one['7'] = this.getSourceNum(source_one['7']) + Number(biz_item_s[result[7]]);
        source_one['8'] = this.getSourceNum(source_one['8']) + Number(biz_item_s[result[8]]);
        source_one['9'] = this.getSourceNum(source_one['9']) + Number(biz_item_s[result[9]]);
        source_one['10'] = this.getSourceNum(source_one['10']) + Number(biz_item_s[result[10]]);
        source_one['11'] = this.getSourceNum(source_one['11']) + Number(biz_item_s[result[11]]);
        source_one['12'] = this.getSourceNum(source_one['12']) + Number(biz_item_s[result[12]]);
        source_one['13'] = this.getSourceNum(source_one['13']) + Number(biz_item_s[result[13]]);
        source_one['14'] = this.getSourceNum(source_one['14']) + Number(biz_item_s[result[14]]);
        source_one['15'] = this.getSourceNum(source_one['15']) + Number(biz_item_s[result[15]]);
        source_one['16'] = this.getSourceNum(source_one['16']) + Number(biz_item_s[result[16]]);
        source_one['17'] = this.getSourceNum(source_one['17']) + Number(biz_item_s[result[17]]);
        source_one['18'] = this.getSourceNum(source_one['18']) + Number(biz_item_s[result[18]]);
        source_one['19'] = this.getSourceNum(source_one['19']) + Number(biz_item_s[result[19]]);
        source_one['20'] = this.getSourceNum(source_one['20']) + Number(biz_item_s[result[20]]);
        source_one['21'] = this.getSourceNum(source_one['21']) + Number(biz_item_s[result[21]]);
        source_one['22'] = this.getSourceNum(source_one['22']) + Number(biz_item_s[result[22]]);
        source_one['23'] = this.getSourceNum(source_one['23']) + Number(biz_item_s[result[23]]);
        source_one['24'] = this.getSourceNum(source_one['24']) + Number(biz_item_s[result[24]]);
        source_one['25'] = this.getSourceNum(source_one['25']) + Number(biz_item_s[result[25]]);
        return source_one;
    }

    getSourceNum(value) {
        const value_ = Number(value) + '';
        if (value_ === 'NaN') {
            return Number('0');
        } else {
            return Number(value_);
        }
    }



    // 设置年月日
    setYearDay(minDate) {
        const minDate_one = minDate.split('-');
        let MinYearDate;
        let MinMouthDate;
        let MinDayDate;
        for (let a = 0; a < minDate_one.length; a++) {
            if (a === 0) {
                MinYearDate = minDate_one[a] + this.translate.instant('BusinessDataAnalysis.tipsYear');
            } else if (a === 1) {
                MinMouthDate = minDate_one[a] + this.translate.instant('BusinessDataAnalysis.tipsMonth');
            } else {
                MinDayDate = minDate_one[a] + this.translate.instant('BusinessDataAnalysis.tipsDays');
            }
        }
        return MinMouthDate + MinDayDate;
    }


    setTimHour(h_time) {
        let n_time = '';
        if (h_time.length === 1) {
            n_time = '0' + h_time + ':00';
        } else if (h_time.length === 2) {
            n_time = h_time + ':00';
        }
        return n_time;
    }

    orderBy_Two(arr, TValue) {
        for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr.length - i - 1; j++) {   // 这里说明为什么需要-1

                let a_j = arr[j][TValue].replace(/,/g, '');
                if (a_j === '-') {
                    a_j = 0;
                }
                let t_j = arr[j + 1][TValue].replace(/,/g, '');
                if (t_j === '-') {
                    t_j = 0;
                }
                if (Number(a_j) < Number(t_j)) {
                    const temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
    }

    // 改变头顶的活动名称
    toChangeSelectName() {
        this.headerSelect.ActivityName.forEach(res_i => {
            if (res_i.id === this.headerSelect.selectName) {
                const start = Date.parse(res_i.selectStart);
                const end = Date.parse(res_i.selectEnd);
                const start_date = new Date(start);
                const end_date = new Date(end);
                this.headerSelect.startTime = res_i.selectStart;
                this.headerSelect.endTime = res_i.selectEnd;
                this.endTime.nativeElement.value = res_i.selectEnd;
                this.startTime.nativeElement.value = res_i.selectStart;
                this.timeDateSelect.pickerStart.destroy();
                this.timeDateSelect.pickerEnd.destroy();
                this.timeDateSelect.pickerStart = flatpickr(this.startTime.nativeElement, this.timeDateSelect.configStart);
                this.timeDateSelect.pickerEnd = flatpickr(this.endTime.nativeElement, this.timeDateSelect.configEnd);
                this.timeDateSelect.pickerStart.setDate(start_date, false);
                this.timeDateSelect.pickerStart.set('minDate', start_date);
                this.timeDateSelect.pickerStart.set('maxDate', end_date);
                this.timeDateSelect.pickerEnd.setDate(end_date, false);
                this.timeDateSelect.pickerEnd.set('minDate', start_date);
                this.timeDateSelect.pickerEnd.set('maxDate', end_date);
                this.generatePortrait();
            }
        });
        this.timeDateSelect.day = 'day';
        this.showHourTable = false;
        // this.options.disable();
        this.timeDateSelect.timeDis = true;
        // 根据事件修改数据信息
        this.changeSurveyParameter();
    }

    // 获取常旅客画像

    generatePortrait(){
        // 参数要填个路径。带ID
        const data = [];
        this.bigBusinessDataService.getMemberProfile(this.headerSelect.selectName).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                for (let y = 0 ; y < res.length ; y++) {
                    data.push({
                        name: res[y].tagName,
                        value:  Math.sqrt(res[y].count),
                    });
                }
                this.setPortraitData(data);
            }
        );

    }

    setPortraitData(data){
        const treeDataURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABNoAAAbQCAYAAACyjzkFAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFHGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIwLTAzLTI2VDExOjMwOjAzKzA4OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMC0wMy0yNlQxMTozMToyNSswODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMC0wMy0yNlQxMTozMToyNSswODowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo4ODk0YmJhZi00ZTBm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';
        // const keywords = {
        //     'visualMap': 22199,
        //     'continuous': 10288,
        //     'contoller': 1206,
        //     'series': 274470,
        //     'gauge': 12311,
        //     'detail': 206,
        //     'piecewise': 4885,
        //     'textStyle': 32294,
        //     'markPoint': 18574,
        //     'pie': 38929,
        //     'roseType': 969,
        //     'label': 37517,
        //     'emphasis': 12053,
        //     'yAxis': 57299,
        //     'name': 15418,
        //     'type': 22905,
        //     'gridIndex': 5146,
        //     'normal': 49487,
        //     'itemStyle': 33837,
        //     'min': 4500,
        //     'silent': 5744,
        //     'animation': 4840,
        //     'offsetCenter': 232,
        //     'inverse': 3706,
        //     'borderColor': 4812,
        //     'markLine': 16578,
        //     'line': 76970,
        //     'radiusAxis': 6704,
        //     'radar': 15964,
        //     'data': 60679,
        //     'dataZoom': 24347,
        //     'tooltip': 43420,
        //     'toolbox': 25222,
        //     'geo': 16904,
        //     'parallelAxis': 4029,
        //     'parallel': 5319,
        //     'max': 3393,
        //     'bar': 43066,
        //     'heatmap': 3110,
        //     'map': 20285,
        //     'animationDuration': 3425,
        //     'animationDelay': 2431,
        //     'splitNumber': 5175,
        //     'axisLine': 12738,
        //     'lineStyle': 19601,
        //     'splitLine': 7133,
        //     'axisTick': 8831,
        //     'axisLabel': 17516,
        //     'pointer': 590,
        //     'color': 23426,
        //    'title': 387,
        //     'formatter': 15214,
        //     'slider': 36,
        //     'legend': 514,
        //     'grid': 8516,
        //     'smooth': 295,
        //     'smoothMonotone': 696,
        //     'sampling': 757,
        //     'feature': 12815,
        //     'saveAsImage': 2616,
        //     'polar': 6279,
        //     'calculable': 879,
        //     'backgroundColor': 9419,
        //     'excludeComponents': 130,
        //     'show': 20620,
        //     'text': 2592,
        //     'icon': 2782,
        //     'dimension': 478,
        //     'inRange': 1060,
        //     'animationEasing': 2983,
        //     'animationDurationUpdate': 2259,
        //     'animationDelayUpdate': 2236,
        //     'animationEasingUpdate': 2213,
        //     'xAxis': 89459,
        //     'angleAxis': 5469,
        //     'showTitle': 484,
        //     'dataView': 2754,
        //     'restore': 932,
        //     'timeline': 10104,
        //     'range': 477,
        //     'value': 5732,
        //     'precision': 878,
        //     'target': 1433,
        // };
        // const data = [];
        // for (const key in keywords) {
        //     data.push({
        //         name: key,
        //         value: Math.sqrt(keywords[key]),
        //     });
        // }
        data.sort( (a , b ) => {
            return a.value < b.value ? 1 : -1;
        });
        const maskImage = new Image();
        maskImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABNoAAAbQCAYAAACyjzkFAAAACXBIWXMAAC4jAAAuIwF4pT92AAAgAElEQVR4nOzd4VFd2bE24NW37n9wBOAIxI1AOALxRTDcCIwjMI7ATASDIjCKYCCCgQgGIhiIoL/a44Uv0gg4B87eZ6+1n6eKGpfLP+RuBum86l4dmVkAAAAAgPf5L/UDAAAAgPcTtAEAAADABgjaAAAAAGADBG0AAAAAsAGCNgAAAADYAEEbAAAAAGyAoA0AAAAANkDQBgAAAAAbIGgDAAAAgA0QtAEAAADABgjaAAAAAGADBG0AAAAAsAGCNgAAAADYAEEbAAAAAGyAoA0AAAAANkDQBgAAAAAbIGgDAAAAgA0QtAEAAADABgjaAAAAAGADBG0AAAAAsAGCNgCAxkTEeURcR8RxROzqHwDAPERmagUAQCOGcK2U8tOTX+1DKeWilHKWmdf6CACwPYI2AIBG1Om121LKzjO/4pshcBuCt8y811cAgGlZHQUAaMfxCyHb4EOddvutrpce6S0AwHRMtAEANCIiLkspH9f81d7V1dJzq6UAAOMStAEANCIihrXRvXf8aofV0vO6Wnqr7wAAmyVoAwBoRERs8g9uQjcAgA0TtAEANGIDE23PEboBAGyAoA0AoBERMby19mnkX+0Qul160w0AYH2CNgCARkTESSnlnxP+ah/qIYXh6zIz732vAAA8T9AGANCIiNgtpQyrnTtb+hVf1Wm3IXS79H0DAPA1QRsAQEMi4rSU8vcZ/IofHkO3GrxZMwUAFk/QBgDQkBlMtb3kceLt2qopALBEgjYAgMZExGEp5ecGftV3NXT7z5erpgBAzwRtAAANmtEK6Vvc1Km8IXy7r/8s3n0DAFonaAMAaFREnJdSfui0fzc1hHt0+Z3/fGtCDgCYE0EbAEDDOg/b1nFV/7eXT/5570gDADAlQRsAQOOEba+6e7KqevvkvTjHGgCAjRK0AQDMQEQclFKGi6L79Wvw+N+V+s8PerVRD48XUh9DOBNwAMB7CNoAACZSw7T9GqDtP/nPO3owK1dPwjeXUgGAlQnaAABGEBGHNUR7/DKN1q67J8Hbpak3AOA5gjYAgHeKiGEy7TFYOxSqdW9YOb2o4duliTcA4JGgDQBgTRGxWwO1o/rPPTVctLvH4C0zL5ZeDABYMkEbAMAK6vtqQ6h2bGKNFzyddrtw2RQAlkXQBgDwjBquHdfJNVNrvMWXGridqx4A9E/QBgDwRH1v7US4xoY9TrqdZ+al4gJAnwRtAMDi1TfXjmrAZi2UsQ1vup3X0M0hBQDoiKANAFisOr12WkO2Hd8JbMFnU24A0A9BGwCwOBFxWAO2j7rPTFzVwM1bbgDQMEEbALAYEXFcjxsI2JirYa30VOAGAG0StAEA3asTbGfeX6MhAjcAaNB/aRoA0KshYIuI4e2rn4VsNGa4ePvT8P1bg2IAoAEm2gCA7tQrosME2w+6SyeGowknmXmvoQAwXybaAICuRMRJKeVWyEZnhu/n2/rOIAAwUybaAIAuRMT+cLXRoQMW4Mtw1MN0GwDMj4k2AKB5dcrnWsjGQnyq023ebgOAmRG0AQBNi4hhiu2nUsqOTrIgw/f7zxFxqukAMB9WRwGAJtWDB5euiYJDCQAwF4I2AKA5EXFQQzZTbPBvN6WUQ2EbAGyX1VEAoClCNviuYbLzsk56AgBbImgDAJohZIMXCdsAYMsEbQBAE4RssJIhbLtQKgDYDkEbADB7dULnQsgGK/lYr/ECABMTtAEALRhCtj2dgpX9EBHHygUA0xK0AQCzFhGnw4SOLsHaziJiX9kAYDqRmcoNAMxSfZftF92BN7vKzEPlA4BpmGgDAObsTHfgXYb32gRtADARE20AwCzVcOBn3YF3u8tMK6QAMAETbQDAXJ3qDGzEXkQcKSUAjE/QBgDMTn2bzQEE2BwXSAFgAoI2AGCOhAKwWZ9cIAWA8QnaAIA5suYGm/drRFxHxElE7KovAGyeYwgAwKzUAOA3XYHRfSmlnGfmhVIDwGaYaAMA5uZAR2ASn0op/4qIW1NuALAZgjYAYG4OdQQmtVdK+WcpZQjcTgVuAPB2gjYAAGCwU0r5u8ANAN5O0AYAADz1GLgNhxNcAAaANQjaAIC52dcRmIVhpfSniLiMCG8nAsAKBG0AwCwMkzPDo+yllB90BGblYynll4g4s04KAC+LzFQiAGBr6qTMWf0wD8zbXSnlODMv9QkA/shEGwCwNfX9p0shGzRjWCf9eTiWoGUA8Ecm2gCArYiIc2ui0LSbUspRZt5qIwD8m6ANAJhUfePpwhQbdOGhrpJeaCcAWB0FACZUQzarotCPnVLKv6ySAsC/mWgDACbxJGT7oOLQpS91uu1eewFYKkEbADA6IRssxvBu26GwDYClsjoKAIxKyAaLMvx7fh0RB9oOwBIJ2gCAsZ0J2WBR9oZwXdgGwBIJ2gCA0UTEELL9oMKwODvCNgCWyBttAMAoIuK4lPKT6sKiPdQ3266XXggAlkHQBgBsXJ1iuaxTLcCyCdsAWAxBGwCwUfX4wXV9pwmgCNsAWApvtAEAm3YmZAO+4c02ABbBRBsAsDERcVRK+ZeKAs8w2QZA1wRtAMBGRMR+XRn1LhvwkiFs28/Me1UCoDdWRwGATTkXsgEreFwj3VUsAHojaAMA3q2ujH5USWBFH2o4DwBdsToKALxLnUq5Nc0GvMGPmXmicAD0wkQbAPBeZ0I24I3+GhHHigdAL0y0AQBvFhGHpZSfVRB4B5dIAeiGoA0AeLOIuPQ2G7ABd6WUA5dIAWid1VEA4E3qupeQDdiEPccRAOiBiTYA4E0i4rZ+OAbYlL9l5plqAtAqE20AwNrqNJuQDdi0f0bEgaoC0CoTbQDA2kyzASO6qccRvNcGQHNMtAEAazHNBozsQynlVJEBaJGJNgBgLabZgIn8JTMvFRuAlphoAwBWZpoNmNB5ROwqOAAtEbQBAOuwzgVMZc/PHABaY3UUAFhJRByVUv6lWsDE/iczrxUdgBaYaAMAVnWiUsAWnCs6AK0QtAEAr4qI/VLKR5UCtuBDRAj6AWiC1VEA4FURMUyU/KBSwJY8lFL2M/NeAwCYMxNtAMCL6tW/I1UCtminlHKmAQDMnaANAHjNUf2QC7BNP9Q1dgCYLUEbAPAabyMBc+EwAgCz5o02AOBZdXrkVxUCZuQvmXmpIQDMkYk2AOAlx6oDzMyphgAwV4I2AOAlgjZgbj5GhJ9NAMyS1VEA4Lsi4qCU8ovqADN0l5kOIwAwOybaAIDnmBgB5mrPVBsAc2SiDQD4roi4HT7Mqg4wU6baAJgdE20AwB/Ua6NCNmDOhqm2Qx0CYE4EbQDA9xypCtAAF0gBmBVBGwDwPYI2oAUfTbUBMCeCNgDgKxGxO3x4VRWgEY4iADAbgjYA4FumQ4CW/FDflQSArRO0AQDfErQBrTnRMQDmIDJTIwCA/4iI61LKBxUBGvKQmbsaBsC2mWgDAP6jvs8mZANasxMR3moDYOsEbQDAU9ZGgVYJ2gDYOkEbAPCUoA1o1UdHEQDYNkEbAPDUgWoADXMUAYCtcgwBAPiPiPAHA6Bld5lpqg2ArTHRBgD8LiKsjQKt24uII10EYFsEbQDAI2ujQA8EbQBsjaANAHgkaAN6IGgDYGsEbQDAI+8aAT3YsT4KwLYI2gCARx9VAuiEoA2ArXB1FAAYDiEM02y/qgTQiYfM3NVMAKZmog0AKNZGgc5YHwVgKwRtAMDgUBWAzvi5BsDkBG0AQDHRBnTIRBsAkxO0AQBF0AZ0aK++PwkAkxG0AQBF0AZ0ylQbAJMStAEAgz1VADrknTYAJiVoA4CFs1oFdEzQBsCkBG0AgKAN6NVORBzoLgBTEbQBALuLrwDQM1NtAExG0AYAmPYAeiZoA2AygjYAAKBngjYAJiNoAwC80Qb0bMfRFwCmImgDAHwABXpnqg2ASQjaAACA3nmLEoBJCNoAAFdHgd4J2gCYRGSmSgPAgkWEPwwAvXvITH+pAMDoTLQBAAC9cxABgEkI2gAAgCUQtAEwOkEbAACwBC6PAjA6QRsAALAEJtoAGJ2gDQAWzJtFwIL4eQfA6ARtALBsPngCS3Gg0wCMTdAGAAAswY4uAzA2QRsAALAIEWGqDYBRCdoAAICl2NVpAMYkaAMAAJbCRBsAoxK0AQAAS2GiDYBRCdoAAIClELQBMCpBGwAAsBRWRwEYlaANAJbteukFAACATRG0AcCCZea9/gMAwGZEZiolACxYRPjDALAYmRm6DcBYTLQBAAAAwAYI2gAAAABgAwRtAAAAALABgjYA4GbxFQAAgA0QtAEALo8CixERB7oNwFgEbQAAwJLs6jYAY/lvlQWAvkXE8KHysJTyOMVxmZmX2g4AAJslaAOATtWA7ayU8sM3/w//HhEPpZSLUsrpELyVUj76PgAAgPcRtAFAh+obREOAtvPM/7udGsAdlVJufQ8AAMD7eaMNADqzQsj21PC/+eB7AAAA3k/QBgAdiYj9NUI2AABggwRtANCXcyEbwIusywMwGkEbAHQiIo4dNQB4WWYK2gAYTWSm6gJA4+qF0VvTbAAvy8xQIgDGYqINAPpwImQDAIDtMtEGAB2IiGGabU8vAV5mog2AMZloA4DG1bfZhGwAr3tQIwDGJGgDgPYd6SHASq6VCYAxCdoAoGERsV9K+aSHAACwfYI2AGibaTYAAJgJQRsAtO1Q/wBWdqlUAIxJ0AYAjYqIXWujAAAwH4I2AGiXaTaA9dyqFwBjErQBQLsEbQDrEbQBMCpBGwC0S9AGsB5BGwCjisxUYQBoUET4TRxgDZkZ6gXAmEy0AUCDIsI0G8B67tQLgLEJ2gCgTQf6BrAWa6MAjE7QBgBtErQBrOdSvQAYm6ANANq0r28Aa7lXLgDGJmgDgDZ91DeAtVwrFwBjc3UUABoTEbullN/0DWB1Lo4CMAUTbQDQHu+zAazHxVEAJiFoA4D2eJ8NYD3WRgGYhKANANojaANYj6ANgEkI2gCgPYI2gPVcqhcAUxC0AUB7BG0Aa8hMQRsAkxC0AQAAPbvRXQCmImgDgPa4OgqwOtNsAExG0AYA7dnRM4CVCdoAmExkpmoDQEMiwm/eAKv7U2beqxcAUzDRBgANiQiHEABWdyNkA2BKgjYAaIugDWB11kYBmJSgDQAA6NWFzgIwJUEbAADQo4fMNNEGwKQEbQAAQI+EbABMTtAGAAD0yNooAJMTtAFAW3b1C2AlgjYAJidoA4C2HOgXwKuuMvNemQCYmqANAADojWk2ALZC0AYAAPRG0AbAVgjaAACAnnzJzFsdBWAbBG0AAEBPTLMBsDWCNgAAoBcPgjYAtknQBgBtudQvgGdduDYKwDYJ2gAAgF6c6yQA2yRoAwAAenCXmaZ+AdgqQRsAANCDM10EYNsEbQAAQA+sjQKwdYI2AACgdZ8dQQBgDiIzNQIAGhERu6WU3/QL4Cv/k5nXSgLAtploA4CGmNgA+K7ziDhSGgC2zUQbADQmIvzmDfB9V6WUI38pAcC2CNoAoDGCNoAXPZRSDq2SArANVkcBoD1XegbwrJ1SymVEHCgRAFMTtAEAAL0ZwraLekAGACYjaAOA9nh7COB1e6WUU3UCYEqCNgBoj3eHAFbz14jYVysApiJoAwAAemaqDYDJuDoKAI2JiMNSys/6BrCyP2WmtXsARmeiDQAA6N2RDgMwBUEbALTHG20A6xG0ATAJQRsANMb6E8DaDpQMgCkI2gCgTVf6BrCyvYjYVS4AxiZoA4A2mWoDWI+pNgBGJ2gDgDZ5pw0AAGZG0AYAbRK0AaznUL0AGJugDQDadKtvAAAwL4I2AGhQZppoAwCAmRG0AUC7bvQOAADmQ9AGAO0y1QYAADMiaAOAdgnaAFbnZyYAoxO0AUC7fGgEWN29WgEwNkEbADQqMy/1DmBlgjYARidoA4C2XekfwOtcawZgCoI2AGibD44Ar7tTIwCmIGgDgLZZHwV43a0aATAFQRsAtE3QBvA6PysBmISgDQAalpnD4943egjwImv2AExC0AYA7bvQQ4AXmWgDYBKCNgBonw+QAM+7qdO/ADA6QRsANC4zh6DtQR8BvstfRgAwGUEbAPTB+ijA9wnaAJiMoA0A+iBoA/ijh8z08xGAyQjaAKAPJjYA/sjPRgAmJWgDgA7Uh74/6yXAV0yzATApQRsA9MMHSoD/8+DnIgBTE7QBQCfqO0SujwL820Wd9gWAyQjaAKAv5/oJ8DvTbABMLjJT1QGgExGxX0r5VT+BhbvLzP2lFwGA6ZloA4COZOZtKeVKT4GFM90LwFYI2gCgPz5gAkt3tvQCALAdgjYA6ExmDkHbnb4CC/XZEQQAtkXQBgB9OtVXYKFMswGwNY4hAECnImJ4r21Pf4EFucrMQw0HYFtMtAFAv0y1AUvj5x4AW2WiDQA6ZqoNWBDTbABsnYk2AOjbif4CC2GaDYCtE7QBQN9u9RdYgGGa7VKjAdg2QRsA9G1Xf4EFMM0GwCwI2gAAgJaZZgNgNgRtAABAy7xFCcBsCNoAoG8H+gt07HNmXmswAHMhaAOAvnmjDejVg2k2AOZG0AYAALToLDPvdQ6AORG0AQAArbnLTJdGAZgdQRsA9M0bbUCPjnUVgDkStAFA37zRBvTmS2Ze6ioAcyRoAwAAWvFgmg2AORO0AQAArTh2AAGAORO0AUDf9vUX6MSwMnqhmQDMWWSmBgFApyLCb/RAD4aV0X3TbADMnYk2AABg7qyMAtAEQRsAADBnVkYBaIbVUQDomNVRoHF3pZQD02wAtMJEGwB0KiIcQgBaZ2UUgKYI2gCgX4I2oGX/yMxLHQSgJYI2AABgbq4y81RXAGiNoA0AAJiTh1LKkY4A0CJBGwAAMCdH3mUDoFWCNgAAYC7+5l02AFomaAMAAObgS2ae6QQALRO0AUC/DvQWaMRNKeVYswBonaANAPq1q7dAAx68ywZALwRtAADANg0h260OANADQRsAALAt/+v4AQA9EbQBAADb8GNmnqs8AD0RtAEAAFP7nJknqg5AbwRtAADAlIYLo0I2ALokaAMAAKYyhGyHLowC0CtBGwAAMIUHIRsAvRO0AQAAYxOyAbAIgjYAAGBMjyHbtSoD0DtBGwAAMBYhGwCLImgDAADGcixkA2BJBG0AAMAY/jczL1QWgCURtAEAAJs2hGznqgrA0gjaAACATRKyAbBYgjYAAGBThGwALJqgDQAA2AQhGwCL999LLwAAAPAuD/W6qMMHACyeoA0A+nWtt8DIhpDtMDP9vAFg8YrVUQDo2r32AiMSsgHANwRtAADAWxwJ2QDga4I2AABgXZ8z81LVAOBrgjYAAGBdpyoGAH8kaAOAft3qLTCCYZrNzxcA+I7ITHUBgE5FhN/ogU37s6ANAL7PRBsAALCqfwjZAOB5JtoAoGMm2oANeiil7GfmvaICwPeZaAOAvt3oL7AhZ0I2AHiZoA0A+uZDMbAJwzTbmUoCwMsEbQAAwGsuTLMBwOsEbQDQN4+WA5twqooA8DpBGwD0TdAGvNdnl0YBYDWCNgAA4CWm2QBgRYI2AOjbpf4C72CaDQDWIGgDAACec64yALA6QRsA9M0kCvBWV5lpKhYA1iBoA4COWfkC3sE0GwCsKTJTzQCgYxFxX0rZ0WNgDXeZua9gALAeE20A0L9rPQbWdKZgALA+QRsA9O9ej4E1WRsFgDcQtAFA/0y0Aev4nJkCegB4A0EbAPTPQQRgHdZGAeCNBG0A0D9BG7Cqm8w0BQsAbyRoA4D++dAMrMo0GwC8Q2Sm+gFA5yLCb/jAax5KKfveZwOAtzPRBgDLcKXPwCsuhGwA8D6CNgBYBu+0Aa85VyEAeB9BGwAsg6ANeMldZl6qEAC8j6ANAJbBB2jgJabZAGADBG0AsAwm2oCXCNoAYAMEbQCwAJkpaAOec+VnBABshqANAJbD5VHge0yzAcCGCNoAYDlMrADfc6EqALAZgjYAWI5rvQa+8SUz7xUFADZD0AYAyyFoA75lmg0ANigyUz0BYCEiwm/8wKOHUsq+iTYA2BwTbQCwLDf6DVQXQjYA2CxBGwAsi/VR4JG1UQDYMEEbACyLoA0YPGSmoA0ANkzQBgDLImgDimk2ABiHoA0AFiQzL/UbELQBwDgEbQCwPFd6DotmbRQARiJoA4DlsT4KyyZkA4CRCNoAYHmsj8KyCdoAYCSRmWoLAAsSEbullN/0HBZpWBvd1XoAGIeJNgBYmMy8L6Xc6Tsskmk2ABiRoA0Alsn6KCyToA0ARiRoA4BlErTB8rg2CgAjE7QBwDIJ2mB5hGwAMDJBGwAsUGbeeqcNFkfQBgAjE7QBwHKZaoPlsDYKABMQtAHAcgnaYDnO9RoAxidoA4DlErTBcgjaAGACkZnqDAALFRHDW217+g9du8vMfS0GgPGZaAOAZfNmE/TvTI8BYBqCNgBYNuuj0D+BOgBMRNAGAMsmaIO+fcnMWz0GgGkI2gBgwTLzvpRy5XsAuuUIAgBMSNAGAJhqgz4NRxCsjQLAhARtAIAP4tAn02wAMLHITDUHgIWLiGGFdGfpdYDO/KmuhwMAEzHRBgAUU23Qnc9CNgCYnqANACiCNujOmZYCwPSsjgIAw+robinlN5WALlxl5qFWAsD0TLQBAKWumF2pBHThVBsBYDsEbQDAI+uj0L5hmu1SHwFgO6yOAgC/i4j9UsqvqgFN+4ugDQC2x0QbAPC7zLwtpdyoBjTLNBsAbJmgDQB4yod0aJe32QBgywRtAMBT56oBTTLNBgAz4I02AOArETGskO6pCjTF22wAMAMm2gCAb7k+Cm35LGQDgHkw0QYAfCUiDkopv6gKNOGhlHJQj5kAAFtmog0A+EpmXtcP78D8nQnZAGA+BG0AwPdYH4X5uxuCNn0CgPkQtAEA3yNog/k7ycx7fQKA+fBGGwDwXRExfIDfUR2YpS+ZeaQ1ADAvJtoAgOeYaoP5cmUUAGZI0AYAPEfQBvN1ojcAMD9WRwGAZ1kfhVn7S2aabAOAGTHRBgC85Fx1YLaOtQYA5sVEGwDwrIg4KKX8okIwW39yeRQA5sNEGwDwrMy8LqXcqRDMlqk2AJgRQRsA8BpHEWC+HEUAgBkRtAEAr/FOG8zXXkQc6Q8AzIOgDQB4UV0fvVElmC3rowAwE4I2AGAVptpgvj5FxL7+AMD2CdoAgFV4pw3mzVttADADkZn6AAC8KiIuSykfVQpm6aGUsp+Z99oDANtjog0AWJX1UZivnVKKowgAsGUm2gCAlUTEbinlN9WC2brLTG+1AcAWmWgDAFZSV9I+qxbM1l5EHGoPAGyPoA0AWIejCDBvp/oDANtjdRQAWEtE3A6TM6oGs/XnzLzVHgCYnok2AGBdptpg3ky1AcCWmGgDANYSEcNj67+qGsyaqTYA2AITbQDAWuqH9xtVg1k71h4AmJ6gDQB4izNVg1k7iYhdLQKAaQnaAIC38E4bzNvOELbpEQBMS9AGAKwtM+9LKZ9VDmZN0AYAExO0AQBvda5yMGs7EeGtNgCYkKujAMCbRcRwGGFPBWG27jJzX3sAYBom2gCA93AUAeZtz1QbAEzHRBsA8GYRMUzK/KqCMGum2gBgIibaAIA3y8xhdfRKBWHWTLUBwERMtAEA7xIRwwXSHVWEWTPVBgATMNEGALxZnZIRssH8mWoDgAmYaAMA3szVUWiKqTYAGJmJNgDgTep0jJAN2mGqDQBGZqINAFhbROyWUm6tjUJzTLUBwIhMtAEAb3EuZIMmmWoDgBGZaAMA1hIRJ6WUf6oaNMtUGwCMxEQbALCyiDgUskHz9mpgDgBsmIk2AGAlEXFQSrm0MgpdeCil7GfmvXYCwOaYaAMAXiVkg+4M/y6bagOADTPRBgC8SMgG3TLVBgAbZqINAHiWkA26Nvx7fabFALA5JtoAgO+qhw8uhGzQvT9n5q02A8D7mWgDAP4gIo5LKT8L2WARzrUZADZD0AYAfCUihg/dP6kKLMbHOsEKALyT1VEA4HcRsVtXRT+qCCzOTWYeaDsAvI+JNgDg8T22WyEbLNaHujIOALyDiTYAWLiIOC2l/H3pdQDKQyllPzPvlQIA3sZEGwAsVETsR8S1kA2ohuMnp4oBAG9nog0AFigiTuoHaldFgW/9OTNvVQUA1meiDQAWpE6xXZZS/ilkA55xrjAA8DaCNgBYiDrFdu3gAfCKjxFxpEgAsD6rowDQuYg4KKWcCdiANdyVUg4cRgCA9ZhoA4BORcRuRAwB2y9CNmBNew4jAMD6TLQBQIfq2tdZ/bAM8Fb/k5nXqgcAqzHRBgAdGdZE67GDfwnZgA1wGAEA1iBoA4AOWBMFRvKhHlIBAFZgdRQAGhcRwztKwwfhHb0ERvBQDyPcKi4AvMxEGwA0KiKOI2L44Pt3IRswoh0rpACwGkEbADQmIg7rO2w/eYcNmMhHK6QA8DqrowDQiCFgK6WceoMN2BIrpADwChNtADBzEbEfERellJ+FbMAWDSukl8N1Y00AgO8TtAHATNWAbXgX6ddSyid9AmZgr4Zth5oBAH8kaAOAmfkmYPtBf4CZGSbbfh4OsmgMAHxN0AYAMyFgAxrzU0ScaRoA/B/HEABgy4aArR45EK4BLfpcSjnJzHvdA2DpBG0AsCX1jaNjARvQgZtSyqGwDYClE7QBwMRqwHbqgijQmbtSylFmXmssAEslaAOAiUTE0bBeJWADOvYwTOpm5oUmA7BEgjYAGFm9zDdMsO2pNbAQf8tMhxIAWBxBGwCMICJ26/Ta8LWjxsACfc7MY40HYEkEbQCwQU8uiB4J2AAcSQBgWQRtALAB9cDBML32ST0BvuJIAgCLIWgDgHeo768NAdsHdQR4liMJACyCoA0A1lTXQ4+9vwawNkcSAOiaoA0AVlTXQ4eA7Qc1A3izz8NfVHi3DYAeCdoA4BXWQwE2zpEEALokaAOA76jroSd1gs16KMDmPdSwzZEEALohaDtfVjAAACAASURBVAOAJyLiqIZrrocCTON/M/NcrQHogaANgMWLiN0n02t7S68HwBZ8zsxjhQegdYI2ABbLcQOAWbkqpRx5tw2AlgnaAFiUOr32eNzA9BrAvNzVsM27bQA0SdAGwCKYXgNoxnAk4cS7bQC0SNAGQLfq5dBjb68BNOnHzDzROgBaImgDoDsuhwJ0w7ttADRF0AZAF+r02uPl0B1dBeiGd9sAaIagDYBm1cMGRzVg+6CTAN3ybhsATRC0AdCcuhp65LABwOJ4tw2AWRO0AdCEJ6uhRw4bACzaTSnl0LttAMyRoA2A2bIaCsAzHmrY5t02AGZF0AbA7FgNBWBFf8vMM8UCYC4EbQDMQkQc1IuhroYCsI7P9VCCVVIAtk7QBsDW1HfXHsM1764B8FbDu23HVkkB2DZBGwCT8u4aACN5qJNt5woMwLYI2gAY3ZNwbfj6pOIAjOjHzDxRYAC2QdAGwGieHDU48u4aABMaVkmPMvNW0QGYkqANgI2KiMP65ppwDYBteqjvtl3oAgBTEbQB8G5PLoYeOWoAwMz8IzNPNQWAKQjaAHgT4RoADbmqq6T3mgbAmARtAKxMuAZAwx5q2HapiQCMRdAGwIsiYr+Ga8fCNQA6YJUUgNEI2gD4gxquHdVw7YMKAdAZq6QAjELQBsDvnqyFHgrXAFgAV0kB2DhBG8CCeXMNAMqPmXmiDABsgqANYGGEawDwBzd1lfRWaQB4D0EbwAII1wDgVcMq6UlmnisVAG8laAPoVEQc1WBt+NrRZwBYyecauDmUAMDaBG0AnYiI3XrIQLgGAO9zV1dJr9URgHUI2gAaVsO1x2Dtk14CwEb9IzNPlRSAVQnaABoTEftPwrWP+gcAo7oa3jl1KAGAVQjaABrw5JjBsBr6Qc8AYFIPNWy7UHYAXiJoA5ipeszg0KVQAJiNLzVwcygBgO8StAHMxDfvrR06ZgAAs3RXw7ZL7QHgW4I2gC3y3hoANOvHzDzRPgCeErQBTCwiDp+Ea1ZCAaBdN3W67VoPASiCNoDxWQkFgO79IzNPtRkAQRvACOqV0MN6KdSVUADon+k2AARtAJtQp9YOn0ytWQkFgGUy3QawYII2gDdyyAAAeIbpNoCFErQBrCEijp5MrplaAwBeYroNYGEEbQAvePLWmqk1AOAtTLcBLIigDeAJb60BACP5sZRympn3CgzQL0EbsHh1au3xrTUXQgGAsdzV6bZLFQbok6ANWJx6xODp1NqO7wIAYEJfauBmug2gM4I2oHtP1kEdMQAA5uKhrpKe6QhAPwRtQJci4vBJuOaIAQAwV1ellBPHEgD6IGgDuvDkOuihdVAAoEGOJQB0QNAGNOnJO2uHroMCAJ14qNNt5xoK0CZBG9CE+s7akWANAFiAmxq4uU4K0BhBGzBL3xwwGL4+6BQAsDBfauB2q/EAbRC0AbMgWAMAeJb32wAaIWgDtkKwBgCwluH9trPhS+AGMF+CNmAS9XjBgWANAOBdHEwAmDFBGzAKV0EBAEZ1V9dJBW4AMyJoAzYiIg6+CdZ2VBYAYHS/B26llAsrpQDbJ2gD3sTEGgDArHjDDWAGBG3AyiJiCNSOvLEGADBbQ+B2UddKb7UJYFqCNuBZ9TLoY7B2ZB0UAKApV6WUc++4AUxH0AZ85Um4Nnx9Uh0AgOY9TrkNoduldgKMR9AGCNcAAJbjMXQbvi695wawWYI2WLCIOBauAQAs2s0QuJVShvfcrk28AbyPoA0Wph40OPbmGgAAz7gbQrf6dSl8A1idoA0WoK6GDuHaSSllT88BAFjT4+TbpZVTgOcJ2qBjT6bXftBnAAA26ObJO28m3gAqQRt05slhg1PTawAATODhybTbRWbeKjqwVII26ERE7D9ZD/X2GgAA2/K4Znqemde6ACyJoA0aVwO2U+uhAADM0ENdMR0m3S40COidoA0aVd9fG6bXPukhAAANELoB3RO0QWNqwDZMsH3UOwAAGiV0A7okaINGCNgAAOiU0A3ohqANZs4bbAAALMhj6DYcUrjUeKA1gjaYqYjYLaWcCdgAAFiouxq6nWXmrW8CoAWCNpihiDithw529AcAAMrNMOVWJ93ulQOYK0EbzEhEHNUptj19AQCA7/pSAzfvuQGzI2iDGajvsJ07dAAAACt7qH+GtloKzIagDbasron+XR8AAODNbupmyIXVUmCbBG2wJRFxWP8GzpooAABsxsOTAwrXagpMTdAGE6vXRIcptr+qPQAAjMaUGzA5QRtMyBQbAABMzpQbMBlBG0wkIs5MsQEAwFZd1Yul59oAjEHQBiOLiIM6xfZBrQEAYBYe6lrpuYulwCYJ2mBEEXFcfwPfUWcAAJilzzVwu9Qe4L0EbTCCevBgmGL7pL4AANCEm/qOm7VS4M0EbbBhVkUBAKBpj2ulZ66VAusStMEGWRUFAICuDGulp95xA1YlaIMNcVUUAAC6dVUDN++4AS8StME7eY8NAAAW464Gbt5xA75L0AbvEBH7pZQL77EBAMCi3NUnY8694wY8JWiDN6pHDy69xwYAAIvlcALwFUEbvEFEHNV1USEbAADwUD8fnDmcAMsmaIM11cuiP6kbAADwHS6VwoIJ2mANQjYAAGBFAjdYoP/SdFhNRJwI2QAAgBX9UEr5NSLO6xE1YAFMtMEKht8c62+UAAAAb2HCDRZA0AavELIBAAAbJHCDjgna4AVCNgAAYCQCN+iQN9rgGfVNNiEbAAAwhqdvuO2qMPTBRBt8h+uiAADAhB5KKWfDV2beKzy0S9AG3xCyAQAAW/JQw7ZTDYA2CdrgiYg4KqX8S00AAIAtuqvvt51rArRF0AZVRByUUi5LKTtqAgAAzMBNKeUkMy81A9ogaIN/h2z7pZRrIRsAADBDV6WUYxdKYf5cHWXx6oWfCyEbAAAwUx/rhdIzF0ph3gRtUMrw7sEHdQAAAGbur6WU24g40SiYJ6ujLNrwN0L1NysAAICW3NV1Uu+3wYyYaGOxIuJYyAYAADRqr5Tyc0Rc1DengRkw0cYiuTAKAAB05KGUcpaZp5oK2yVoY3Hq46GX3mUDAAA6c1NKObFOCttjdZQlOhOyAQAAHfpQ10nPXSeF7TDRxqLUd9l+0nUAAKBzD/VYwoVGw3QEbSyGd9kAAIAFuqqB263mw/isjrIk50I2AABgYT6WUq4j4kTjYXyCNhYhIk69ywYAACzUMHDwz4i4jIh93wQwHqujdK+ujP6i0wAAAL+/3TZcJj1XCtg8QRvdi4hr02wAAABf+VLfbrtXFtgcq6N0zcooAADAd30qpdxGxKHywOaYaKNbVkYBAABW8mNmOpYAGyBoo1tWRgEAAFZ2U0o5ysxbJYO3szpKl+rpaiEbAADAaobPT9cRcaRe8HYm2uhOROwObw3UE9YAAACs5x+ZeapmsD4TbfToTMgGAADwZn+PiIs6xACswUQbXakXc37WVQAAgHcb3m07zsxrpYTVCNroSkRcllI+6ioAAMBGPNQjCZfKCa+zOko3IuJYyAYAALBRw7M8P9fPW8ArTLTRjYgYDiDs6SgAAMAoHEmAV5hoowsRcSJkAwAAGNVwJOFcieF5JtpoXr2Ec+vSKAAAwCQ+Z6ZVUvgOE2304ETIBgAAMJkfTLbB95loo2mm2QAAALbGZBt8w0QbrTPNBgAAsB0m2+AbJtpolmk2AACAWTDZBpWJNlpmmg0AAGD7hsk2QRuLV0y00bKIuBe0AQAAzMb/y8wL7WDJTLTRpPq3JUI2AACA+TiPiH39YMlMtNGkiBjeZtvTPQAAgFm5ycwDLWGpTLTRnIg4ErIBAADM0oeIONMalspEG82JiMtSykedAwAAmK2/ZOal9rA0gjaaEhHDCPIvugYAADBrVkhZJKujtOZExwAAAGZvWCH1+Y3FMdFGMyJit5Ry69ooAABAEx5KKfuZea9dLIWJNlpyLGQDAABoxk79HAeLYaKNZkTErWujAAAATbnLzH0tYylMtNGEegRByAYAANCWvYg41DOWQtBGKzyiCQAA0CbroyyG1VGaEBH33mcDAABo0kNm7modS2CijdmLCEcQAAAA2rVjfZSlELTRgiNdAgAAaJrPdSyC1VFmLSKG8eLfdAkAAKBpro+yCCbamDt/6wEAANC+4fqooI3uCdqYO9dGAQAA+uCdNronaGO26t92fNAhAACALthYonuCNubMD2EAAIB+mGije4I25swPYQAAgH7sRMSBftIzQRuzVK+NftIdAACArhiooGuCNubK2igAAEB/BG10TdDGXAnaAAAA+iNoo2uCNubKD18AAID+eKeNrgnamJ2IGEK2HZ0BAADokqCNbgnamCNrowAAAP2ywUS3BG3MkR+6AAAA/fKZj25FZuousxER+6WUX3UEAACga3/KzHstpjcm2pgbf7MBAADQP5/96JKgjbnxwxYAAKB/DiLQJUEbcyNoAwAA6J/PfnTJG23MhvfZAAAAliMzQ7vpjYk25sTfaAAAACxERFgfpTuCNuZE0AYAALAcgja6I2hjTgRtAAAAy+EzIN0RtDEL9X22Pd0AAABYDBNtdEfQxlz4AQsAALAsH/Sb3gjamAsjwwAAAAsTET4L0hVBG3Nhog0AAGB5fBb8/+zd63EV2fU34F5V73fJEQhHIBwBcgTgCJAjsBzBMBH8mQjMRGCIwBCBIYJBERgiWG/10JoRGgnOpS/78jxVlL+Moc/eR0d9fr3WXjRF0EYpntgJAACA7gjaaIqgjc0pFQYAAOiW74M0RdBGCTzBAAAA6NNZRJzae1ohaKMEgjYAAIB++U5IMwRtlMCHKgAAQL+0j9IMQRslOLcLAAAA3VJ8QTMEbWzKIAQAAIDuCdpohqCNrT2yAwAAAF0zEIFmCNrYmicXAAAA+G5IEwRtbM2HKQAAAI4VogmCNrYmaAMAAMCxQjRB0MZmph78EzsAAADQPUUYNEHQxpZ8kAIAADA6twq0QNDGlgRtAAAA/CoinNNG9QRtbEkPPgAAADcUY1A9QRtb8iEKAADADd8RqZ6gjS2paAMAAOCGoI3qRWbaRTYREd58AAAA/CYzw2pQMxVtbMIhlwAAANwVEaraqJqgja2cWnkAAADuELRRNUEbW/HhCQAAwF2+K1I1QRtbUdEGAADAXYI2qiZoYys+PAEAALjLd0WqJmhjK4+sPAAAAHecRITvi1RL0MZWzqw8AAAA91DVRrUEbazO0wkAAAC+QdBGtQRtbEHQBgAAwEMEbVRL0MYWBG0AAAA8RNBGtQRtbEHQBgAAwEPOIuLU6lAjQRtbELQBAADwLaraqJKgjS0I2gAAAPgWQRtVErSxBSXAAAAAfIugjSoJ2tjCuVUHAADgG3RCUaXITDvHqiLCmw4AAIBvysywQtRGRRuriogLKw4AAMD3RIT2UaojaAMAAABKpH2U6gjaWJsPSgAAAHahoo3qCNpYm6ANAACAXTh6iOoI2gAAAIASKdSgOoI21uaJBAAAALs4i4hTK0VNBG0AAABAqZzTRlUEbaxN6S8AAAC7ErRRFUEbazuz4gAAAOxI0EZVBG0AAABAqXRFUZXITDvGKiJifBLxX6sNAADArjIzLBa1UNHGmkyLAQAAYC8RoaqNagjaAAAAgJI5p41qCNpY04XVBgAAYE+CNqohaAMAAABKJmijGoI21uSMNgAAAPYlaKMagjbW5MMRAACAfZ1ZMWohaAMAAACKFhHO/KYKgjbWZCQzAAAAh/B9kioI2liTcl8AAAAO4SgiqiBoAwAAAEonaKMKgjZWERE+FAEAADiU75RUQdDGWk6tNAAAAAc6iQjfKymeoA0AAACogao2iidoYy1GMQMAAHAM3yspnqANAAAAqMEju0TpBG2sxQciAAAAx/C9kuIJ2liLD0QAAACO8cTqUTpBGwAAAFCFiDAQgaIJ2liLJw8AAAAcS7cURRO0AQAAALVQ0UbRBG0sLiI8cQAAAGAOgjaKJmhjDYI2AAAA5iBoo2iCNtYgaAMAAGAOZ1aRkgnaWIOgDQAAgFlExIWVpFSCNtZwapUBAACYiWIOiiVoYw166AEAAJiL75gUS9DGGjxtAAAAYC6CNooVmWl3WFREeJMBAAAwl8+Z6YgiiqSijUVFhCcNAAAAzOkkIgRtFEnQxtK0jQIAADA3RR0USdDG0nz4AQAAMDffNSmSoI2l+fADAABgbr5rUiRBG0vTOgoAAMDcfNekSKaOsigTRwEAAFhCZoaFpTQq2lhMRFxYXQAAAJYQEaraKI6gjSXpmQcAAGApgjaKI2hjSSraAAAAWIrvnBRH0MaSVLQBAACwFN85KY6gjUVMvfJnVhcAAICFaB2lOII2lqKEFwAAgCWdW11KI2hjKYI2AAAAFhUR2kcpiqCNpQjaAAAAWJr2UYoiaGN2zmcDAABgJSraKIqgjSWoZgMAAGANgjaKImhjCYI2AAAA1iBooyiRmXaEWUXEp2EYTqwqAAAAS8vMsMiUQkUbs5omvgjZAAAAWEVE6KqiGII25uYDDgAAgDWZPEoxBG3M7ZkVBQAAYEWCNoohaGM2EXE6DMMTKwoAAMCKdFZRDEEbc1LNBgAAwNpUtFEMQRtz8hQBAACAtZ1NHVawOUEbc1LRBgAAwBYeW3VKIGhjFtM45ROrCQAAwAYEbRRB0MZcVLMBAACwFee0UQRBG3MRtAEAALAVFW0UQdDG0SJi/EA7s5IAAABsRNBGEQRtzOHSKgIAALChk4jQPsrmBG3MQdsoAAAAWxO0sTlBG0fRNgoAAEAhLmwEWxO0cSxtowAAAJRARRubE7RxLG2jAAAAlEDQxuYiM+0CB5naRv9r9QAAAChBZoaNYEsq2jiGtlEAAACKYfIoWxO0cQxtowAAAJTksd1gS4I2DmLaKAAAAAUStLEpQRuHurJyAAAAFEbQxqYEbRxK2ygAAAClcUYbmxK0sbeIGEO2EysHAABAYc5tCFsStHEI1WwAAAAUaTpTHDYhaGMvEXE6DMNzqwYAAEChtI+yGUEb+1LNBgAAQMlUtLEZQRv7urRiAAAAFOzC5rAVQRs7i4ix/PaJFQMAAKBgWkfZjKCNfahmAwAAoHRndoitCNrYh6ANAACA4kWE9lE2IWhjJ9OHlKcCAAAA1ED7KJsQtLEr1WwAAADUQtDGJgRtfFdEnA7D8MxKAQAAUAmto2xC0MYuxpDtxEoBAABQicc2ii1EZlp4viki3g/DcG6VAAAAqMifMvOTDWNNKtr4poh4LGQDAACgQqraWJ2gje8xBAEAAIAaCdpYnaCN7xG0AQAAUCOTR1mdoI0HRcSlIQgAAABUSkUbqzMMgQdFxNthGJ5YIQAAAGqUmWHjWJOKNu4VEY+EbAAAANRs+m4LqxG08ZArKwMAAEDlBG2sStDGQwxBAAAAoHYXdpA1Cdr4A0MQAAAAaISKNlYlaOM+qtkAAABogcmjrMrUUb4yHRT5i1UBAACgBSaPsiYVbdxlCAIAAADNiAhVbaxG0MZvIuJU2ygAAACNcU4bqxG0cdszQxAAAABojIo2ViNo4zZtowAAALRG0MZqBG38KiIuhmE4txoAAAA0RtDGagRt3HA2GwAAAC06s6usJTLTYnduGoLwv97XAQAAgGb9NTPf2l6WpqKNwdlsAAAANM7kUVYhaGPQNgoAAEDjBG2sQtDWuYh4pl8dAACAxl3YYNYgaEPbKAAAAK0zeZRVGIbQsYgYS2d/6X0dAAAA6MKfMvOTrWZJKtr69qL3BQAAAKAbqtpYnKCtUxFxOgzDs97XAQAAgG4I2licoK1f46TRk94XAQAAgG4I2licoK1fhiAAAADQk0d2m6UZhtChiBhbRv/d+zoAAADQl8wMW86SVLT1STUbAAAA3YkIVW0sStDWmelD5Unv6wAAAECXBG0sStDWnxe9LwAAAADdurD1LEnQ1pGIOB2G4Xnv6wAAAEC3TB5lUYK2vjibDQAAgJ5pHWVRpo52JCI+DsNw1vs6AAAA0C+TR1mSirZORMSlkA0AAIDeRYT2URYjaOuHtlEAAABwThsLErR1ICLGqSrnva8DAAAAOKeNJQna+nDZ+wIAAADA5MJCsBTDEBoXEWNS/0vv6wAAAACT68xU1cYiVLS1z9lsAAAA8LuziDi1HixB0Naw6YND2ygAAAB8zUAEFiFoa9sYsp30vggAAABwh6CNRQja2qZtFAAAAP5I0MYiBG2Nioixmu2s93UAAACAexiGwCJMHW1URLwfhuG893UAAACA+2RmWBjmpqKtQRFxIWQDAACAh0WEqjZmJ2hrk7PZAAAA4Nuc08bsBG2NmRL5p72vAwAAAHyHoI3ZCdra86L3BQAAAIAdCNqYnWEIDYmI02EY/tf7OgAAAMAOrjPTOW3MSkVbW5zNBgAAALs5s07MTUVbQyLi0zAMJ72vAwAAAOzor5n51mIxFxVtjYiISyEbAAAA7EXrKLMStLXDEAQAAADYj4EIzErQ1oCIeKa3HAAAAPYmaGNWgrY2GIIAAAAA+xO0MStBW+Ui4mIYhie9rwMAAAAc4CQinNPGbARt9VPNBgAAAIcTtDEbQVvFptT9ae/rAAAAAEe4sHjMRdBWN5NGAQAA4DjOaWM2kZlWs0IRcToMw/96XwcAAAA40ofMFLYxCxVt9XI2GwAAABzv3BoyF0FbhaZqNkEbAAAAzCAinNPGLARtdbocRxD3vggAAAAwE5NHmYWgrU6q2QAAAGA+zmhjFoK2ykTEWM121vs6AAAAwIwEbczC1NHKRMRHQRsAAADM6nNmnlpSjqWirSLT4YxCNgAAAJjXSUQ4p42jCdrq8qL3BQAAAICFCNo4mqCtElM125Pe1wEAAAAWcmFhOZagrR6XvS8AAAAALMhABI5mGEIFpj7xX3pfBwAAAFjQdWZqH+UoKtrq4Gw2AAAAWJbhgxxNRVvhImIcL/y/3tcBAAAAVvDXzHxroTmUirbyXfW+AAAAALAS57RxFEFbwaZqNkEbAAAArMMZbRxF0Fa2cdLoSe+LAAAAACtR0cZRnNFWsIj46DBGAAAAWE9mhuXmUCraChURl0I2AAAAWFdEqGrjYIK2cr3ofQEAAABgA85p42CCtgJFxIVqNgAAANiEijYOJmgrk2o2AAAA2MaFdedQhiEUZqpm+0/v6wAAAAAb+ZyZpxafQ6hoK89l7wsAAAAAGzqJCEEbBxG0FSQixgMXn/e+DgAAALAx57RxEEFbWZzNBgAAANtzThsHEbQVYipLVc0GAAAA21PRxkEEbeW46n0BAAAAoBCCNg5i6mgBpmq2j+OBi72vBQAAAJQgM8NGsC8VbWW4FLIBAABAOSLCOW3sTdBWBm2jAAAAUBbto+xN0LaxiBir2c66XgQAAAAoj6CNvQnatqeaDQAAAMojaGNvhiFsaOr3/k+3CwAAAAAFMxCBfalo29aLnl88AAAAlMxABPYlaNtIRDwahuFJly8eAAAA6vDIPrEPQdt2VLMBAABA2ZzTxl4EbRuYqtmed/fCAQAAoC6CNvYiaNvGZY8vGgAAACrjyCf2YuroyiLidBiGj8MwnHT1wgEAAKBOf8nM9/aOXahoW98zIRsAAABUQ/soOxO0rc8QBAAAAKiHoI2dCdpWFBFjNdtZNy8YAAAA6idoY2fOaFtRRLx1kCIAAADUJTPDlrELFW0riYhHQjYAAACoT0SoamMngrb1OJsNAAAA6iRoYyeCthVExOkwDM+bf6EAAADQJkEbOxG0reOqhxcJAAAAjRK0sRPDEFYQER9NG6VTn4dheO98QgAAoHYGIrALFW0Li4hnQjY69nIK2gAAAKpmIAK7ELQt77L1Fwjf8GoYhrcWCAAAaICgje/6f5ZoORHxaBiGp62+PviON5n5MSI+WSgAAKABgja+S0XbsgxBoGdjNdt4jsEYtF17JwAAAJUTtPFdhiEsyBAEOvY5M09vXn5EjKHbc28IAACgZgYi8D0q2hZiCAKde3Xn5RuIAAAAVM9ABL5H0LYcQxDomaANAABokaCNbxK0LSAiTg1BoGMfMvOrYC0zTR4FAABacGEX+RZB2zKetfiiYEd3q9luvLOAAABA5VS08U2CtmUI2ujZ6wdeu/ZRAACgdud2kG8RtC1D2yi9GttGPz7w2gVtAABA9SJC+ygPErTNzA8cnXuobXQQtAEAAI3QPsqDBG3zE7TRs4faRodpQMJn7w4AAKByvvfzIEHb/PzA0atvtY3eUNUGAADUTkUbDxK0zc8PHL16u8Pr3uW/AQAAKNlZRJzaIe4jaJvR9IN20swLgv1863y2GyraAACAFuhm416CtnmpZqNXn6cz2L5H0AYAALTA93/uJWib16OWXgzs4cEhCLdNZ7gZiAAAANRORRv3ErTNS9BGr/Y5e01VGwAAUDsVbdxL0DYvhyHSq32CNgMRAACA2p1EhLCNPxC0zcsPGT26nlpCd6WiDQAAaIEMgD8QtAHH2rdCTdAGAAC0wDlt/IGgDTjWXsGZgQgAAEAjVLTxB4I24FiHnLmmqg0AAKjdeUQ4q52vCNqAo2TmIaGZgQgAAEALVLXxFUEbcIx3B/5/VbQBAAAtcE4bXxG0AcfYZ9robYI2AACgBYI2viJoA45xUNBmIAIAANAIraN8RdAGHOOYs9ZUtQEAALU7iQhhG78RtAFbMRABAABogfZRfiNoAw6WmSraAACA3qlo4zeCNmArgjYAAKAFKtr4jaANONRRwwymgQgAAAC1O4uIR3aRQdA2O2dO0ZM5KtLeeccAAAANUNXGrwRtwJa0jwIAAC0QtPErQRuwJUEbAADQAkEbvxK0zcuZU7AfQRsAANCC8Zy2UzuJoG1egjZ6cvQvkcwUtAEAAK1Q1YagDTjY+UxLZyACAADQAkEbgjZgc6raAACAFgjaELTNKTPftvNq4PsiYo5fJFquAQCAFpxHxCM72TdBG3CMxzOsnoo2WwaG2wAAIABJREFUAACgFaraOidoA45x9C8RlaAAAEBDBG2dE7QBx5jrl8gHuwAA0IWfh2F4Y6tpmKCtc4K2+V239oLgG05mWhztowAAfRjP5730oJWGnTmnrW+Ctvk52B325+cGAKAP7zPz01T189me06hnNrZfgjbgGHNVcDqnDQCgD2PINtwK26BF3tsdE7QBx5grINM6CgDQgduDsDJzvAf8p32nQYK2jgnagGO8nmP1pieazjcEAOhMZr40HIEGnUSEsK1TgjbgUNeZOUvQNlHVBgDQtncPvLpL57XRIOe0dUrQNr/T1l4QPOBq5oURtAEAtO3Tfa9u6m64tPc0RkVbpwRt8ztv7QXBPd7MXM02CNoAAJr34P3edG/5UMUb1Og8Ih7Zuf4I2oB9XS/0xFHQBgDQto/feXWq2miN9tEOCdpmJK2mA+PZGc+m8v5ZZeZHZ3MAADTtm0HbdD/4o7cADdE+2iFB27wEbbRsDMEupjHsS1HVBgDQrl3u9V56+EpDnkaEc9w7I2ibl7SaVq0Rsg2CNgCAdu3SFTH9Ny+8DWiI9tHOCNrm9bilFwOTtUK2QdAGANCsD7u+sMx8OZ0LDC0QtHVG0DYvFW20Zs2QbRC0AQA0a98zflW10Qrto50RtM0kIsaU+qSJFwNfjE8dH60Ysg1r/lsAAKzq7T7/WGa+UtVGQ1S1dUTQNh8/OLTk56mSbfbpojvYua0AAICmqWqjFZd2sh+CthlMZaCCNlrxz8y83ChkG7SPAgA0aa+KtslrE0hpxJOIeGQz+yBom8eVtlEaMJbm/2U6fHZLgjYAAG4mkG59bwpzUdXWicjM3tfgKFMq/V7QRuXejB/8G1ax/SYixqEi//GGAgBoR2bGIS9m+r71i7cCDficmYYidEBF2/FeCdmo3Ngq+qyEkG2iog0AoC0Ht39m5sfpoTDU7iQiVLV1QNB2hIgYD+d8Uu0LoHcfCmkV/coU+JkwBQDQjmMfpL7yXqARVzayfYK2A01J9A9VXjz8PlW01OqxjwVcAwAA8ziqcyIzX3sQSyPOp6NyaJig7QBTyPav6i4cvpTt/23jqaK7OGQqFQAAZZrj4a6qNlqhfbRxgrY9RcSVkI1Kja2ij6cngqVzThsAQDvmeMAraKMVz6chHzRK0LajiDiNiDGg+L8qLhi+9lNmPp4Ok62B1lEAgHYc/RB1uo/94D1BI1S1NSwys/c1+K6IeDwMwxiynRV+qXDX2Cp6WUkV21ciwocTAEAb/jzHA19H+NCQz5l5akPbpKLtO6YP87dCNipUU6vofd6Vd0kAAOxrxq6KWu9r4a6TKWugQYK2b7j1xOSk2IuE+91MFa25BdM5bQAA9ZttWug0zOuN9wSNuLKRbRK0PUBZMhX7qYKportwThsAQP3mvqdT1UYrzqdjqmiMoO0e05tdyEaN/p6ZrTwZUdEGAFC/uYO2t94TNERVW4MEbXeM00V9eFOpMWRrZux5Zvo5BACo36xBm+mjNOb5lEHQEEHbH712JhsVaipku2W2Mz0AANjEEseBaB+lJYYiNEbQdst0LtuTYi4IdvPPRkO2QfsoAED1BG3wbdpHGyNom0zlmi+LuBjY3ZvMbPl9K2gDAKjb7EFbZr7X+UBDziLiwoa2Q9D2uysto1TmcwdlxoI2AICKTWeqLcF5vrRE+2hDBG2/V7Mp16Q2V5n5qfFdE7QBANRryaozQRstGYciPLKjbRC0fXGpmo3KXDd8LttvFnwCCgDA8pa8l3NOG615ZkfbIGj7QjUbtWk+ZLvlXTFXAgDAPhbrvpg6Oz7YDRoil2hE90HbdOjgWQGXAvvoqVRe+ygAQJ2Wvo/TPkpLDEVoRPdBm0MHoXjaRwEA6rT0ecKCNlojn2iAoG0YJMZQNhVtAAB1UtEG+3k+DWukYl0HbRHxWNsoNcrMbm4qenqtAACNWbSizTltNEpVW+V6r2gz1QPqsORoeAAAFpCZa3Qm6H6gNYK2yvUetGkbhTq4gQIA4D66H2jN+dR9R6V6D9qeFHANwPcJ2gAA6vJupasVtNGiK7tar26DNmNzoSqCNgAA/iAzxwn1n60MjXHMVcV6rmgTtEE9BG0AAHVZs9LMvSKtOYkIZ7VVStAGFG96UgkAAPfRPkqLVLVVquegzeGCUJe1zvkAAOB4a1aZCdpo0dOIeGRn69Nl0DZN8Dgp4FKA3alqAwCox6cVr1TrKK1S1VahXivatI1CfdxAAQDUY7V7t8wcQ71r7w0a5Jy2CgnagFoI2gAAKjGFX2tyr0iLzqeOPCoiaIP69Pq0zs0TAEAdtrhfda9Iq1S1Vaa7oM35bDSgy7PKtAQAAFRji/tVQRutck5bZXqsaFPNBvUyEAEAoHxrt40OgjYadhYRwraKCNqAmhjdDgBQvtVDr8z0QJaWCdoq0lXQFhGnwzA8LeBS4Bg930R4UgkAwEPeWRkaJWirSG8VbarZaEHPQZsnlQAA5duqC8FDWVp1on20Hr0Fbd6YULHMdPMEAMBDPJSlZaaPVqKboG1qG31ewKXAsXoPmz4UcA0AADxsq/vV3u+TadvTKdegcD1VtKlmoxVbTHEqiRsoAICCZeZW96vuE2mdXKMCPQVtVwVcA8yh96BNSwAAQLmut7qyKeD77L1BwwRtFegiaIuIx8MwnBdwKXA055RtdrguAADft/VD0d7vlWmb9tEK9FLRppqNVnhCp6INAKBkW3dfuFekdaraCtd80BYRjwxBoCHdP6HLzI8CRwCAYm19vypoo3WCtsL1UNH2ooBrgLl0H7RNrAMAAPdxzAit0z5auKaDNtVsNKj3QQg3BG0AAGXaOuhyv0wPVLUVrPWKtlcFXAPMyRO6L7QEAADwBwaH0QlBW8GaDdoiYnzjPSngUmBObhy+sA4AAGUq4T7tQwHXAEt6anXL1WTQNvUrvyzgUmBOnzNTKfyXJ5Uq+wAAClTI/ap7Zpo3FRdRoFYr2sYBCGcFXAfMSbj0teuSLgYAgGImw7tvpgeCtkI1F7RNqe4/CrgUmJt2ya85pw0AoCyl3K+qaKMHgrZCNRW0TVNGDUCgVZ7Mfc16AABwHw+o6cGJ9tEyNRO0TeeyvR7fbAVcDszOuWR/4AYKAKAsKtpgXRfWuzwtVbSNww/OC7gOWMI7q/oHWkcBAMpSRMCVmR7I0gsVbQVqImiLiKthGJ4XcCmwFNVsd7iBAgAoTkkPQg3OogdnEfHYTpel+qBtelP9XwGXAkt6bXXv9aHAawIA6FVJQZvuB3qhfbQwVQdt07lshh/QumvVWw9yAwUAwH3cJ9KLSztdltor2l44l40OqGZ7mAASAKAQhQ3vErTRi/OpCIlCVBu0TS2j/yjgUmBpgraHObsOAID7eCBLTwxFKEjNFW0vC7gGWNp1YU8GS+NJJQBAGUobPlDEBFRYiXPaClJl0BYRYw/ykwIuBZammu0bMlPQBgBQhtLuy1S00RMVbQWptaLtRQHXAGtQufl970q/QAAA1pWZKtroycl0vBYFqC5om6rZzgq4FFjaGxVbO7FGAADbK7GC7EMB1wBrUdVWiBor2lSz0QvVbLvRFgAAsL0SK8hUtdETQVshqgraIuJCNRud+GAIws4EbQAA2ysx1NL5QE/OI+LUjm+vtoq2ywKuAdagmm13gjYAgO2VeE8maKM3po8WoJqgbUpmnxdwKbC0d5n5yirvZjro9nMN1woAwKoEbfRG+2gBaqpo84ahF84h3J+qNgCAbZUYagna6I2KtgII2qAsb5zNdhBBGwDAhgqdli9oozdnEfHIrm+rpqDtaQHXAEsa2x+vrPBBBG0AAHyl0PAPlqaqbWNVBG3TtFFo3Qs3AwezbgAA2/lQ8No7y5feyE82VktFmzcKrRtbRk0aPZB2WwCATX0qePl1PtAb+cnGBG2wvethGC7tw9GuK79+AACAYzmnbWO1BG1PCrgGWMJYyv4sM0t+ClgL7aMAANsoubtA5wM9Uqy0oeKDNkksjbvKTOXs83ATBQAAIGjbVA0VbYI2WvX3zHxld2ejog0AYBsld2d4GEuPBG0bqiFo8wahRUK2+QnaAAC2oUMDyuKctg3VELSdFnANMCch2wJMHgUA4B5CQHr12M5vo4agzZuDlgjZlvWh5RcHAFCoYltHDR2jY7oDN1LL1FFogZBtedpHAQBWVsFwr+sCrgHWpmhpIzUEbU8KuAY41k9CtlVoDQAA4C4PY+mRLGUjKtpgeT9n5pV1XoWgDQBgXZ8rWG9BG12KCO2jGxC0wbLGM8OEbOtxEwUAsK4aHnS6R6RX2kc3UHTQZhwtlRuf7l06gHU9FZwPAgDA+tyP0ysVbRsovaJN0EbNXgh+NmHyKADAemoIsdyT0ysVbRvQOgrLeJeZL63tJrQGAACsR4gF5TqLiFP7sy5BGyzj0rpuxs0eAAC/ycy3VoOOqWpbmaAN5vdjZqqq2o6gDQAA4AvntK1M0AbzGgcgaBndlpATAGA9tVSLvSvgGmALzr5fmaAN5vXSlNFtGUABAADwG62jKzN1FOajmq0cJo8CAHCbh7H06tzOr0vQBvN5rZqtGNpHAQDWUct9l/t0uhURqtpWpHUU5qOarRyeWAIArKCiIWDuD+mZoG1FgjaYxwdngxXFXgAAcJuKNnqmW3BFgjaYxyvrWBRBGwAAtzlahJ5d2P31CNpgHq+tYzkqamEAAKjZu1qu3f0hnTvtfQHWJGiD433wi7tI1dz4AQCwimvLTKdMHl2RoA2O99YaFkn4CQDAbe4P6ZbJo+sRtMHxnM9WJjdSAADLqm3AgPtDeqZ9dCWlB20O7KN0n00bLZZKQwCAZdV2Hyxoo2fylZWoaIPjGIJQLjdSAADc5gE5sDhBGxxH0FYoAyoAALijtlZXmJOKtpUI2uA42hPLZvIoAMByanuwqaINWFzpQZupGJTsTWZ6KlY2+wMAsJyqgjb37nTuSe8LsJbSg7aTAq4BHqJttHyeWgIAcJuOB2BRWkfhcIK28gnaAAAAhmGIiEfWYXnFBm0R4aA+SqZttA4GIgAAcJszlumZoG0FKtrgMKrZKpCZKtoAABaSmTWGVh6WA4sqOWgzCIFSfc7MV3anGh96XwAAAH7jQSw9k7OsoOSg7bSAa4D7CNnqon0UAIAbgjZ6JmdZgYo22N9La1YVN1MAAPzKOcvA0koO2hzSR4neZaYKqboI2gAA5ve54jV9V8A1wBbkLCsoOWg7L+Aa4K4XVqQ6glEAgPnV/DDT/SG9ErStoMigLSK0jVKid5VOVuqayaMAANwhaAMWU2pFm6CNEqlmq5fJowAA3PAgFlhMqUHbRQHXALepZqubp5YAANxwb0ivFDWtQNAGu1HNVjdPLQEA+JWjRejYic1fXnFBW0SMh/OdFXApcOONarbquZkCAJhX7VVhJo8Ciyixok01G6W5siPV0x4AADCv2u+v3B8CiygxaHtWwDXAjR8z0y/hymkPAADgDveHdCkiFDctTEUbPOx6GIaX1qcZ170vAAAAvxG0AYsoKmiLiGcO56Mgl5n5yYY0Q2UiAAA3BG3AIkqraNM2Sil+MgChOfYTAIBfTQ/UdTwAsystaNM2SgnGX7gv7ERzVLQBAHCbqjZ6JHdZWDFBW0Q8HobhrIBLAS2jbRK0AQBwm44HYHYlVbRdFnAN8KOW0TbZVwCAWbVwb6WiDZhdSUGb89nY2ofM1DLaNudwAADwKw9i6dQjG7+sIoI2baMU4LOwtwvaRwEAuO2d1aAzgraFlVLRpm2UrY3nsglh2qc9AACA29wfArMqJWhTScSWfsrM13agC8JUAABu0z5Kb07t+LI2D9q0jbKxd5l5ZRO64YklAAC3CdrozbkdX1YJFW1CDrbiXLb+CNoAAPhNZn4ah6JZEWAuJQRtgg628mz6xUon7DcAAPdQ1UZXIsJAhAVtGrRFxBiynWx5DXTrR+O8u2WyFAAAtzmvmd4I2ha0dUWbaja28CEzX1j5bhmIAADAb6YH8J+tCDAHQRs9urTrXRO0AQBwl24XenJht5ezWdCmbZSNjC2jDsTvm5soAADu0j4KzGLLijZVRaxtLAd/adW7ZyACAAB3CdroiYq2BW0StEXE6TAMT7f4t+naK1MnUdEIAMBd0/eENxYGONZWFW3OZmMLr6w6kw8WAgCAO1S10Ysndno5gja6oZKJWwxEAADgrtemj9KLiHhks5exetA2baa2Udb2zopzi9AVAICvTO2jqtrohaBtIVtUtKlmYwunVp1bVLQBAHAfw9PohYEIC9kiaDNtlC2cW3VuEbQBAPAH03EzzvOlByraFrJq0Da1jQo82EREqKbkV5n51koAAByl5S/pqtrowWO7vIy1K9oEHWzJ+4/bHHQLAHC4ZoO2zHw1DMN1AZcCS1IEtZC1g7arlf89uO25ySrcYiACAAAPeWVlaF1EOKdtAasFbRExliWerfni4B5+YXJD0AYAwENe6oCgA4K2BaxZ0WYIAiV4EhEqKxl9sgoAANwnMz85q40OCNoWsGbQ5nwsSvFiqrCkbwYiAADwLbphaN1YiHJql+e1StCmbZTCnIy/NH2gdO9j7wsAAHCE5ithMnO8X/y5gEuBJalqm9laFW3aRinNOGHlrbCtX9ONEwAAfMsLq0PjdB/ObK2gzcZRonPl4N370PsCAADwMFVtdEBeM7PFg7ZpXKy2UUr1NCKEbf1S1QYAcJhHHa3blQmkNOwkInQhzmiNijYbRumeC9u69b73BQAAOFA3xRQmkNIBVW0zisxc9h+I+DQdPg+lezd+wEy/SOnA9OTmX/YaAGB/mRm9LNt0tvNH321p2J+dYz2PRSvaIuKZDyIq8sSAhO74RQIAcKCIeNzL2k0P4w1GoGXe3zNZunVU+SG1uZlG2tOZEz3TOgoAcLiuHlBn5tg+el3ApcASnvsePA9BG/zRGLa97+kJXa+mJ5MOtgUAOEyPX8qvCrgGWIqqthksFrRpG6Vy43v3v6avdEFVGwDAYboL2jLz9XS2M7TouYKT4y1Z0aaajRb8KyJMGGqbc9oAAA7Ta5uZqjZa9sruHmfJoO1ijRcAK/hHRLzXr94sQRsAwGG6vD/OzLEj4qcCLgWWcB4RWkiPEJk5/1/6pdTwvyu+DljDeJbX5VQuTiOmNvd/208AgP1lZvS4bBFxOj2wdVwSrfqb776HWaqizblWtGj8JfrviHg1/WKlDSraAAAO1Ot98TRUSwspLXvlvLbDLFXRNn5xPVvnJcAmrqfqtreWv34RMf8HIQBAH/7a8z1xRIyv/UkBlwJLGLu6LqZ2aXY0e0XblHgK2Wjd+B7/T0S8Vt3WhOveFwAAgIPo5qJlY1fX24hwBv8elmgdNW2UnjwdWw8jQtl43bSPAgAcpusv4Jk53kf+WMClwFJOpiITAxJ2JGiD440fPP83TSaV9NdJKTQAAAfJzDGA+GD1aNwPY6u0c9u+b9agLSLG8c7nC10rlO58SvpfTT8L1OOTvQIA4AhaSOnBeB7hf33n/ba5K9pUs8EwPB+G4ZeIeOn8tmoYagEAcBhftr9UtY0dEj8VcCmwhvE773tHKN1v7qBN2xz87h/T+W0vBG7FU9EGAHAYQdvvXhiyRUdujlB66/vu1yIz5/mLvizs/+a7NGjKOBb55fgnM4U6BYqIeT4MAQD68i4zFVxMpjOb/1PExcB6xjMKL3zX/WLOijYfrvCwMe3/4VaFmyd/5fH0EQCAo2TmWy2kdGg8r1xl22TOoM35bPB9N4HbLw6QLM7H3hcAAIBZmEJKj8aw7ZWdV9EGW7oZmvB6KjFnW++tPwAAx5ra50whpUdPI6L7IqxZgraIeDwMw9kcfxd06Ol4jkNEjFNb/ELejvMEAACYxTSF9EerSYde9r7pc1W0qcaB442ltv+KCJNKt/G2xxcNAHAkDysfkJlaSOnRWe9VbXMFbd2XBsKMzm4NTnCO23rcJAIA7M/xG982flf+XPIFwgK67tSaK2h7MtPfA/zuxDlu65nK+wEAYDaZ+XEajgA9edrzbh8dtPVeEggruTnH7a2fuUVdN/zaAADYQGaOZ1a9sfb0pOdCkTkq2lTZwHrG6tF/T+e4GZwwv4+tvSAAgIXpCtjNpRZSOiNoO4KgDdZ3dmtwgp/B+QjaAAD245zbHWTmJ2eb05nHvW74UUHbNBXxfL7LAfZ0dqultNsPshkJ2gAA9iNo21FmjlPuf6riYuF4p72u4bEVbSppoAxjS+l/I+LlFIBzGK0PAAB7MFBqP5l5NQzDh5quGQ7U7dBMQRu05R9jWKSd9GCeyAIA7M4gqcM4rw0aJmiD9ty0kxojvqepnB8AgN04duMAUxWge3Wa12u31bFBm/PZoFw/RMQr+wMAwEK0jR4oM18Ow/CmyouH3XV5jvjBQZvWNKjC84hwA7SfdzVdLADAhtxnHkcLKTTomIo2QRvU4Vxl216c0wYAsBtB2xEyc7zvfFbtCwDuJWiDPoyVbW9Vou7EDSMAwA5MHD3edEbwT7W/DniAM9r21GWvLVTsyTQkQeD2bSraAAC+z3EbM8nMq2EYPjTxYuBrzmjbVUQ8GobhZJMrBo4lcPs2T2YBAL7PPdO8Llt6MdCzQyvaVLNB/QRu91PRBgDwfW+t0XymNtwfW3k90DNBGyBwu8VZIwAAOxG0zSwzX2jJpTFdfr88NGjr/ss4NEjg9jtj1gEAHvZhmpjJ/C7di0LdVLQBdwncnDkCAPAtqtkWkpkfh2F40eSLo0dPenzRewdtEXFqEAJ0oefAzRNaAICHCdoWlJkvtZDSiilD6sohFW2q2aAvPQZuKtoAAO73OTNfW5vFXTX++uhHdxnSIUFb72c3Qa96CtxUtAEA3E812wpMIaUh3WVIhwRt3ZX9AV+5Cdw+RsRlo0ujog0A4H6q2dYztpBe9/JiaZagbQdaR4HR2TAM/2o8cAMA4GuCtpVMk10NRqB2T3o7p+2QoO3RAtcB1Ku5wC0ztUQAAPzRmyn8YSWZ+cpgBBrwrKdNPCRoO1vgOoD6qXADAGibarZtqGqjdoK2h0SEtlHge1oJ3D4UcA0AACURtG1g6rZQ1UbNnkZEN92R+1a0GYQA7Op24Paiwr58bREAAL/TNrqtVz2/eJrQTWXmvkGb89mAfY2B2w/DMNQWuH0s4BoAAEoh6NnQdFbb524XgBY876WqTdAGrOWkssBN0AYA8MXnzNQ2uj1hJ7Xr4j18yDAEgGPcDdxKDfC1RgAAfCHgKYOwk9o9iYir1ncxMnP3/zhi/MF+uugVAT36eezZz8xiqsgi4mIYhv8UcCkAAFv7c0n3aT2LiN2/wEOZxhboi8x83+r+GIYAlOD5MAy/RMSrnqbRAABU4J2QrSjXvS8A1Rs7nF5XOCxvZ1pHgZLcDtwuNr6uZp+wAADsQdtoWYSetGAcmPe21bBt39bRt2NP7aJXBPC7d1NL6dst1kRpPgDQuXEIgq6mgkTEp6kiCFrwYWojbep8bBVtQMnGYP8/Y8gfEc/sFADAql5a7nJMR6wI2WjJ+dhJFBGPW3pRzmgDajAGbv+OiHFS6eWK1/vOuwMA6Ji20bKseR8Ma7lpI22msGLfoO18oesA2MX4Ifyvm8Ct5QM0AQA29rMhCOWYKn5+6H0daNbJVFjxsoXvePsGbZ8Xug6AffwauI2HwUbEC4EbAMDsVLMVYgrZNjmzGFb2j6mVdOvBeEfZN2gzhQ8oycn0ZO/j9PTj0czX5jMPAOjRu62GUfG1qZ3urbPZ6MjZdE73i1pfsmEIQAtOpqcfv0TEqxkDt6am3wAA7MgQhAJMQcO/hWx06ofpu1113UuCNqA1z6fA7W3tJccAABu4zszXFn5bUyWbM9no3fNpUEJVYZugDWjVk6nk+O3Kk0oBAGpWbbtWY+wDfHFeW5XtvkGbNiqgNk+OmFRq0hYA0JOxms0QhI1Nx6Ccd70I8LXnNRVPGIYA9OKQSaWCNgCgJ85mK8PcA76gBdVUeWodBXpzM6n0fzMPTgAAqNnnYRhUswGlOqvlDO59gzYjnoGW3AxOeG1wAgDQuZeZ6aigMugkg/s1GbRpowJa9HQanPDe4AQAoEOftY2WYwo8r3tfB6jVXkFbZn6cPoQBWnR+a3DCi1qemAAAHEk1W3l0k8EfVfE5FZm53/8h4u00xQ8AAIC6jYUUjwRtZYmIx8Mw/Lf3dYA7/pKZxbdWHzIMQbIOAADQBtVsBZrChHe9rwPc8rmGkG0QtAEAAHTL2Wxle9H7AsAt1UxF3jtoy8y3zmkDAAConmq2gk3fvVW1wRfVPBQ4pKJt9Hrm6wAAAGA9qtnqcNX7AsAwDG+m4ZxVODRoq6ZkDwAAgD9QzVaB6Uyqn3pfB7pX1UOBvaeO/vZ/jBjTxLPZrwgAAIAlmTRakYg4HYbhve/fdOpdZl7U9NIPrWgbHMwIAABQJdVsFZn26rL3daBb1WVPB1e0DaraAAAAaqOarVIRMQYOP/S+DnTlOjMf1faCj6loG1S1AQAAVEU1W6Uyc/z+/aH3daArVWZOR1W0DV9S9XHk8JPZrggAAIAlqGarXEQ8ms5rO+l9LWhetZ9Xx1a0DVOv+OcZ/h4AAACWo5qtcpn50XltdOJ1rZ9XRwdtftABAACKNxZHvLRN9cvM18Mw/NT7OtC817W+wDkq2m5+0P8+x98FAADA7FSzNSQzr5zXRsM+TzlTlY4+o+22iBgr2/7l3Q4AAFCMKif38W0RcToMw0fntdGgN5n5rNaXNUtF243MfKWyDQAAoChVTu7j26YKxWrDCPiGtzUvzqxB2/B72PYXAxIAAAA2dz19R6NBmTkGEj/aWxrzvuaXM2vr6Fd/8Zexw2NP7fki/wAAAADf83dBW/siYvzu/bT3daANmRk1v5DFgrbh957xcbLN88X+EQAAAO7jbLZOTN+9xyqgs97XguqNgxBOa34UW2NXAAAgAElEQVQRs7eO3jb2jGfm5XRum1ZSAACA9TibrRPTeW2Xva8DTai6bXRYOmi7MZUqXxg/DAAAsApns3XGeW1QhlWCtuHLD/37KWz72d4DAAAsSjVbhzLzhQIX2NZqQdvwdSvp37SSAgAALEI1W9+e+b4N21k1aLuRmeNElPFQznf2HgAAYFaq2TqWmR+noYTABjYJ2obfq9vGVtJ/StsBAABmoZqNmxbSaysB69ssaLuRmWPS/lh1GwAAwNFUMnHDFFJq9Kj2XYvMLOAyvoiIq6nM+aSE6wEAAKjI2Cn0aOwesmkMX75jj0MJzy0GNcnMqHnDNq9ou011GwAAwMFeCtm4Q4Uj1YmIxzXvWlFB2zAd3OjsNgAAgL18Fqpwj9cWhQpV3T5aXNB2Y6puGxf3TRlXBAAAUCzVbPzB9J74YGWojIq2pUyTSZ8Nw/BXE1MAAAAepJqNhwhgqc1FzTtWdNB2IzPfTonmj2VcEQAAQDF+Vs3GN1RdHUSXntT8oqsI2obfq9vGiaR/MSwBAADgNy8sBfeJiKthGE4sDrWJiGe1blo1QduNzHw/DUv4u2EJAABA596MA+V6XwT+KCLGAPb/LA2VqrZ9NDKzgMs4TEScDsMwJvQ/1Hj9AAAAR/rrdNQOjN+Rx4GCl9OfMytCxa4zs8rpo1UHbTemD5NXtffxAgAA7OFDZjp/i5silHEgxnOrQUP+MnY11vZyqmsdvc9YKj21k/7NdFIAAKATJo1yc5bVRyEbDbqq8SU1UdF219SL7tBHAACgVdW2VTGfiBjD1n9YUhr1OTNPa3tpTVS03TVNJx1/6fxc1pUBAADM4pVl7FtEvBKy0biTiLis7SU2WdF2m/PbAACABv3ZtNF+TSGbVlF6UN1ZlE1WtN126/y2v44bVM6VAQAAHORnIVu/IuJKyEZHziPioqaX23zQdmMceT2loH83MAEAAKiYttFOTYHD//W+DnSnqqEIzbeOPmR6CvDCwAQAAKAihiB0KiLGQ+HfD8Nw1vta0KVq2uW7qWi7KzNfTgMTfhwnWZR1dQAAAPd6aVm6dSVko2Mvannp3Va03TY9GXhhYgsAAFC4P2XmJ5vUl2nI3y+9rwPdq6KqrduKttvGX1SZOT4d+PN4sGg5VwYAAPCbN0K2blVTzQMLquJ8ShVt95ieFrwwyQUAACjI3zLztQ3py9SB9b/e1wEmfx2HXZa8GCra7jGWImbmpQo3AACgEJ+FbN267H0B4JbiqzsFbd8gcAMAAApRRcsUi7iyrPCbJxFRdPisdXQPWkoBAICN/CUz31v8vkTE42EY/tv7OsAd18MwPC71zEoVbXtQ4QYAAGzgWsjWrWe9LwDc46zkSk9B2wEEbgAAwIqczdavi94XAB7ww1TxWRytozOYpsBcTX9Oqn9BAABASbSNdioifGGHh73LzOLCaBVtMxj7gjNzPLttPMPtx3EiUPUvCgAAKIG20U5FhGo2+LZxMEJxLaSCthndBG6ZOVa4/X06oA8AAOBQ2kb79aj3BYAdvJgGVxZD0LaQzHyVmeNm/20sZ2zyRQIAAEsTtPVL0AbfNx7f9aqkdRK0LSwzX089w381OAEAANjD58x8a8G6JWiD3RTVQipoW8n4C/LWpNKfnOMGAAB8h5Ctb4I22N2LUqaQCtpWlpkfM/Nq+tB0jhsAAPAQbaMAuymmhVTQtpFpcIJz3AAAgIeoaAPY3XlEvNh6vQRtBbh1jpu2UgAAYPRh7IaxEgB7+WHrFlJBW0HuaSv90PuaAABAp1SzARzm5ZbrJmgr0K220jGF/cs0rVSVGwAA9EPQhopGOMw4hfTZVmsnaCtcZr6fppWqcgMAgH4I2hC0weGutlo7QVslVLkBAEA3rsf7f9vdPUEbHG6sarvYYv0EbRW6qXLLzNOpys3EUgAAaIdqNgZBGxztcosljMy0dQ2IiEfTm2j8c9b7egAAQMX+mZmbHuZNGSLCF3Y43OepQGlVKtoaMU0sfZGZj7SWAgBA1d7bPia6l+BwJ1sMRRC0NehOa+nfhG4AAFCPzNQ6yo3XVgKOsnrQpnW0ExFxOr3Bxj9Pe18PAAAo1IdpABrcHBH0i5WAg11PnX+rEbR1SOgGAADFepOZq1dgUK6IGFuJz20RHOxPa05y1jraofENlpmvpl/gf5oml77RXgoAAJtzPht3GYwBx1m1SljQ1rnbodudM92ue18bAADYwEeLzm3j9zXfz+AoF2sun6CNr2Tm62mQws300h/HcyKsEgAArELQxn1eWBU4mDPaKM+tc90upv89sU0AADC7P2emsI0/iIjxfXFmZWBv7zJztao2QRsHiYjHt0K3J1YRAACOl5lhGblPRIzfv/5jcWBvq04eFbQxi+lD/+aP4A0AAPb3eTo3Ge4VEeNghH9YHdjPmg8xBG0sYgreHt8K37SaAgDAt63a3kSdImKcTHtu+2B3gjaaExGPpuDtJnx7LHwDAICvCNr4run87I++T8HuBG104U749niaBOLJDAAAvfo5My/tPt8znZn9VtgGO/tTZn5aY7n+nz1hK9M0pfHP69uXMP3SOJ0q306nEO5UCAcAQONMG2Unmfl+Oq5H2Aa7uQmnFydoozjjL43pmu79IZh+oQy3QrgbN4HcrsY0+/2t//bRFO4ZmQ0AABRtCtseT4ULihKgEII2qpOZtwO413Nf/9TS+swgBwAAoGRjl9BUiDBOI31us2B7zmiD75h+cd38eWK9AABYyI+Z+cLicoiIGIsFXikUgHutdkaboA32ME34uQndnmkzBQBgRv/MzJcWlENN31dUt8Edpo5CJaY209vBm6dHAAAc6q93jkmBg0zfU17pyIEvBG1Qqekw0pvQzS81AAD2IWhjVtMxOK904tA7QRs0YvrFdjNYwSQgAAC+RdDG7KZ20tcKAeiZoA0aNP2Cuz3N9P+3d7dXeVxJu4B3zXr/i4lAOALhCGAiMG8ExhEMjsA4AxTBQREcFIEhAkMEAxEMTwR1VlutY4T4eD77Y+/rWkv/6dos3L67apevSgAAPCZoY2ci4sLdbTTqOjOPhnr0f/gtg2F0G04y8yIzTzKzuzPhh+7C21LK51LKwjEAAAA7dFpKuVVg2C1BG4wkM++6rVKZeZyZXbfbj91K9y5tdyYAAE0arOOC9nQf/vsJGx/5ac3dkM/7P369YBoy86aU0v37OmZ69Oif+90AAICNdB/7I+K8lPKbStKQQYM2HW0wQf2Y6WVmnmbmQT9m+ksp5VMp5d6ZAQAAazrX1UZjBG3At/ox08f3u/3ofjcAAGBV/QjppcLREEEb8LpuzPTJ/W7/cr8bAACwJEEbLbkZ8lkjM/12QUXc7wYAMFufugkGx8cQIkIYQAsWfXPKYCxDgMo8agX/6ytVROw/Cd7eO3MAgEnadywM6NZHeRowaDdbMToK9XO/GwAA8IxB762CkQjagN165n63H93vBgAwCTraGNLgAQSMYPBA2egoNK4L3h7/RzYijt3vBgAwCld8AGzX4IGyoA34RmY+vt+t63g7dr8bAAAAc5OZV0P/yEZHgRd1ixWe3O/2QynlF/e7AQDsRkQcKS3AVtyOUUZBG7C0R4sVHt/v9nWxAgAAAEzFKPcQCtqAtT1ZrBCllH9ZrAAAsBEdbQxlT6Wp3OBjo8UdbcA29fPvf/0x6+93O7JYAQAAJunAsVC5UTraIjP9YgE7Z7ECAMBSrjNTVxs7FxE3PoZTsUV/3dHgBG3AKCJivw/cvoZv75wEAEC5zUydRuxcRAgDqNnn7oqjMZ5P0AZMQkQcPBk1FbwBAE3q776Fnenfvf9UYSr2a3ef+BiPJ2gDJqlfbf/136FTAgAa8mO3dMqBsysR0XX6/F8FpmKj/R21DAGYpMeLFcq3wduxuyQAgMrtj3WJN81wDyA1W4z5seIffrWAOeiCt8w86+8s+Wcp5X9LKR+7e0wcIABQGXe0sWt+x6jZ5ZjPpqMNmJ3MfOj/eP71B7TfaPp4sYKNpgDAnAlB2DVXs1CzqzGfzR1tQHUebTQ9ErwBADNk8yg701/J8ocKU7EfMvNurMcTtAHVE7wBAHNj8yi7EhHdJsZ/KzCVGv1DhaANaE6/zvxx8PbObwEAMDH/6pdDwVZFxI3lYlTsY2aejvl4gjageYI3AGCCfs3McwfDNvWTHv9RVCo2+kcKyxCA5vWrn7t/f73MCt4AgAlwRxu7cKSqVGwxhU5gHW0AbxC8AQAjuM/MfYVnmyKi29r/k6JSqU+ZeTL2ownaAFbUB2/HpZTf1A4A2KF/ZuaDArMNEbFXSvmvYlKx/83My7EfT9AGsKaIuLPBFADYoUn8TyN1iIiu0+f/OE5qNZVtzf+YwM8AMFdefAGAXXJPG9t0rJpU7PNUHk3QBrC+G7UDAHbIxfVsRT826m42ajaZJghBG8D67tQOANihQ8VlS3SzUTtBG8DcTWF1NABQt4jQ1cY2jL6JEXbo85QWxwjaADazUD8AYIcEbWwkIvZ1R1K5Sd2dLWgD2Ix72gCAXRK0sSndbNRO0AYAAMBSdCKxKUEbNfs0pbHRImgD2JiFCADATrmnjXVFRLcE4b0CUrFJdbMVQRvAxgRtAMCu2RjJuvzuULNFZgraAAAAWImONlYWEXullJ9VjopNLmQrgjYAAIDJ+9CHJrAKd7NRu/MpPp+gDWAzV+oHAAzACCCrOlUxKnafmTdTfDxBGwAAwPQZH2Vp/QINSxCo2cVUn03QBgAAMH062liFbjZqJ2gDAABgbe8i4kD5eEtE7JdSflIoKnadmXdTfTxBGwAAwDzoamMZliBQu8l2s3UiMyfwYwDMV0T4QwoADOE2M3W18aqIuHM/GxVbZOaktzDraAMAAJiHDxEx6f/BZFwRcSJko3KT7mYrgjYAAIBZMT7Ka4yNUjtBGwAAAFtzpJQ8p1+Wcag4VKwbn7+Z+uMJ2gAAAOZDRxsvOVUZKnc+h8ezDAFgQ5YhAAAD+3EOXR0Mp7+7779KTsUWpZT9zHyY+iPqaAMAAJgX93DxlN8Jancxh5Ct6GgD2JyONgBgYN09RQeKzlcRcWfbKJX7ITPv5vCIOtoAAADm5UNE7DszypeQ7VjIRuWu5xKyFUEbAADALNk+yleWIFC7izk9n6ANYHP3aggADMz2UUrf2XioElTsPjMFbQCNmU0bMwBQDR1tdM5UgcrNKmQrgjYAAIBZehcRwraGRcSezkYacD63RxS0AQAAzJOQpW0nXeDaehGo2qfMfJjbAwraAAAA5klHW9ssQaB2s+tmK4I2AACA2frQjw/SmIjouhnfO3cqdp2ZN3N8PEEbAADAfBkfbdNJ6wWgerPsZiuCNgAAgFkzPtqYiNgvpfzUeh2o2n1mXs71AQVtAAAA8yVoa4+72ajdbLvZiqANAABg1t67p605xkap2aKUcjHn5xO0AQAAzJuutkZERBeyvWu9DlTtPDMf5vyAgjYAAIB5O3B+zdDNRu1m3c1WBG0AAACzp6OtAf0ShMPW60DVPmXm3dwfUNAGAAAwb/vOrwmWIFC7sxqeT9AGAAAwb++dXxOMjVKz6xq62YqgDWAr3IsCAIwqIryPVMwSBBpQRTdbEbQBbIWXHgBgbHtOoGrHrReAqnXdbFe1PKCgDQAAACaqX4Lwk/OhYrPfNPqYoA0AAACmSzcbNbvPTEEbAAAAMAjbRqlZNXezfSVoAwAAgAnql1zYKkutqutmK4I2AACAKtw5xiqdtF4AqlZdN1snMnMCPwbAfEWEP6QAwJi6rpB9J1CfiLjT0UalFqWU/cx8qO3xdLQBAADMW3WjVxgbpXrnNYZsRdAGAAAwe5eOsErGRqlV1812XuvDCdoAAADma5GZN86vSsetF4BqVdvNVgRtAAAAs3bl+OpjbJSKVd3NVgRtAAAAs6abrU7GRqlV1d1sRdAGAAAwa4K2Oh21XgCqVH03WxG0AWymb+sHABjLncrXJSL2SykfWq8DVaq+m60I2gA2tqeEAMBYLEKokm42atREN1sRtAEAAMzWwtFVSdBGjZroZiuCNgAAgNnSzVan49YLQHWa6WYrgjYAAACYhv7+33eOg8o0081WBG0AAACzdeXoqmPRFrVpqputCNoAAABgMtzPRm2a6mYrgjYAAIDZaup/Xhuho42aNNfNVgRtAAAAs2UZQn0+tF4AqtJcN1sRtAFsTHs/AAAbiwjvldSkyW62ImgDAACYLaOjdTE2Sk2a7GYrgjYAAIB5ykyjo3URtFGLZrvZiqANAAAAJkHQRi1OW+1mK4I2AAAAmASLEKjBfWZetHySgjYAAID5uXdm9bAIgYqctX6YgjYAAID5uXNmVTE2Sg2a72YrgjaAjfn6CADApgRt1KD5brYiaAMAAIDRCdqYu2vdbF8I2gAAAGBcFiEwd7rZeoI2AACA+blyZnWICN1szF3XzeZvUk/QBgAAAOMRtDF3utkeEbQBAADAeARtzNln3WzfErQBbOZQ/QAA2ICgjTk7dXrfErQBAADAeARtzNWnzLxzet8StAEAAMAIImK/lPJO7ZmhhbvZnidoAwAAmJ8bZ1YF3WzM1blutucJ2gAAAObnwZlVQdDGHHXdbOdO7nmCNoA19a3+AACwLkEbc3SWmcL+FwjaANYnaAMAYBOCNubmPjN1s71C0AYAAADjeK/uzIwFCG8QtAEAAMDAIuJIzZmZ68y8cGivE7QBAADA8IyNMje62ZYgaANYnzvaAABYl3dJ5uRzZl45sbcJ2gDW5+UIAIB16WhjTk6d1nIEbQAAAPNz48xm77D1AjAbHzPzznEtR9AGAAAwM5n54MzmKyJMRjAXC3ezrUbQBgAAAMMStDEX54L91QjaANZnJTsAAOvwHskc3GembrYVCdoAAABgWBYhMAcWIKxB0AYAAADDMjrK1F1n5qVTWp2gDQAAAIb1Qb2ZOCOjaxK0AazPl0gAAFYSEcZGmbpPmXnllNYjaANY33u1AwBgRYI2pmyhm20zgjYAAAAYjqkIpuw8M++c0PoEbQAAADCcI7Vmou67oM3hbEbQBrCGiPAlEgCAdXiPZKrOMvPB6WxG0AawHi9IAACswz2/TNF1Zl44mc0J2gAAAGAAEWFslKmyAGFLBG0AAAAwDBtHmaJPmXnlZLZD0AawHi9JAACsyvUjTM2ilHLqVLZH0Aawnj11AwBgRT7WMjXnFiBsl6ANAAAAhiFoY0ruM9PdbFsmaAMAAIAdi4huIuKdOjMhRkZ3QNAGsB4bowAAWIVuNqbkOjMvncj2CdoAAABg9wRtTMmJ09gNQRsAAADsno2jTMXvmXnnNHZD0AawHi9KAACsQkcbU7DoNo06id0RtAGs5726AQCwAkEbU3CamQ9OYnciM2t9NoCdiQh/PAGA0WRmqP589BtH/9t6HRhdtwDBUrcd09EGsKL+RQkAAJalm40pOHUKuydoA1idFyUAAFbh/ZGxfczMG6ewe4I2AAAA2C2LtBhTtwDhzAkMQ9AGAAAAu6WjjTGdWYAwHEEbwOpcIAoAwCoEbYzlNjPPVX84gjYAAADYkX6R1jv1ZSQWIAxM0AYAAAC7o5uNsXzKzCvVH5agDWB1RkcBAFiWoI0xLHSzjUPQBgAAALtj4yhjsABhJII2AAAA2B0dbQzNAoQRRWY2+/AA64gIfzgBgLH9kJl3TmH6IuLBMgQG9i93s41HRxsAAMD8GEecARtHGcFHIdu4BG0AK+hflgAAYBnGRhlStwDhTMXHJWgDWI2XJQAAluXdkSGdWoAwPkEbAAAA7IYRX4ZynZkXqj0+QRvAarwsAQCwLB1tDOVUpadB0AawGkEbAADLErQxhG4Bwo1KT4OgDQAAALbMxlEGcm8BwrQI2gBWc6ReAAAsQTcbQ7AAYWIEbQAAALB9rhxh17oFCJeqPC2CNoDV7KkXAABLELSxS4tSyokKT4+gDWA1H9QLAJgAH/+mz5Uj7NJ5Zt6p8PQI2gAAAObH/V/Tp6ONXbnPTAsQJkrQBrCkiPBVEgCAZb1XKXbEyOiECdoAAABgi3ygZYc+ZeaVAk+XoA1gedr/AQBYhvdGdqFbgHCqstMmaANYnhcmAACW4b2RXTjNzAeVnTZBG8DybPcCAGAZllWwbdeZeaGq0ydoA1ieFyYAAJaho41tswBhJgRtAAAAsF0f1JMt+j0z7xR0HiIzW68BwFIiwh9MAGAqujEymy0nKCK6KYg/W68DW3OfmTokZ0RHGwAAAGyPe33ZJiOjMyNoA1hCRPhiDADAMrw3si2fMvNKNedF0AYAAADbY8yPbViUUk5Vcn4EbQDL8WUSAIBlCNrYhtPMfFDJ+RG0AQAAwPYcqiUb6padXCjiPAnaAJajow0AgFdFhEUIbGphAcK8CdoAAADmR9fUNB20XgA2dp6Zd8o4X4I2gOV4mQUA4C2CNjZxm5lnKjhvgjaANxgBAABgSRYhsAkjoxUQtAG8zZdJAACW4b2RdX3MzBvVmz9BG8DbdLQBALAMHW2s476UYmS0EoI2gLf5MgkAwDLeqxJrOMnMB4Wrg6AN4G2+TAIAkxMRR05lOpwHa/qcmVeKVw9BG8DbBG0AALzFdSOsamEBQn0EbQBvO1QjAADe4LoRVmVktEKCNoBXRIQvkwAALEPQxiquM/NSxeojaAN4nRcmAACW4boRlmVktGKCNoDXCdoAgKkS7ExERByXUj60XgeWdpaZd8pVJ0EbwOu8wAIAU+U9ZQL6q0YuWq8DS+tGRs+Vq16CNoDX6WgDAOA1Z6WUdyrEkoyMVk7QBvA6QRsAAM+KiO5d8d+qw5J+NzJaP0EbwAv6MQBfJwEAeIkRQJZ1m5lnqlU/QRvAy3SzAQBT5o62EUVENwJ42GwBWJWR0UYI2gBedqQ2AMCECdpG0k8+6E5iWd3I6I1qtUHQBvAyHW0AADzntJTyXmVYwr2R0bYI2gBeJmgDAOAbEdF1Ev6mKizJyGhjBG0Az+jHAXylBADgKd1JLOtjZl6pVlsiM1uvAcB3IqK7n+0PlQEAJmyRmXsOaDjeEVnBfTchk5kPitYWHW0Az7MIAQCYundOaHC62VjWiZCtTYI2gOcJ2gAA+P8iortr61BFWIKR0YYZHQV4RkQ8+EoMAExdZoZDGkZE3LnDlyUYGW2cjjaAJyLiQMgGAMxBvwGTHYuIMyEbSzIy2jhBG8D3jI0CAHMhaNuxfhv9adUPybZ8MjKKoA3ge4I2AAC+OjXtwBIWAlmKoA3gWT8pCwAA/Wjub80XgmUYGeUvgjaARyLiWD0AgBnZc1g7dVbxs7E9nzPzUj0pgjaA7wjaAIA5OXBau9F3s/1c47OxVd3I6ImS8pWgDeBb7mcDAKBzoQoswcgo3xC0AfQi4sDadgAAIqL7+HrYfCF4i5FRviNoA/ibsVEAYG72ndhOuJuNtxgZ5VmCNoC/CdoAgLkRtG1ZvxxLNxtvMTLKswRtAF9eqLqNXR/UAgCgeeetF4A3GRnlRYI2gC90swEANC4iTtzZyxuMjPIqQRvAF7aNAgBzdODUtqOfcHA3G28xMsqrBG0AXwjaAIA5eufUtuZUNxtvMDLKmyIzVQloWkR0X4L/bL0OAMA8ZWY4us303Wx3gkte0Y2M7utm4y062gB0swEAM9aHRGzmVMjGG46FbCxD0AYgaAMA5s09bRuIiP1Sym+zfQCG8DEzr1SaZQjaAARtAAAtswCB19z7HWEVgjagaf39bMYEAAAa1Hez/ezseYUto6xE0Aa0TjcbADB3RkfXdzHXH5xBGBllZYI2oHWCNgBg7ixDWENEdO+Bh7P7wRmKkVHWImgDWucLMABAm4QovMbIKGsRtAHN6u/keO83AACYuX0HuJqIONbNxiuMjLI2QRvQMmOjAEANBG2rO5/bD8xgbnU7sglBG9AyY6MAAI2JiBNTDbzCyCgbEbQBLRO0AQA1sAxhSRGxp5uNV/yemTcKxCYiMxUQaFJE+AMIAFQhM8NJvi0iupHA36b+czKK28z0IZ6N6WgDmtSvcwcAoBH9IqxT580LThSGbRC0Aa3ytQoAqEY/Esnrum62d2rEM4yMsjWCNqBVgjYAoCbebV4REV19fp7sD8iYupFRW0bZGkEb0CovowAA7bAAgecsSinHKsM2CdqAVn1w8gBARYyOvqC/m/dwkj8cYzvLzDunwDYJ2oDm9KMDAAA18X7zsoup/mCM6jozdTqydYI2oEVeRAEAGhAR3SbJ986aJxa2jLIrgjagRftOHQCojPebJ/pNrDqWeM6pkVF2RdAGtOjIqQMAlRG0fe+0lPJuaj8Uo/ucmcaJ2RlBG9AiL6IAABWLiO597zdnzBNGRtk5QRvQIvd0AAC1cQftt3Qs8ZyTzHxQGXZJ0AY0pV/vDgBQGyOSvf5973ASPwxT0o2MXjoRdk3QBrTG2CgAQN10s/GUkVEGI2gDWiNoAwCqpHP/rxqcuSaEZ5waGWUogjagNc2/gAIA1KhfgHDqcHnCllEGJWgDWrPnxAGASrX+nnPmrjqeuDcyytAEbUBrPjhxAKBSzW4e7cdmf57Aj8K0HBsZZWiCNqAZEdH6V14AgFoZDeSpXzPzRlUYmqANaEmzX3kBgCY0+a5jAQLP6O5lO1cYxiBoA1pi4ygAULPmuvctQOAZt+5lY0yCNqAlgjYAoGYtXpNxYQECjyy6kM29bIxJ0Aa0RNAGANSsqaVPEXFcSjmcwI/CdJy6l42xCdqAlgjaAAAq0C+5sgCBxz5mpt8JRidoA1pi6ygAULWIaGUhwpmRUR65zkx39TEJgjagJU2NUwAATar+w2JEHJVS/j2BH4Vp6O5lO3YWTIWgDQAAoB5VX5VhZJRnHFl+wJQI2oAmNDRGAQC0rfY7abuR0fcT+DmYhl8sP2BqBG1AK9zPBgC0oNp3HiOjPPHJ8gOmSNAGAABQjyq7+I2M8sRtZp4oCqqKNc4AAA8uSURBVFMkaANaceSkAQBmy8goXy282zNlgjYAAIB6HNZ2lkZGecLyAyZN0AYAAMAkGRnlCcsPmDxBG9AK7eUAQBMq27Z+YWSUnuUHzIKgDQAAoC5VbB6NiO6y+58m8KMwPssPmA1BGwAAQF325/40fVfe+QR+FMZn+QGzImgDWlHFl10AgCXMPmjrR0bfTeDnYHyWHzArgjagFR+cNADQiFkHbRFx7t2NnuUHzI6gDQAAoC6zDdr6e9n+PYEfhfFZfsAsRWY6OaB6EeGPHQDQivvMnF3Y1t/LdmVklFLKdWa6l41ZErQBTRC0AQAtycyY0+NGxF4fshkZ5b6UcuBeNubK6CgAAEBlImJuHW0XQjb6DaPHQjbmTNAGVG+GL5oAAJuazftPRJyVUn6awI/C+E4tP2DuBG1ACwRtAEBrZvH+0y8/+G0CPwrj+2j5ATUQtAEAANRn8kFbv/zgfAI/CuPrlh+cOgdqIGgDAACoz6SDtkfLD2wY5ba7l635KlANQRsAAEB9Jhu0Cdl4pFt+cGL5ATURtAEAANRnyh1tVzaM0jux/IDaCNoAAADq836KTxQRF0I2er9n5qViUBtBGwAAQIX6ZQOT0YdsP/tdo5TyOTPPFIIaCdoAAADqtDeVpxKy8Ui3/OBEQaiVoA0AAKBOR1N4KiEbj3TLD44tP6BmgjYAAIA6jd7RJmTjiS5ku1MUaiZoAwAAqNOod7QJ2Xji18y8UhRqJ2gDAACo0/5YTyVk44lPmXmuKLTgf5wyAABAld4P/VAR0Y2rdl1LH/xK0euWH5wqBq3Q0Qa0wD0QAECTImKw8dGI2Bey8US3/ODI8gNaoqMNqF534WpEOGgAoEWDLEToA70uZHvnt4xHhGw0R0cbAABAvY52/WQR0Y0F/ilk44lfMvNGUWiNjjYAAIB67ayjrb+PrVt68JPfH57olh9cKAotErQBAADUayd3tPWjopdjLFxg8m4z88Qx0Sqjo0ArFk4aAGjQ1oO2iDjrR0WFbDy1GGJcGaZM0Aa0wv0QAECLtnZvWkQcRUT3TvWb3ySeYcMozSuCNgAAgLp1AdkmD9jdxRYR3X1bf5RSPvh14QWnlh+AO9oAAABqt7/O8/XLDk77fzaK8pqPlh/AF4I2oBXd17VDpw0ANGiloE3AxoquM/NU0eALQRvQCndFAACtWmp0NCL2+3DtRMDGku5LKceKBX8TtAEAANTtxY62vnvtuA/XdP+zim75wbHlB/AtQRvQChezAgCtev/4uSPioO9y6/795LeCNZ1YfgDfE7QBrfClDQBoVr81tOtsOzAWyhb8npmXCgnfi8xUFqB6/ZfbP500AABs5HNmupcNXiBoA5oREf7gAQDA+m67kWP3ssHL/qE2AAAAwBsW/b1sQjZ4haANaMm10wYAgLVYfgBLELQBLfH1DQAAVmf5ASxJ0Aa0xBc4AABYzafMPFMzWI6gDWiJjjYAAFhet/zgVL1geYI2oCU62gAAYDnd8oNjyw9gNYI2oCV3ThsAAJbShWzen2FFgjagGV4UAABgKb9m5pVSweoEbUBrrp04AAC8qFt+cK48sB5BG9AaXW0AAPA8yw9gQ4I2oDUWIgAAwPcsP4AtELQBrRG0AQDA9yw/gC0QtAGtEbQBAMC3LD+ALRG0AU3pW+HvnToAAPzF8gPYIkEb0CJdbQAAYPkBbJ2gDWiRoA0AgNZZfgA7IGgDWuT+CQAAWmf5AexAZKa6As2JCH/8AABo1a/uZYPd0NEGtOrWyQMA0CDLD2CHBG1Aq4yPAgDQGssPYMcEbUCrBG0AALTE8gMYgDvagCZFxF4p5b9OHwCARvwrM31shh3T0QY0qf+S5542AABa8KuQDYYhaANa5mUDAIDaWX4AAxK0AS0TtAEAUDPLD2Bg7mgDmhYR/ggCAFCjbvnBQWbeOV0Yjo42oHWfWy8AAABVOhGywfAEbUDrjI8CAFCb3zPz0qnC8IyOAk2LiP1Syn9arwMAANX4nJnHjhPGoaMNaFrfTn/beh0AAKhC91574ihhPII2gFK01QMAMHeL/l62BycJ4xG0AQjaAACYv9PMvHGOMC5BG9C8/oXkvvU6AAAwWx8z88LxwfgEbQBfeDEBAGCOrjPz1MnBNNg6CmD7KAAA89Tdy7bvXjaYDh1tALaPAgAwT0dCNpgWQRvA34yPAgAwF79YfgDTY3QUoBcRe6WU/6oHAAAT9ykzTxwSTI+ONoBe33b/ST0AAJiw7roTyw9gogRtAN8yPgoAwFR1yw+O3csG0yVoA3gkM69KKfdqAgDABJ30S7yAiRK0AXzvXE0AAJiY3zPz0qHAtFmGAPBEvxSh+1L4Tm0AAJiA68w8chAwfTraAJ7o77zwtRAAgCnorjU5dhIwDzraAJ4REfullP+oDQAAI/sxM28cAsyDjjaAZ/SXzF6rDQAAI/pVyAbzoqMN4AUR0d2D8Yf6AAAwgk+ZeaLwMC+CNoBXRMRVKeVQjQAAGNBtKeWovzsYmBGjowCvO1MfAAAGtCilnAjZYJ4EbQCvyMwrd7UBADCgU/eywXwJ2gDepqsNAIAhdPeyXag0zJc72gCW4K42AAB27DYzDxQZ5k1HG8BydLUBALAr3b1sx6oL8ydoA1iCu9oAANihbvnBnQLD/AnaAJZ3olYAAGzZx8y8VFSog6ANYEn9V8ZP6gUAwJZ097KdKibUwzIEgBVExF4ppQvc3qkbAAAb6O5lOzAyCnXR0Qawgsx8sBgBAIAtcC8bVEhHG8AaIuKmlPJB7QAAWMNHI6NQJ0EbwBoi4qiU8ofaAQCwottSylE/KQFUxugowBoy86r7Eql2AACsYNGPjArZoFI62gDW1C9G6EZI36shAABL+CUzLxQK6qWjDWBN/ZdId2sAALCMz0I2qJ+ONoANRUQ3RnqojgAAvOC+lHJgZBTqp6MNYAP9UgQhGwAAr3EvGzRC0Aawpv6Otkv1AwDgFb/3i7SABhgdBVhTRHR3bPysfgAAvOA2Mw8UB9ohaANYQz8y+ofaAQDwih8z80aBoB1GRwHWc6ZuAAC84lchG7RHRxvAinSzAQDwhuvMPFIkaI+gDWBFEXFl0ygAAC9YlFIOMvNOgaA9RkcBVtB3swnZAAB4yZmQDdqlow1gBRFxWUr5Sc0AAHiGLaPQOEEbwJIiYr+U8h/1AgDgBbaMQuOMjgIs70StAAB4wUchG6CjDWBJEdHdtfFevQAAeKJbgLCfmQ8KA23T0QawhIg4FrIBAPCCMyEbUARtAEs7VioAAJ5xn5nnCgMUQRvA2yJiT9AGAMALzhQG+ErQBvC2LmR7p04AADzRdbNdKArwlaAN4G262QAAeI5uNuAbto4CvCEiHnS0AQDwRNfNtq8owGM62gBe0W8bFbIBAPCUbjbgO4I2gNcZGwUA4KmFu9mA5wjaAF53pD4AADxxriDAc9zRBvCCiDgopfypPgAAPLIopexn5oOiAE/paAN4mW42AACeuhSyAS/R0Qbwgoi4KqUcqg8AAI/8kJl3CgI8R9AG8IKI8AcSAIDHPmemZVnAi4yOAjwjIoyNAgDwlCUIwKsEbQDPE7QBAPDYfWZeqQjwGkEbwPMEbQAAPHamGsBb3NEG8Az3swEA8MiilLJv2yjwFh1tAE+4nw0AgCcuhWzAMgRtAN8TtAEA8JixUWApgjaA7x2oCQAAvevMvFMMYBmCNoDv6WgDAOCrC5UAlmUZAsAjEdF1s/2pJgAAdEsQMnNPIYBl6WgD+JaxUQAAvtLNBqxE0AbwLUEbAABfnasEsApBG8C3BG0AABRLEIB1CNoAvnWoHgAAGBsF1mEZAkAvIrpto3+oBwBA8yxBANaiow3gb8ZGAQAoutmAdQnaAP62rxYAAFiCAKxL0AbwNx1tAADcWoIArEvQBvA3ixAAANDNBqxN0AbwZRGCbjYAABallMvmqwCsTdAG8IX72QAAuMzMh+arAKxN0AbwhY42AABsGwU2ImgD+OJIHQAAmnafmVetFwHYjKAN4AujowAAbdPNBmwsMlMVgeZFhD+GAABt+yEz71ovArAZHW1A8yLC2CgAQNuuhWzANgjaACxCAABonbFRYCsEbQCl7KkBAEDTLlsvALAdgjYAG0cBAFr2KTMf/AYA2yBoA7BxFACgZbrZgK2xdRRono2jAADNus9MH12BrdHRBjTNxlEAgKbpZgO2StAGtM4XTACAdtk2CmyVoA1onaANAKBN3djojbMHtknQBrTuoPUCAAA06tzBA9smaANat9d6AQAAGuV+NmDrbB0FmmbjKABAk64z01IsYOt0tAHNigjdbAAAbbIEAdgJQRvQMvezAQC0ydgosBOCNqBlNo4CALTnc2Y+OHdgFwRtQMsEbQAA7dHNBuyMoA1omdFRAIC2LDLT/WzAzgjagJZZhgAA0BbdbMBOCdqAlh06fQCApgjagJ2KzFRhoEkR4Q8gAEA7urFREw3ATuloA5oUEUdOHgCgKbrZgJ0TtAEAANACSxCAnRO0Aa3S0QYA0I77zLxy3sCuCdqAVrmfAwCgHcZGgUEI2oBWHTh5AIBmGBsFBiFoAwAAoGbd2OiNEwaGIGgDWnXo5AEAmmBsFBiMoA0AAICaGRsFBiNoA5oTETaOAgC0wdgoMChBGwAAALUyNgoMStAGtEhHGwBAG4yNAoMStAEAAFAjY6PA4ARtQIsOnDoAQPWMjQKDE7QBLdpz6gAA1Tt3xMDQBG1Ai/adOgBA1W4z884RA0MTtAEteu/UAQCqZmwUGIWgDWhKRBgbBQCon6ANGIWgDWiNRQgAAHWzbRQYjaANAACAmuhmA0YjaANao6MNAKBuF84XGIugDWiNO9oAAOplbBQYlaANaI2gDQCgXsZGgVEJ2oDWGB0FAKiXsVFgVII2AAAAamBsFBidoA1ojY42AIA6GRsFRheZ6RSAZkSEP3oAAHX6UUcbMDYdbUAzIsIiBACAOhkbBSZB0Aa0xNgoAECdjI0CkyBoAwAAYO4EbcAkCNqAluhoAwCozyIzr5wrMAWCNqAl7mgDAKiPbjZgMgRtAAAAzJmgDZgMQRvQkiOnDQBQlW5sVNAGTIagDQAAgLkSsgGTImgDAABgrixBACYlMtOJAE2ICH/wAADq8s/MfHCmwFToaAMAAGCOPgvZgKkRtAFNiIg9Jw0AUBX3swHTUkr5fwew2jVemJzOAAAAAElFTkSuQmCC' ; // 'assets/images/cards/testImg.png';
        const option = {
            backgroundColor: '#fff',
            xAxis: {
                axisLine: {show: false},
                axisLabel: {show: false},
                axisTick: {show: false},
                splitLine: {show: false},
            },
            yAxis: {
                data: [0 , 900],
                show: false
            },
            grid: {
                top: '72',
                height: 780
            },
            series: [

                {
                    name: '',
                    type: 'wordCloud',
                    sizeRange: [8, 60],
                    rotationRange: [-30, 30],
                    // shape: 'circle',
                    maskImage: maskImage,
                    textPadding: 0,
                    gridSize: 0,
                    width: 350 , // '70%',
                    height: 480 , // '70%',
                    left: 'center',
                    top: 'center',
                    drawOutOfBound: false,
                    autoSize: {
                        enable: true,
                        minSize: 4
                    },
                    textStyle: {
                        normal: {
                            fontFamily: 'Arial',
                            color: function () {
                                return 'rgb(' + [
                                    Math.round(Math.random() * 160),
                                    Math.round(Math.random() * 160),
                                    Math.round(Math.random() * 160)
                                ].join(',') + ')';
                            },
                            // shadowBlur: 25,
                            // shadowColor: '#fff'
                        },

                    },
                    // backgroundColor: '#333',
                    data: data
                },
                {
                    name: '',
                    type: 'pictorialBar',
                    symbol: 'image://' + treeDataURI,
                    symbolSize: [364, 494],
                    symbolRepeat: false, // 复制
                    data:  [{value: 0 , symbolOffset: null }, {value: 10 , symbolOffset: ['6.8%' , -20 ] }],
                    animationEasing: 'elasticOut'
                },
            ]
        };



        const echarts = require('echarts');
        require('echarts-wordcloud');
        const myChart = echarts.init(document.getElementById('Portrait'));
        maskImage.onload = function() {
            myChart.setOption(option);
        };
        window.onresize = function() {
            myChart.resize();
        };


    }




    /** 获取数据方法 end **/






    assignment(res, val , p?) {
        this.surveyParameter[val] = null;
        res.value.forEach(
            res1 => {
                if (this.headerSelect.selectName === res1.selectID) {
                    this.surveyParameter[val] = res1.number;
                }
            });
    }

    changeSurveyParameter() {
        this.surveyParameter.ParameterActivityArray.forEach(
            res => {
                if (res.title === 'activebrowsevipcount_bcia') {
                    // 获取活动浏览人数
                    this.assignment(res, 'ActivityBrowsingNum');
                } else if (res.title === 'activebrowsevipcountrate_bcia') {
                    // 获取占常旅客会员比率
                    this.assignment(res, 'ActivityBrowsingPercent');
                } else if (res.title === 'addsumwxmembers_bcia') {
                    // 获取会员转化人数
                    this.assignment(res, 'MembershipConversionNum');
                } else if (res.title === 'addsumwxmembersrate_bcia') {
                    // 获取占活动浏览量百分比
                    this.assignment(res, 'MembershipConversionPercent');
                } else if (res.title === 'sumactivevipcoupon_bcia') {
                    // 获取活动参与人数
                    this.assignment(res, 'NumberOfParticipantsNum');
                } else if (res.title === 'ticketvipcountrate_bcia') {
                    // 获取旅客活动参与度
                    this.assignment(res, 'NumberOfParticipantsPercent');
                } else if (res.title === 'sharecountbyactivity_bcia') {
                    // 获取 活动分享
                    this.assignment(res, 'ActivitySharingNum');
                } else if (res.title === 'sumticketcount_bcia') {
                    // 获取优惠券发放张数
                    this.assignment(res, 'CouponGrantNum');
                } else if (res.title === 'ticketpaycountrate_bcia') {
                    // 获取核销转化率
                    this.assignment(res, 'CouponGrantPercent');
                } else if (res.title === 'ticketnetamount_bcia') {
                    // 获销售金额
                    this.assignment(res, 'SalesAmountNum');
                } else if (res.title === 'sumactivitynetamount_bcia') {
                    // 获取占活动期间销售额
                    this.assignment(res, 'SalesAmountPercent');
                }  else if (res.title === 'activitysumamountyoy_bcia') {
                    // 营销带动销售额同比增长
                    this.assignment(res, 'SalesAmountInNum');
                } else if (res.title === 'activityusumamount_bcia') {
                    // 获取营销基金使用金额
                    this.assignment(res, 'AmountMarketingFundNum');
                } else if (res.title === 'activityticketkdj_bcia') {
                    // 获取参与活动客单价 元
                    this.assignment(res, 'UnitPriceACNum' );
                } else if (res.title === 'activityticketkdjyoy_bcia') {
                    // 获取参与活动客单价 同比
                    this.assignment(res, 'UnitPriceACPercent1' );
                } else if (res.title === 'activitysumkdjyoy_bcia') {
                    // 整体客单价同比
                    this.assignment(res, 'UnitPriceACPercent2' );
                } else if (res.title === 'activityaddvipavgbyday_bcia') {
                    //  日增加人数
                    this.assignment(res, 'DailyIncreaseNum' );
                }else if (res.title === 'activityaddvipavgyoybyday_bcia') {
                    //  会员日均增加人数环比
                    this.assignment(res, 'DailyIncreasePercent' );
                }else if (res.title === 'membersgrowthcountbyday_bcia') {
                    // 根据事件改变会员增长的数据图表
                    this.changeMembershipGrowthData(res);
                } else if (res.title === 'pageviewcountbyhour_bcia') {
                    // 根据事件改变访问时段的数据图表
                    this.changeAccessPeriodData(res);
                }  else if (res.title === 'activitystoresalegroup_bcia') {
                    // 订单金额分布
                    this.changeOrderAmountDisData(res);
                }else if (res.title === 'vipsexcouponcount_bcia') {
                    // 根据事件改编会员性别比的数据图表
                    this.changeGenderOfParticipatingMembersData(res);
                } else if (res.title === 'vipfirstbonuscountrate_bcia') {
                    // 根据事件改变参与会员类型图表数据
                    this.changeTypesOfParticipatingMembersData(res);
                } else if (res.title === 'vipagegroupcouponcount_bcia') {
                    // 根据事件改变参与会员年龄分布数据图表
                    this.changeAgeDistributionOfParticipatingMemberData(res);
                } else if (res.title === 'tickettypecountrate_bcia') {
                    // 根据事件改变销售券核销业态占比数据图表
                    this.changeSalesVoucherWriteOffProfessionalFormProportionData(res);
                } else if (res.title === 'activityleasemodeamount_bcia') {
                    // 根据事件改变业态关联销售占比数据图表
                    this.setOrChangeSeries(res, 'change');
                } else if (res.title === 'activityticketcountbydate_bcia') {
                    // 优惠券领取量与核销量 根据日期
                    if (this.timeDateSelect.day === 'day') {
                        this.setReceiveWriteOffTable(res, 'change');
                    }
                } else if (res.title === 'activityticketcountbyhour_bcia') {
                    // 优惠券领取量与核销量 根据时间
                    if (this.timeDateSelect.day === 'hour') {
                        this.setReceiveWriteOffTableHour(res, null, null);
                    }
                }
            }
        );

    }


    // 根据事件改变会员增长的数据图表
    changeMembershipGrowthData(res1) {

        this.MembershipGrowth.NaturalGrowth_title_one = [];
        this.MembershipGrowth.NaturalGrowth_value_one = [];
        this.MembershipGrowth.IncreaseByActivity_value_one = [];
        res1.value.forEach(res => {
            if (res.selectID === this.headerSelect.selectName) {
                this.MembershipGrowth.NaturalGrowth_title_one.push(res.title);
                this.MembershipGrowth.NaturalGrowth_value_one.push(Number(res.NaturalGrowth_value_one));
                this.MembershipGrowth.IncreaseByActivity_value_one.push(Number(res.IncreaseByActivity_value_one));
            }
        });
        this.changeGrowthData();
    }

    // 会员增长
    changeGrowthData(){
        const  flag =  this.compareData(this.MembershipGrowth.IncreaseByActivity_value_one , this.MembershipGrowth.NaturalGrowth_value_one);
        if (!flag) {
            this.widget_MembershipGrowth_DS = [
                {
                    label: this.translate.instant('BusinessDataAnalysis.IncreaseByActivity'), // 活动新增',
                    data: this.MembershipGrowth.IncreaseByActivity_value_one,
                    fill: 'start'
                },
                {
                    label: this.translate.instant('BusinessDataAnalysis.NaturalGrowth'), // '自然增长',
                    data: this.MembershipGrowth.NaturalGrowth_value_one,
                    fill: 'start'
                },
            ];
            const  colors =  [
                {
                    borderColor: '#E04958',
                    backgroundColor: 'rgba(224,73,88, 0.7)',
                    pointBackgroundColor: '#E04958',
                    pointHoverBackgroundColor: '#E04958',
                    pointBorderColor: '#ffffff',
                    pointHoverBorderColor: '#ffffff',
                },
                {
                    borderColor: '#2395DB',
                    backgroundColor: 'rgba(35,149,219, 0.7)',
                    pointBackgroundColor: '#2395DB',
                    pointHoverBackgroundColor: '#2395DB',
                    pointBorderColor: '#ffffff',
                    pointHoverBorderColor: '#ffffff',
                },

            ];
            this.widgets.widget_MembershipGrowth.colors = colors;
            this.widgets.widget_MembershipGrowth.datasets = this.widget_MembershipGrowth_DS;
            this.widgets.widget_MembershipGrowth.labels = this.MembershipGrowth.NaturalGrowth_title_one;
        } else {
            this.widget_MembershipGrowth_DS = [
                {
                    label: this.translate.instant('BusinessDataAnalysis.NaturalGrowth'), // '自然增长',
                    data: this.MembershipGrowth.NaturalGrowth_value_one,
                    fill: 'start'
                },
                {
                    label: this.translate.instant('BusinessDataAnalysis.IncreaseByActivity'), // 活动新增',
                    data: this.MembershipGrowth.IncreaseByActivity_value_one,
                    fill: 'start'
                },
            ];
            const  colors =  [
                {
                    borderColor: '#2395DB',
                    backgroundColor: 'rgba(35,149,219, 0.7)',
                    pointBackgroundColor: '#2395DB',
                    pointHoverBackgroundColor: '#2395DB',
                    pointBorderColor: '#ffffff',
                    pointHoverBorderColor: '#ffffff',
                },
                {
                    borderColor: '#E04958',
                    backgroundColor: 'rgba(224,73,88, 0.7)',
                    pointBackgroundColor: '#E04958',
                    pointHoverBackgroundColor: '#E04958',
                    pointBorderColor: '#ffffff',
                    pointHoverBorderColor: '#ffffff',
                },


            ];
            this.widgets.widget_MembershipGrowth.colors = colors;
            this.widgets.widget_MembershipGrowth.datasets = this.widget_MembershipGrowth_DS;
            this.widgets.widget_MembershipGrowth.labels = this.MembershipGrowth.NaturalGrowth_title_one;
        }

    }


    // 根据事件改变访问时段的数据图表
    changeAccessPeriodData(res1) {
        this.AccessPeriod.title_one = [];
        this.AccessPeriod.value_one = [];
        this.AccessPeriod.value_two = [];
        res1.value.forEach(res => {
            if (res.selectID === this.headerSelect.selectName) {
                this.AccessPeriod.title_one.push(res.title_one);
                this.AccessPeriod.value_one.push(Number(res.value_one));
                this.AccessPeriod.value_two.push(Number(res.value_two));
            }
        });

        this.AccessPeriodDS();
        this.widgets.widget_AccessPeriod.datasets = this.widget_AccessPeriod_DS;
        this.widgets.widget_AccessPeriod.labels = this.AccessPeriod.title_one;
    }


    // 访问时段
    AccessPeriodDS(){
        const  flag =  this.compareData(this.AccessPeriod.value_one , this.AccessPeriod.value_two);
        let colors = [];
        if (flag) {
            this.widget_AccessPeriod_DS = [
                {
                    label: this.translate.instant('BusinessDataAnalysis.AccessPeriod'), // '访问人次',
                    data: this.AccessPeriod.value_two,
                    fill: 'start'
                },
                {
                    label: this.translate.instant('BusinessDataAnalysis.AccessPeriodWeChat'), // '小程序访问人次',
                    data: this.AccessPeriod.value_one,
                    fill: 'start'
                }
            ];
            colors =  [
                {
                    borderColor: '#FF5823',
                    backgroundColor: 'rgba(255,88,35, 0.6)',
                    pointBackgroundColor: '#FF5823',
                    pointHoverBackgroundColor: '#FF5823',
                    pointBorderColor: '#ffffff',
                    pointHoverBorderColor: '#ffffff',
                },
                {
                    borderColor: '#00A0EE',
                    backgroundColor: 'rgba(0,160,238, 0.6)',
                    pointBackgroundColor: '#2395DB',
                    pointHoverBackgroundColor: '#2395DB',
                    pointBorderColor: '#ffffff',
                    pointHoverBorderColor: '#ffffff',
                },
            ];
        } else {
            this.widget_AccessPeriod_DS = [
                {
                    label: this.translate.instant('BusinessDataAnalysis.AccessPeriodWeChat'), // '小程序访问人次',
                    data: this.AccessPeriod.value_one,
                    fill: 'start'
                },
                {
                    label: this.translate.instant('BusinessDataAnalysis.AccessPeriod'), // '访问人次',
                    data: this.AccessPeriod.value_two,
                    fill: 'start'
                },
            ];
            colors =  [
                {
                    borderColor: '#00A0EE',
                    backgroundColor: 'rgba(0,160,238, 0.6)',
                    pointBackgroundColor: '#2395DB',
                    pointHoverBackgroundColor: '#2395DB',
                    pointBorderColor: '#ffffff',
                    pointHoverBorderColor: '#ffffff',
                },
                {
                    borderColor: '#FF5823',
                    backgroundColor: 'rgba(255,88,35, 0.6)',
                    pointBackgroundColor: '#FF5823',
                    pointHoverBackgroundColor: '#FF5823',
                    pointBorderColor: '#ffffff',
                    pointHoverBorderColor: '#ffffff',
                },

            ];
        }
        this.widgets.widget_AccessPeriod.colors = colors;
        this.widgets.widget_AccessPeriod.datasets = this.widget_AccessPeriod_DS;
        this.widgets.widget_AccessPeriod.labels = this.AccessPeriod.title_one;
    }




    // 订单金额分布
    changeOrderAmountDisData(res1) {
        this.OrderAmountDis.xAxis = [];
        this.OrderAmountDis.yAxis = [];
        this.OrderAmountDis.label = '';
        const m = [];
        res1.value.forEach(res => {
            if (res.selectID === this.headerSelect.selectName) {
                this.OrderAmountDis.xAxis.push(res.xAxis);
                this.OrderAmountDis.yAxis.push(Number(res.yAxis));
                m.push({key: res.xAxis, value: res.p});
            }
        });
        this.OrderAmountDis.label = JSON.stringify(m);
        // this.OrderAmountDis_DS = [
        //     {
        //         label: this.translate.instant('BusinessDataAnalysis.number'), // '个数',
        //         data: this.OrderAmountDis.value,
        //         fill: 'start'
        //     },
        // ];
        this.createAnnularChart();
        // this.widgets.OrderAmountDis.datasets = this.OrderAmountDis_DS;
        // this.widgets.OrderAmountDis.labels = this.OrderAmountDis.title;
    }



    // 根据事件改变参与会员性别的数据图表
    changeGenderOfParticipatingMembersData(res1) {
        let male;
        let female;
        this.surveyParameter.GenderRatioOfMembersMale = null;
        this.surveyParameter.GenderRatioOfMembersFemale = null;
        this.GenderOfParticipatingMembers.value = [];
        res1.value.forEach(res => {
            if (res.selectID === this.headerSelect.selectName) {
                if (res.sex === this.translate.instant('BusinessDataAnalysis.male')) { // 男
                    male = res.num;
                } else if (res.sex === this.translate.instant('BusinessDataAnalysis.female')) { // 女
                    female = res.num;
                }
            }
        });

        if (female || male) {
            if (!female) {
                female = 0;
            }
            if (!male) {
                male = 0;
            }
            const maleRatio = ((Number(male) / (Number(male) + Number(female))) * 100).toFixed(0);
            const femaleRatio = (100 - Number(maleRatio)).toFixed(0);
            this.surveyParameter.GenderRatioOfMembersMale = maleRatio + '%';
            this.surveyParameter.GenderRatioOfMembersFemale = femaleRatio + '%';
            // 女  男
            this.GenderOfParticipatingMembers.value = [{
                value: female,
                name: this.translate.instant('BusinessDataAnalysis.female')
            }
                , {value: male, name: this.translate.instant('BusinessDataAnalysis.male')}];

        }


        this.initGenderOfParticipatingMemberChart();

    }

    // 根据事件改变参与会员类型的数据图表
    changeTypesOfParticipatingMembersData(res1) {

        let title_one;
        let title_two;
        let value_one;
        let value_two;
        this.surveyParameter.FirstMembershipNum = null;
        this.TypesOfParticipatingMember.value = [];
        res1.value.forEach(res => {
            if (res.selectID === this.headerSelect.selectName) {
                value_one = res.value_one;
                value_two = res.value_two;
                title_one = res.title_one;
                title_two = res.title_two;
            }
        });

        if (value_one || value_two) {
            if (!value_one) {
                value_one = 0;
            }
            if (!value_two) {
                value_two = 0;
            }
            const other_people = ((Number(value_one) / 10000) - (Number(value_two) / 10000)).toFixed(2);
            this.surveyParameter.FirstMembershipNum = (Number(value_two) / 10000).toFixed(2);
            // 首单会员占比   非首单会员占比
            this.TypesOfParticipatingMember.value =
                [{
                    value: this.surveyParameter.FirstMembershipNum,
                    name: this.translate.instant('BusinessDataAnalysis.FirstMembershipNum')
                }
                    , {
                    value: other_people,
                    name: this.translate.instant('BusinessDataAnalysis.FirstMembershipNumOther'),
                    label: {normal: {show: false}}
                }];
        }
        this.initTypesOfParticipatingMembersChart();
    }

    // 根据事件改变参与会员年龄分布数据图表
    changeAgeDistributionOfParticipatingMemberData(res1) {
        this.AgeDistributionOfParticipatingMembers.legend = [];
        this.AgeDistributionOfParticipatingMembers.value = [];
        res1.value.forEach(res => {
            if (res.selectID === this.headerSelect.selectName) {
                this.AgeDistributionOfParticipatingMembers.legend.push({name: res.name});
                this.AgeDistributionOfParticipatingMembers.value.push({
                    value: res.value,
                    name: res.name,
                    itemStyle: {color: res.color}
                });

            }
        });

        this.initAgeDistributionOfParticipatingMemberChart();
    }

    // 根据事件改变销售券核销业态占比数据图表
    changeSalesVoucherWriteOffProfessionalFormProportionData(res1) {
        const cou_Array: any = [];
        this.SalesVoucherWriteOffProfessionalFormProportion_.title = [];
        this.SalesVoucherWriteOffProfessionalFormProportion_.CouponCount = [];
        this.SalesVoucherWriteOffProfessionalFormProportion_.Proportion = [];
        this.SalesVoucherWriteOffProfessionalFormProportion_.WriteOffData = [];
        res1.value.forEach(res => {
            if (res.selectID === this.headerSelect.selectName) {
                cou_Array.push(res);
            }
        });
        // batchNum 批次数量 == 发放量  grantNum 优惠券发放张数===领取量  writeOffNum核销总量 == 核销量
        if (cou_Array.length > 0) {
            this.setCouponBarWidth(cou_Array);
            this.orderBy_Two(cou_Array, 'batchNum');
            for (let r = (cou_Array.length - 1); r >= 0; r--) {
                const num = cou_Array.length - r - 1;
                this.SalesVoucherWriteOffProfessionalFormProportion_.title [num] = cou_Array[r].title;
                const batchNum = cou_Array[r].batchNum; // 领取
                const grantNum = cou_Array[r].grantNum; // 核销
                const WriteOffNum = cou_Array[r].writeOffNum; // 发放

                const p_w_g = Number((Number(grantNum) / Number(batchNum)).toFixed(2));
                let could_true = false;
                if (p_w_g > 0.94) {
                    could_true = true;
                }
                this.setValueCouponCount(batchNum, num, batchNum, could_true);
                this.setValueProportion(grantNum, num, grantNum);
                this.setValueWriteOffData(WriteOffNum, num, WriteOffNum);
            }

            this.SalesVoucherWriteOffProfessionalFormProportion_.barMinHeight = 30;
            this.SalesVoucherWriteOffProfessionalFormProportion_.barMinHeight_two = 15;
            this.SalesVoucherWriteOffProfessionalFormProportion_.barMinHeight_three = 45;
        }
        this.initSalesVoucherWriteOffProfessionalFormProportionChart();
    }

    // 设置优惠券核销占比的条的大小
    setCouponBarWidth(cou_Array) {
        if (cou_Array.length <= 2) {
            this.SalesVoucherWriteOffProfessionalFormProportion_.barWidth = '35';
        } else if (cou_Array.length <= 3) {
            this.SalesVoucherWriteOffProfessionalFormProportion_.barWidth = '45';
        } else if (cou_Array.length <= 6) {
            this.SalesVoucherWriteOffProfessionalFormProportion_.barWidth = '57%';
        } else {
            this.SalesVoucherWriteOffProfessionalFormProportion_.barWidth = '67%';
        }
    }

    // 根据事件修改table的值
    changeTable(p) {
        this.receiveWriteOffNum.displayedColumns = [];
        this.receiveWriteOffNum.TableHer = [];
        this.receiveWriteOffNum.dataSource.data = [];
        this.receiveWriteOffNum.pageSize = 0;
        if (p === 'hour') {
            this.showHourTable = true;
            // 小时 时段
            this.surveyParameter.ParameterActivityArray.forEach(res => {
                if (res.title === 'activityticketcountbyhour_bcia') {
                    // 优惠券领取量与核销量 时段
                    if (this.timeDateSelect.pickerStart.selectedDates.length !== 0) {
                        const date_start = this.CalculationDate('start');
                        const date_end = this.CalculationDate('end');
                        this.setReceiveWriteOffTableHour(res, date_start, date_end);
                    } else {
                        const start = Date.parse(this.headerSelect.startTime);
                        const end = Date.parse(this.headerSelect.endTime);
                        const start_date = new Date(start);
                        const end_date = new Date(end);
                        this.endTime.nativeElement.value = this.headerSelect.startTime;
                        this.startTime.nativeElement.value = this.headerSelect.endTime;
                        this.timeDateSelect.pickerStart.destroy();
                        this.timeDateSelect.pickerEnd.destroy();
                        this.timeDateSelect.pickerStart = flatpickr(this.startTime.nativeElement, this.timeDateSelect.configStart);
                        this.timeDateSelect.pickerEnd = flatpickr(this.endTime.nativeElement, this.timeDateSelect.configEnd);
                        this.timeDateSelect.pickerStart.setDate(start_date, false);
                        this.timeDateSelect.pickerStart.set('minDate', start_date);
                        this.timeDateSelect.pickerStart.set('maxDate', end_date);
                        this.timeDateSelect.pickerEnd.setDate(end_date, false);
                        this.timeDateSelect.pickerEnd.set('minDate', start_date);
                        this.timeDateSelect.pickerEnd.set('maxDate', end_date);
                        this.setReceiveWriteOffTableHour(res, null, null);
                    }

                }
            });
            // this.options.enable();
            this.timeDateSelect.timeDis = false;
        } else {
            this.showHourTable = false;
            // 日期 活动期间
            this.surveyParameter.ParameterActivityArray.forEach(res => {
                if (res.title === 'activityticketcountbydate_bcia') {
                    // 优惠券领取量与核销量 根据日期
                    this.setReceiveWriteOffTable(res, 'change');
                }
            });
            // this.options.disable();
            this.timeDateSelect.timeDis = true;
        }
        this.timeDateSelect.day = p;
    }

    // 切换日期事件
    onDateStartChange() {
        const date_start = this.CalculationDate('start');
        const date_end = this.CalculationDate('end');
        const start_times = Date.parse(date_start);
        const end_times = Date.parse(date_end);
        if (!start_times || !end_times) {
            this.snackBar.open(this.translate.instant('BusinessDataAnalysis.tips_18'), '✖'); // 两个时间必须都选择才行~
            return;
        }
        this.surveyParameter.ParameterActivityArray.forEach(res => {
            if (res.title === 'activityticketcountbyhour_bcia') {
                // 优惠券领取量与核销量 时段
                this.setReceiveWriteOffTableHour(res, date_start, date_end);
            }
        });

    }

    CalculationDate(p) {
        let sourceDate: any;
        if (p === 'start') {
            if (this.timeDateSelect.pickerStart.selectedDates.length === 0) {
                const start = Date.parse(this.headerSelect.startTime);
                const end = Date.parse(this.headerSelect.endTime);
                const start_date = new Date(start);
                const end_date = new Date(end);
                this.startTime.nativeElement.value = this.headerSelect.endTime;
                this.timeDateSelect.pickerStart.setDate(start_date, false);
                this.timeDateSelect.pickerStart.set('minDate', start_date);
                this.timeDateSelect.pickerStart.set('maxDate', end_date);
            }
            sourceDate = this.timeDateSelect.pickerStart.selectedDates[0];
            this.timeDateSelect.pickerEnd.set('minDate', sourceDate);
        } else {
            if (this.timeDateSelect.pickerEnd.selectedDates.length === 0) {
                const start = Date.parse(this.headerSelect.startTime);
                const end = Date.parse(this.headerSelect.endTime);
                const start_date = new Date(start);
                const end_date = new Date(end);
                this.endTime.nativeElement.value = this.headerSelect.startTime;
                this.timeDateSelect.pickerEnd.setDate(end_date, false);
                this.timeDateSelect.pickerEnd.set('minDate', start_date);
                this.timeDateSelect.pickerEnd.set('maxDate', end_date);
            }
            sourceDate = this.timeDateSelect.pickerEnd.selectedDates[0];
            this.timeDateSelect.pickerStart.set('maxDate', sourceDate);
        }

        const Year = sourceDate.getFullYear();
        let Mou = (sourceDate.getMonth() + 1);
        if (Mou <= 9) {
            Mou = '0' + Mou;
        }
        let date = sourceDate.getDate();
        if (date <= 9) {
            date = '0' + date;
        }
        const date_real = Year + '-' + Mou + '-' + date;
        return date_real;
    }


    // 小时选择结束事件
    /* onEndHourChange(){
         const sourceDate_end =  this.timeDateSelect.endHour.selectedDates[0];
         const endHour = sourceDate_end.getHours();
         this.timeDateSelect.startHour.set('maxDate', sourceDate_end);

         const sourceDate_start =  this.timeDateSelect.startHour.selectedDates[0];
         const startHour = sourceDate_start.getHours();
         if (startHour > endHour) {
             this.snackBar.open( '结束的小时大于开始的小时,时间不合理噢~' , '✖');
             return;
         } else {
             this.surveyParameter.ParameterActivityArray.forEach( res => {
                 if (res.title === 'activityticketcountbyhour_bcia') {
                     // 优惠券领取量与核销量 时段
                     const date_real = this.CalculationDate();
                     this.setReceiveWriteOffTableHour(res , date_real , 'unionHour');
                 }
             });
         }
     }*/

     /** 初始化参数问题**/
    initChartEntity() {
        // 必须初始化，否则找不到
        // 会员增长
        this.MembershipGrowth = {
            NaturalGrowth_title_one: [], NaturalGrowth_value_one: []
            , NaturalGrowth_title_two: [], NaturalGrowth_value_two: []
            , NaturalGrowth_title_three: [], NaturalGrowth_value_three: [],
            IncreaseByActivity_value_one: [], IncreaseByActivity_value_two: [], IncreaseByActivity_value_three: [],
        };
        // 访问时段
        this.AccessPeriod = {
            title_one: [], value_one: []
            , title_two: [], value_two: []
            , title_three: [], value_three: []
        };
        // 订单金额分布
         this.OrderAmountDis = {
             xAxis: [], yAxis: [] , label: ''
         };
        // 参与会员性别
        this.GenderOfParticipatingMembers = {
            value: [],
            value_one: [],
            value_two: [],
            value_three: [],
        };
        // 参与会员类型
        this.TypesOfParticipatingMember = {
            value: [],
            value_one: [],
            value_two: [],
            value_three: [],
        };
        // 参与会员年龄分布
        this.AgeDistributionOfParticipatingMembers = {
            legend: [],
            value: [],
            value_one: [],
            value_two: [],
            value_three: [],
        };
        // 销售券核销业态占比
        this.SalesVoucherWriteOffProfessionalFormProportion_ = {
            barWidth: '35',
            barMinHeight: null,
            barMinHeight_two: null,
            barMinHeight_three: null,
            title: [],
            title_one: [],
            title_two: [],
            title_three: [],
            CouponCount: [],
            CouponCount_one: [],
            CouponCount_two: [],
            CouponCount_three: [],
            Proportion: [],
            Proportion_one: [],
            Proportion_two: [],
            Proportion_three: [],
            WriteOffData: [],
            WriteOffData_one: [],
            WriteOffData_two: [],
            WriteOffData_three: []
        };
        // 概况变量
        this.surveyParameter = {
            // 活动浏览
            ActivityBrowsingNum: null, ActivityBrowsingPercent: null, ParameterActivityArray: [],
            // 会员转化
            MembershipConversionNum: null, MembershipConversionPercent: null, ParameterArticleArray: [],
            // 活动参与人数
            NumberOfParticipantsNum: null, NumberOfParticipantsPercent: null,
            // 活动分享
            ActivitySharingNum: null,
            // 优惠券发放
            CouponGrantNum: null, CouponGrantPercent: null,
            // 销售金额
            SalesAmountNum: null, SalesAmountPercent: null, SalesAmountInNum: null,
            // 会员性别占比
            GenderRatioOfMembersMale: null, GenderRatioOfMembersFemale: null,  // 会员性别占比 女
            // 首单会员人数              // 营销基金使用金额
            FirstMembershipNum: null,  AmountMarketingFundNum: null,
            // 参与活动客单价 -元    //参与活动客单价 -参与活动的客单价同比 // 参与活动客单价 -整体客单价同比
            UnitPriceACNum: null , UnitPriceACPercent1: null ,     UnitPriceACPercent2: null,
            // 日增加人数  -人       // 会员日均增加人数环比
            DailyIncreaseNum: null, DailyIncreasePercent: null
        };
        this.headerSelect = {
            selectedType: null,
            selectName: null,
            ActivityType: [],
            ActivityName: [],
            startTime: null,
            endTime: null,
        };
        //
        this.formatRelatedSalesP = {
            title: [],
            retailValue: [], // 零售
            RestaurantValue: [], // 餐饮
            dutyFreeValue: [], // 免税
            legendName: [],
            tipsSource: [],  // 页面的提示内容
        };
        // 表格
        this.receiveWriteOffNum = new ReceiveWriteOffNum();
        this.receiveWriteOffNum.displayedColumns = [];
        this.receiveWriteOffNum.TableHer = [];
        this.receiveWriteOffNum.pageSize = 0;
        // 时间选择框
        this.timeDateSelect = new TimeDateSelect();
        this.timeDateSelect.configStart = {
            enableTime: false,
            dateFormat: 'Y/m/d',
            locale: Mandarin,
        };
        this.timeDateSelect.configEnd = {
            enableTime: false,
            dateFormat: 'Y/m/d',
            locale: Mandarin,
        };
        this.timeDateSelect.day = 'day';
        this.timeDateSelect.timeDis = true;
        this.timeDateSelect.pickerStart = flatpickr(this.startTime.nativeElement, this.timeDateSelect.configStart);
        this.timeDateSelect.pickerEnd = flatpickr(this.endTime.nativeElement, this.timeDateSelect.configEnd);

        // echart初始化
        this.allECharts = new AllEChartsE();
    }

    intiAllEcharts() {
        this.zone.runOutsideAngular(() => {
            this.echarts = require('echarts');
        });
        window.addEventListener('resize', () => {
            if (this.allECharts.AgeDistributionOfParticipatingMember && !this.allECharts.AgeDistributionOfParticipatingMember.isDisposed()) {
                this.allECharts.AgeDistributionOfParticipatingMember.resize();
            }
            if (this.allECharts.GenderOfParticipatingMember && !this.allECharts.GenderOfParticipatingMember.isDisposed()) {
                this.allECharts.GenderOfParticipatingMember.resize();
            }
            if (this.allECharts.SalesVoucherWriteOffProfessionalFormProportion && !this.allECharts.SalesVoucherWriteOffProfessionalFormProportion.isDisposed()) {
                this.allECharts.SalesVoucherWriteOffProfessionalFormProportion.resize();
            }
            if (this.allECharts.TypesOfParticipatingMembers && !this.allECharts.TypesOfParticipatingMembers.isDisposed()) {
                this.allECharts.TypesOfParticipatingMembers.resize();
            }
            if (this.allECharts.FormatRelatedSalesP && !this.allECharts.FormatRelatedSalesP.isDisposed()) {
                this.allECharts.FormatRelatedSalesP.resize();
            }
            if (this.allECharts.OrderAmountDis && !this.allECharts.OrderAmountDis.isDisposed()) {
                this.allECharts.OrderAmountDis.resize();
            }
        });
    }

    initWidgetElement() {
        this.elements_ = {
            point: {
                radius: 5,
                borderWidth: 2,
                hoverRadius: 5,
                hoverBorderWidth: 2
            },
            line: {
                borderWidth: 1,
            },
            pointLabels: {
                display: true
            },
        };
    }


    /**  图表问题  **/
    // 参与会员性别
    initGenderOfParticipatingMemberChart() {
        this.zone.runOutsideAngular(() => {
            this.allECharts.GenderOfParticipatingMember = this.echarts.init(this.GenderOfParticipatingMember.nativeElement);
        });
        const option = {
            color: ['#DD4B58', '#2395DB'],
            tooltip: {
                trigger: 'item',
                backgroundColor: '#333333',
                formatter: '{a} <br/>{b}: {c} ',
                padding: [1, 2, 1, 2], // 设置框框的上下左右边距
                position: ['40%', '55%'],
            },
            legend: {
                orient: 'vertical',
                x: 'center',
                y: 'top',
                data: []
            },
            series: [
                {
                    name: this.translate.instant('BusinessDataAnalysis.partakeMemberGender'), // '参与会员性别',
                    type: 'pie',
                    hoverOffset: 2,
                    radius: ['62%', '82%'],
                    avoidLabelOverlap: false,
                    label: {
                        normal: {
                            show: false,
                            position: 'inside',
                            formatter: '{b}:{d}%',
                            align: 'center',
                            fontSize: 12,
                            verticalAlign: 'top',
                            color: '#555555'
                        },
                        emphasis: {
                            show: true,
                            textStyle: {
                                fontSize: '12',
                                fontWeight: 'bold'
                            }
                        }
                    },
                    labelLine: {
                        normal: {
                            lineStyle: {
                                color: 'rgba(255, 255, 255, 0.3)',
                            },
                            smooth: 0.2,
                            length: -80,
                            length2: 10
                        }
                    },
                    data: this.GenderOfParticipatingMembers.value
                }
            ]
        };
        this.zone.runOutsideAngular(() => {
            this.allECharts.GenderOfParticipatingMember.setOption(option);
        });
    }


    // 参与会员类型
    initTypesOfParticipatingMembersChart() {
        this.zone.runOutsideAngular(() => {
            this.allECharts.TypesOfParticipatingMembers = this.echarts.init(this.TypesOfParticipatingMembers.nativeElement);
        });
        const option = {
            color: ['#2295DD', '#56CEFF'],
            tooltip: {
                trigger: 'item',
                backgroundColor: '#333333',
                padding: [1, 2, 1, 2], // 设置框框的上下左右边距
                // position: ['40%', '55%'],
                formatter: function (params) {

                    if (params.name === '首单会员占比') {
                        return params.seriesName + '</br>' + '首单会员人数:' + params.value + '万人(' + params.percent + '%)';
                    } else {
                        return params.seriesName + '</br>' + '非首单会员人数' + ':' + params.value + '万人(' + params.percent + '%)';
                    }
                }
            },
            legend: {
                orient: 'vertical',
                x: 'center',
                y: 'top',
                data: []
            },
            series: [
                {
                    name: this.translate.instant('BusinessDataAnalysis.partakeNumType'), // '参与会员类型',
                    type: 'pie',
                    hoverOffset: 2,
                    center: ['50%', '48%'],
                    radius: ['64%', '85%'],
                    avoidLabelOverlap: false,
                    label: {
                        normal: {
                            formatter: function (p) {
                                return p.percent + '%' + '\n' + p.name;
                            },
                            show: true,
                            position: 'center',
                            color: '#000000',
                            fontSize: 14,
                        },
                        emphasis: {
                            show: true,
                            textStyle: {
                                fontSize: '12',
                                fontWeight: 'bold'
                            }
                        }
                    },
                    labelLine: {
                        normal: {
                            lineStyle: {
                                color: 'rgba(255, 255, 255, 0.3)',
                            },
                            smooth: 0.2,
                            length: -80,
                            length2: 10
                        }
                    },
                    data: this.TypesOfParticipatingMember.value
                }
            ]
        };
        this.zone.runOutsideAngular(() => {
            this.allECharts.TypesOfParticipatingMembers.setOption(option);
        });
    }

    // 参与会员年龄分布
    initAgeDistributionOfParticipatingMemberChart() {
        this.zone.runOutsideAngular(() => {
            this.allECharts.AgeDistributionOfParticipatingMember = this.echarts.init(this.AgeDistributionOfParticipatingMember.nativeElement);
        });
        const option = {
            color: ['#4a90e2', '#e04957', '#91c7ae', '#f5a623', '#65d3ff', '#ffe08b'],
            tooltip: {
                trigger: 'item',
                backgroundColor: '#333333',
                formatter: '{a} <br/>{b}: {c} ',
                padding: [1, 2, 1, 2], // 设置框框的上下左右边距
                position: ['37%', '35%'],
            },
            legend: {
                orient: 'vertical',
                x: 'center',
                bottom: '5%',
                height: '25%',
                data: this.AgeDistributionOfParticipatingMembers.legend
            },
            series: [
                {
                    name: this.translate.instant('BusinessDataAnalysis.partakeNumAge'), //  '参与会员年龄',
                    type: 'pie',
                    hoverOffset: 2,
                    center: ['50%', '32%'],
                    radius: ['47%', '63%'], // ['65%', '89.5%'],
                    avoidLabelOverlap: false,
                    label: {
                        normal: {
                            show: false,
                            position: 'inside',
                            formatter: '{b}:{d}%',
                            align: 'center',
                            fontSize: 12,
                            verticalAlign: 'top',
                            color: '#555555'
                        },
                        emphasis: {
                            show: true,
                            textStyle: {
                                fontSize: '12',
                                fontWeight: 'bold'
                            }
                        }
                    },
                    labelLine: {
                        normal: {
                            lineStyle: {
                                color: 'rgba(255, 255, 255, 0.3)',
                            },
                            smooth: 0.2,
                            length: -80,
                            length2: 10
                        }
                    },
                    data: this.AgeDistributionOfParticipatingMembers.value
                }
            ]
        };
        this.zone.runOutsideAngular(() => {
            this.allECharts.AgeDistributionOfParticipatingMember.setOption(option);
        });
    }

    // 销售券核销业态占比
    initSalesVoucherWriteOffProfessionalFormProportionChart() {
        this.zone.runOutsideAngular(() => {
            this.allECharts.SalesVoucherWriteOffProfessionalFormProportion = this.echarts.init(this.SalesVoucherWriteOffProfessionalFormProportion.nativeElement);
        });
        const rich = {
            b: {
                fontSize: 14,
                // color: '#2FAB24',
            },
            n: {
                fontSize: 12,
                // color: '#DA1ECD',
            }
        };
        const option = {

            color: ['#A6E6FF', '#2395DB', '#C63862'],
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'line',
                    lineStyle: {
                        color: 'rgba(255,255,255,0)',
                    },
                },
                backgroundColor: '#333333',
                padding: [1, 2, 1, 2], // 设置框框的上下左右边距
                textStyle: {
                    fontWeight: 500,
                },
                formatter: function (params) {
                    let result = '';
                    let x_value = '';
                    let lastvalue = '';
                    const dotHtml_0 =
                        '<span style="display:inline-block;margin-right:5px;width:15px;height:15px;background-color:#A6E6FF; border:2px solid #ffffff "></span>';
                    if (params[0].seriesName === '发放量') { //
                        const str = params[0].value;
                        const reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
                        lastvalue = str.replace(reg, '$1,');
                        x_value = params[0].axisValue;
                        result += dotHtml_0 + params[0].seriesName + ':' + lastvalue + '</br>';
                    }
                    const dotHtml =
                        '<span style="display:inline-block;margin-right:5px;width:15px;height:15px;background-color:#2395DB; border:2px solid #ffffff "></span>';
                    if (params[1].seriesName === '领取量') {  //
                        const str = params[1].value;
                        const reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
                        lastvalue = str.replace(reg, '$1,');
                        x_value = params[1].axisValue;
                        result += dotHtml + params[1].seriesName + ':' + lastvalue + '</br>';
                    }
                    const dotHtml_ =
                        '<span style="display:inline-block;margin-right:5px;width:15px;height:15px;background-color:#C63862; border:2px solid #ffffff "></span>';

                    if (params[2].seriesName === '核销量') { //
                        const str = params[2].value;
                        const reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
                        lastvalue = str.replace(reg, '$1,');
                        x_value = params[2].axisValue;
                        result += dotHtml_ + params[2].seriesName + ':' + lastvalue + '</br>';
                    }
                    return x_value + '</br>' + result;
                }
            },
            grid: {
                left: '15%',
                right: '5%',
                bottom: '24px',
                top: '12px',
                containLabel: false
            },
            xAxis: [
                {
                    type: 'value',
                    axisTick: {
                        show: false,
                        lineStyle: {
                            color: '#E6E6E6',
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#E6E6E6',
                        }
                    },
                    axisLabel: {
                        show: false,
                    }
                }
            ],
            yAxis: [
                {
                    type: 'category',
                    data: this.SalesVoucherWriteOffProfessionalFormProportion_.title,
                    axisLabel: {
                        color: '#333333',
                        // margin: 20,
                        fontSize: 14,
                        interval: '0',

                        formatter: function (params) {
                            let newParamsName = '';  // 最终拼接成的字符串
                            // let num = params.length;
                            /*  const params = pp;
                              const y_p = params.split('');
                              for (let y = 0 ; y < y_p.length ;  y++) {
                                  const hy = Number(y_p[y]);
                                  if (!isNaN(hy)) {
                                      num = num - 0.5;
                                  } else if (/^[\u4E00-\u9FA5]+$/.test(y_p[y])) {
                                     // num = num + 2;
                                  }else if (!/[A-Z]/.test(y_p[y])) {
                                      num = num - 0.5;
                                  }else {
                                     // num = num + 2;
                                  }
                              }*/

                            const paramsNameNumber = params.length; // 实际标签的个数
                            const provideNumber = 10; // 每行能显示的字的个数
                            const rowNumber = Math.ceil(paramsNameNumber / provideNumber); // 换行的话，需要显示几行，向上取整
                            /**
                             * 判断标签的个数是否大于规定的个数， 如果大于，则进行换行处理 如果不大于，即等于或小于，就返回原标签
                             */
                            // 条件等同于rowNumber>1
                            if (paramsNameNumber > provideNumber) {
                                /** 循环每一行,p表示行 */
                                for (let p = 0; p < rowNumber; p++) {
                                    let tempStr = '';                    //  表示每一次截取的字符串
                                    const start = p * provideNumber;    // 开始截取的位置
                                    const end = start + provideNumber;  // 结束截取的位置

                                    // 此处特殊处理最后一行的索引值
                                    if (p === rowNumber - 1) {
                                        // 最后一次不换行
                                        tempStr = params.substring(start, paramsNameNumber);
                                    } else {
                                        // 每一次拼接字符串并换行
                                        tempStr = params.substring(start, end) + '\n';
                                    }
                                    newParamsName += tempStr;   // 最终拼成的字符串
                                }

                            } else {
                                // 将旧标签的值赋给新标签
                                newParamsName = params;
                            }
                            if (paramsNameNumber > 20) {
                                return '{n|' + newParamsName + '}';
                            } else {
                                return '{b|' + newParamsName + '}';
                            }
                        },
                        rich: rich
                    },
                    axisTick: {
                        lineStyle: {
                            color: '#E6E6E6',
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#E6E6E6',
                        }
                    }
                }
            ],
            series: [
                {
                    name: this.translate.instant('BusinessDataAnalysis.grantNum'), // '发放量',
                    type: 'bar',
                    barGap: '-100%',
                    // barMaxWidth: 45,
                    barWidth: this.SalesVoucherWriteOffProfessionalFormProportion_.barWidth,
                    barMinHeight: this.SalesVoucherWriteOffProfessionalFormProportion_.barMinHeight_three,
                    label: {
                        normal: {
                            show: true,
                            position: 'right',
                            distance: 0,
                            color: '#555555',
                            fontSize: 0,
                            borderColor: 'auto',
                            formatter: function (p) {
                                const str = p.value;
                                const reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
                                return str.replace(reg, '$1,');
                            }
                        }
                    },
                    itemStyle: {
                        barBorderRadius: [0, 30, 30, 0],
                    },
                    data: this.SalesVoucherWriteOffProfessionalFormProportion_.WriteOffData
                },
                {
                    name: this.translate.instant('BusinessDataAnalysis.Receive'), // '领取量',
                    type: 'bar',
                    barGap: '-100%',
                    // barMaxWidth: 45,
                    barWidth: this.SalesVoucherWriteOffProfessionalFormProportion_.barWidth,
                    barMinHeight: this.SalesVoucherWriteOffProfessionalFormProportion_.barMinHeight,
                    label: {
                        normal: {
                            show: true,
                            position: 'insideRight',
                            // distance: -15,
                            color: '#ffffff',
                            fontSize: 12,
                            borderColor: 'auto',
                            formatter: function (p) {
                                let str = ''; // 字符串累加
                                const num = p.value;
                                for (let i = num.length - 1, j = 1; i >= 0; i-- , j++) {
                                    if (j % 3 === 0 && i !== 0) { // 每隔三位加逗号，过滤正好在第一个数字的情况
                                        str = str + num[i] + ','; // 加千分位逗号
                                        continue;
                                    }
                                    str = str + num[i]; // 倒着累加数字
                                }
                                const lastvalue = str.split('').reverse().join('');
                                return lastvalue;
                            }
                        }
                    },
                    itemStyle: {
                        barBorderRadius: [0, 30, 30, 0],
                    },
                    data: this.SalesVoucherWriteOffProfessionalFormProportion_.CouponCount
                },
                {
                    name: this.translate.instant('BusinessDataAnalysis.WriteOff'), // '核销量',
                    type: 'bar',
                    barGap: '-100%',
                    // barMaxWidth: 45,
                    barWidth: this.SalesVoucherWriteOffProfessionalFormProportion_.barWidth,
                    barMinHeight: this.SalesVoucherWriteOffProfessionalFormProportion_.barMinHeight_two,
                    label: {
                        normal: {
                            show: true,
                            position: 'insideRight',
                            color: '#ffffff',
                            fontSize: 12,
                            formatter: function (p) {
                                let str = ''; // 字符串累加
                                const num = p.value;
                                for (let i = num.length - 1, j = 1; i >= 0; i-- , j++) {
                                    if (j % 3 === 0 && i !== 0) { // 每隔三位加逗号，过滤正好在第一个数字的情况
                                        str = str + num[i] + ','; // 加千分位逗号
                                        continue;
                                    }
                                    str = str + num[i]; // 倒着累加数字
                                }
                                const lastvalue = str.split('').reverse().join('');
                                return lastvalue;
                            }
                        }
                    },
                    itemStyle: {
                        barBorderRadius: [0, 30, 30, 0],
                    },
                    data: this.SalesVoucherWriteOffProfessionalFormProportion_.Proportion
                },
            ]
        };
        this.zone.runOutsideAngular(() => {
            this.allECharts.SalesVoucherWriteOffProfessionalFormProportion.setOption(option);
        });
    }

    // 业态关联销售占比
    initFormatRelatedSalesPChart() {
        this.zone.runOutsideAngular(() => {
            this.allECharts.FormatRelatedSalesP = this.echarts.init(this.FormatRelatedSalesP.nativeElement);
        });
        const option = {
            legend: {
                show: true,
                icon: 'none',
                top: '5.5%',
                left: '15%',
                data: this.formatRelatedSalesP.legendName,
                width: 50,
                padding: [0, 8, 0, 0],
                itemGap: 13,
                formatter: function (name) {
                    // return "{title|" + name + "}\n{value|" + (objData[name].value) +"}  {title|项}"

                    return name;
                },
                textStyle: {
                    color: '#555',
                    fontSize: 12,
                    /*    rich: {
                            title: {
                                fontSize: 16,
                                lineHeight: 15,
                                color: "rgb(0, 178, 246)"
                            },
                            value: {
                                fontSize: 18,
                                lineHeight: 20,
                                color: "#fff"
                            }
                        }*/
                },
            },
            tooltip: {
                show: true,
                trigger: 'item',
                formatter: function (p) {
                    /*const p_name = p.name;
                    const nameS = p_name.split('&&');
                    let re_value1;
                    let re_value2;
                    let re_value3;
                    for (let y = 0 ; y < nameS.length ; y++ ) {
                        if (y === 0 ) {
                            re_value1 = nameS[y];
                        } else if (y === (nameS.length - 1 ) ) {
                            re_value2 = nameS[y];
                        } else {
                            re_value3 = nameS[y];
                        }
                    }
                    return re_value1 + '<br>' + re_value2 ;*/
                }
            },
            /* yAxis: [{
                 type: 'category',
                 splitNumber: 3,
                 inverse: true,
                 axisLine: {
                     show: true
                 },
                 axisTick: {
                     show: true,
                     alignWithLabel: true,

                 },
                 axisLabel: {
                     interval: 0,
                     inside: false,
                     textStyle: {
                         color: "#fff",
                         fontSize: 14,
                     },
                     show: true
                 },
                 data: optionData.yAxis
             }],
             xAxis: [{
                 show: false
             }],*/
            series: [
                {
                    name: '',
                    type: 'pie',
                    radius: ['30%', '40%'],
                    avoidLabelOverlap: false,
                    hoverAnimation: false,
                    label: {
                        normal: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            show: false,
                            textStyle: {
                                fontSize: '30',
                                fontWeight: 'bold'
                            }
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    data: this.formatRelatedSalesP.RestaurantValue,
                },
                {
                    name: '',
                    type: 'pie',
                    z: 1,
                    radius: ['30%', '40%'],
                    avoidLabelOverlap: false,
                    hoverAnimation: false,
                    label: {
                        normal: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            show: false,
                            textStyle: {
                                fontSize: '30',
                                fontWeight: 'bold'
                            }
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    data: [
                        {
                            value: 7.5,
                            name: this.translate.instant('BusinessDataAnalysis.Restaurant'),
                            itemStyle: {color: '#EEEEEE', borderWidth: 5, borderColor: '#EEEEEE'},
                            tooltip: {show: false}
                        }, // 餐饮
                        {
                            value: 2.5,
                            name: this.translate.instant('BusinessDataAnalysis.RestaurantAllSalesMount'),
                            itemStyle: {color: 'rgba(0,0,0,0)', borderWidth: 0},
                            tooltip: {show: false}
                        },  // 餐饮总销售额
                    ]
                },
                {
                    name: '',
                    type: 'pie',
                    radius: ['55%', '65%'],
                    hoverAnimation: false,
                    avoidLabelOverlap: false,
                    label: {
                        normal: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            show: false,
                            textStyle: {
                                fontSize: '30',
                                fontWeight: 'bold'
                            }
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    data: this.formatRelatedSalesP.retailValue
                },
                {
                    name: '',
                    type: 'pie',
                    z: 1,
                    radius: ['55%', '65%'],
                    hoverAnimation: false,
                    avoidLabelOverlap: false,
                    label: {
                        normal: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            show: false,
                            textStyle: {
                                fontSize: '30',
                                fontWeight: 'bold'
                            }
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    data: [
                        {
                            value: 7.5,
                            name: this.translate.instant('BusinessDataAnalysis.retail'),
                            itemStyle: {color: '#EEEEEE', borderWidth: 5, borderColor: '#EEEEEE'},
                            tooltip: {show: false}
                        }, // 零售
                        {
                            value: 2.5,
                            name: this.translate.instant('BusinessDataAnalysis.retailAllSalesMount'),
                            itemStyle: {color: 'rgba(0,0,0,0)', borderWidth: 0},
                            tooltip: {show: false}
                        },  // 零售总销售额
                    ]
                },
                {
                    name: '',
                    type: 'pie',
                    radius: ['80%', '90%'],
                    hoverAnimation: false,
                    avoidLabelOverlap: false,
                    label: {
                        normal: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            show: false,
                            textStyle: {
                                fontSize: '30',
                                fontWeight: 'bold'
                            }
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    data: this.formatRelatedSalesP.dutyFreeValue
                },
                {
                    name: '',
                    type: 'pie',
                    z: 1,
                    radius: ['80%', '90%'],
                    hoverAnimation: false,
                    avoidLabelOverlap: false,
                    label: {
                        normal: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            show: false,
                            textStyle: {
                                fontSize: '30',
                                fontWeight: 'bold'
                            }
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    data: [
                        {
                            value: 7.5,
                            name: this.translate.instant('BusinessDataAnalysis.dutyFree'),
                            itemStyle: {color: '#EEEEEE', borderWidth: 5, borderColor: '#EEEEEE'},
                            tooltip: {show: false}
                        }, // 免税
                        {
                            value: 2.5,
                            name: this.translate.instant('BusinessDataAnalysis.dutyFreeAllSalesMount'),
                            itemStyle: {color: 'rgba(0,0,0,0)', borderWidth: 0},
                            tooltip: {show: false}
                        },  // 免税总销售额
                    ]
                }
            ],
        };
        this.zone.runOutsideAngular(() => {
            this.allECharts.FormatRelatedSalesP.setOption(option);
        });
    }

     // 订单金额分布
    createAnnularChart() {
        this.zone.runOutsideAngular(() => {
            this.allECharts.OrderAmountDis = this.echarts.init(this.OrderAmountDisChart.nativeElement);
        });


        const passengerGrowthOption = {
            color: ['#c63862'],
            title: {
                text: ''
            },
            tooltip: {
                trigger: 'item',
                backgroundColor: '#333333',
                formatter: function (params){
                    const v_json = JSON.parse(params.seriesName);
                    const value =  params.value + ''; // 单笔销售额
                    const reg = value.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
                    const  lastvalue = value.replace(reg, '$1,');
                    const name = params.name;
                    const res =  v_json.filter( d => d.key === name);
                    return '单笔销售额：' + lastvalue + '<br/>' + '占比：' + res[0].value;
                }
            },
            legend: {
                show: false
            },
            grid: {
                left: '70px',
                right: '35px',
                bottom: '25px',
                top: '35px',
                containLabel: false
            },
            xAxis: [
                {
                    type: 'category',
                    data: this.OrderAmountDis.xAxis,
                    boundaryGap: false,
                    axisLine: {
                        show: true ,
                        lineStyle: {
                            color: '#E6E6E6'
                        }
                    },
                    axisLabel: {show: true ,  color: '#333333'},
                    axisTick: {show: true},
                    splitLine: {show: false},
                }
            ],
            yAxis: [
                {
                    name: '',
                    type: 'value',
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: '#E6E6E6'
                        }
                    },
                    axisLabel: {show: true ,  color: '#333333'},
                    axisTick: {show: true},
                    splitLine: {
                        show: true ,
                        lineStyle: {
                            color: '#E6E6E6'
                        }},
                }
            ],
            series: [
                {
                    name: this.OrderAmountDis.label,
                    type: 'line',
                    areaStyle: {
                        normal: {
                            color: '#ffffff',
                            opacity: 0.1
                        }
                    },
                    symbol: 'circle',
                    symbolSize: 8,
                    data: this.OrderAmountDis.yAxis
                }
            ]
        };
        this.zone.runOutsideAngular(() => {
            this.allECharts.OrderAmountDis.setOption(passengerGrowthOption);
        });

    }


    initWidget() {
        this.widgets = {
            // 会员增长
            widget_MembershipGrowth: {
                chartType: 'line',
                datasets: [
                    {
                        label: this.translate.instant('BusinessDataAnalysis.IncreaseByActivity'), // '活动新增',
                        data: this.MembershipGrowth.IncreaseByActivity_value_one,
                        fill: 'start'
                    },

                    {
                        label: this.translate.instant('BusinessDataAnalysis.NaturalGrowth'), // '自然增长',
                        data: this.MembershipGrowth.NaturalGrowth_value_one,
                        fill: 'start'
                    },

                ],
                labels: this.MembershipGrowth.NaturalGrowth_title_one,
                colors: [
                    {
                        borderColor: '#E04958',
                        backgroundColor: 'rgba(224,73,88, 0.7)',
                        pointBackgroundColor: '#E04958',
                        pointHoverBackgroundColor: '#E04958',
                        pointBorderColor: '#ffffff',
                        pointHoverBorderColor: '#ffffff',
                    },
                    {
                        borderColor: '#2395DB',
                        backgroundColor: 'rgba(35,149,219, 0.7)',
                        pointBackgroundColor: '#2395DB',
                        pointHoverBackgroundColor: '#2395DB',
                        pointBorderColor: '#ffffff',
                        pointHoverBorderColor: '#ffffff',
                    },

                ],
                options: {
                    spanGaps: false,
                    legend: {
                        display: false
                    },
                    maintainAspectRatio: false,
                    tooltips: {
                        position: 'nearest',
                        mode: 'index',
                        intersect: false,
                        enabled: true
                    },
                    elements: this.elements_,
                    layout: {
                        padding: {
                            top: 28,
                            left: 8,
                            right: 26,
                            bottom: 8
                        }
                    },
                    scales: {
                        xAxes: [
                            {
                                display: true,
                                gridLines: {
                                    display: false,
                                },
                            }
                        ],
                        yAxes: [
                            {
                                display: true,
                                ticks: {
                                    beginAtZero: true
                                }
                            }
                        ],
                    },
                    plugins: {
                        datalabels: {
                            anchor: 'end',
                            align: function (context) {
                                if (context.dataIndex === 0) {
                                    return 'right';
                                } else if (context.dataIndex === context.dataset['data'].length - 1) {
                                    return 'left';
                                } else {
                                    return 'end';
                                }
                            },
                            color: '#555555',
                            display: 'auto',
                            fontSize: '9px'
                        }
                    }
                }
            },
            // 访问时段
            widget_AccessPeriod: {
                chartType: 'line',
                datasets: [
                    {
                        label: this.translate.instant('BusinessDataAnalysis.AccessPeriod'), // '访问人次',
                        data: this.AccessPeriod.title_two,
                        fill: 'start'
                    },
                    {
                        label: this.translate.instant('BusinessDataAnalysis.AccessPeriodWeChat'), // '小程序访问人次',
                        data: this.AccessPeriod.value_one,
                        fill: 'start'
                    }
                ],
                labels: this.AccessPeriod.title_one,
                colors: [
                    {
                        borderColor: '#FF5823',
                        backgroundColor: 'rgba(255,88,35, 0.6)',
                        pointBackgroundColor: '#FF5823',
                        pointHoverBackgroundColor: '#FF5823',
                        pointBorderColor: '#ffffff',
                        pointHoverBorderColor: '#ffffff',
                    },
                    {
                        borderColor: '#00A0EE',
                        backgroundColor: 'rgba(0,160,238, 0.6)',
                        pointBackgroundColor: '#2395DB',
                        pointHoverBackgroundColor: '#2395DB',
                        pointBorderColor: '#ffffff',
                        pointHoverBorderColor: '#ffffff',
                    },
                    /*  {
                          borderColor: '#FF6D31',
                          backgroundColor          : 'rgba(255,109,49, 0.7)',
                          pointBackgroundColor     : '#FF6D31',
                          pointHoverBackgroundColor: '#FF6D31',
                          pointBorderColor         : '#ffffff',
                          pointHoverBorderColor    : '#ffffff',
                      },*/
                ],
                options: {
                    spanGaps: false,
                    legend: {
                        display: false
                    },
                    maintainAspectRatio: false,
                    tooltips: {
                        position: 'nearest',
                        mode: 'index',
                        intersect: false,
                        enabled: true
                    },
                    elements: this.elements_,
                    layout: {
                        padding: {
                            top: 28,
                            left: 8,
                            right: 26,
                            bottom: 8
                        }
                    },
                    scales: {
                        xAxes: [
                            {
                                display: true,
                                gridLines: {
                                    display: false,
                                },
                            }
                        ],
                        yAxes: [
                            {
                                display: true,
                                ticks: {
                                    beginAtZero: true
                                }
                            }
                        ],
                    },
                    plugins: {
                        datalabels: {
                            anchor: 'end',
                            align: function (context) {
                                if (context.dataIndex === 0) {
                                    return 'right';
                                } else if (context.dataIndex === context.dataset['data'].length - 1) {
                                    return 'left';
                                } else {
                                    return 'end';
                                }
                            },
                            color: '#555555',
                            display: 'auto',
                            fontSize: '9px'
                        }
                    }
                }
            },
            // 订单金额分布
            // OrderAmountDis: {
            //     chartType: 'line',
            //     datasets: [
            //         {
            //             label: this.translate.instant('BusinessDataAnalysis.number'), // '个数',
            //             data: this.OrderAmountDis.title,
            //             fill: 'start'
            //         }
            //     ],
            //     labels: this.OrderAmountDis.title,
            //     colors: [
            //         {
            //             borderColor: '#E04958',
            //             backgroundColor: 'rgba(255,255,255, 0.1)',
            //             pointBackgroundColor: '#E04958',
            //             pointHoverBackgroundColor: '#E04958',
            //             pointBorderColor: '#ffffff',
            //             pointHoverBorderColor: '#ffffff',
            //         }
            //     ],
            //     options: {
            //         title: {
            //             display: false,
            //             text: '人数',
            //             left: '0',
            //             position: 'top',
            //         },
            //         spanGaps: false,
            //         legend: {
            //             display: false
            //         },
            //         maintainAspectRatio: false,
            //         tooltips: {
            //             position: 'nearest',
            //             mode: 'index',
            //             intersect: false,
            //             enabled: true,
            //             callbacks: {
            //                 label: function (tooltipItem, data) {
            //                     console.log(tooltipItem , '----tooltipItem');
            //                     console.log(data , '----data');
            //                     return '单笔销售：' + 111 + '\n\r占比：333' ;
            //                     // const str = tooltipItem.value;
            //                     // const reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
            //                     // const value_ = str.replace(reg, '$1,');
            //                     // return data.datasets[tooltipItem.datasetIndex].label + ':' + value_;
            //                 }
            //             }
            //         },
            //         elements: this.elements_,
            //         layout: {
            //             padding: {
            //                 top: 28,
            //                 left: 8,
            //                 right: 26,
            //                 bottom: 8
            //             }
            //         },
            //         scales: {
            //             xAxes: [
            //                 {
            //                     display: true,
            //                     gridLines: {
            //                         display: false,
            //                     },
            //                 }
            //             ],
            //             yAxes: [
            //                 {
            //                     display: true,
            //                     ticks: {
            //                         beginAtZero: true
            //                     },
            //                 }
            //             ],
            //         },
            //         plugins: {
            //             datalabels: {
            //                 anchor: 'end',
            //                 align: function (context) {
            //                     if (context.dataIndex === 0) {
            //                         return 'right';
            //                     } else if (context.dataIndex === context.dataset['data'].length - 1) {
            //                         return 'left';
            //                     } else {
            //                         return 'end';
            //                     }
            //                 },
            //                 color: '#555555',
            //                 display: 'auto',
            //                 fontSize: '9px'
            //             }
            //         }
            //     }
            // },
        };
    }

    addWindowListener() {
        // 页面响应式窗口变化监听
        window.addEventListener('resize', () => {
            this.reSw();
        });
    }

    reSw() {
        const w_w = window.innerWidth;
        w_w >= 1244 ? this.HeaderTitle = true : this.HeaderTitle = false;
        w_w >= 960 ? this.ResponsiveStruts = true : this.ResponsiveStruts = false;
    }

    // 单纯的将数字添加千分位
    setThousandBit(al_num) {
        let str = ''; // 字符串累加
        const num = al_num + '';
        for (let i = num.length - 1, j = 1; i >= 0; i-- , j++) {
            if (j % 3 === 0 && i !== 0) { // 每隔三位加逗号，过滤正好在第一个数字的情况
                str = str + num[i] + ','; // 加千分位逗号
                continue;
            }
            str = str + num[i]; // 倒着累加数字
        }
        const v_num = str.split('').reverse().join('');
        return v_num;
    }

    goBack() {
        history.back();
    }



    ngOnDestroy(): void {
        if (this.allECharts.AgeDistributionOfParticipatingMember) {
            this.allECharts.AgeDistributionOfParticipatingMember.dispose();
        }
        if (this.allECharts.GenderOfParticipatingMember) {
            this.allECharts.GenderOfParticipatingMember.dispose();
        }
        if (this.allECharts.SalesVoucherWriteOffProfessionalFormProportion) {
            this.allECharts.SalesVoucherWriteOffProfessionalFormProportion.dispose();
        }
        if (this.allECharts.TypesOfParticipatingMembers) {
            this.allECharts.TypesOfParticipatingMembers.dispose();
        }
        //
        if (this.allECharts.FormatRelatedSalesP) {
            this.allECharts.FormatRelatedSalesP.dispose();
        }
        if (this.allECharts.OrderAmountDis) {
            this.allECharts.OrderAmountDis.dispose();
        }
        this.timeDateSelect.pickerStart.destroy();
        this.timeDateSelect.pickerEnd.destroy();
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}


// 会员增长
export interface MembershipGrowth {
    NaturalGrowth_title_one?: Array<number | null | undefined | string>; // 自然增长标题1
    NaturalGrowth_title_two?: Array<number | null | undefined | string>;  // 自然增长标题2
    NaturalGrowth_title_three?: Array<number | null | undefined | string>;  // 自然增长标题3
    NaturalGrowth_value_one?: Array<number | null | undefined> | ChartPoint[]; // 自然增长数值1
    NaturalGrowth_value_two?: Array<number | null | undefined> | ChartPoint[]; // 自然增长数值2
    NaturalGrowth_value_three?: Array<number | null | undefined> | ChartPoint[]; // 自然增长数值3
    IncreaseByActivity_value_one?: Array<number | null | undefined> | ChartPoint[]; // 活动新增数值1
    IncreaseByActivity_value_two?: Array<number | null | undefined> | ChartPoint[]; // 活动新增数值2
    IncreaseByActivity_value_three?: Array<number | null | undefined> | ChartPoint[]; // 活动新增数值3
}

// 访问时段
export interface AccessPeriodE {
    title_one?: Array<number | null | undefined | string>; // 访问时段标题1
    title_two?: Array<number | null | undefined | string>;  // 访问时段标题2
    title_three?: Array<number | null | undefined | string>;  // 访问时段标题3
    value_one?: Array<number | null | undefined> | ChartPoint[]; // 访问时段数值1
    value_two?: Array<number | null | undefined> | ChartPoint[]; // 访问时段数值2
    value_three?: Array<number | null | undefined> | ChartPoint[]; // 访问时段数值3
}

// 订单金额分布
export interface OrderAmountDisE {
    xAxis: any; // 订单金额分布标题
    yAxis: any; // 订单金额分布值
    label: any ; // 订单金额分布的 提示
}



// 参与性别占比
export interface GenderOfParticipatingMembersE {
    value?: Array<any>; // 数组
    value_one?: Array<any>; // 数组 one
    value_two?: Array<any>; // 数组 two
    value_three?: Array<any>; // 数组 three
}

// 参与会员类型
export interface TypesOfParticipatingMembersE {
    value?: Array<any>; // 数组
    value_one?: Array<any>; // 数组 one
    value_two?: Array<any>; // 数组 two
    value_three?: Array<any>; // 数组 three
}

// 会员年龄分布
export interface AgeDistributionOfParticipatingMemberE {
    legend?: any; // 标签框
    value?: any; // 数组
    value_one?: any; // 数组 one
    value_two?: any; // 数组 two
    value_three?: any; // 数组 three
}

// 销售券核销业态占比
export interface SalesVoucherWriteOffProfessionalFormProportionE {
    barWidth: string;
    barMinHeight: number;
    barMinHeight_two: number; // 深色的那个条的最小值
    barMinHeight_three: number; //
    title?: Array<number | null | undefined | string>; // 标题
    title_one?: Array<number | null | undefined | string>; // 标题1
    title_two?: Array<number | null | undefined | string>; // 标题2
    title_three?: Array<number | null | undefined | string>; // 标题3

    WriteOffData?: Array<any>; //  领取量数组   发放量 批次量
    WriteOffData_one?: Array<any>; // 数组 one  发放量  批次量
    WriteOffData_two?: Array<any>; // 数组 two  发放量  批次量
    WriteOffData_three?: Array<any>; // 数组 three Proportion   发放量  批次量
    CouponCount?: Array<any>; // 总券数数组      领取量
    CouponCount_one?: Array<any>; //  总券数数组 领取量
    CouponCount_two?: Array<any>; //  总券数数组 领取量
    CouponCount_three?: Array<any>; //  总券数数组 领取量
    Proportion?: Array<any>; //  总券数数组 占比  核销量
    Proportion_one?: Array<any>; // 数组 占比one  核销量
    Proportion_two?: Array<any>; // 数组 占比two   核销量
    Proportion_three?: Array<any>; // 数组 占比three Proportion   核销量

}

// 将eCharts图表集到此集合
export class AllEChartsE {
    GenderOfParticipatingMember: any; // 参与会员性别
    TypesOfParticipatingMembers: any; // 参与会员类型
    AgeDistributionOfParticipatingMember: any; // 参与会员年龄分布
    SalesVoucherWriteOffProfessionalFormProportion: any; // 销售券核销业态占比
    FormatRelatedSalesP: any; // 业态关联销售占比
    OrderAmountDis: any; // 订单金额分布
}


// 最上面显示的常量
export interface SurveyParameter {
    ActivityBrowsingNum: string; // 活动浏览 数字
    ActivityBrowsingPercent: string; // 活动浏览 百分比

    MembershipConversionNum: string; // 会员转化 数字
    MembershipConversionPercent: string; // 会员转化 百分比

    NumberOfParticipantsNum: string; // 活动参与人数 数字
    NumberOfParticipantsPercent: string; // 活动参与人数 百分比

    ActivitySharingNum: string; // 活动分享 数字
    // ActivitySharingPercent: string; // 活动分享 百分比 暂未用到

    CouponGrantNum: string; // 优惠券发放 数字
    CouponGrantPercent: string; // 优惠券发放 百分比

    SalesAmountNum: string; // 销售金额 数字
    SalesAmountPercent: string; // 销售金额 百分比
    SalesAmountInNum: string; // 同比增长

    GenderRatioOfMembersMale: string; // 会员性别占比 男
    GenderRatioOfMembersFemale: string; // 会员性别占比 女
    FirstMembershipNum: string; // 首单会员人数

    ParameterActivityArray: Array<any>; // 活动参数数组
    ParameterArticleArray: Array<any>; // 文章参数数组


    AmountMarketingFundNum: string; // 营销基金使用金额

    UnitPriceACNum: string; // 参与活动客单价 -元
    UnitPriceACPercent1: string; // 参与活动客单价 -参与活动的客单价同比
    UnitPriceACPercent2: string; // 参与活动客单价 -整体客单价同比

    DailyIncreaseNum: string; // 日增加人数  -人
    DailyIncreasePercent: string; // 会员日均增加人数环比
}

// 头部选择框
export interface HeaderSelect {
    selectedType: string; //  '活动'; 类型
    selectName: string; // 活动名称
    startTime: any;
    endTime: any;
    ActivityType: Array<{ value: number | null | undefined | string, viewValue: number | null | undefined | string }>; //  '活动';类型
    ActivityName: Array<{
        id: number | null | undefined | string, viewValue: number | null | undefined | string, selectStart: any | string, selectEnd: any | string
    }>; //  '活动'; 名称
}

// 业态关联销售占比
export class FormatRelatedSalesP {
    title: any;
    retailValue: any; // 零售
    RestaurantValue: any; // 餐饮
    dutyFreeValue: any; // 免税
    legendName: any;
    tipsSource: any;
}

// 优惠券领取量与核销量
export class ReceiveWriteOffNum {
    dataSource = new MatTableDataSource;
    displayedColumns: any;
    displayedColumns_Copy: any;
    displayedColumns_otherCopy: any;
    TableHer: any;
    pageSize: number;
}

// 时间选中框
export class TimeDateSelect {
    pickerStart: any;
    configStart: any;
    pickerEnd: any;
    configEnd: any;
    day: string;
    timeDis: boolean;
}

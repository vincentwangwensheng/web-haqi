import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {MatDialog, MatSnackBar} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import {takeUntil} from 'rxjs/operators';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NgZone} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Utils} from '../../../../services/utils';
import {ActivityAnalysisService} from './activity-analysis.service';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {DateTransformPipe} from '../../../../pipes/date-transform/date-transform.pipe';
@Component({
  selector: 'app-activity-analysis',
  templateUrl: './activity-analysis.component.html',
  styleUrls: ['./activity-analysis.component.scss']
})
export class ActivityAnalysisComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject();
    @ViewChild('contentUpperPartFirstChart', {static: true}) contentUpperPartFirstChart: ElementRef;  // 活动浏览
    @ViewChild('activityShareChart', {static: true}) activityShareChart: ElementRef; // 活动分享
    @ViewChild('PickUpClickChart', {static: true}) PickUpClickChart: ElementRef; // 活动点击
    @ViewChild('SalesVoucherWriteOffProfessionalFormProportion', {static: true}) SalesVoucherWriteOffProfessionalFormProportion: ElementRef; // 销售券核销业态占比

    allECharts: AllEChartsE; // 所有echarts的集合
    threeCharts: SalesAmountBagRateCustomerUnitPriceE; // 上半部分三个图表 活动浏览 -- 活动分享 -- 活动点击
    acBrowse: ACBrowse; // 活动浏览折线图
    SVWOF: SalesVoucherWriteOffProfessionalFormProportionE; // 优惠券核销占比
    widgets: any;
    echarts: any;
    public ChartPlugins = [pluginDataLabels];
    ActivityType = '';
    selectedType = [];
    ResponsiveStruts = true;
    storeCodeClear = [];
    constructor(
      private service: ActivityAnalysisService,
      private dialog: MatDialog,
      private http: HttpClient,
      private utils: Utils,
      private snackBar: MatSnackBar,
      private loading: FuseProgressBarService,
      private translate: TranslateService,
      private newDateTransformPipe: NewDateTransformPipe,
      private dateTransform: DateTransformPipe,
      private zone: NgZone
  ) { }

  ngOnInit() {
      // 相应式
      this.reSw();
      this.addWindowListener();
      // 初始化我自己创建的图表的类
      this.initChartEntity();
      // 设置关于echarts
      this.intiAllECharts();
      // 初始化chart.js图表
      this.initWidget();
      // 初始化所有数据
      this.initAllData();

  }



    // 初始化所有的数据
    initAllData() {
        this.utils.getBaseUrl().then(project => {
            const baseUrl = project.baseUrl;
            console.log('当前环境baseUrl:' + baseUrl);
            sessionStorage.setItem('baseUrl', baseUrl);
            this.getACTimeSelect(); // 获取活动列表
        });
    }

    getACTimeSelect(){
        this.service.getActivityList(0, 0x3f3f3f3f, 'lastModifiedDate,desc', null, null).pipe(takeUntil(this._unsubscribeAll))
            .subscribe( res => {
                const content = res.body;
                const ac_list = [];
                content['forEach']( c => {
                    const begin_time = this.newDateTransformPipe.transform(c['beginTime']);
                    const end_time = this.newDateTransformPipe.transform(c['endTime']);
                    const viewValue = c['name'] + ' ' + begin_time + '-' + end_time;
                    ac_list.push({id: c['id'] , viewValue: viewValue });
                });
                this.selectedType = ac_list;
                this.ActivityType = this.selectedType[0].id;
                this.searchActivityBrowseData(); // 第一个图表，柱状图 活动浏览
                this.searchACShareChartData(); // 第二个图表 ，柱状图 活动分享
                this.searchPickUpClickChartData(); // 第三个图表 ，柱状图 活动点击领取
                this.searchSVWOFData(); // 优惠券核销
                this.searchStoreCodeClear(); // 品牌排行
            });
    }

    changeActivity(){
        this.searchActivityBrowseData(); // 第一个图表，柱状图 活动浏览
        this.searchACShareChartData(); // 第二个图片 ，柱状图 活动分享
        this.searchPickUpClickChartData(); // 第三个图表 ，柱状图 活动点击领取
        this.searchSVWOFData(); // 优惠券核销
        this.searchStoreCodeClear(); // 品牌排行
    }


    // 自动改变单位，如果超过万元就用万元做单位，如果超过
    changNumUnit(num) {
        num = num + '';
        if (num.includes(',')) {
            num = num.replace(/,/g , '');
        }
        let len = num.length;
        if (num.includes('.')) {
            len = num.indexOf('.');
        }
        if (len >= 6 &&  len < 9) { // 数字超过5 且在 8位数之内  单位就改成  万元
            const reg = Number(num) / 10000;
            return reg.toFixed(2) + ',万元';
            // } else if ( len === 8 ) {  // 数字等于8的时候  单位就改成  百万元
            //     const reg = Number(num) / 1000000;
            //     return reg.toFixed(2) + ',百万元';
            // } else if (len === 9 ) {  // 数字为9的时候 单位为 千万
            //     const reg = Number(num) / 10000000;
            //     return reg.toFixed(2) + ',千万元';
            // }
        }else if (num.length >= 9 ){  // 大于9的时候  单位改成亿
            const reg = Number(num) / 100000000;
            return reg.toFixed(2) + ',亿元';
        } else{
            return num + ',元';
        }
    }


    // 活动浏览柱状图&折线图
    searchActivityBrowseData() {
        this.service.activityBrowse(this.ActivityType).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (res) => {
                this.threeCharts.salesChartValue = res['map']( res1 => res1.data);
                this.threeCharts.salesChartTitle = res['map']( res1 => this.dateTransform.transform(res1.day , '-'));
                this.acBrowse.ACBrowseValue = res['map']( res1 => res1.data);
                this.acBrowse.ACBrowseTitle = res['map']( res1 => this.dateTransform.transform(res1.day , '-'));
                const value = res['map']( res1 => res1.data);
                this.orderBy_Two(value);
                this.threeCharts.salesCountValue = value[0];
                this.createSalesAmountChart();

                // 折线
                const widget6DataSets = [
                    {
                        label: '活动浏览',
                        data: this.acBrowse.ACBrowseValue,
                        fill: 'start'
                    }
                ];
                this.widgets.widget6.datasets = widget6DataSets;
                this.widgets.widget6.labels = this.acBrowse.ACBrowseTitle;
            },
            error1 => {
                this.loading.hide();
                console.log('获取活动浏览数据出错--', error1);
            }, () => {
                this.loading.hide();
            });
    }

    // 活动分享柱状图
    searchACShareChartData() {
        this.service.activityShare(this.ActivityType).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (res) => {
                this.threeCharts.activityShareValue = res['map']( res1 => res1.data);
                this.threeCharts.activityShareTitle = res['map']( res1 => this.dateTransform.transform(res1.day , '-'));
                const value = res['map']( res1 => res1.data);
                this.orderBy_Two(value);
                this.threeCharts.activityShareCount = value[0];
                this.createActivityShareChart();
            },
            error1 => {
                this.loading.hide();
                console.log('获取活动分享数据出错--', error1);
            }, () => {
                this.loading.hide();
            });
    }

    // 活动领取点击
    searchPickUpClickChartData(){
        this.service.activityCouPo(this.ActivityType).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (res) => {
                this.threeCharts.AcClickTitle = res['map']( res1 => res1.data);
                this.threeCharts.AcClickValue = res['map']( res1 => this.dateTransform.transform(res1.day , '-'));
                const value = res['map']( res1 => res1.data);
                this.orderBy_Two(value);
                this.threeCharts.AcClickCount = value[0];
                this.createPickUpClickChart();
            },
            error1 => {
                this.loading.hide();
                console.log('获取活动领取点击数据出错--', error1);
            }, () => {
                this.loading.hide();
            });
    }

    // 优惠券核销
    searchSVWOFData(){
        this.service.codeClear(this.ActivityType).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (res) => {
                const data = [
                    { name: '测试',   ff: 20, lq:  17, hx: 10 } ,
                    { name: '测试1',  ff: 36, lq:  27, hx: 12 } ,
                    { name: '测试2',  ff: 16, lq:  12, hx: 10 } ,
                    { name: '测试3',  ff: 12, lq:  11, hx: 10 } ,
                ];
                this.setCouponBarWidth(data);
                data.forEach( (d , i) => {
                    const num = i;
                    this.SVWOF.title [num] = d.name;
                    const batchNum = d.lq; // 领取
                    const grantNum = d.hx; // 核销
                    const WriteOffNum = d.ff; // 发放
                    const p_w_g = Number((Number(grantNum) / Number(batchNum)).toFixed(2));
                    let could_true = false;
                    if (p_w_g > 0.94) {
                        could_true = true;
                    }
                    this.setValueCouponCount(batchNum, num, batchNum, could_true);
                    this.setValueProportion(grantNum, num, grantNum);
                    this.setValueWriteOffData(WriteOffNum, num, WriteOffNum);
                    this.createSVWOFChart();
                });
            },
            error1 => {
                this.loading.hide();
                console.log('获取活动领取点击数据出错--', error1);
            }, () => {
                this.loading.hide();
            });
    }

    // 设置优惠券核销占比的条的大小
    setCouponBarWidth(cou_Array) {
        if (cou_Array.length <= 2) {
            this.SVWOF.barWidth = '35';
        } else if (cou_Array.length <= 3) {
            this.SVWOF.barWidth = '45';
        } else if (cou_Array.length <= 6) {
            this.SVWOF.barWidth = '57%';
        } else {
            this.SVWOF.barWidth = '67%';
        }
    }

    setValueCouponCount(p, num, batchNum, could_true) {

        if ('0' === p || '' === p || 0 === p) { // p === false 说明当前为0
            this.SVWOF.CouponCount[num] = {
                value: batchNum, label: {normal: {show: false}},
                itemStyle: {color: 'rgba(255 ,255 ,255 , 0)'}
            };
        } else {
            if (could_true) {
                // 百分比在95到100%之间
                this.SVWOF.CouponCount[num] = {
                    value: batchNum,
                    label: {normal: {show: false}}
                };
            } else {
                // 其他
                this.SVWOF.CouponCount[num] = {value: batchNum};
            }
        }

    }

    setValueProportion(p, num, grantNum) {
        if ('0' === p || '' === p || 0 === p) {  // 为0 与不为0
            this.SVWOF.Proportion[num] = {
                value: grantNum,
                itemStyle: {color: 'rgba(255 ,255 ,255 , 0)'},
                label: {normal: {show: false}}
            };
        } else {
            this.SVWOF.Proportion[num] = {value: grantNum};
        }

    }

    setValueWriteOffData(p, num, WriteOffNum) {
        if ('0' === p || '' === p || 0 === p) { // 为0 与不为0
            this.SVWOF.WriteOffData[num] = {
                value: WriteOffNum,
                label: {normal: {show: false}},
                itemStyle: {color: 'rgba(255 ,255 ,255 , 0)'}
            };
        } else {
            this.SVWOF.WriteOffData[num] = {value: WriteOffNum};
        }
    }

    // 品牌排行
    searchStoreCodeClear(){
        this.service.storeCodeClear(this.ActivityType).pipe(takeUntil(this._unsubscribeAll)).subscribe( res => {
            console.log('res ----' , res);
            const data = [
                {  bloc: '店铺1店铺1店铺1店铺1', count: '118338221'  } ,
                {  bloc: '店铺2', count: '2000'  } ,
                {  bloc: '店铺3', count: '4999'  } ,
                {  bloc: '店铺4', count: '6777'  } ,
                {  bloc: '店铺5', count: '6177'  } ,
                {  bloc: '店铺6', count: '6277'  } ,
                {  bloc: '店铺7', count: '6377'  } ,
                {  bloc: '店铺8', count: '6577'  } ,
                {  bloc: '店铺9', count: '6077'  } ,
                {  bloc: '店铺10', count: '5777'  } ,
                {  bloc: '店铺11', count: '4777'  } ,
                {  bloc: '店铺12', count: '2777'  } ,
                {  bloc: '店铺13', count: '4777'  } ,
                {  bloc: '店铺15', count: '1777'  } ,
                {  bloc: '店铺16', count: '8777'  } ,
            ];
            this.orderBy_Two(data , 'count');
            this.storeCodeClear = data;
        });
    }


    // 活动浏览
    createSalesAmountChart() {
        this.zone.runOutsideAngular(() => {
            this.allECharts.myUpperPartFirstChart = this.echarts.init(this.contentUpperPartFirstChart.nativeElement);
        });
        const option = {
            color: ['#2295DB'],
            tooltip: {
                trigger: 'item',
                position: ['37%', '35%'],
                backgroundColor: '#333333',
                formatter: function (params) {
                    const str = params.value + '';
                    const reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
                    const lastvalue = str.replace(reg, '$1,');
                    return params.name + '</br>' + params.seriesName + ':' + lastvalue;
                },
                textStyle: {
                    fontWeight: 525,
                }
            },

            grid: {
                left: '12px',
                right: '12px',
                bottom: '12px',
                top: '35px',
                containLabel: false
            },
            xAxis: [
                {
                    type: 'category',
                    data: this.threeCharts.salesChartTitle,
                    show: false,

                }
            ],
            yAxis: [
                {
                    type: 'value',
                    show: false,
                }
            ],
            series: [
                {
                    name: '活动浏览',
                    type: 'bar',
                    barWidth: '20%',
                    emphasis: {
                        itemStyle: {
                            //   color : 'rgba(51 , 152 , 219, 0.6)'
                            //   color : 'rgba(224 , 73 , 87, 1)'
                            color: '#7DCEFF'
                        }
                    },
                    label: {
                        normal: {
                            show: true,
                            color: '#555555',
                            position: 'top',
                            fontSize: 12,
                            formatter: function (params) {
                                // if (params.dataIndex % 3 === 0) {
                                //
                                // } else if (params.dataIndex % 9 === 0) {
                                //     return '';
                                // } else {
                                //     return '';
                                // }
                                const str = params.value + '';
                                const reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
                                return str.replace(reg, '$1,');
                            },
                        }
                    },
                    data: this.threeCharts.salesChartValue
                }
            ]
        };

        this.zone.runOutsideAngular(() => {
            this.allECharts.myUpperPartFirstChart.setOption(option);
        });
    }

    // 活动分享
    createActivityShareChart(){
        this.zone.runOutsideAngular(() => {
            this.allECharts.activityShareChart = this.echarts.init(this.activityShareChart.nativeElement);
        });
        const option = {
            color: ['#2295DB'],
            tooltip: {
                trigger: 'item',
                position: ['37%', '35%'],
                backgroundColor: '#333333',
                formatter: function (params) {
                    const str = params.value + '';
                    const reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
                    const lastvalue = str.replace(reg, '$1,');
                    return params.name + '</br>' + params.seriesName + ':' + lastvalue;
                },
                textStyle: {
                    fontWeight: 525,
                }
            },

            grid: {
                left: '12px',
                right: '12px',
                bottom: '12px',
                top: '35px',
                containLabel: false
            },
            xAxis: [
                {
                    type: 'category',
                    data: this.threeCharts.activityShareTitle,
                    show: false,

                }
            ],
            yAxis: [
                {
                    type: 'value',
                    show: false,
                }
            ],
            series: [
                {
                    name: '活动分享',
                    type: 'bar',
                    barWidth: '20%',
                    emphasis: {
                        itemStyle: {
                            //   color : 'rgba(51 , 152 , 219, 0.6)'
                            //   color : 'rgba(224 , 73 , 87, 1)'
                            color: '#7DCEFF'
                        }
                    },
                    label: {
                        normal: {
                            show: true,
                            color: '#555555',
                            position: 'top',
                            fontSize: 12,
                            formatter: function (params) {
                                const str = params.value + '';
                                const reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
                                return str.replace(reg, '$1,');
                                // if (params.dataIndex % 3 === 0) {
                                //
                                // } else if (params.dataIndex % 9 === 0) {
                                //     return '';
                                // } else {
                                //     return '';
                                // }
                            },
                        }
                    },
                    data: this.threeCharts.activityShareValue
                }
            ]
        };
        this.zone.runOutsideAngular(() => {
            this.allECharts.activityShareChart.setOption(option);
        });
    }


    // 活动领取点击
    createPickUpClickChart(){
        this.zone.runOutsideAngular(() => {
            this.allECharts.pickUpClickChart = this.echarts.init(this.PickUpClickChart.nativeElement);
        });
        const option = {
            color: ['#2295DB'],
            tooltip: {
                trigger: 'item',
                position: ['37%', '35%'],
                backgroundColor: '#333333',
                formatter: function (params) {
                    const str = params.value + '';
                    const reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
                    const lastvalue = str.replace(reg, '$1,');
                    return params.name + '</br>' + params.seriesName + ':' + lastvalue;
                },
                textStyle: {
                    fontWeight: 525,
                }
            },

            grid: {
                left: '12px',
                right: '12px',
                bottom: '12px',
                top: '35px',
                containLabel: false
            },
            xAxis: [
                {
                    type: 'category',
                    data: this.threeCharts.AcClickTitle,
                    show: false,

                }
            ],
            yAxis: [
                {
                    type: 'value',
                    show: false,
                }
            ],
            series: [
                {
                    name: '领取点击',
                    type: 'bar',
                    barWidth: '20%',
                    emphasis: {
                        itemStyle: {
                            //   color : 'rgba(51 , 152 , 219, 0.6)'
                            //   color : 'rgba(224 , 73 , 87, 1)'
                            color: '#7DCEFF'
                        }
                    },
                    label: {
                        normal: {
                            show: true,
                            color: '#555555',
                            position: 'top',
                            fontSize: 12,
                            formatter: function (params) {
                                const str = params.value + '';
                                const reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
                                return str.replace(reg, '$1,');
                                // if (params.dataIndex % 3 === 0) {
                                //
                                // } else if (params.dataIndex % 9 === 0) {
                                //     return '';
                                // } else {
                                //     return '';
                                // }
                            },
                        }
                    },
                    data: this.threeCharts.AcClickValue
                }
            ]
        };
        this.zone.runOutsideAngular(() => {
            this.allECharts.pickUpClickChart.setOption(option);
        });
    }

    // 销售券核销业态占比
    createSVWOFChart() {
        this.zone.runOutsideAngular(() => {
            this.allECharts.SVWOFChart = this.echarts.init(this.SalesVoucherWriteOffProfessionalFormProportion.nativeElement);
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
                        const str = params[0].value + '';
                        const reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
                        lastvalue = str.replace(reg, '$1,');
                        x_value = params[0].axisValue;
                        result += dotHtml_0 + params[0].seriesName + ':' + lastvalue + '</br>';
                    }
                    const dotHtml =
                        '<span style="display:inline-block;margin-right:5px;width:15px;height:15px;background-color:#2395DB; border:2px solid #ffffff "></span>';
                    if (params[1].seriesName === '领取量') {  //
                        const str = params[1].value + '';
                        const reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
                        lastvalue = str.replace(reg, '$1,');
                        x_value = params[1].axisValue;
                        result += dotHtml + params[1].seriesName + ':' + lastvalue + '</br>';
                    }
                    const dotHtml_ =
                        '<span style="display:inline-block;margin-right:5px;width:15px;height:15px;background-color:#C63862; border:2px solid #ffffff "></span>';

                    if (params[2].seriesName === '核销量') { //
                        const str = params[2].value + '';
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
                    data: this.SVWOF.title,
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
                    barWidth: this.SVWOF.barWidth,
                    barMinHeight: this.SVWOF.barMinHeight_three,
                    label: {
                        normal: {
                            show: true,
                            position: 'right',
                            distance: 0,
                            color: '#555555',
                            fontSize: 0,
                            borderColor: 'auto',
                            formatter: function (p) {
                                const str = p.value + '';
                                const reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
                                return str.replace(reg, '$1,');
                            }
                        }
                    },
                    itemStyle: {
                        barBorderRadius: [0, 30, 30, 0],
                    },
                    data: this.SVWOF.WriteOffData
                },
                {
                    name: this.translate.instant('BusinessDataAnalysis.Receive'), // '领取量',
                    type: 'bar',
                    barGap: '-100%',
                    // barMaxWidth: 45,
                    barWidth: this.SVWOF.barWidth,
                    barMinHeight: this.SVWOF.barMinHeight,
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
                                const num = p.value + '';
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
                    data: this.SVWOF.CouponCount
                },
                {
                    name: this.translate.instant('BusinessDataAnalysis.WriteOff'), // '核销量',
                    type: 'bar',
                    barGap: '-100%',
                    // barMaxWidth: 45,
                    barWidth: this.SVWOF.barWidth,
                    barMinHeight: this.SVWOF.barMinHeight_two,
                    label: {
                        normal: {
                            show: true,
                            position: 'insideRight',
                            color: '#ffffff',
                            fontSize: 12,
                            formatter: function (p) {
                                let str = ''; // 字符串累加
                                const num = p.value + '';
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
                    data: this.SVWOF.Proportion
                },
            ]
        };
        this.zone.runOutsideAngular(() => {
            this.allECharts.SVWOFChart.setOption(option);
        });
    }



    // 初始化自己建的变量部分
    initChartEntity() {
        this.allECharts = new AllEChartsE(); // 所有的echarts图表
        this.acBrowse = new  ACBrowse(); // 活动浏览折线图
        this.threeCharts = new SalesAmountBagRateCustomerUnitPriceE(); // 上半部分三个图表 活动浏览，活动分享，领取点击
        this.SVWOF = new SalesVoucherWriteOffProfessionalFormProportionE(); // 优惠券核销占比
    }

    // 初始化所有的eCharts
    intiAllECharts() {
        this.zone.runOutsideAngular(() => {
            this.echarts = require('echarts');
        });
        window.addEventListener('resize', () => {
            if (this.allECharts.myUpperPartFirstChart && !this.allECharts.myUpperPartFirstChart.isDisposed()) {
                this.allECharts.myUpperPartFirstChart.resize();
            }
            if (this.allECharts.pickUpClickChart && !this.allECharts.pickUpClickChart.isDisposed()) {
                this.allECharts.pickUpClickChart.resize();
            }
            if (this.allECharts.activityShareChart && !this.allECharts.activityShareChart.isDisposed()) {
                this.allECharts.activityShareChart.resize();
            }
            if (this.allECharts.SVWOFChart && !this.allECharts.SVWOFChart.isDisposed()) {
                this.allECharts.SVWOFChart.resize();
            }
        });
    }

    initWidget(){
        this.widgets = {
            widget6: {
                chartType: 'line',
                datasets: [
                    {
                        label: '活动浏览',
                        data: this.acBrowse.ACBrowseValue,
                        fill: 'start'
                    }
                ],
                labels: this.acBrowse.ACBrowseTitle,
                colors: [
                    {
                        borderColor: '#2295DB',
                        backgroundColor: 'rgba(34,149,219, 0.6)',
                        pointBackgroundColor: '#2295DB',
                        pointHoverBackgroundColor: '#2295DB',
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
                        enabled: true,
                        callbacks: {
                            label: function (tooltipItem, data) {
                                const str = tooltipItem.value;
                                const reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
                                const value_ = str.replace(reg, '$1,');
                                return '活动浏览：' + value_;
                            }
                        }
                    },
                    elements: {
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

                    },
                    layout: {
                        padding: {
                            top: 24,
                            left: 8,
                            right: 26,
                            bottom: 12
                        }
                    },
                    scales: {

                        xAxes: [
                            {
                                display: true,
                                gridLines: {
                                    display: false,
                                },
                                /* offset: true,
                                 beforeSetDimensions(value){
                                     console.log(value) ;
                                 }*/
                            }
                        ],
                        yAxes: [
                            {
                                display: true,
                            }
                        ],
                    },
                    plugins: {
                        datalabels: {
                            anchor: 'end',
                            align: function (context) {
                                if (context.dataIndex === 0) {
                                    return 'right';
                                } /*else if (context.dataIndex === context.dataset['data'].length - 1) {
                                    return 'left';
                                }*/ else {
                                    return 'end';
                                }
                            },
                            color: '#555555',
                            display: 'auto',
                            fontSize: '9px',
                            formatter: function (value) {
                                const str = value;
                                const reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
                                const value_ = str.replace(reg, '$1,');
                                return value_;
                            }
                        }
                    }
                }
            },
        };
    }


    // 排序从大到小
    orderBy_Two(arr, TValue?) {
        for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr.length - i - 1; j++) {   // 这里说明为什么需要-1
                let a_j;
                let t_j ;
                if (TValue){
                    if (arr[j][TValue].includes(',')){
                        a_j = arr[j][TValue].replace(/,/g, '');
                    } else {
                        a_j = arr[j][TValue];
                    }
                    if (arr[j + 1][TValue]){
                        t_j = arr[j + 1][TValue].replace(/,/g, '');
                    } else {
                        t_j = arr[j + 1][TValue];
                    }
                } else {
                    a_j = arr[j];
                    t_j = arr[j + 1];
                }

                if (a_j === '-') {
                    a_j = 0;
                }
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


    addWindowListener() {
        // 页面响应式窗口变化监听
        window.addEventListener('resize', () => {
            this.reSw();
        });
    }

    reSw() {
        const w_w = window.innerWidth;
        w_w >= 960 ? this.ResponsiveStruts = true : this.ResponsiveStruts = false;
    }

    ngOnDestroy(): void {
        if (this.allECharts.pickUpClickChart) {
            this.allECharts.pickUpClickChart.dispose();
        }
        if (this.allECharts.myUpperPartFirstChart) {
            this.allECharts.myUpperPartFirstChart.dispose();
        }
        if (this.allECharts.activityShareChart) {
            this.allECharts.activityShareChart.dispose();
        }
        if (this.allECharts.SVWOFChart) {
            this.allECharts.SVWOFChart.dispose();
        }
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();

    }


}


// 将eCharts图表集到此集合
export class AllEChartsE {
    myUpperPartFirstChart: any; // 销售金额柱状图
    activityShareChart: any; // 活动分享
    pickUpClickChart: any; // 活动点击领取
    SVWOFChart: any; // 优惠券核销
}


// 上半部分三个图表 销售金额柱状图 -- 综合提袋率折线 -- 综合客单价
export class SalesAmountBagRateCustomerUnitPriceE {
    // 活动浏览柱状图数据
    salesChartTitle = [];
    salesChartValue = [];
    // 活动浏览总数据
    salesCountValue = null;
    // 活动分享
    activityShareTitle = [];
    activityShareValue = [];
    // 活动分享总数据
    activityShareCount = null;

    // 活动活动点击领取
    AcClickCount = null;
    // 活动点击领取图表
    AcClickTitle = [];
    AcClickValue = [];
}


// 活动浏览 折线图
export class ACBrowse {
    // 客单价统计图12个月
    ACBrowseTitle = [];
    ACBrowseValue = [];
}

// 优惠券核销占比
export class SalesVoucherWriteOffProfessionalFormProportionE {
    barWidth: string;
    barMinHeight: number;
    barMinHeight_two: number; // 深色的那个条的最小值
    barMinHeight_three: number; //
    title = []; // 标题
    title_one  = [];  // 标题1
    title_two  = []; // 标题2
    title_three  = [];  // 标题3

    WriteOffData = [];  //  领取量数组   发放量 批次量
    WriteOffData_one = []; // 数组 one  发放量  批次量
    WriteOffData_two = [];  // 数组 two  发放量  批次量
    WriteOffData_three = []; // 数组 three Proportion   发放量  批次量
    CouponCount = []; // 总券数数组      领取量
    CouponCount_one = [];  //  总券数数组 领取量
    CouponCount_two = [];  //  总券数数组 领取量
    CouponCount_three = [];  //  总券数数组 领取量
    Proportion = [];  //  总券数数组 占比  核销量
    Proportion_one = [];  // 数组 占比one  核销量
    Proportion_two = [];  // 数组 占比two   核销量
    Proportion_three = [];  // 数组 占比three Proportion   核销量

}

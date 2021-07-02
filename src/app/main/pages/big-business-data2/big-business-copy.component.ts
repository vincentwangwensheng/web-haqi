import {Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {fuseAnimations} from '../../../../@fuse/animations';
import {Subject} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ConfigService} from '../../../../@fuse/services/config.service';
import {TranslateService} from '@ngx-translate/core';
import {BigBusinessDataService} from '../../../services/big-business-data.service';
import {Utils} from '../../../services/utils';
import {HttpClient} from '@angular/common/http';
import {MatSnackBar} from '@angular/material';
import {Router} from '@angular/router';
import {EventManager} from '@angular/platform-browser';
import {FuseProgressBarService} from '../../../../@fuse/components/progress-bar/progress-bar.service';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'BigBusinessCopy',
    templateUrl: './big-business-copy.component.html',
    styleUrls: ['./big-business-copy.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class BigBusinessCopyComponent implements OnInit , OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject();
    loginForm: FormGroup;

    echarts: any;
    // 所有的echarts
    allEChartsE: AllEChartsE;
    sysVariableParam: SysVariableParam;
    allValue: AllValue;
    evenMana: any;
    @ViewChild('saleChart', {static: true}) saleChart: ElementRef;
    @ViewChild('paymentChart', {static: true}) paymentChart: ElementRef;
    @ViewChild('dutyFreeChart', {static: true}) dutyFreeChart: ElementRef;
    @ViewChild('retailChart', {static: true}) retailChart: ElementRef;
    @ViewChild('passengerGrowthChart', {static: true}) passengerGrowthChart: ElementRef;
    @ViewChild('roseChart', {static: true}) roseChart: ElementRef;
    @ViewChild('brandPreference', {static: true}) brandPreference: ElementRef;

    // @ViewChild('flightsChart', {static: true}) flightsChart: ElementRef;

    /**
     * Constructor
     *
     * @param {ConfigService} _configService
     * @param {FormBuilder} _formBuilder
     * @param http
     * @param bigBusinessDataService
     * @param snackBar
     * @param eventManager
     * @param router
     * @param loading
     * @param translate
     * @param zone
     */
  constructor(
        private _configService: ConfigService,
        private _formBuilder: FormBuilder,
        private http: HttpClient,
        private bigBusinessDataService: BigBusinessDataService,
        private snackBar: MatSnackBar,
        private eventManager: EventManager,
        private router: Router,
        private utils: Utils,
        private loading: FuseProgressBarService,
        private translate: TranslateService,
        private zone: NgZone,
    ) {
        this._configService.config = {
            layout: {
                navbar: {
                    hidden: true
                },
                toolbar: {
                    hidden: true
                },
                footer: {
                    hidden: true
                },
                sidepanel: {
                    hidden: true
                }
            }
        };
    }
    ngOnDestroy() {
        if (this.allEChartsE.myChart) {
            this.allEChartsE.myChart.dispose();
        }
        if (this.allEChartsE.myPaymentChart) {
            this.allEChartsE.myPaymentChart.dispose();
        }
        if (this.allEChartsE.myDutyFreeChart) {
            this.allEChartsE.myDutyFreeChart.dispose();
        }
        if (this.allEChartsE.myRetailChart) {
            this.allEChartsE.myRetailChart.dispose();
        }
        if (this.allEChartsE.myPassengerGrowthChart) {
            this.allEChartsE.myPassengerGrowthChart.dispose();
        }
        if (this.allEChartsE.myRoseChart) {
            this.allEChartsE.myRoseChart.dispose();
        }

        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        // document.getElementById('option-button').style.display = null;
    }

    /**
     * On init
     */
    ngOnInit(): void {
        // 隐藏设置按钮
        // document.getElementById('option-button').style.display = 'none';
        this.loginForm = this._formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
        // this.evenMana = this.eventManager.addGlobalEventListener('window', 'keydown.backspace', (e) => {
        //     const t = e.target.type;
        //     if (e.keyCode === 8 && t !== 'password' && t !== 'text' && t !== 'textarea' && e.target.localName !== 'div') {
        //         // 不是文本框的时候按backspace有效i
        //         this.router.navigateByUrl('apps/passengersAnalysis');
        //     }
        //
        // });

        this.sysVariableParam = new SysVariableParam();
        this.allEChartsE = new AllEChartsE();
        this.allValue = new AllValue();
        // 获取日期小标题
        // this.getTheMouth();
        this.initECharts();
        this.getBaseUrl();
    }


    initECharts() {
        this.zone.runOutsideAngular(() => {
            this.echarts = require('echarts');
        });
        window.addEventListener('resize', () => {
            if (this.allEChartsE.myChart && !this.allEChartsE.myChart.isDisposed()) {
                this.allEChartsE.myChart.resize();
            }
            if (this.allEChartsE.myPaymentChart && !this.allEChartsE.myPaymentChart.isDisposed()) {
                this.allEChartsE.myPaymentChart.resize();
            }
            if (this.allEChartsE.myDutyFreeChart && !this.allEChartsE.myDutyFreeChart.isDisposed()) {
                this.allEChartsE.myDutyFreeChart.resize();
            }
            if (this.allEChartsE.myRetailChart && !this.allEChartsE.myRetailChart.isDisposed()) {
                this.allEChartsE.myRetailChart.resize();
            }
            if (this.allEChartsE.myPassengerGrowthChart && !this.allEChartsE.myPassengerGrowthChart.isDisposed()) {
                this.allEChartsE.myPassengerGrowthChart.resize();
            }
            if (this.allEChartsE.myRoseChart && !this.allEChartsE.myRoseChart.isDisposed()) {
                this.allEChartsE.myRoseChart.resize();
            }
        });
    }

    getBaseUrl() {
        this.utils.getBaseUrl().then(project => {
            const baseUrl = project.baseUrl;
            console.log('当前环境baseUrl:' + baseUrl);
            sessionStorage.setItem('baseUrl', baseUrl);
            this.getTheMouth();
            this.searchOptionData();
            this.searchPaymentMethodData();
            this.searchUnitPriceData();
            // this.searchRetailData();
            this.searchPassengersAgeData();
            this.searchPassengersSexRation();
            //   this.searchMembersContributeData(); // 会员贡献额不要了‘
            this.getSearchComprehensiveBaggingRate_S();
            this.searchPassengersMembers();
            this.searchSalesCountData();
            this.searchBrandPreferenceData();
            this.searchPassengerGrowthCurve();
            this.searchBrandRankData();
            this.searchPassengersTotal();
            this.searchSalesChangeRate();
            this.searchPassengersChangeRate();
            this.searchMembersContributeChangeRate();
            this.searchFrequentPassengersMemberYearOnYear();  // 获取常旅客会员同比


        });
    }

    getTheMouth() {
        /*  const d = new Date();
          let theYear = d.getFullYear();
          let theMouth = d.getMonth(); // 获取当前月份(0-11,0代表1月)
          let HowDay;
          if (theMouth === 0) {
              theMouth = 12; // 是0的时候就要显示12月份,上一年的最后一个月
              theYear = theYear - 1; // 年份就是上一年
          }
          const myDate = new Date(theYear , theMouth , 0);
          HowDay = myDate.getDate();*/

        this.bigBusinessDataService.getTimeTitle().pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                if (res.status === 200) {
                    const timeArray = res.body;
                    this.sysVariableParam.MouthStart = timeArray[0];
                    this.sysVariableParam.MouthEnd = timeArray[1];
                }
            }
        );


        // this.sysVariableParam.MouthStart = theYear + '.' + theMouth + '.1';
        // this.sysVariableParam.MouthEnd =  theYear + '.' + theMouth + '.' + HowDay;
        // console.log('theYear ---' , theYear  + 'theMouth----' , theMouth + 'HowDay----' , HowDay);
    }

    //  文字云的内容 container dom节点  size 长和宽
    initTextCloud(texts: string[], container: string, size: number[]) {
        const word = [];
        texts.forEach((item, index) => {
                if (index <= 9) { // 文字过多 会导致比重高的有几率显示不出来
                    /* if (index <= 2) {
                         const textSize = 60 - (10 * index) > 0 ? 60 - (10 * index) : 20;
                         word.push({text: item, size: textSize});
                     } else {
                         const textSize = 40 - (5 * index) > 15 ? 40 - (5 * index) : 15;
                         word.push({text: item, size: textSize});
                     }*/
                    const textSize = 45 - index * 3;
                    word.push({text: item, size: textSize});
                }
            }
        );
        const d3 = require('d3');
        const cloud = require('d3-cloud');
        const layout = cloud()
            .size(size ? size : [400, 500])
            .words(word)
            .padding(5)
            .rotate(() => {
                const position = Math.round(Math.random());
                const mult = position === 0 ? -1 : 1;
                const rotate = Math.round(Math.random() * 90) * mult;
                return 0;
            })
            .font('Impact')
            .fontSize((d) => {
                return d.size;
            })
            .on('end', (words) => {
                d3.select(container).append('svg')
                    .attr('width', layout.size()[0])
                    .attr('height', layout.size()[1])
                    .append('g')
                    .attr('transform', 'translate(' + layout.size()[0] / 2 + ',' + layout.size()[1] / 2 + ')')
                    .selectAll('text')
                    // data方法会循环拿words里的数据
                    .data(words)
                    .enter().append('text')
                    .style('font-size', (d) => {
                        return d.size + 'px';
                    })
                    .style('font-family', 'Impact')
                    .style('fill', '#fff')
                    .attr('text-anchor', 'middle')
                    .attr('transform', (d) => {
                        return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')';
                    })
                    .text((d) => {
                        return d.text;
                    });
            });
        layout.start();
    }

    // 销售额业态占比数据
    searchOptionData() {
        this.allValue.optionColor = [
            {color: '#28c5e6'},
            {color: '#bb263e'},
            {color: '#ffffff'},
            {color: '#168075'},
            {color: '#5e131f'}
        ];
        this.loading.show();
        this.bigBusinessDataService.searchSalesRatioData().pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {

            this.parseOptionData(res, 'sales');
        }, error1 => {
            console.log(this.translate.instant('BusinessDataAnalysis.tipsSalesFormatRatioDataGetError'), error1);
        }, () => {
            this.loading.hide();
        });
    }

    // 支付方式占比数据
    searchPaymentMethodData() {
        this.loading.show();
        this.bigBusinessDataService.searchPaymentMethod().pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
            this.parseOptionData(res, 'payment');
        }, error1 => {
            console.log(this.translate.instant('BusinessDataAnalysis.tipsPaymentDataGetError'), error1);
        }, () => {
            this.loading.hide();
        });
    }

    // 获取客单价数据
    searchUnitPriceData() {
        this.loading.show();
        this.bigBusinessDataService.searchUnitPrice().pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
            this.parseOptionData(res, 'unitPrice');
        }, error1 => {
            console.log(this.translate.instant('BusinessDataAnalysis.tipsUnitPriceGetError'), error1);
        }, () => {
            this.loading.hide();
        });
    }

    // 业态客单价分析
    searchRetailData() {
        this.bigBusinessDataService.searchUnitPrice().pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
            this.parseOptionData(res, 'retail');
        });
    }

    // 零售品牌TOP5
    searchBrandRankData() {
        this.loading.show();
        this.bigBusinessDataService.searchBrandRank().pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
            this.parseOptionData(res, 'brandTop5');
        }, error1 => {
            console.log(this.translate.instant('BusinessDataAnalysis.tipsBrandTop5DataGetError'), error1);
        }, () => {
            this.loading.hide();
        });
    }

    // 销售额业态占比（月）
    searchSalesCountData() {
        this.loading.show();
        this.bigBusinessDataService.searchSalesCount().pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
            this.parseOptionData2(res, 'sales');
        }, error1 => {
            console.log(this.translate.instant('BusinessDataAnalysis.tipsMouthSalesFormatRatioDataGetError'), error1);
        }, () => {
            this.loading.hide();
        });
    }

    // 会员贡献
    searchMembersContributeData() {
        this.loading.show();
        this.bigBusinessDataService.searchMembersContribute().pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
            this.parseOptionData2(res, 'membersC');
        }, error1 => {
            console.log(this.translate.instant('BusinessDataAnalysis.tipsMembersCDataGetError'), error1);
        }, () => {
            this.loading.hide();
        });
    }

    // 获取综合提袋率的单个提袋率
    getSearchComprehensiveBaggingRate_S() {
        this.loading.show();
        this.bigBusinessDataService.getsearchComprehensiveBaggingRate_S().pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (res) => {
                this.loading.hide();
                this.sysVariableParam.BaggingRate_S = this.getChartsValue(res['cellset'][1], 0).replace('%', '');
              //  this.sysVariableParam.BaggingRate_S = this.sysVariableParam.BaggingRate_S.toFixed(2);
            },
            error1 => {
                this.loading.hide();
                console.log(this.translate.instant('BusinessDataAnalysis.tipsBaggingNumDataGetError'), error1);
            }, () => {
                this.loading.hide();
            });
    }



    // 常旅客会员
    searchPassengersMembers() {
        this.loading.show();
        this.bigBusinessDataService.searchPassengersMembers().pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
            this.parseOptionData2(res, 'pMembers');
        }, error1 => {
            console.log(this.translate.instant('BusinessDataAnalysis.tipsPMembersDataGetError'), error1);
        }, () => {
            this.loading.hide();
        });
    }

    // 旅客总量
    searchPassengersTotal() {
        this.loading.show();
        this.bigBusinessDataService.searchPassengersCount().pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.sysVariableParam.passengersTotal = res['cellset'][1][0].value;
        }, error1 => {
            console.log(this.translate.instant('BusinessDataAnalysis.tipsPMembersNumDataGetError'), error1);
        }, () => {
            this.loading.hide();
        });
    }

    // 获取常旅客增长曲线
    searchPassengerGrowthCurve() {
        this.loading.show();
        this.bigBusinessDataService.searchPassengerGrowthCurve().pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
            this.parseOptionData(res, 'growth');
        }, error1 => {
            console.log(this.translate.instant('BusinessDataAnalysis.tipsPMembersGrowthDataGetError'), error1);
        }, () => {
            this.loading.hide();
        });
    }

    // 常旅客年龄层
    searchPassengersAgeData() {
        this.loading.show();
        this.bigBusinessDataService.searchPassengersAge().pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
            this.parseOptionData(res, 'age');
        }, error1 => {
            console.log(this.translate.instant('BusinessDataAnalysis.tipsPMembersAgeDataGetError'), error1);
        }, () => {
            this.loading.hide();
        });
    }

    // 常旅客性别比
    searchPassengersSexRation() {
        this.loading.show();
        this.bigBusinessDataService.searchPassengersSexRatio().pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
            this.parseOptionData(res, 'sex');
        }, error1 => {
            console.log(this.translate.instant('BusinessDataAnalysis.tipsPMembersSexDataGetError'), error1);
        }, () => {
            this.loading.hide();
        });
    }

    // 获取销售同比数据
    searchSalesChangeRate() {
        this.loading.show();
        this.bigBusinessDataService.getSaikuData('storesalesyoy_bcia').pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
            this.parseOptionData2(res['body'], 'sCRate');
        }, error1 => {
            console.log(this.translate.instant('BusinessDataAnalysis.tipsSCRateDataGetError'), error1);
        }, () => {
            this.loading.hide();
        });
    }

    // 获取月旅客量同比数据
    searchPassengersChangeRate() {
        this.loading.show();
        this.bigBusinessDataService.getSaikuData('flightdatayoy_bcia').pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
            this.parseOptionData2(res['body'], 'pCRate');
        }, error1 => {
            console.log(this.translate.instant('BusinessDataAnalysis.tipsPCRateDataGetError'), error1);
        }, () => {
            this.loading.hide();
        });
    }

    // 获取月会员贡献同比数据 membersContributeChangeRate
    searchMembersContributeChangeRate() {
        this.loading.show();
        this.bigBusinessDataService.getSaikuData('vipsalesyoy_bcia').pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
            this.parseOptionData2(res['body'], 'mContributeCRate');
        }, error1 => {
            console.log(this.translate.instant('BusinessDataAnalysis.tipsMContributeCRateDataGetError'), error1);
        }, () => {
            this.loading.hide();
        });
    }

    // 获取常旅客会员同比
    searchFrequentPassengersMemberYearOnYear() {
        this.loading.show();
        this.bigBusinessDataService.getSaikuData('vipcountyoy_bcia').pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {

            const cellsetJson = res.body['cellset'];
            this.sysVariableParam.FrequentPassengersMemberYearOnYear = cellsetJson[1][0]['value'];


        }, error1 => {
            console.log(this.translate.instant('BusinessDataAnalysis.tipsPMembersCRateDataGetError'), error1);
        }, () => {
            this.loading.hide();
        });
    }

    // 解析销售额业态占比数据
    parseOptionData(jsonParam, param) {

        const cellsetJson = jsonParam['cellset'];
        if ('sales' === param) {
            for (let i = 1; i < cellsetJson.length; i++) {
                let color;
                const title = cellsetJson[i][0]['value'];
                (this.allValue.optionTitle)[i - 1] = title;
                if (title === this.translate.instant('BusinessDataAnalysis.dutyFree')) {
                    // 免税
                    color = '#5ABAFF';
                } else if (title === this.translate.instant('BusinessDataAnalysis.Restaurant')) {
                    // 餐饮
                    color = '#F79000';
                } else {
                    // 零售
                    color = '#2295DB'; // 零售
                }
                const val = cellsetJson[i][1]['value'].replace(/,/g, '');
                (this.allValue.optionValue)[i - 1] = {value: val, name: title, itemStyle: {color: color}};
            }
            this.createSalesFormatRatioChart();
        }
        if ('growth' === param) { //
            for (let i = 1; i < cellsetJson.length; i++) {
                const title = cellsetJson[i][0]['value'];
                (this.allValue.passengersValueX)[i - 1] = title;
                const val = cellsetJson[i][1]['value'].replace(/,/g, '');
                /* if (i === 8) {
                     (this.passengersValueY)[i - 1] = {value: '12000', name: title};
                 }else {
                     (this.passengersValueY)[i - 1] = {value: val, name: title};
                 }*/
                (this.allValue.passengersValueY)[i - 1] = {value: val, name: title};

            }
            //   console.log('this.passengersValueY----' , this.passengersValueY);
            this.createAnnularChart();
        } else if ('payment' === param) {
            this.allValue.paymentValue = [];
            this.allValue.paymentTitle = [];
            for (let i = 1; i < cellsetJson.length; i++) {
                const title = cellsetJson[i][0]['value'];
                const val = cellsetJson[i][1]['value'].replace(/,/g, '');
                let color;
                if (this.translate.instant('BusinessDataAnalysis.AliPay') === title) {
                    color = '#5abaff';
                } else if (this.translate.instant('BusinessDataAnalysis.WeChat') === title) {
                    color = '#5eca82';
                } else if (this.translate.instant('BusinessDataAnalysis.MIS') === title) {
                    color = '#d92f56';
                } else {
                    color = '#2295db';
                }
                (this.allValue.paymentValue)[i - 1] = {
                    value: val,
                    name: title,
                    percent: '',
                    itemStyle: {color: color},
                    label: {show: false}
                };
            }
            this.allValue.paymentValue.sort((a, b) => b.value - a.value); // 按照比重排序
            const other = this.allValue.paymentValue.find((item, index) => index === 3);
            let total = 0;
            let otherCount = 0;
            if (other) {
                otherCount = parseInt(other.value, 10);
            }
            this.allValue.paymentValue.forEach((item, index) => {
                total += parseInt(item.value, 10);
                if (index <= 2) { // 取比重最大三位显示
                    this.allValue.paymentTitle.push(item.name.substring(0, 3));
                    item.label.show = true;
                } else if (index > 3) {
                    if (other) {
                        otherCount += parseInt(item.value, 10);
                    }
                }
            });
            this.allValue.paymentValue = this.allValue.paymentValue.slice(0, 3);
            if (other) {
                other.name = this.translate.instant('BusinessDataAnalysis.OtherPay');
                other.value = otherCount + '';
                other.label.show = true;
                this.allValue.paymentValue.push(other);
            }
            this.allValue.paymentValue.forEach(item => {
                item.percent = ((parseInt(item.value, 10) / total) * 100).toFixed(2);
            });
            this.createPaymentMethodChart();
        } else if ('unitPrice' === param) {
            this.allValue.unitPriceValue = [];
            this.allValue.retailValue = [];
            const colors = [{color: '#2cdaff'},
                {color: '#2C566D'}];
            let index = 0;
            for (let i = 1; i < cellsetJson.length; i++) {
                const title = cellsetJson[i][0]['value'];
                const val = cellsetJson[i][1]['value'].replace(/,/g, '');
                index = index + 1 >= 2 ? 0 : index + 1;
                if (title === this.translate.instant('BusinessDataAnalysis.dutyFree')) {
                    this.allValue.unitPriceValue.push({
                        name: val,
                        rate: '',
                        selected: true,
                        itemStyle: colors[0],
                        label: {position: 'center', show: true}
                    });
                } else if (title === this.translate.instant('BusinessDataAnalysis.retail')) {
                    this.allValue.retailValue.push(
                        {
                            name: val,
                            rate: '',
                            selected: true,
                            itemStyle: colors[0],
                            label: {position: 'center', show: true}
                        }
                    );
                }
                // (this.unitPriceValue)[i - 1] = {
                //     value: val,
                //     name: title,
                //     selected: false,
                //     itemStyle: colors[index],
                //     label: {position: index !== 0 ? 'inner' : 'outside', show: index === 0}
                // };
            }
            // this.unitPriceValue[0].selected = true;
            // this.unitPriceValue.forEach(item => {
            //     item.value = parseInt(item.value, 10).toFixed(0);
            // });
            this.bigBusinessDataService.searchBaggingRateWithPrice().pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                const cellset = res['cellset'];
                cellset.forEach(item => {
                    if (item[0].value === this.translate.instant('BusinessDataAnalysis.dutyFree')) {
                        this.allValue.unitPriceValue[0].rate = item[1].value;
                    } else if (item[0].value === this.translate.instant('BusinessDataAnalysis.retail')) {
                        this.allValue.retailValue[0].rate = item[1].value;
                    }
                });
                const unitPriceRate = parseFloat(this.allValue.unitPriceValue[0].rate.replace('%', ''));
                const retailRate = parseFloat(this.allValue.retailValue[0].rate.replace('%', ''));
                if (unitPriceRate < 100) {
                    const value = unitPriceRate;
                    const otherValue = 100 - value;
                    const other = {
                        value: otherValue,
                        itemStyle: colors[1],
                        label: {position: 'inner', show: false}
                    };
                    this.allValue.unitPriceValue[0].value = value;
                    this.allValue.unitPriceValue.push(other);
                } else {
                    const value = unitPriceRate;
                    const otherValue = 0;
                    const other = {
                        selected: false,
                        value: otherValue,
                        itemStyle: colors[1],
                        label: {position: 'inner', show: false}
                    };
                    const item = this.allValue.unitPriceValue[0];
                    item.value = value;
                    item.selected = false;
                    this.allValue.unitPriceValue.push(other);

                }
                if (retailRate < 100) {
                    const value = retailRate;
                    const otherValue = 100 - value;
                    const other = {
                        value: otherValue,
                        itemStyle: colors[1],
                        label: {position: 'inner', show: false}
                    };
                    this.allValue.retailValue[0].value = value;
                    this.allValue.retailValue.push(other);
                } else {
                    const value = retailRate;
                    const otherValue = 0;
                    const other = {
                        value: otherValue,
                        itemStyle: colors[1],
                        label: {position: 'inner', show: false}
                    };
                    const item = this.allValue.retailValue[0];
                    item.value = value;
                    item.selected = false;
                    this.allValue.retailValue.push(other);
                }
                this.createUnitPriceChart();
                this.createRetailChart();
            }, error1 => {
                console.log(this.translate.instant('BusinessDataAnalysis.tipsPriceBaggingDataGetError'), error1);
            });
        } else if ('age' === param) {
            for (let i = 1; i < cellsetJson.length; i++) {
                const title = cellsetJson[i][0]['value'];
                const val = cellsetJson[i][1]['value'].replace(/,/g, '');
                if (title !== this.translate.instant('BusinessDataAnalysis.OtherPay')) {
                    (this.allValue.passengersAgeValue)[i - 1] = {
                        value: val,
                        name: title,
                        itemStyle: {color: '#ff505c', opacity: 1}
                    };
                }
            }
            this.allValue.passengersAgeValue.forEach((item, index) => {
                switch (index) {
                    case 0: {
                        item.itemStyle.opacity = 0.2;
                        break;
                    }
                    case 1: {
                        item.itemStyle.opacity = 0.3;
                        break;
                    }
                    case 2: {
                        item.itemStyle.opacity = 0.5;
                        break;
                    }
                    case 3: {
                        item.itemStyle.opacity = 0.7;
                        break;
                    }
                    case 4: {
                        item.itemStyle.opacity = 0.85;
                        break;
                    }
                }
            });
            this.createPassengersAgeChart();
        } else if ('sex' === param) {
            for (let i = 1; i < cellsetJson.length; i++) {
                const title = cellsetJson[i][0]['value'];
                const val = cellsetJson[i][1]['value'].replace(/,/g, '');
                if (title === this.translate.instant('BusinessDataAnalysis.male')) {
                    this.sysVariableParam.maleValue = val;
                } else if (title === this.translate.instant('BusinessDataAnalysis.female')) {
                    this.sysVariableParam.femaleValue = val;
                }
            }
            this.sysVariableParam.malePercent = ((Number(this.sysVariableParam.maleValue) / (Number(this.sysVariableParam.maleValue)
                + Number(this.sysVariableParam.femaleValue))) * 100).toFixed(2);
            this.sysVariableParam.femalePercent = ((Number(this.sysVariableParam.femaleValue) / (Number(this.sysVariableParam.maleValue)
                + Number(this.sysVariableParam.femaleValue))) * 100).toFixed(2);
        } else if ('brand' === param) {
            for (let i = 1; i < (cellsetJson.length > 20 ? 20 : cellsetJson.length); i++) {
                const title = cellsetJson[i][0]['value'];
                const val = cellsetJson[i][1]['value'].replace(/,/g, '');

                // const val = cellsetJson[i][1]['value'].replace(/,/g, '');
                (this.allValue.brandPreferenceValue)[i - 1] = {name: title, value: val};
            }
            this.allValue.brandPreferenceValue.sort((a, b) => b.value - a.value);
            const textCloud = [];
            this.allValue.brandPreferenceValue.forEach((item, index) => {
                // if (index <= 4) {
                textCloud.push(item.name);
                // }
            });
            this.initTextCloud(textCloud, this.brandPreference.nativeElement, [400, 240]);
        } else if ('brandTop5' === param) {
            for (let i = 1; i < cellsetJson.length; i++) {
                const title = cellsetJson[i][0]['value'];
                const val = cellsetJson[i][1]['value'];
                const val2 = cellsetJson[i][2]['value'];
                const brandInfo = new BrandInfo();
                brandInfo.brand = title;
                brandInfo.sales = val;
                brandInfo.unitPrice = val2;
                this.allValue.brandList[i - 1] = brandInfo;
            }
        }

    }

    parseOptionData2(jsonParam, param) {
        const cellsetJson = jsonParam['cellset'];
        const value = cellsetJson[1][0]['value'];
        if (param === 'membersC') {
            this.sysVariableParam.membersValue = value;
        } else if (param === 'pMembers') {
            this.sysVariableParam.pMembersValue = value;
        } else if (param === 'sales') {
            this.sysVariableParam.salesCountValue = value;
        } else if ('sCRate' === param) {
            this.sysVariableParam.salesChangeRate = value;
        } else if ('pCRate' === param) {
            this.sysVariableParam.passengersChangeRate = value;
        } else if ('mContributeCRate' === param) {
            this.sysVariableParam.membersContributeChangeRate = value;
        }
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



    // 销售额业态占比
    createSalesFormatRatioChart() {
        // const echarts = require('echarts');
        this.zone.runOutsideAngular(() => {
            this.allEChartsE.myChart = this.echarts.init(this.saleChart.nativeElement);
        });

        // 绘制图表图标数据
        const option = {
            legend: {
                orient: 'horizontal',
                bottom: '0px',
                itemWidth: 20,
                itemHeight: 6,
                textStyle: {
                    color: 'white',
                    fontSize: 14,
                },
                data: this.allValue.optionTitle
            },

            series: [
                {
                    name: this.translate.instant('BusinessDataAnalysis.saleChart'),
                    type: 'pie',
                    center: ['50%', '40%'],
                    radius: ['60%', '80%'],
                    hoverOffset: 2,
                    itemStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [{
                                offset: 0, color: '#e33b46' // 0% 处的颜色#2cdaff
                            }, {
                                offset: 1, color: '#2cdaff' // 100% 处的颜色
                            }],
                            global: false // 缺省为 false
                        }
                    },
                    label: {
                        show: true,
                        position: 'inner',
                        formatter: '{b}:{d}%',
                        fontSize: 14,
                        color: '#fff'

                    },
                    data: this.allValue.optionValue
                }
            ]
        };
        this.zone.runOutsideAngular(() => {
            this.allEChartsE.myChart.setOption(option);
        });

    }

    // 支付方式占比
    createPaymentMethodChart() {
        // const echarts = require('echarts');
        this.zone.runOutsideAngular(() => {
            this.allEChartsE.myPaymentChart = this.echarts.init(this.paymentChart.nativeElement);
        });

        const option = {
            tooltip: {
                show: false,
                trigger: 'item',
                backgroundColor: '#333333',
                formatter: ' {a} <br/>{b}: {c} ({d}%)',
                padding: [1, 2, 1, 2], // 设置框框的上下左右边距
                textStyle: {fontSize: 9},
            },
            legend: {
                orient: 'horizontal',
                // x: 'left',
                // y: 'bottom',
                // left: '5px',
                bottom: '0px',
                itemWidth: 20,
                itemHeight: 6,
                textStyle: {
                    color: 'white',
                    fontSize: 14,
                },
                data: this.allValue.paymentTitle
            },
            series: [
                {
                    name: this.translate.instant('BusinessDataAnalysis.payment'),
                    type: 'pie',
                    center: ['55%', '40%'],
                    radius: ['60%', '80%'],
                    hoverOffset: 2,
                    label: {
                        position: 'inner',
                        formatter: '{b}:{d}%',
                        fontSize: 14,
                        color: '#fff'
                    },
                    data: this.allValue.paymentValue
                }
            ]
        };
        this.zone.runOutsideAngular(() => {
            this.allEChartsE.myPaymentChart.setOption(option);
        });

    }

    // 客单价与提袋率（免税）
    createUnitPriceChart() {
        /// const echarts = require('echarts');
        this.zone.runOutsideAngular(() => {
            this.allEChartsE.myDutyFreeChart = this.echarts.init(this.dutyFreeChart.nativeElement);
        });

        const dutyFreeOption = {
            // tooltip: {
            //     trigger: 'item',
            //     formatter: '{a} <br/>{b} : {c} ({d}%)'
            // },
            series: [
                {
                    name: this.translate.instant('BusinessDataAnalysis.dutyFree'),
                    type: 'pie',
                    radius: '80%',
                    center: ['50%', '50%'],
                    data: this.allValue.unitPriceValue,
                    label: {
                        // formatter: '{b}元\n{c}%',
                        normal: {
                            show: true,
                            position: 'center',
                            padding: [85, 30, 40, 30],
                            color: 'white',
                            fontSize: '14',
                            formatter: '{b}' + this.translate.instant('BusinessDataAnalysis.Yuan') + '\n{c}%',
                        },
                        // color: 'white',
                        // fontSize: '14'
                        // padding: [30, 0, 0, 0],

                    },
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
            this.allEChartsE.myDutyFreeChart.setOption(dutyFreeOption);
        });

    }

    // 客单价与提袋率（零售）
    createRetailChart() {
        // const echarts = require('echarts');
        this.zone.runOutsideAngular(() => {
            this.allEChartsE.myRetailChart = this.echarts.init(this.retailChart.nativeElement);
        });

        const retailOption = {
            series: [
                {
                    name: this.translate.instant('BusinessDataAnalysis.retail'),
                    type: 'pie',
                    radius: '80%',
                    center: ['50%', '50%'],
                    data: this.allValue.retailValue,
                    label: {
                        normal: {
                            show: true,
                            position: 'center',
                            padding: [90, 30, 30, 20],
                            color: 'white',
                            fontSize: '14',
                            formatter: '{b}' + this.translate.instant('BusinessDataAnalysis.Yuan') + '\n{c}%',
                        },
                        // formatter: '{b}元\n{c}%',
                        // padding: [30, 0, 0, 0],
                        // color: 'white',
                        // fontSize: '14'
                    },
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
            this.allEChartsE.myRetailChart.setOption(retailOption);
        });

    }


    // 地图旋转
    initEarthMap() {
        const echarts = require('echarts');
        require('echarts-gl');
        const dom = document.getElementById('flight-container');
        const myChart = echarts.init(dom);
        const option = null;
        this.http.get('assets/flights/flight.json').pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            const data = res as any;
            const airports = data.airports.map(function (item) {
                return {
                    coord: [item[3], item[4]]
                };
            });

            function getAirportCoord(idx) {
                return [data.airports[idx][3], data.airports[idx][4]];
            }

            // Route: [airlineIndex, sourceAirportIndex, destinationAirportIndex]
            const routesGroupByAirline = {};
            data.routes.forEach(function (route) {
                const airline = data.airlines[route[0]];
                const airlineName = airline[0];
                if (!routesGroupByAirline[airlineName]) {
                    routesGroupByAirline[airlineName] = [];
                }
                routesGroupByAirline[airlineName].push(route);
            });

            const pointsData = [];
            data.routes.forEach(function (airline) {
                pointsData.push(getAirportCoord(airline[1]));
                pointsData.push(getAirportCoord(airline[2]));
            });

            const series = data.airlines.map(function (airline) {
                const airlineName = airline[0];
                const routes = routesGroupByAirline[airlineName];

                if (!routes) {
                    return null;
                }
                return {
                    type: 'lines3D',
                    name: airlineName,

                    effect: {
                        show: true,
                        trailWidth: 1,
                        trailLength: 0.15,
                        trailOpacity: 1,
                        trailColor: 'rgb(30, 30, 60)'
                    },

                    lineStyle: {
                        width: 1,
                        color: 'rgb(50, 50, 150)',
                        // color: 'rgb(118, 233, 241)',
                        opacity: 0.1
                    },
                    blendMode: 'lighter',

                    data: routes.map(function (item) {
                        return [airports[item[1]].coord, airports[item[2]].coord];
                    })
                };
            }).filter(function (series2) {
                return !!series2;
            });
            series.push({
                type: 'scatter3D',
                coordinateSystem: 'globe',
                blendMode: 'lighter',
                symbolSize: 1,
                itemStyle: {
                    color: 'rgb(50, 50, 150)',
                    opacity: 0.2
                },
                data: pointsData
            });
            // 切换航线图的key 后期可以汉化 将中国放到默认
            const keys = Object.keys(routesGroupByAirline);
            keys.splice(keys.indexOf('Air China'), 1);
            keys.unshift('Air China');
            myChart.setOption({
                legend: {
                    selectedMode: 'single',
                    left: 'left',
                    data: keys,
                    orient: 'vertical',
                    textStyle: {
                        color: '#fff'
                    }
                },
                globe: {

                    environment: '',

                    heightTexture: 'assets/flights/bathymetry_bw_composite_4k.jpg',

                    displacementScale: 0.1,
                    displacementQuality: 'high',

                    baseColor: '#000',

                    shading: 'realistic',
                    realisticMaterial: {
                        roughness: 0.2,
                        metalness: 0
                    },

                    postEffect: {
                        enable: true,
                        depthOfField: {
                            enable: false,
                            focalDistance: 150
                        }
                    },
                    temporalSuperSampling: {
                        enable: true
                    },
                    light: {
                        ambient: {
                            intensity: 0
                        },
                        main: {
                            intensity: 0.1,
                            shadow: false
                        },
                        ambientCubemap: {
                            texture: 'assets/flights/lake.hdr',
                            exposure: 1,
                            diffuseIntensity: 0.5,
                            specularIntensity: 2
                        }
                    },
                    viewControl: {
                        autoRotate: true
                    },
                    silent: true
                },
                series: series
            });
            window.addEventListener('keydown', function () {
                series.forEach(function (series2, idx) {
                    myChart.dispatchAction({
                        type: 'lines3DToggleEffect',
                        seriesIndex: idx
                    });
                });
            });
        });
        if (option && typeof option === 'object') {
            myChart.setOption(option, true);
        }

    }

    // 常旅客增长曲线
    createAnnularChart() {
        this.zone.runOutsideAngular(() => {
            this.allEChartsE.myPassengerGrowthChart = this.echarts.init(this.passengerGrowthChart.nativeElement);
        });


        const passengerGrowthOption = {
            color: ['#2cdaff'],
            title: {
                text: ''
            },
            tooltip: {
                trigger: 'item',
                backgroundColor: '#333333',
            },
            legend: {
                show: false
            },
            grid: {
                left: '70px',
                right: '25px',
                bottom: '25px',
                top: '35px',
                containLabel: false
            },
            xAxis: [
                {
                    type: 'category',
                    data: this.allValue.passengersValueX,
                    axisLabel: {
                        color: '#ffffff',
                        fontSize: 14
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#2cdaff',
                        }
                    }
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    splitLine: {
                        show: false
                    },
                    axisLabel: {
                        color: '#ffffff',
                        fontSize: 14
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#2cdaff',
                        }
                    }
                }
            ],
            series: [
                {
                    name: this.translate.instant('BusinessDataAnalysis.MembershipGrowth'),
                    type: 'line',
                    stack: this.translate.instant('BusinessDataAnalysis.Total'),
                    areaStyle: {
                        normal: {
                            color: '#ffffff',
                            opacity: 0.1
                        }
                    },
                    lineStyle: {
                        normal: {
                            opacity: 0.5,
                            show: true
                        }
                    },
                    markPoint: {
                        symbolSize: 35,
                        data: [
                            {type: 'max', name: this.translate.instant('BusinessDataAnalysis.max')}
                        ],
                        label: {
                            fontStyle: {
                                fontSize: 10,
                            }
                        },
                    },
                    symbol: 'circle',
                    symbolSize: 8,
                    data: this.allValue.passengersValueY
                }
            ]
        };
        this.zone.runOutsideAngular(() => {
            this.allEChartsE.myPassengerGrowthChart.setOption(passengerGrowthOption);
        });

    }

    // 常旅客年龄层
    createPassengersAgeChart() {
        // const echarts = require('echarts');
        this.zone.runOutsideAngular(() => {
            this.allEChartsE.myRoseChart = this.echarts.init(this.roseChart.nativeElement);
        });

        const roseChartOption = {
            legend: {
                x: 'center',
                y: 'bottom',
                data: []
            },
            calculable: true,
            series: [
                {
                    name: this.translate.instant('BusinessDataAnalysis.MembershipAge'),
                    type: 'pie',
                    radius: [40, 120],
                    center: ['50%', '50%'],
                    label: {
                        show: true,
                        position: 'outeside',
                        formatter: '{b}\n{d}%',
                        color: 'white',
                        fontSize: 14
                    },
                    labelLine: {
                        normal: {
                            lineStyle: {
                                color: 'rgba(255, 255, 255, 0.3)'
                            },
                            smooth: 0.2,
                            length: 8,
                            length2: 10
                        }
                    },
                    roseType: 'area',
                    data: this.allValue.passengersAgeValue
                }
            ]
        };
        this.zone.runOutsideAngular(() => {
            this.allEChartsE.myRoseChart.setOption(roseChartOption);
        });
    }

    // 获取品牌偏好数据
    searchBrandPreferenceData() {
        this.bigBusinessDataService.searchBrandPreference().pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
            this.parseOptionData(res, 'brand');
        });
    }

    getAirportCoord(data, idx) {
        return [data.airports[idx][3], data.airports[idx][4]];
    }


}

// 商品top5的属性
export class BrandInfo {
    brand: string;
    sales: string;
    unitPrice: string;
}

export class AllEChartsE {
    myRoseChart: any;
    myChart: any;
    myPaymentChart: any;
    myDutyFreeChart: any;
    myRetailChart: any;
    myPassengerGrowthChart: any;
}

// 所有图表的数据的集合
export class AllValue {
    // 销售额业态占比数据
    optionColor = [];
    optionTitle = [];
    optionValue = [];
    // 支付方式占比数据
    paymentTitle = [];
    paymentValue = [];
    // 客单价与提袋率（免税-零售）
    unitPriceValue = [];
    retailValue = [];
    // 常旅客增长曲线图
    passengersValueX = [];
    passengersValueY = [];
    // 常旅客年龄
    passengersAgeValue = [];
    // 品牌偏好数据
    brandPreferenceValue = [];
    // 品牌top5 数据
    brandList = [];
}

export class SysVariableParam {
    // 旅客总量人数
    passengersTotal;
    // 会员贡献额 万元
    membersValue;
    // 常旅客会员 万人
    pMembersValue;
    // 销售额 万元
    salesCountValue;
    // 会员性别比 人数
    maleValue;
    femaleValue;
    // 男性百分比数据
    malePercent;
    // 女性百分比数据
    femalePercent;
    // 销售同比
    salesChangeRate;
    // 旅客量同比数据
    passengersChangeRate;
    // 会员贡献同比数据
    membersContributeChangeRate;
    // 常旅客会员同比数据
    FrequentPassengersMemberYearOnYear;
    // 营销引擎参数
    MouthStart: string;
    MouthEnd: string;

    // 综合提袋率
    BaggingRate_S;
}

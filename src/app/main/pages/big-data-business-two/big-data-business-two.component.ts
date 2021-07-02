import {Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {ConfigService} from '../../../../@fuse/services/config.service';
import {HttpClient} from '@angular/common/http';
import {BigBusinessDataService} from '../../../services/big-business-data.service';
import {MatSnackBar} from '@angular/material';
import {FuseProgressBarService} from '../../../../@fuse/components/progress-bar/progress-bar.service';
import {Router} from '@angular/router';
import {EventManager} from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-big-data-business-two',
  templateUrl: './big-data-business-two.component.html',
  styleUrls: ['./big-data-business-two.component.scss']
})
export class BigDataBusinessTwoComponent implements OnInit , OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject();
    @ViewChild('SalesBizTypePro', {static: true}) SalesBizTypePro: ElementRef; // 销售额方式占比
    @ViewChild('PayTypePro', {static: true}) PayTypePro: ElementRef;  // 支付方式占比
    @ViewChild('CustomerUnitPrice', {static: true}) CustomerUnitPrice: ElementRef; // 客单价图表
    @ViewChild('BagRate', {static: true}) BagRate: ElementRef;  // 提袋率图表
    @ViewChild('ageProChart', {static: true}) ageProChart: ElementRef;  // 性别占比
    @ViewChild('brandCloud', {static: true}) brandCloud: ElementRef;  // 文字云

    twoEChartsE: TwoEChartsE;
    circlePieChart: CirclePieChart;
    eatTop: EatTopSource;
    amountSales3D: AmountSales3D;
    sexPro: SexPro;
    listData: any;
    eCharts: any;
  constructor(
      private _configService: ConfigService,
      private _formBuilder: FormBuilder,
      private http: HttpClient,
      private bigBusinessDataService: BigBusinessDataService,
      private snackBar: MatSnackBar,
      private eventManager: EventManager,
      private router: Router,
      private loading: FuseProgressBarService ,
      private translate: TranslateService,
      private zone: NgZone,
  ) {
      // Configure the layout
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

  ngOnInit() {
      this.initParam();
      this.initECharts();
      this.initData();
  }


    initECharts(){
      this.zone.runOutsideAngular(() => {
          this.eCharts = require('echarts');
      });
      window.addEventListener('resize', () => {
          if (this.twoEChartsE.SalesBizTypePro && !this.twoEChartsE.SalesBizTypePro.isDisposed()  ){
              this.twoEChartsE.SalesBizTypePro.resize();
          }
          if (this.twoEChartsE.SalesBizTypePro && !this.twoEChartsE.SalesBizTypePro.isDisposed()  ){
              this.twoEChartsE.SalesBizTypePro.resize();
          }
          if (this.twoEChartsE.SalesBizTypePro && !this.twoEChartsE.SalesBizTypePro.isDisposed()  ){
              this.twoEChartsE.SalesBizTypePro.resize();
          }
          if (this.twoEChartsE.CustomerUnitPrice && !this.twoEChartsE.CustomerUnitPrice.isDisposed()  ){
              this.twoEChartsE.CustomerUnitPrice.resize();
          }
          if (this.twoEChartsE.BagRate && !this.twoEChartsE.BagRate.isDisposed()  ){
              this.twoEChartsE.BagRate.resize();
          }
      });
  }

    initParam(){
        this.twoEChartsE = new TwoEChartsE();
        this.circlePieChart = new CirclePieChart();
        this.eatTop = new EatTopSource();
        this.amountSales3D = new AmountSales3D();
        this.sexPro = new SexPro();
    }

    initData(){
      this.getSalesBizTypeProData();
      this.getPayTypeProData();
      this.getUnitPriceAndBagRateData();
      this.getListData();
      this.getEatTop5Data();
      this.setAmountSales3DData();
      this.setSexProData();
      this.setAgeProData();
      this.setBrandCloudData();
    }


   // 获取数据

    // 获取销售方式占比数据
    getSalesBizTypeProData(){
      this.circlePieChart.SalesBizTypeProData =  [
          {value: 335, name: '零售' , itemStyle: {color: '#2295DB'}},
          {value: 310, name: '免税' , itemStyle: {color: '#5ABAFF'}},
          {value: 410, name: '餐饮' , itemStyle: {color: '#F79000'}},
      ];
      this.setSalesBizTypeProChart();
    }

   // 获取支付方式占比的数据
    getPayTypeProData(){
        this.circlePieChart.PayTypeProData =  [
            {value: 335, name: '支付宝' , itemStyle: {color: '#5abaff'}},
            {value: 310, name: '微信' , itemStyle: {color: '#5eca82'}},
            {value: 310, name: 'MIS' , itemStyle: {color: '#d92f56'}},
            {value: 310, name: '其他' , itemStyle: {color: '#2295db'}},
        ];
        this.setPayTypeProChart();
    }

    // 获取客单价与提袋率的数据（零售与免税）
    getUnitPriceAndBagRateData(){
        this.circlePieChart.CustomerUnitPriceData = [
            {value: 335, name: '数值' , itemStyle: {color: '#2cdaff'}},
            {value: 310, name: '其他' , itemStyle: {color: '#2C566D'}},
        ];  // 免税
        this.circlePieChart.BagRateData = [
            {value: 335, name: '数值' , itemStyle: {color: '#2cdaff'}},
            {value: 310, name: '其他' , itemStyle: {color: '#2C566D'}},
        ];  // 零售
        this.setUnitPriceChart();
        this.setBagRateChart();
    }


    // 获取品牌Top5的数据
    getListData() {
        this.listData = [
            {storeName: '111' , amountNum: 123456789, price: 2222},
            {storeName: '222' , amountNum: 123456789, price: 111},
            {storeName: '333' , amountNum: 123456789, price: 123},
            {storeName: '444' , amountNum: 123456789, price: 4567},
            {storeName: '555' , amountNum: 123456789, price: 123},
        ];

    }

    // 获取必吃排行榜数据
    getEatTop5Data(){
      if (this.eatTop.dataList_one.length === 0 || this.eatTop.dataList_one === undefined) {
          this.eatTop.dataList_one = [
              {imgSrc: 'assets/images/backgrounds/biz1.png' , imgDesc: '1', id_b: '1' , bizName: '肯德基'},
              {imgSrc: 'assets/images/backgrounds/biz2.png' , imgDesc: '2', id_b: '2', bizName: '汉堡王'},
              {imgSrc: 'assets/images/backgrounds/biz3.png' , imgDesc: '3', id_b: '3', bizName: '巴黎梦甜'},
              {imgSrc: 'assets/images/backgrounds/biz4.png' , imgDesc: '4', id_b: '4', bizName: '麦当劳'},
              {imgSrc: 'assets/images/backgrounds/biz5.png' , imgDesc: '5', id_b: '5', bizName: '必胜客'},
          ];
      }
      if (this.eatTop.dataList_two.length === 0 || this.eatTop.dataList_two === undefined) {
          this.eatTop.dataList_two = [
              {imgSrc: 'assets/images/backgrounds/biz1.png' , imgDesc: '1', id_b: '1' , bizName: '肯德基'},
              {imgSrc: 'assets/images/backgrounds/biz2.png' , imgDesc: '2', id_b: '2', bizName: '汉堡王'},
              {imgSrc: 'assets/images/backgrounds/biz3.png' , imgDesc: '3', id_b: '3', bizName: '巴黎梦甜'},
              {imgSrc: 'assets/images/backgrounds/biz4.png' , imgDesc: '4', id_b: '4', bizName: '麦当劳'},
              {imgSrc: 'assets/images/backgrounds/biz5.png' , imgDesc: '5', id_b: '5', bizName: '必胜客'},
          ];
      }
        const one_list1 = JSON.stringify(this.eatTop.dataList_one);
        const one_list2 = JSON.stringify(this.eatTop.dataList_two);
        if ( this.eatTop.theOneF) {
            // 第一次请求 直接赋值
            this.eatTop.theOneF = false;
            this.eatTop.bizTop5Array = JSON.parse(one_list1);
            this.eatTop.bizTop5ArrayBf = JSON.parse(one_list2);
            this.eatTop.thisDate = new Date().getTime() + 4680;
        }

        this.eatTop.IntervalID.forEach( res_id => {
            // 删除之前的定时器，下面会创建新的， 不然会有时间的影响
            clearInterval(res_id.value);
        });

        const IntervalID =  setInterval( () => {
            this.setEatTop5Interval();
        } , 220);
        this.eatTop.IntervalID.push({value: IntervalID});

    }
    // 必吃排行榜处理函数
    setEatTop5Interval(){
        if (this.eatTop.one_yes){
            const otherTime = new Date().getTime();
            if (otherTime - this.eatTop.thisDate >= 400){
                const one_list_ = JSON.stringify(this.eatTop.dataList_one);
                const one_list_Json = JSON.parse(one_list_);
                this.eatTop.bizTop5Array[this.eatTop.one_i] =  one_list_Json[this.eatTop.one_i]; // 这里是利用 angular的数据绑定，只更新那一条要翻转的数据  。这里可以应该可以换成用js操作dom
                this.eatTop.one_i = this.eatTop.one_i + 1;
                if (this.eatTop.one_i === 5) {
                    this.eatTop.one_yes = false;
                    this.eatTop.two_yes = true;
                    this.eatTop.one_i = 0;
                    this.eatTop.thisDate = new Date().getTime() + 480;
                }
            }

        } else {
            if (this.eatTop.two_yes) {
                const otherTime = new Date().getTime();
                // console.log(otherTime - this.bizTopSource.thisDate , '-----2我的定时器时间差');
                if (otherTime - this.eatTop.thisDate >= 200){
                    const two_list_ = JSON.stringify(this.eatTop.dataList_two);
                    const  two_list_Json = JSON.parse(two_list_);
                    this.eatTop.bizTop5ArrayBf[this.eatTop.two_i] = two_list_Json[this.eatTop.two_i]; // 更新其中一条数据
                    this.eatTop.two_i = this.eatTop.two_i + 1;
                    this.eatTop.thisDate = new Date().getTime() + 200;
                    if (this.eatTop.two_i === 5) {
                        this.eatTop.one_yes = true;
                        this.eatTop.two_yes = false;
                        this.eatTop.two_i = 0;
                        this.eatTop.thisDate = new Date().getTime() + 4680; // 每次5条数据翻完后需要停几秒
                        this.getEatTop5Data();
                    }
                }


            }

        }
    }

    // 获取中间部分3D图上的显示数据
    setAmountSales3DData(){
        this.amountSales3D.amt = 21122;
        this.amountSales3D.passengerNum = 343;
        this.amountSales3D.passengerTrade = 372;
        this.amountSales3D.passengerSum = 392;
        this.toGetNumberSum(); // 旅客总量
        this.toGetNumberTrade(); // 会员交易额
        this.toGetNumberNum(); // 常旅客会员
        this.toGetNumberAmt();  // 销售额
   }

    // 销售额 处理滚动数字
    toGetNumberAmt() {
        const number1 = document.getElementById('Number4_1');
        const number2 = document.getElementById('Number4_2');
        const number3 = document.getElementById('Number4_3');
        const number4 = document.getElementById('Number4_4');
        const number5 = document.getElementById('Number4_5');
        const number6 = document.getElementById('Number4_6');
        const amt = ( this.amountSales3D.amt + '' );
        const amt_5 = this.fillZero(amt, 5);
        const reg = amt_5.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
        const  value =  amt_5.replace(reg, '$1,');
        const number = (value + '').split('');
        this.amountSales3D.amt_1 = number[0];
        this.amountSales3D.amt_2 = number[1];
        this.amountSales3D.amt_3 = number[2];
        this.amountSales3D.amt_4 = number[3];
        this.amountSales3D.amt_5 = number[4];
        this.amountSales3D.amt_6 = number[5];

         if (this.amountSales3D.amt_1 === '0') {
             number1.style.opacity = '0';
         } else {
             number1.style.opacity = '1';
             number1.style.transform = `translate(0%, -${ this.amountSales3D.amt_1 * 10}%)`;
         }
        if (this.amountSales3D.amt_2 === '0') {
            number2.style.opacity = '0';
        } else {
            number2.style.opacity = '1';
            number2.style.transform = `translate(0%, -${this.amountSales3D.amt_2 * 10}%)`;
        }
        if (this.amountSales3D.amt_1 === '0' && this.amountSales3D.amt_2 === '0'){
            number3.style.opacity = '0';
        } else {
            number3.style.opacity = '1';
        }
        if (this.amountSales3D.amt_4 === '0') {
            number4.style.opacity = '0';
        } else {
            number4.style.opacity = '1';
            number4.style.transform = `translate(0%, -${this.amountSales3D.amt_4 * 10}%)`;
        }
        if (this.amountSales3D.amt_5 === '0') {
            number5.style.opacity = '0';
        } else {
            number5.style.opacity = '1';
            number5.style.transform = `translate(0%, -${this.amountSales3D.amt_5 * 10}%)`;
        }
        if (this.amountSales3D.amt_6 === '0') {
            number6.style.opacity = '0';
        } else {
            number6.style.opacity = '1';
            number6.style.transform = `translate(0%, -${this.amountSales3D.amt_6 * 10}%)`;
        }
    }

     // 常旅客会员  处理滚动数字
    toGetNumberNum() {
        const number1 = document.getElementById('Number3_1');
        const number2 = document.getElementById('Number3_2');
        const number3 = document.getElementById('Number3_3');
        const number = ( this.amountSales3D.passengerNum + '' ).split('');
        this.amountSales3D.passengerNum_1 = number[0];
        this.amountSales3D.passengerNum_2 = number[1];
        this.amountSales3D.passengerNum_3 = number[2];
        number1.style.transform = `translate(0%, -${ this.amountSales3D.passengerNum_1 * 10}%)`;
        number2.style.transform = `translate(0%, -${this.amountSales3D.passengerNum_2 * 10}%)`;
        number3.style.transform = `translate(0%, -${this.amountSales3D.passengerNum_3 * 10}%)`;
    }

    // 会员交易额  处理滚动数字
    toGetNumberTrade() {
        const number1 = document.getElementById('Number2_1');
        const number2 = document.getElementById('Number2_2');
        const number3 = document.getElementById('Number2_3');
        const number = ( this.amountSales3D.passengerSum + '' ).split('');
        this.amountSales3D.passengerTrade_1 = number[0];
        this.amountSales3D.passengerTrade_2 = number[1];
        this.amountSales3D.passengerTrade_3 = number[2];
        number1.style.transform = `translate(0%, -${ this.amountSales3D.passengerTrade_1 * 10}%)`;
        number2.style.transform = `translate(0%, -${this.amountSales3D.passengerTrade_2 * 10}%)`;
        number3.style.transform = `translate(0%, -${this.amountSales3D.passengerTrade_3 * 10}%)`;
    }

   // 旅客总量 处理滚动数字
    toGetNumberSum() {
        const number1 = document.getElementById('Number8_1');
        const number2 = document.getElementById('Number8_2');
        const number3 = document.getElementById('Number8_3');
        const number = ( this.amountSales3D.passengerSum + '' ).split('');
        this.amountSales3D.passengerSum_1 = number[0];
        this.amountSales3D.passengerSum_2 = number[1];
        this.amountSales3D.passengerSum_3 = number[2];
        number1.style.transform = `translate(0%, -${ this.amountSales3D.passengerSum_1 * 10}%)`;
        number2.style.transform = `translate(0%, -${this.amountSales3D.passengerSum_2 * 10}%)`;
        number3.style.transform = `translate(0%, -${this.amountSales3D.passengerSum_3 * 10}%)`;
    }


    // 性别占比的数据
    setSexProData(){
          this.sexPro.maleNum = 123456;
          this.sexPro.malePro = 33;
          this.sexPro.femaleNum = 234321;
          this.sexPro.femalePro = 54 ;
    }

    // 年龄占比数据
    setAgeProData(){
       this.circlePieChart.ageProData = [
           {value: '567', name: '0-18岁', itemStyle:  {color: '#ff505c', opacity: 0.85}},
           {value: '467', name: '19-28岁', itemStyle: {color: '#ff505c', opacity: 0.7}},
           {value: '367', name: '29-35岁', itemStyle: {color: '#ff505c', opacity: 0.6}},
           {value: '267', name: '35-48岁', itemStyle: {color: '#ff505c', opacity: 0.6}},
           {value: '167', name: '49-58岁', itemStyle: {color: '#ff505c', opacity: 0.4}},
       ];
       this.setAgeProChart();
    }

    // 文字云数据
    setBrandCloudData(){
        this.circlePieChart.brandCloudData = ['日上' , '全家' , '中免' , '好邻居' , '全聚德' , '111' , '哈哈哈哈哈哈哈哈哈'  , 'rtdfasdf' ];
        this.setTextCloud(this.circlePieChart.brandCloudData, this.brandCloud.nativeElement, [432, 186]);
    }


   // 图表

    // 销售额方式占比
    setSalesBizTypeProChart(){

        this.zone.runOutsideAngular(() => {
            this.twoEChartsE.SalesBizTypePro = this.eCharts.init(this.SalesBizTypePro.nativeElement);
        });
        const option = {
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c} ({d}%)'
            },
            grid: {
              width: '100%',
              height: '100%',
            },
            series: [
                {
                    name: '销售额方式占比',
                    type: 'pie',
                    center: ['60%' , '55%'],
                    radius: ['55%', '75%'],
                    avoidLabelOverlap: false,
                    label: {
                        normal: {
                            formatter: '{b}: \n{c} ({d}%)',
                            show: true,
                            position: 'inside',
                            color: '#ffffff',
                            fontSize: 12,
                        },

                    },
                    labelLine: {
                        normal: {
                            show: true
                        }
                    },
                    data: this.circlePieChart.SalesBizTypeProData
                }
            ]
        };
        this.zone.runOutsideAngular(() => {
            this.twoEChartsE.SalesBizTypePro.setOption(option);
        });
    }

    // 支付方式占比
    setPayTypeProChart(){
        this.zone.runOutsideAngular(() => {
            this.twoEChartsE.PayTypePro = this.eCharts.init(this.PayTypePro.nativeElement);
        });
        const option = {
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c} ({d}%)'
            },
            series: [
                {
                    name: '支付方式占比',
                    type: 'pie',
                    center: ['60%' , '55%'],
                    radius: ['55%', '75%'],
                    avoidLabelOverlap: false,
                    label: {
                        normal: {
                            formatter: '{b}: \n{c} ({d}%)',
                            show: true,
                            position: 'inside',
                            color: '#ffffff',
                            fontSize: 12,
                        },

                    },
                    labelLine: {
                        normal: {
                            show: true
                        }
                    },
                    data: this.circlePieChart.PayTypeProData
                }
            ]
        };
        this.zone.runOutsideAngular(() => {
            this.twoEChartsE.PayTypePro.setOption(option);
        });
    }

    // 客单价 免税
    setUnitPriceChart(){
        this.zone.runOutsideAngular(() => {
            this.twoEChartsE.CustomerUnitPrice = this.eCharts.init(this.CustomerUnitPrice.nativeElement);
        });
       const  option = {
            series: [
                {
                    name: '免税',
                    type: 'pie',
                    radius: '85%',
                    center: ['60%' , '55%'],
                    data: this.circlePieChart.CustomerUnitPriceData,
                    label: {
                        position: 'center',
                        padding: [53, 4, 5, 6],
                        formatter: function(p){
                            if (p.name === '其他') {
                                return '';
                            } else {
                                return p.value + '\n' + p.percent + '%';
                            }
                        },
                        color: '#ffffff'
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
        this.zone.runOutsideAngular(() => {
            this.twoEChartsE.CustomerUnitPrice.setOption(option);
        });
    }

    // 提袋率  零售
    setBagRateChart(){
        this.zone.runOutsideAngular(() => {
            this.twoEChartsE.BagRate = this.eCharts.init(this.BagRate.nativeElement);
        });
        const  option = {
            series: [
                {
                    name: '零售',
                    type: 'pie',
                    radius: '85%',
                    center: ['60%' , '55%'],
                    data: this.circlePieChart.BagRateData,
                    label: {
                        position: 'center',
                        padding: [53, 4, 5, 6],
                        formatter: function(p){
                            if (p.name === '其他') {
                                return '';
                            } else {
                                return p.value + '\n' + p.percent + '%';
                            }
                        },
                        color: '#ffffff'
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
        this.zone.runOutsideAngular(() => {
            this.twoEChartsE.BagRate.setOption(option);
        });
    }

    // 年龄占比
    setAgeProChart() {

        this.zone.runOutsideAngular(() => {
            this.twoEChartsE.ageProChart = this.eCharts.init(this.ageProChart.nativeElement);
        });

        const roseChartOption = {
            calculable: true,
            series: [
                {
                    name: this.translate.instant('BusinessDataAnalysis.MembershipAge'),
                    type: 'pie',
                    radius: ['40%', '90%'],
                    center: ['45%', '55%'],
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
                    data: this.circlePieChart.ageProData
                }
            ]
        };
        this.zone.runOutsideAngular(() => {
            this.twoEChartsE.ageProChart.setOption(roseChartOption);
        });
    }

    //  文字云的内容 container dom节点  size 长和宽
    setTextCloud(texts: string[], container: string, size: number[]) {
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
                    const textSize = 42 - index * 5;
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

    // 工具类
    // 补0
    fillZero(number, digits){
        number = number + '';
        const length = number.length;
        if ( number.length < digits){
            for (let i = 0 ; i < digits - length ; i ++){
                number = '0' + number;
            }
        }
        return number;
    }

    ngOnDestroy() {
        if (this.twoEChartsE.SalesBizTypePro) {
            this.twoEChartsE.SalesBizTypePro.dispose();
        }
        if (this.twoEChartsE.PayTypePro) {
            this.twoEChartsE.PayTypePro.dispose();
        }
        if (this.twoEChartsE.BagRate) {
            this.twoEChartsE.BagRate.dispose();
        }
        if (this.twoEChartsE.CustomerUnitPrice) {
            this.twoEChartsE.CustomerUnitPrice.dispose();
        }
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}


export class TwoEChartsE {
    SalesBizTypePro: any;
    PayTypePro: any;
    BagRate: any;
    CustomerUnitPrice: any;
    ageProChart: any;
    brandCloud: any;
}


export class CirclePieChart {
    SalesBizTypeProData: any ; // 销售额方式占比
    PayTypeProData: any;  // 支付方式占比
    BagRateData: any;  // 提袋率  零售
    CustomerUnitPriceData: any; // 客单价 免税
    ageProData: any; // 年龄占比数据
    brandCloudData: any; // 文字云数据 品牌偏好
}


// 业态Top5 必吃排行榜
export  class EatTopSource {
    page  = 0;
    size = 5;
    total = 0;
    dataList_one = [];
    dataList_two = [];
    one_i = 0;
    one_yes = true;
    two_i = 0;
    two_yes = false;
    theOneF = true;
    thisDate: any;
    IntervalID:  Array<{ value: any }> = [];
    bizTop5Array: any;
    bizTop5ArrayBf: any;
}

 // 中间部分  3D图所显示的数字部分  数据分割变量
export  class AmountSales3D {

    // 销售额
    amt: any;
    amt_1: any;
    amt_2: any;
    amt_3: any;
    amt_4: any;
    amt_5: any;
    amt_6: any;

    // 常旅客会员
    passengerNum: any;
    passengerNum_1: any;
    passengerNum_2: any;
    passengerNum_3: any;

    // 会员交易额
    passengerTrade: any;
    passengerTrade_1: any;
    passengerTrade_2: any;
    passengerTrade_3: any;

    // 旅客总量
    passengerSum: any;
    passengerSum_1: any;
    passengerSum_2: any;
    passengerSum_3: any;
}


export class SexPro {
    malePro: number; // 男 占 比
    maleNum: number; // 男 人数
    femalePro: number;  // 女 占比
    femaleNum: number; // 女 人数
}
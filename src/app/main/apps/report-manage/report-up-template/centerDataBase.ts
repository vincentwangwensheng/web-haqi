import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {takeUntil} from 'rxjs/operators';
import {MatSnackBar} from '@angular/material';
import {Subject} from 'rxjs';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {HttpCommonServiceService} from '../../../../services/httpCommonService.service';
import {ReportIn} from '../report-down-manage/AllReportSource/base/interImpl/reportIn';

export class CenterDataBase {
    private _unsubscribeAll: Subject<any> = new Subject();

    title = '';
    rows = [];
    columns = [];
    page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};
    customButtons = []; // 自定义按钮组
    filter: any  = [{name: 'enabled', value: true}];
    detailUrl: any;
    theType = ''; //  如果当前详情页有多个用到查询列表的接口。但是我们接口抽象类又未定义，这个时候可以定义一个类型，告诉它我们调用的是哪个接口
    hasSub = false ; // 是否需要订阅列表完成状态。
    needHandleData = false ; // 是否需要在接受到数据后再对数据进行处理
    searchFinish: any; // 查询完成，一个Subject对象
    searchPermissions = '';
    currentDara = [];
    itemIds = [];
    constructor(
        private snackBar: MatSnackBar,
        private translate: TranslateService,
        private router: Router,
        private loading: FuseProgressBarService,
        private notify: NotifyAsynService ,
        private dateTransform: NewDateTransformPipe ,
        private service: ReportIn,
    ){
        this.getItemIds();
    }


    initSearch() {
        this.searchFinishE();
        this.loading.show();
        this.service.getDataListOther(this.page.page, this.page.size, this.page.sort , null, this.filter , this.theType , this.itemIds).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                this.rows = res.body;
                if (this.hasSub) {
                    this.searchFinish.next(2);
                }
                this.HandleOtherData();
                this.page.count = res.headers.get('x-total-count');
                if (this.rows.length === 0) {
                    this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
                }
                this.notify.onResponse.emit();
                this.loading.hide();
            }
        });
    }

    onSearch() {
        this.searchFinishE();
        this.loading.show();
        const multiSearch = [];
        this.columns.forEach(column => {
            if (column.value !== '') {
                multiSearch.push({name: column.name, value: column.value, type: column.type});
            }
        });
        this.page.page = 0 ;
        this.service.getDataListOther(this.page.page, this.page.size, this.page.sort, multiSearch, this.filter , this.theType).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                this.rows = [];
                this.rows = res.body;
                if (this.hasSub) {
                    this.searchFinish.next(2);
                }
                this.HandleOtherData();
                this.page.count = res.headers.get('x-total-count');
                if (this.rows.length === 0) {
                    this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
                }
                this.notify.onResponse.emit();
                this.loading.hide();
            }
        });

    }

    onPage(event) {
        this.page.page = event.page;
        this.onSearch();
    }

    onSort(event) {
        this.page.sort = event;
        this.onSearch();
    }

    searchFinishE(){
        if (this.hasSub){
            this.searchFinish = new Subject();
        }
    }

    getDetail(e){
        this.router.navigate([this.detailUrl + e.id]);
    }


    getDateTransform(){
        return this.dateTransform;
    }

    HandleOtherData(){
        if (this.needHandleData) {
            // 写处理逻辑
        }
    }


    getService(){
        return this.service;
    }

    Destory(){
        if (this.searchFinish && !this.searchFinish.isStopped) {
            this.searchFinish.next();
            this.searchFinish.complete(); // 状态改完成
            this.searchFinish.unsubscribe();  // 取消订阅
        }
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._unsubscribeAll.unsubscribe();
    }

    getItemIds(){
        this.service.getUserAuth(sessionStorage.getItem('username')).subscribe( res => {
            this.itemIds = res.items;
        });
    }




}

// 例子
// 1. html部分，与调用列表组件的部分是一样的，按照列表组件写法就行。
// <ng-template #choiceSite>
// <app-table-list [title]="'站点列表'" [rows]="siteTagList.rows" (search)="siteTagList.onSearch()"
//     [columns]="siteTagList.columns" [page]="siteTagList.page" (navigateDetail)="siteTagList.getDetail($event)"    [customButtons]="siteTagList.customButtons"
// (tablePaging)="siteTagList.onPage($event)" (tableSort)="siteTagList.onSort($event)" (searchClear)="siteTagList.onSearch()"
//     [initOpacity]="true"
//     [checkbox]="true" [hasDetail]="false"
//     [selectedRows]="siteSelect" [overPanel]="true" (dataSelect)="siteListSelect($event)"   [selectedField]="'id'"
//     >
//     </app-table-list>
//     </ng-template>

// 2 . 声明一个继承中间类。columns需要自定义，
// export class  SiteTagList  extends CenterDataBase {
//     carType = [];
//     itemList = [];
//
//     columns = [
//         {name: 'siteId', translate: '站点ID', value: ''},
//         {name: 'siteName', translate: '站点名称', value: '' , type: 'input'},
//         // {name: 'province', translate: '省', value: ''  ,  type: 'select' , options: this.provinceData},
//         // {name: 'city', translate: '市', value: ''  ,  type: 'select' , options: this.cityData},
//         {name: 'address', translate: '地址', value: ''},
//         {name: 'itemId', translate: '所属项目', value: ''},
//         // {name: 'contact', translate: '联系人', value: ''},
//         {name: 'telephone', translate: '电话', value: ''},
//         {name: 'carType', translate: '车辆类型', value: ''},
//         {name: 'batteryCount', translate: '电池仓位数', value: ''},
//         {name: 'chargeCount', translate: '充电通道数', value: ''},
//         {name: 'openClose', translate: '营业时间', value: ''}, // 将营业开始时间与营业结束时间结合起来
//         {name: 'online', translate: '上线日期', value: ''},
//         {name: 'signIn', translate: '注册日期', value: ''},
//         {name: 'operatingStatus', translate: '营业状态', value: ''},
//         {name: 'status', translate: '状态', value: '' ,  type: 'select',
//             options: [
//                 {translate: '已上线', value: true},
//                 {translate: '未上线', value: true}
//             ]},
//         {name: 'createBy', translate: '创建人', value: ''},
//         {name: 'createDate', translate: '创建时间', value: ''},
//     ];
//
// // 这个函数是其他处理函数，如果有列表的字段需要根据ID处理转换的。需要在这里重写这个方法
//     HandleOtherData(){
//         if (this.needHandleData) {
//             // 写处理逻辑
//             const map = new Map([
//                 ['true' ,  '已上线'],
//                 ['false' ,  '未上线'],
//                 ['ON' ,  '营业中'],
//                 ['OFF' ,  '歇业中'],
//             ]);
//             this.rows.forEach(
//                 c => {
//                     c['openClose'] = c['openTime'] + '-' + (c['closeTime'] ? c['closeTime'] : '') ;
//                     c['status'] = map.get(c['status'].toString());
//                     c['operatingStatus'] = map.get(c['operatingStatus']);
//                     c['online'] = this.getDateTransform().transform(c['online']);
//                     c['signIn'] = this.getDateTransform().transform(c['signIn']);
//                     let CarJson = c['carTypeId'] ? c['carTypeId'] : '';
//                     if (CarJson === '') {
//                         CarJson = [];
//                     }
//
//                     const carName = [];
//                     let carType = '';
//                     this.carType.forEach( car => {
//                         if (CarJson.includes(car.id)) {
//                             carName.push(car.typeName);
//                         }
//                     });
//                     for (let u = 0 ; u < carName.length ; u++) {
//                         carType = carType  + carName[u] + ((u === ( carName.length - 1) ) ? '' : ',');
//                     }
//                     c['carType'] = carType;
//                     const item = this.itemList.filter( i => i.itemId === c.itemId || i.id === c.itemId);
//                     c.itemId = item[0] ? item[0].itemName : '';
//                 }
//             );
//
//         }
//     }
//
//
//
////  }
// 3 . 在ngOnInit的的时候 需要实例化关于列表类。
//   this.siteTagList = new SiteTagList(this.snackBar, this.translate, this.router, this.loading, this.notify, this.dateTransform , this.priceService);
//         this.siteTagList.theType = 'site'; // 当前定义查询的是站点的接口 , 这个一般看自己怎么定义
//  this.siteTagList.needHandleData = true ; // 需要单独再次处理数据。 为true的情况下需要重写 HandleOtherData()方法

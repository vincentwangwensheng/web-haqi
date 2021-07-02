import {Subject} from 'rxjs';
import {Router} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {HttpCommonServiceService} from '../../services/httpCommonService.service';

/** 拉到下面有使用步骤说明 **/
export class DetailTableDataBase {
    private _unsubscribeAll: Subject<any> = new Subject();
    dataColumns = []; // 表头字段
    dataRecords: any[] = []; // 数据集
    dataHeaders: any; // 表头字段对应的中文释义
    detailUrl = ''; // 详情路径【路由，和列表页跳转路由的地址一样写法】
    page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'}; // 分页
    multiSearch = [];
    ownTurnSource = [];
    filter = [];
    hasEnableFilter = true ;
    defaulQuery = [];
    type = '';
    exportUrlType = '';
    exportReportName = '';
    dateTimeConfig = 'time';
    otherOp = false ;
    initOpacity = false; // 很重要。拿到值后需要把表格的透明度给显示出来不然看不到表格
    searchFinish: any;
    hasSub = false;
    scrollbarH = false ; // 表格是否有水平滚动条, 默认是没有。主要是因为一个页面如果有俩列表，那种事件类型不太合适
    onceSearch = false ; // 第一次访问就需要带参数访问
    itemIds = [];
    constructor(
        private router: Router,
        private service: HttpCommonServiceService,
    ){
    }


    // 根据接口返回的数据分页方法
    getDataList(type? , otherFilter? , hasEnable? ){
        this.searchFinishE();
        this.initOpacity = false;
        this.filter = [];
        if (this.hasEnableFilter) {
            this.filter = [{name: 'enabled', value: true}];
        }
        if (otherFilter) {
            otherFilter.forEach( f => {
                this.filter.push(f);
            });
        }
        if (type) {
            this.type = type;
        }
        this.service.getDataListOther(this.page.page, this.page.size, this.page.sort, this.multiSearch, this.filter , this.type , this.itemIds).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                console.log('res--' , res );
                this.dataRecords = res.body;
                this.page.count = Number(res.headers.get('x-total-count'));
                this.otherDataHandle();
                this.initOpacity = true;
                if (this.searchFinish && !this.searchFinish.isStopped && this.hasSub)  {
                    this.searchFinish.next(true); // 查询完成通知观察者
                }
            }, error => {
                if (this.searchFinish && !this.searchFinish.isStopped && this.hasSub)  {
                    this.searchFinish.next(true); // 查询完成通知观察者
                }
                this.initOpacity = true;
            }, () => {
                if (this.searchFinish && !this.searchFinish.isStopped && this.hasSub)  {
                    this.searchFinish.next(true); // 查询完成通知观察者
                }
                this.initOpacity = true;
            });
    }

    otherDataHandle(){

    }


    onPage(e , type? , otherFilter?){
        this.page.page = e.offset;
        this.dataRecords = [];
        this.initOpacity = false;
        this.getDataList(type , otherFilter);
    }

    toPageOne(){
        this.page.page = 0;
        this.page.size = 10;
        this.page.count = 0;
        this.dataRecords = [];
    }

    // 拿到所有的数据，过滤后自己分页，不根据接口分页
    getAllData(filter? , type?){
        this.searchFinishE();
        this.initOpacity = false;
        this.service.getDataListOther(0, 0x3f3f3f3f, this.page.sort, null, filter , type).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                this.ownTurnSource = res.body;
                this.page.count = res.headers.get('x-total-count');
                this.otherDataHandle();
                this.initOpacity = true;
                if (this.searchFinish && !this.searchFinish.isStopped && this.hasSub)  {
                    this.searchFinish.next(true); // 查询完成通知观察者
                }
            }, error => {
                this.initOpacity = true;
            }, () => {
                this.initOpacity = true;
            });
    }


    // 自己的翻页
    ownTurn(){
        this.dataRecords =  [];
        const start = this.page.page * this.page.size;
        let end = this.page.page * this.page.size + this.page.size;
        if (end >= this.ownTurnSource.length) {
            end = this.ownTurnSource.length;
        }
        for (let i = start ; i < end ; i++ ) {
            this.dataRecords.push(this.ownTurnSource[i]);
        }
        this.initOpacity = true;
    }

    ownOnPage(e){
        this.page.page = e.offset;
        this.dataRecords = [];
        this.initOpacity = false;
        this.ownTurn();
    }


    ownToPageOne(){
        this.page.page = 0;
        this.page.size = 10;
        this.page.count = 0;
        this.dataRecords = [];
        this.ownTurnSource = [];
    }

    goToDetail(row){
        this.router.navigate([this.detailUrl + row.id]);
    }

    searchFinishE(){
        if (this.hasSub){
            this.searchFinish = new Subject();
        }
    }

    handleDate(time){
     return  new Date(time).toISOString();
    }

    getParentService(){
        return this.service;
    }

    onDestory(){
        if (this.searchFinish && !this.searchFinish.isStopped) {
            this.searchFinish.next();
            this.searchFinish.complete(); // 状态改完成
            this.searchFinish.unsubscribe();  // 取消订阅
        }
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._unsubscribeAll.unsubscribe();
    }
}

// 使用步骤
// 1. 新建一个子类继承这个类
//  detailUrl是跳转详情的 链接地址，如果有详情就写，没有详情则不写
//  dataColumns 是表头，【如果需要特定颜色显示与特定的翻译对应文字 ，可再加一个 style属性，使用如同下方 ，不加style则按接口返回的显示数据,如果不用变色，可以不写color】。添加一个
//  dataHeaders 需要按照下方map的方式去写，表头字段与其中文释义一一对应。
//  【！！！特别注意。如果需要显示详情这一列，需要自己在表头添加{name: 'operation'}, 然后 dataHeaders 添加相应的key-value值】
// export class ProjectCashList extends  DetailTableDataBase{
//     detailUrl = 'apps/siteList/edit/';
//     dataColumns = [{name: 'siteName'} , {name: 'itemName'} , {name: 'operatingStatus' , style: [{text: 'ON' , color: '#87E86E' , textCh: '营业中'} , {text: 'OFF' , color: 'red' , textCh: '已关店'} ]} , {name: 'status' , style: [{text: true , color: '#87E86E' , textCh: '已上线'} , {text: false , color: 'red' , textCh: '已下线'} ]} , {name: 'createdDate'} , {name: 'operation'} ];
//    page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};   // 可重新定义子类的分页与排序字段， 不定义则直接用父类的
// dataHeaders = new Map([
//         ['siteName', '站点名称'],
//         ['itemName', '项目名称'],
//         ['operatingStatus', '营业状态'],
//         ['status', '状态'],
//         ['createdDate', '创建时间'],
//         ['operation' , '操作']
//         // ['id', '用户ID'],
//         // ['itemName', '项目'],
//         // ['siteName', '站点名称'],
//         // ['cityName', '所在城市'],
//         // ['date', '日期'],
//         // ['serviceCarNum', '服务车次'],
//         // ['serviceUserNum', '服务用户'],
//         // ['entryAmount', '入账金额'],
//         // ['status' , '状态'],
//         // ['operation' , '操作']
//     ]);
//
//     otherDataHandle(){
//         // 子类可酌情重写该方法，如果查询的数据需要进行一些匹配操作，需要在此重写。也可以用订阅的方式完成处理
//     }
// }
//  2. 实例化这个子类
//  this.projectCash_list = new ProjectCashList(this.router ,  this.projectCashService );
//  3. 获取列表
//   this.projectCash_list.getDataList();
// 4. 翻页
//  onPage(e){
//          this.projectCash_list.hasSub = false;// 如果前面有设置这个值为true, 在翻页的时候需要设置为false避免创建太多Subject实例
//         this.projectCash_list.onPage(e);
//     }
// 5. 跳转详情
// goToDetail(e){
//         this.projectCash_list.goToDetail(e);
//     }
// 6. 清空查询
//   clearSearch1(){
//          this.projectCash_list.hasSub = false;// 如果前面有设置这个值为true, 在查询的时候需要设置为false避免创建太多Subject实例
//         this.projectCash_list.multiSearch = [];
//         this.projectCash_list.getDataList();
//     }
// 7. 查询 【查询这里的逻辑需要自己写，multiSearch里面的内容需与下面展示的一致，这个与TableList中定义的查询组件是一致的，建议观看utils中的getELMultiSearch方法即可明白】
//  search(){
//          this.projectCash_list.hasSub = false;// 如果前面有设置这个值为true, 在查询的时候需要设置为false避免创建太多Subject实例
//         this.projectCash_list.multiSearch = [{name: 'status', value: true, type: 'select'}];
//         this.projectCash_list.getDataList();
//     }
// 8. html  【projectCash_list 需要继承DetailTableDataBase父类】 ，不要忘记引入相关module 【 DetailTableListModule 】
// <app-detail-table-list class="w-100-p h-100-p" [DetailTableParam]="projectCash_list" (onPageEvent)="onPage($event)" (goToDetailEvent)="goToDetail($event)">
//  </app-detail-table-list>
// ==================================获取全部数据的写法=================================================
// 1,2 步骤相同
// 3. 获取全部列表数据
//  this.projectCash_list.getAllData(filter? , type?);
// 4. 翻页
//   onPage(e) {
//         this.projectCash_list.ownOnPage(e);
//     }
// 5.  详情
//  goToDetail(row){
//         this.projectCash_list.goToDetail(row);
//     }

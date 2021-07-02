import {AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {fuseAnimations} from '../../../../../@fuse/animations';
import {MatDialog, MatSnackBar} from '@angular/material';
import {ReportMainService} from './report-main.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {TranslateService} from '@ngx-translate/core';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {ReportChartIn} from './AllReportSource/base/baseClass/report-chart-In';
import {FileDownloadService} from '../../../../directives/file-download/file-download.service';
import {DetailTableDataBase} from '../../../../components/detail-table-list/detail-table-dataBase';
import {BirthdayMonthReport} from './AllReportSource/birthday-month-report';
import {ConsumerDetailsReport} from './AllReportSource/consumer-details-report';
import {IntegralAnomalyReport} from './AllReportSource/Integral-anomaly-report';
import {NumberCardsReport} from './AllReportSource/number-cards-report';
import { PointsSupplementReport} from './AllReportSource/points-supplement-report';

@Component({
    selector: 'app-project-cash-manage',
    templateUrl: './report-main-manage.component.html',
    styleUrls: ['./report-main-manage.component.scss'] ,
    animations: fuseAnimations
})
/** 所有的报表页 除了换电明细**/
export class ReportMainManageComponent implements OnInit , OnDestroy , AfterViewInit{
    @ViewChild('loadTg', {static: true}) loadTg: TemplateRef<any> ;
    private _unsubscribeAll: Subject<any> = new Subject();

    // 项目权限数组
    itemIds = [];
    // 标题与页面参数
    chartParameter = '';
    reportFormTitles: any;
    reportValue = '';

    // 左边的查询项表单
    formGroup: any;

    // 右边的列表项
    right_table_list: DetailTableDataBase;

    search_parameter = [];

    // 右边列表出现与否
    hasReportList = false;
    searchReportLoading = false ;
    allListSearch = true;

    // 左边菜单html页
    formKeys = [];

    // 各报表通用方法的抽象类
    reportChart: ReportChartIn;
    map_source: any;
    th_all_div_h: any;

    search_Sub: any; // 当需要查询查询额外的接口去拼接查询条件时，创建一个观察对象，等数据拼接完成后再进行列表查询
    hasSub = false;


    loadingShowData: 'loading...';


//    showLeft = false;
//     @ViewChild('t_list', {static: false}) #t_list
//     t_list: any;
    constructor(
        private snackBar: MatSnackBar,
        private translate: TranslateService,
        private notify: NotifyAsynService ,
        private dateTransform: NewDateTransformPipe,
        private router: Router,
        private loading: FuseProgressBarService,
        private activateRoute: ActivatedRoute,
        private dialog: MatDialog,
        private projectCashService: ReportMainService,
        private fileDownload: FileDownloadService,
    ) {
        // this.getUserAuth(sessionStorage.getItem('username'));
        this.getChartParameters().then( p => {
            this.getReportSource(p);
        });
    }

    ngOnInit() {
        this.titlesMap();
    }

    // 拿到对应的报表实例
    getReportSource(key){
        if (!this.map_source) {
            this.map_source = {
                // 生日月报表
                'birth' :  new BirthdayMonthReport(this.snackBar, this.translate, this.router, this.loading, this.notify, this.dateTransform , this.projectCashService),
                // 消费明细报表
                'consumer'  :  new ConsumerDetailsReport(this.snackBar, this.translate, this.router, this.loading, this.notify, this.dateTransform , this.projectCashService),
                // 积分异常报表
                'Integral'  :  new IntegralAnomalyReport(this.snackBar, this.translate, this.router, this.loading, this.notify, this.dateTransform , this.projectCashService),
                // 办卡数量报表
                'numberCards'  :  new NumberCardsReport(this.snackBar, this.translate, this.router, this.loading, this.notify, this.dateTransform , this.projectCashService),
                // 积分补录报表
                'pointsSupplement':  new PointsSupplementReport(this.snackBar, this.translate, this.router, this.loading, this.notify, this.dateTransform , this.projectCashService),
           };
            // this.onSearchData([]);
        }
        this.formKeys = [];
        this.formGroup = null;
        this.right_table_list = null;
        this.reportChart =  this.map_source[key];
        this.formGroup = this.reportChart.getFormGroup();
        this.formKeys = this.reportChart.getFormKeys();
        this.right_table_list = this.reportChart.getRightDataList();
        this.right_table_list.itemIds = this.itemIds;
        // console.log('this.formKeys----' , this.formKeys);
        // console.log('right_table_list.dateTimeConfig----' , this.right_table_list.dateTimeConfig);
        // let search_p = [];
        // if (this.right_table_list.onceSearch){
        //     search_p = this.right_table_list.filter;
        // }
        // this.onSearchData(search_p);
    }


    // 标题
    titlesMap(){
        // 标题
        // this.reportFormTitles = new Map([
        //     ['birth' , '生日月报表'] , // 生日月报表
        //     ['consumer' , '消费明细报表'],  // 消费明细报表
        //     ['Integral' , '积分异常报表'],  // 积分异常报表
        //     ['numberCards' , '办卡数量报表'],  // 办卡数量报表
        //     ['pointsSupplement' , '积分补录报表'],  // 积分补录报表
        // ]);
        this.reportFormTitles = [
            {key: 'birth' , value: '生日月报表'},
            {key: 'consumer' , value: '消费明细报表'},
            {key: 'pointsSupplement' , value: '积分补录报表'},
            {key: 'Integral' , value: '积分异常报表'},
            // {key: 'numberCards' , value: '办卡数量报表'}
        ];
        this.reportValue = 'birth';
    }


    reportChange(){
        this.getReportSource(this.reportValue);
    }

    /** 统一查询方法 **/
    onSearchData(search_param){
        this.hasReportList = false;
        this.searchReportLoading = true;
        this.right_table_list.hasSub = true;
        this.right_table_list.page.page = 0;
        if (this.right_table_list.defaulQuery.length > 0){
            this.right_table_list.defaulQuery.forEach( q => {
                search_param.push(q);
            });
        }
        const  search_p = this.getSearchParam(search_param);
        this.search_parameter = search_p ;
        if (this.hasSub) {
            this.search_Sub.subscribe( res => {
                if (res === 1){
                    this.searchList(search_p , search_param);
                    this.hasSub = false;
                    this.cancelSub();
                }
            });
        } else {
            this.searchList(search_p , search_param);
        }
    }

    // 设置查询参数
    getSearchParam(search_param){
            const type_s = this.right_table_list.type.split('_');
            const search_p = [];
            if (type_s[0]  !== 'es' ) {
                // 普通查询

                search_param.forEach( s_p => {

                    if (s_p.type && s_p.type === 'in') {
                        const value =   this.getBracketsParam(s_p.value);
                        search_p.push({name: s_p.name, value: value, reg: 'in'});
                        // const y = value.split(',');
                        // if (y.length > 1) {
                        //     const v = s_p.value.split(','); // '(' + s_p.value + ')' ;
                        //     s_p.value = v;
                        //     search_p.push({name: s_p.name, value: s_p.value , reg: 'in'});
                        // } else {
                        //     search_p.push({name: s_p.name, value: s_p.value});
                        // }
                    } else if (s_p.type === 'date'){
                        if (s_p.dataInType && s_p.dataInType === 'input'){
                            search_p.push({name: s_p.name, value: s_p.value , reg: s_p.dataInType });
                        } else {
                            search_p.push({name: s_p.name, value: s_p.value , reg: s_p.type });
                        }
                    } else {
                        if (s_p.type) {
                            search_p.push({name: s_p.name, value: s_p.value , reg: s_p.type });
                        } else {
                            search_p.push({name: s_p.name, value: s_p.value });
                        }

                        // const len = s_p.value.length;
                        // if (len > 0){
                        //  const value =   this.getBracketsParam(s_p.value);
                        //  if (s_p.type) {
                        //      search_p.push({name: s_p.name, value: value , reg: s_p.type });
                        //  } else {
                        //      search_p.push({name: s_p.name, value: value });
                        //  }
                        // }
                    }


                });
                console.log('search_p---' , search_p);
            } else {
                // es查询
                search_param.forEach( s_p => {
                    if (s_p.type && s_p.type === 'date') {
                        const date = s_p.value.split('TO');
                        let date1 =  !this.isNull(date[0]) ? this.right_table_list.handleDate(date[0]) : null;
                        let date2 =  !this.isNull(date[1]) ? this.right_table_list.handleDate(date[1]) : null;
                        if (s_p.dataInType && s_p.dataInType === 'number') {
                            date1 =  !this.isNull(date[0]) ? date[0] : null;
                            date2 =  !this.isNull(date[1]) ? date[1] : null;
                        } else if (s_p.dataInType && s_p.dataInType === 'dateStr'){
                            date1 =  !this.isNull(date[0]) ? date[0] : null;
                            date2 =  !this.isNull(date[1]) ? date[1] : null;
                        } else  {
                             date1 =  !this.isNull(date[0]) ? this.right_table_list.handleDate(date[0]) : null;
                             date2 =  !this.isNull(date[1]) ? this.right_table_list.handleDate(date[1]) : null;
                        }
                        if (!this.isNull(date[0]) && !this.isNull(date[1])){
                            if (s_p.dataInType && s_p.dataInType === 'number'){
                                const v =  '("' + date1 + '" TO "' + date2 + '")';
                                search_p.push({name: s_p.name, value: v });
                            } else if (s_p.dataInType && s_p.dataInType === 'dateStr'){
                                const v =  '(' + date1 + ' TO ' + date2 + ')';
                                search_p.push({name: s_p.name, value: v });
                            } else {
                                const v =  '[' + date1 + ' TO ' + date2 + ']';
                                search_p.push({name: s_p.name, value: v });
                            }

                        } else {
                            if (!this.isNull(date[0]) && this.isNull(date[1])) {
                                if (s_p.dataInType && s_p.dataInType === 'number'){
                                    date1 = '"' + date1 + '"';
                                } else if (s_p.dataInType && s_p.dataInType === 'dateStr'){
                                    date1 = '' + date1 + '';
                                }
                                search_p.push({name: s_p.name, value: date1 });
                            } else {
                                if (s_p.dataInType && s_p.dataInType === 'number'){
                                    date2 = '"' + date2 + '"';
                                } else if (s_p.dataInType && s_p.dataInType === 'dateStr'){
                                    date1 = '' + date1 + '';
                                }
                                search_p.push({name: s_p.name, value: date2 });
                            }
                        }

                    } else if (s_p.needReqResult && s_p.needReqResult === true){
                        this.hasSub = true;
                        this.setSub();
                        this.reportChart.getOtherData(s_p.value).then( m => {
                            search_p.push({name: s_p.name, value: m });
                            this.search_Sub.next(1);
                        });
                    } else {
                        search_p.push(s_p);
                    }
                });
            }
        return search_p;
    }

    /** 统一清空筛选方法 **/
    clearSearch(){
        this.searchReportLoading = false;
        this.hasReportList = false;
        // this.allListSearch = true ;  // 1
        this.search_parameter = [];
        this.setRightHeight('');
        this.right_table_list.toPageOne();
        // this.onSearchData([]); // 1
    }



    /** 导出接口 **/
    exportData(e){
        this.loadingShowData = 'loading...';
        const dialog = this.dialog.open(this.loadTg, {
            id: 'loadingDialog', width: '100%' , height: '100%'
        });
        const page = this.right_table_list.page.page;
        const size =  this.right_table_list.page.size;
        const sort = this.right_table_list.page.sort;
        const type = this.right_table_list.exportUrlType;
        const name = this.right_table_list.exportReportName + '.csv';
        dialog.afterOpened().subscribe(re => {
            this.projectCashService.dataTemplateExport(page , size , sort , null , this.search_parameter , type ).subscribe(
                res => {
                    if (res['type'] === 4) {
                        this.fileDownload.blobDownload(res['body'], name);
                    }
                },
                error1 => { dialog.close();  }  ,
                () => { dialog.close();  }
            );
        });
    }



    /** 右边的列表 **/
    onPage(e){
        this.right_table_list.hasSub = false;
        this.right_table_list.onPage(e , this.right_table_list.type , this.search_parameter);
    }

    goToDetail(e){
        this.right_table_list.goToDetail(e);
    }

    // 查询列表【调接口】
    searchList(search_p , search_param){

        this.right_table_list.getDataList(this.right_table_list.type , search_p  );
        this.right_table_list.searchFinish.subscribe( res => {
            if (res){
                this.hasReportList = true;
                if (search_param.length > 0 ){
                    this.allListSearch = false;
                } else {
                    this.allListSearch = true;
                }
                this.setRightHeight('auto');
                this.right_table_list.searchFinish.complete(); // 完成后取消订阅
                this.right_table_list.searchFinish.unsubscribe(); // 完成后取消订阅
            }
        } , error => {
            this.hasReportList = true;
            this.allListSearch = false;
        } , () => {
        });
    }


    setSub(){
        if (this.hasSub){
            if (!this.search_Sub){
                this.search_Sub = new  Subject();
            }
        }
    }

    /** 右边的列表 -----完 **/

    /** 获取当前访问参数**/
     getChartParameters(){
        return new Promise((resolve ) => {
            this.activateRoute.data.pipe(takeUntil(this._unsubscribeAll)).subscribe(
                (p) => {
                    this.chartParameter = p.operation;
                    resolve(p.operation);
                }
            );
        });
    }

    isNull(value) {
        if (value !== null && value !== '' && value !== 'null' && value !== undefined) {
            return false;
        } else {
            return true;
        }
    }


    getBracketsParam(itemIds , filed?){
        const value = [];
        itemIds.forEach( id => {
            const v_ =  '"' + id + '"';
            value.push(v_);
        });
        const search_v = this.ArrayToStr(value , filed);
        const filter_value = '(' + search_v + ')';
        return filter_value;
    }


    ArrayToStr(arr , filed? ,  separator?){
        if (arr.length > 0){
            const result =   arr.map( a_a => {
                if (filed) {
                    return a_a[filed];
                } else {
                    return a_a;
                }
            }).join( (separator ? separator : ','));
            return result;
        }
    }
    /** 展开或关闭左边模块 **/
    // changeLeftW(){
    //     this.showLeft === true ? this.showLeft = false : this.showLeft = true ;
    //     setTimeout(() => {
    //         this.t_list.getColumnWidth();
    //     }, 350);
    // }

    cancelSub(){
        if (this.search_Sub && !this.search_Sub.isStopped) {
            this.search_Sub.next();
            this.search_Sub.complete(); // 状态改完成
            this.search_Sub.unsubscribe();  // 取消订阅
            this.search_Sub = null;
        }
    }


    getUserAuth(username){
        //  this.getUserAuth(sessionStorage.getItem('username')).then().finally( () => {
        //
        //         });
        return new Promise( (re , rj) => {
            this.projectCashService.getUserAuth(username).subscribe( res => {
                console.log('当前角色项目权限----' , res);
                this.itemIds = res.items;
                re(true);
            });
        });

    }

    ngOnDestroy(): void {
        this.setRightHeight('');
        this.cancelSub();
        if (this.right_table_list) {
            this.right_table_list.onDestory();
            this.right_table_list = null;
        }
    }

    ngAfterViewInit(): void {
       this.setRightHeight('');
    }

    setRightHeight(p){
        const card_right = document.getElementById('card_right');
        if (p === 'auto'){
            card_right.style.height = p;
        } else {
            const card_left = document.getElementById('card_left');
            if (!this.th_all_div_h) {
                const w_h = document.getElementById('th_all_div');
                this.th_all_div_h = w_h.clientHeight ;
            }
            card_right.style.height = ((Number(this.th_all_div_h) - Number(card_left.clientHeight)) - 20 ) + 'px';
        }

    }
}


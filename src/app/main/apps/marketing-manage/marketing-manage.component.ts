import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {StoreManageService} from '../mall-management/store-mange/store.manage.service';
import {MatDialog, MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../services/notify-asyn.service';
import {PassengersManageService} from '../../../services/passengersManageService/passengers-manage.service';
import {takeUntil} from 'rxjs/operators';
import {NewDateTransformPipe} from '../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {MarketingManageService} from './marketing-manage.service';
import {FileDownloadService} from '../../../services/file-download.service';
import {MatDialogRef} from '@angular/material/dialog/typings/dialog-ref';

@Component({
    selector: 'app-marketing-manage',
    templateUrl: './marketing-manage.component.html',
    styleUrls: ['./marketing-manage.component.scss']
})
export class MarketingManageComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject();
    @ViewChild('progressBar', {static: true}) progressBar: TemplateRef<any>;
    /** 浮动模式选择标签单选*/
    @Input()
    selectedRow: any; // 单个选中，传一个对象
    @Input()
    singleSelect = false;
    /** 多选*/
    @Input()
    selectedRows = [];
    @Input()
    checkbox = false;
    @Input()
    overPanel = false;
    @Input()
    createButton = true;
    @Input()
    resetSelect = true;
    @Output()
    dataSelect: EventEmitter<any> = new EventEmitter();

    @Input()
    activityType: 'DEFAULT' | 'GROUP' | 'POINT' | 'GROUPBUY' | '' = ''; // 悬浮时的筛选条件
    @Input()
    ids = []; // 筛选的id，数据分析中有则显示
    @Input()
    emptyMsg = ''; // 空结果提示
    filter = [];

    detailMenu = []; // 详情操作菜单

    fileSpinner = 0;

    fileSpinnerDialog: MatDialogRef<any>;

    rows = [];
    @Input()
    columns = [];
    page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};

    constructor(
        private snackBar: MatSnackBar,
        private translate: TranslateService,
        private router: Router,
        private loading: FuseProgressBarService,
        private merchantService: StoreManageService,
        private notify: NotifyAsynService,
        private passengersManageService: PassengersManageService,
        private marketingManageService: MarketingManageService,
        private dateTransform: NewDateTransformPipe,
        private fileDownload: FileDownloadService,
        private dialog: MatDialog,
    ) {

    }

    ngOnInit(): void {
        this.getColumns();
        this.getDetailMenu();
        setTimeout(() => {
            this.initSearch();
        });
    }


    onSelect(event) {
        this.dataSelect.emit(event);
    }

    // 获取表头和显示key
    getColumns() {
        if (this.columns.length === 0) {
            this.columns = [
                {name: 'id', translate: 'marketingManage.tableHead.id', value: ''},
                {name: 'name', translate: 'marketingManage.tableHead.name', type: 'input', value: ''},
                {name: 'validity', translate: '有效期', value: ''},
                {
                    name: 'reviewResult', translate: 'marketingManage.tableHead.newStatus', type: 'select', options: [
                        {
                            translate: '待审核',
                            value: false + '&reviewStatus.equals=false&endTime.greaterOrEqualThan=' + new Date().toISOString()
                        },
                        {
                            translate: '已上线',
                            value: true + '&reviewStatus.equals=true&endTime.greaterOrEqualThan=' + new Date().toISOString()
                        },
                        {
                            translate: '已驳回',
                            value: false + '&reviewStatus.equals=true&endTime.greaterOrEqualThan=' + new Date().toISOString()
                        },
                        {translate: '已过期', value: 'overdue'},
                    ], value: ''
                },
                {name: 'lastModifiedBy', translate: 'marketingManage.tableHead.lastModifiedBy', value: ''},
                {name: 'lastModifiedDate', translate: 'marketingManage.tableHead.lastModifiedDate', value: ''},
            ];
        }
    }

    /** 详情操作菜单*/
    getDetailMenu() {
        this.detailMenu = [
            {
                translate: '详情', icon: 'edit', fn: (event) => {
                    this.getDetail(event);
                }
            },
            {
                translate: '统计', icon: 'signal_cellular_alt', fn: (event) => {
                    this.linkToStatistics(event);
                }
            },
            {
                translate: '导出对账单', icon: 'save_alt', fn: (event) => {
                    this.exportReconciliation(event);
                }
            },
        ];
    }




    // 初始化列表数据
    initSearch() {
        this.loading.show();
        if (this.activityType) {
            this.filter.push({name: 'activityType', value: this.activityType});
        }
        if (this.ids.length > 0) {
            this.filter.push({name: 'id', value: this.ids, reg: 'in'});
        } else if (this.activityType) {
            this.snackBar.open(this.emptyMsg, '✖');
            this.loading.hide();
            return;
        }
        this.marketingManageService.multiSearchStoreLists(this.page.page, this.page.size, this.page.sort, null, this.filter).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res['body']) {
                this.transToIndate(res['body']);
                this.rows = res['body'];
                this.page.count = parseInt(res.headers.get('X-Total-Count'), 10);
                if (this.rows.length === 0) {
                    if (this.emptyMsg) {
                        this.snackBar.open(this.emptyMsg, '✖');
                    } else {
                        this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
                    }
                }
            }
            this.loading.hide();
            this.notify.onResponse.emit();
        }, error => {
            this.loading.hide();
        }, () => {
            this.loading.hide();
        });
    }


    // 分页
    onPage(event) {
        this.page.page = event.page;
        this.onSearch();
    }

    // 搜索 包含查询、排序、分页 以及混合的情况
    onSearch() {
        this.loading.show();
        const multiSearch = [];
        if (this.activityType && this.ids.length === 0) {
            this.snackBar.open(this.emptyMsg, '✖');
            this.loading.hide();
            return;
        }
        this.columns.forEach(column => {
            if (column.value !== '') {
                if (column.value === 'overdue' && column.name === 'reviewResult') {

                    multiSearch.push({name: 'endTime', endDate: new Date(), type: 'date'});
                } else {
                    multiSearch.push({name: column.name, value: column.value, type: column.type});
                }

            }
        });

        this.marketingManageService.multiSearchStoreLists(this.page.page, this.page.size, this.page.sort, multiSearch, this.filter).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res['body']) {
                this.rows = res['body'];
                this.transToIndate(res['body']);
                this.page.count = parseInt(res.headers.get('X-Total-Count'), 10);
                if (this.rows.length === 0) {
                    if (this.emptyMsg) {
                        this.snackBar.open(this.emptyMsg, '✖');
                    } else {
                        this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
                    }
                }
            }
            this.loading.hide();
            this.notify.onResponse.emit();
        }, error => {
        }, () => {
            this.loading.hide();
        });
    }

    // 搜索清除
    clearSearch() {
        this.onSearch();
    }

    // 排序
    onSort(event) {
        this.page.sort = event;
        this.onSearch();
    }

    // 详情跳转
    getDetail(event) {
        this.loading.show();
        this.router.navigate(['/apps/marketingManage/marketingManageDetail/' + event.id]).then(res => {
            this.loading.hide();
        });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // 跳转套新增页面
    createActivity() {
        this.loading.show();
        this.router.navigate(['/apps/marketingManage/marketingManageAdd']).then(res => {
            this.loading.hide();
        });
    }

    // 将开始时间与结束时间变为有效期
    transToIndate(param) {
        for (let i = 0; i < param.length; i++) {
            if (param[i]['beginTime'] && param[i]['endTime']) {
                param[i]['validity'] = this.dateTransform.transform(param[i]['beginTime']) + '-' + this.dateTransform.transform(param[i]['endTime']);
            } else {
                param[i]['validity'] = '';
            }
            const dateToday = new Date().getTime();
            const endTime = new Date(param[i]['endTime']).getTime();
            if (dateToday - endTime > 0) {
                param[i]['reviewResult'] = '已过期';
            } else {
                if (param[i]['reviewStatus'] === true) {
                    // 已经审核
                    if (param[i]['reviewResult'] === true) {
                        param[i]['reviewResult'] = '已上线';
                    } else {

                        param[i]['reviewResult'] = '已驳回';
                    }
                } else {
                    // 未审核
                    param[i]['reviewResult'] = '待审核';
                }

            }
        }
    }


    // 统计
    linkToStatistics(event) {
        this.router.navigate(['/apps/marketingManage/AnalysisOfMarketingData/' + event.id]).then(res => {
            this.loading.hide();
        });
    }

    // 导出对账单
    exportReconciliation(event ){
        if (!this.dialog.getDialogById('progressBarDialog_')) {
         this.fileSpinnerDialog =    this.dialog.open(this.progressBar, {id: 'progressBarDialog_', width: '100%', height: '100%', hasBackdrop: true });
         this.fileSpinnerDialog.afterOpened().subscribe(
             re => {
                 this.marketingManageService.exportReconciliation(event.id).pipe().subscribe(
                     res => {
                         if (res['type'] !== 4){
                             this.fileSpinner = res['loaded'] ; // (res['loaded'] / res['total']) * 100 ;
                         }
                         if (res['type'] === 4) {
                             this.fileDownload.blobDownload(res['body'], event.name + '活动对账单.csv');

                         }

                     } , error1 => {  this.fileSpinnerDialog.close(); } , () => {
                         this.fileSpinnerDialog.close();
                     }
                 );
             }
         );


        }

    }

}

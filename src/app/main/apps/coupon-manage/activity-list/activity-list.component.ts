import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {forkJoin, Observable, Subject} from 'rxjs';
import {MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {takeUntil} from 'rxjs/operators';
import {CouponManageService} from '../coupon-manage.service';
import {Utils} from '../../../../services/utils';
import {MatDialog} from '@angular/material/dialog';

@Component({
    selector: 'app-activity-list',
    templateUrl: './activity-list.component.html',
    styleUrls: ['./activity-list.component.scss']
})
export class ActivityListComponent implements OnInit, OnDestroy {
    @Input()
    overPanel: boolean;
    @Input()
    createButton = true;
    @Input()
    singleSelect: boolean;
    @Input()
    selectedRow: any = {};
    @Output()
    dataSelect = new EventEmitter();


    private _unsubscribeAll: Subject<any> = new Subject();
    rows = [];
    columns = [];
    page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};
    configurationTypeList = [];
    typeOptions = [];
    @Input()
    filter: any[] = [{name: 'reviewStatus', value: true}];

    customButtons = []; // 自定义按钮组
    mallOptions = []; // 商场选择

    loadingShowData = 'loading...';
    @ViewChild('loadTg', {static: true})
    loadTg: TemplateRef<any>;

    constructor(
        private snackBar: MatSnackBar,
        private translate: TranslateService,
        private router: Router,
        private loading: FuseProgressBarService,
        private notify: NotifyAsynService,
        private utils: Utils,
        private newDateTransformPipe: NewDateTransformPipe,
        private couponManageService: CouponManageService,
        private dialog: MatDialog,
    ) {
        this.customButtons = [
            {
                name: '导出', iconFont: '', class: 'shallow-button', fn: () => {
                    this.exportList();
                }
            }
        ];
    }

    ngOnInit(): void {
        this.getColumns();
        // 如果从弹窗模式父组件传入了过滤条件则去掉类型筛选
        if (this.filter.find(item => item.name === 'type')) {
            this.columns.find(column => column.name === 'type').type = '';
        }
        // 通过接口获取表头数据
        this.getAllData().then(res => {
        }).catch((res) => {
        }).finally(() => {
            this.initSearch(null);
        });
        this.getMallList();
    }

    // 导出列表数据
    exportList(){
        const dialog = this.dialog.open(this.loadTg, {
            id: 'loadingDialog', width: '100%', height: '100%'
        });
        dialog.afterOpened().subscribe(re => {
            const multiSearch = [];
            this.columns.forEach(column => {
                if (column.value !== '') {
                    multiSearch.push({name: column.name, value: column.value, type: column.type});
                }
            });
            this.couponManageService.toExportActivityList(0, 0x3f3f3f3f, 'lastModifiedDate,desc', multiSearch).subscribe(reg => {
                if (reg.body.type === 'application/json') { // 如果返回的是错误json消息
                    const reader = new FileReader();
                    let result = '';
                    reader.readAsText(reg.body, 'utf-8');
                    reader.onloadend = (ev: ProgressEvent) => { // fileReader读取文件需要时间 默认代码不会等待
                        result = ev.currentTarget['result'];
                        if (result) {
                            const resMessage = JSON.parse(result);
                            this.snackBar.open('导出活动列表:' + resMessage['header'].errorMsg);
                        }
                    };
                } else {
                    this.downloadFileLink(reg.body, '活动列表.csv');
                }
            }, error1 => {
                dialog.close();
            }, () => {
                dialog.close();
            });
        });
    }

    downloadFileLink(data, fileName?: string) {
        const url = window.URL.createObjectURL(data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('target', '_self');
        link.setAttribute('downLoad', fileName);
        link.click();
        window.URL.revokeObjectURL(url); // 手动释放url对象
    }

    getMallList() {
        this.couponManageService.searchMall(0, 0x3f3f3f3f, 'lastModifiedDate,desc').subscribe(res => {
            if (res.content) {
                res.content.forEach(item => {
                    const newItem = {translate: item.mallName, value: item.mallId};
                    this.mallOptions.push(newItem);
                });
                const all = {translate: '归属全部商场', value: '__ALL__'};
                this.mallOptions.unshift(all);
            }
        });
    }

    getSelectData() {
        return new Observable(subscriber => {
            forkJoin(this.couponManageService.toGetActivityTypeList()).subscribe(res => {
                subscriber.next(res);
            });
        });
    }

    getAllData() {
        return new Promise((resolve, rj) => {
            this.getSelectData().subscribe(res => {
                if (res) {
                    res[0].forEach(item => {
                        const option = {translate: item.name, value: item.id};
                        this.typeOptions.push(option);
                        this.configurationTypeList.push(item);
                    });
                }
                resolve(true);
            }, error1 => {
                rj(true);
            });
        });
    }

    // 获取表头和显示key
    getColumns() {
        this.columns = [
            {name: 'id', translate: 'ID', value: ''},
            {name: 'name', translate: '活动名称', value: '', type: 'input'},
            {name: 'type', translate: '活动类型', value: '', type: 'select', options: this.typeOptions},
            {name: 'ruleText', translate: '活动说明', value: '', transformType: 'htmlToText'},
            {name: 'validity', translate: '有效期', value: ''},
            {name: 'lastModifiedBy', translate: '修改人', value: ''},
            {name: 'lastModifiedDate', translate: '修改时间', value: ''},
            {
                name: 'mall', translate: '归属商场ID', value: '', type: 'select',  options: this.mallOptions
            },
            {
                name: 'reviewResult',
                translate: '审核状态',
                transform: [{true: '已通过'}, {false: '已驳回'}],
                type: 'select',
                value: '',
                options: [
                    {translate: '已通过', value: true},
                    {translate: '已驳回', value: false},
                ]
            },
            {name: 'enabled', translate: '状态', value: ''},
            {name: 'reviewUserId', translate: '审核人', value: ''},
            {name: 'reviewTime', translate: '审核时间', value: ''}
        ];
    }

    // 初始化列表数据
    initSearch(search) {
        this.loading.show();
        this.couponManageService.toGetActivityList(this.page.page, this.page.size, this.page.sort, search, this.filter).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res['body']) {
                this.rows = res.body;
                this.page.count = res.headers.get('x-total-count');
                if (this.rows.length === 0) {
                    this.snackBar.open('未查询到数据', '✖');
                } else {
                    this.rows.forEach(item => {
                        this.configurationTypeList.forEach(type => {
                            if (type['id'] === item['type']) {
                                item['type'] = type['name'];
                            }
                        });
                        if (item['city'] && item['city'].length !== 0 && item['city'][0] === '__ALL__') {
                            item['city'] = '全部';
                        }
                        if (item['enabled'] === true) {
                            item['enabled'] = '已上线';
                        } else {
                            item['enabled'] = '已上线';
                        }
                        if (item['reviewResult']) {
                            item['reviewResult'] = '已通过';
                        } else {
                            item['reviewResult'] = '已驳回';
                        }
                        if (item['mall'][0] === '__ALL__') {
                            item['mall'] = '全部';
                        }
                        item['validity'] = this.newDateTransformPipe.transform(item['beginTime']) + ' - ' + this.newDateTransformPipe.transform(item['endTime']);
                    });
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
        const multiSearch = [];
        this.columns.forEach(column => {
            if (column.value !== '') {
                multiSearch.push({name: column.name, value: column.value, type: column.type});
            }
        });
        this.initSearch(multiSearch);
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
        this.router.navigate(['/apps/activityList/edit'], {
            queryParams: {
                id: event.id
            }
        }).then(res => {
            this.loading.hide();
        });
    }

    // 新增套餐
    createActivity() {
        this.loading.show();
        this.router.navigate(['/apps/activityList/create']).then(res => {
            this.loading.hide();
        });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    onDataSelect(event) {
        this.dataSelect.emit(event);
    }
}

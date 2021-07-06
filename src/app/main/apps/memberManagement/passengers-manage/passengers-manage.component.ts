import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {StoreManageService} from '../../mall-management/store-mange/store.manage.service';
import {MatDialog, MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {PassengersManageService} from '../../../../services/passengersManageService/passengers-manage.service';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {takeUntil} from 'rxjs/operators';
import {MemberLevelService} from '../../../../services/memberLevelService/member-level.service';
import {InjectConfirmDialogComponent} from '../../../../components/inject-confirm-dialog/inject-confirm-dialog.component';


@Component({
    selector: 'app-passengers-manage',
    templateUrl: './passengers-manage.component.html',
    styleUrls: ['./passengers-manage.component.scss']
})

export class PassengersManageComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject();
    @Input()
    selectedRows = [];
    @Input()
    overPanel = false;
    @Input()
    checkbox = false;
    @Input()
    singleSelect = false;
    @Input()
    selectedRow = null;
    @Output()
    dataSelect: EventEmitter<any> = new EventEmitter();
    rows = [];
    columns = [];
    levels = []; // 会员级别
    levels_se = []; // 会员数据
    page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};

    tlKey = '';

    @Input()
    createButton = true;

    @Input()
    statusCondition = true;
    customButtons = []; // 自定义按钮组
    loadingShowData = 'loading...';
    @ViewChild('loadTg', {static: true})
    loadTg: TemplateRef<any>;

    constructor(
        private snackBar: MatSnackBar,
        private translate: TranslateService,
        private router: Router,
        private dialog: MatDialog,
        private loading: FuseProgressBarService,
        private merchantService: StoreManageService,
        private notify: NotifyAsynService,
        private  memberLevelService: MemberLevelService,
        private passengersManageService: PassengersManageService
    ) {
        this.tlKey = 'passengers.' + localStorage.getItem('currentProject') + '.';
        this.customButtons = [
            {
                name: '下载模板', iconFont: '', class: 'deep-blue-button', fn: () => {
                    this.downloadTemplate();
                }
            },
            {
                name: '批量导入', iconFont: '', class: 'green-button', fn: () => {
                    this.batchImport();
                }
            },
            {
                name: '导出', iconFont: '', class: 'shallow-button', fn: () => {
                    this.exportList();
                }
            }
        ];
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
                    if (column.name === 'level') {
                        const leve = this.levels_se.filter(l => l.levelName === column.value);
                        column.value = leve ? (leve[0] ? leve[0].level : column.value) : column.value;
                    }
                    multiSearch.push({name: column.name, value: column.value, type: column.type});
                }
            });
            this.memberLevelService.toExportMemberList(0, 0x3f3f3f3f, 'lastModifiedDate,desc', multiSearch).subscribe(reg => {
                if (reg.body.type === 'application/json') { // 如果返回的是错误json消息
                    const reader = new FileReader();
                    let result = '';
                    reader.readAsText(reg.body, 'utf-8');
                    reader.onloadend = (ev: ProgressEvent) => { // fileReader读取文件需要时间 默认代码不会等待
                        result = ev.currentTarget['result'];
                        if (result) {
                            const resMessage = JSON.parse(result);
                            this.snackBar.open('导出会员列表:' + resMessage['header'].errorMsg);
                        }
                    };
                } else {
                    this.downloadFileLink(reg.body, '会员列表.csv');
                }
            }, error1 => {
                dialog.close();
            }, () => {
                dialog.close();
            });
        });
    }

    // 下载模板
    downloadTemplate(){
        this.memberLevelService.toGetMemberTemplate().subscribe(reg => {
            if (reg.body.type === 'application/json') { // 如果返回的是错误json消息
                const reader = new FileReader();
                let result = '';
                reader.readAsText(reg.body, 'utf-8');
                reader.onloadend = (ev: ProgressEvent) => { // fileReader读取文件需要时间 默认代码不会等待
                    result = ev.currentTarget['result'];
                    if (result) {
                        const resMessage = JSON.parse(result);
                        this.snackBar.open('下载模板:' + resMessage['header'].errorMsg);
                    }
                };
            } else {
                this.downloadFileLink(reg.body, '会员模板.csv');
            }
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

    // 批量导入
    batchImport(){
        this.dialog.open(InjectConfirmDialogComponent, {
            id: 'del', width: '400px', data: {
                title: '提示',
                content: '请确认当前导入为下载模板',
                cancelButton: true
            }
        }).afterClosed().subscribe(re => {
            if (re) {
                this.loadingShowData = '0%';
                this.uploadFile();
            }
        });
    }

    uploadFile() {
        const inputElement = document.createElement('input');
        inputElement.setAttribute('type', 'file');
        inputElement.setAttribute('accept', '.csv');
        inputElement.setAttribute('multiple', 'multiple');
        inputElement.hidden = true;
        inputElement.addEventListener('change', () => {
            const file = inputElement.files[0];
            const suffix = file.name.includes('csv');
            if (!suffix) {
                this.snackBar.open('必须上传csv格式的数据 ', '✖');
                inputElement.remove();
                return;
            }
            const formData = new FormData();
            formData.append('file', file);
            const dialog = this.dialog.open(this.loadTg, {
                id: 'loadingDialog', width: '100%', height: '100%', data: {id: 'loading'}
            });
            dialog.afterOpened().subscribe(re => {
                this.memberLevelService.toGetMemberImport(formData).subscribe(res => {
                    let pros = '';
                    if (res.type === 1) {
                        const load = res['loaded'] ? res['loaded'] : 0;
                        const total = res['total'] ? res['total'] : 0;
                        pros = ((load / total) * 100).toFixed(0);
                    }
                    if (this.loadingShowData !== '100%') {
                        this.loadingShowData = pros === 'NaN' ? '0%' : (pros + '%');
                    }
                    if (res['type'] === 4) {
                        this.onSearch();
                        dialog.close();
                    }
                    inputElement.remove();
                }, error1 => {
                    dialog.close();
                    inputElement.remove();
                }, () => {
                    dialog.close();
                });
            });

        });
        inputElement.click();
    }

    ngOnInit(): void {
        this.getColumns();
        this.initLevels().then(re => {
            setTimeout(() => {
                this.initSearch();
            });
        });
    }

    onSelect(event) {
        this.dataSelect.emit(event);
    }

    initLevels() {
        return new Promise(re => {
            this.memberLevelService.searchMemberCardList(0, 0x3f3f3f, 'id,asc').pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                if (res.body) {
                    this.levels_se = res.body;
                    res.body.forEach(level => {
                        this.levels.push({translate: level.levelName, value: level.levelName});
                    });
                    re(true);
                }
            });
        });

    }


    // 获取表头和显示key
    getColumns() {
        this.columns = [
            {name: 'id', translate: this.tlKey + 'tableHead.id', value: ''},
            {name: 'name', translate: this.tlKey + 'tableHead.nickName', type: 'input', value: ''},
            {
                name: 'level',
                translate: this.tlKey + 'tableHead.level',
                type: 'select',
                options: this.levels,
                value: ''
            },
            // {
            //     name: 'gender', translate: 'passengers.tableHead.gender', value: '', type: 'select', options: [
            //         {translate: 'passengers.gender.female', value: '女'},
            //         {translate: 'passengers.gender.male', value: '男'}
            //     ]
            // }, 值是汉字男女
            {name: 'birthday', translate: this.tlKey + 'tableHead.birthday', value: ''},
            {name: 'validPoint', translate: '有效积分', value: '', sort: false},
            {name: 'mobile', translate: this.tlKey + 'tableHead.mobile', type: 'input', value: ''},
            {name: 'sourceMall', translate: '归属地', value: ''},
            {name: 'source', translate: this.tlKey + 'tableHead.source', value: ''},
            {name: 'createdDate', translate: this.tlKey + 'tableHead.createdDate', value: ''},
            {name: 'lastModifiedBy', translate: '修改人', value: ''},
            {name: 'lastModifiedDate', translate: '修改时间', value: ''},
            this.statusCondition ?
                {
                    name: 'enabled', translate: this.tlKey + 'tableHead.enabled', type: 'select', options: [
                        {translate: 'normal', value: true},
                        {translate: 'frozen', value: false}
                    ], value: ''
                } : {
                    name: 'enabled', translate: this.tlKey + 'tableHead.enabled', value: ''
                },
        ];
    }

    // 初始化列表数据
    initSearch() {
        this.loading.show();
        if (this.statusCondition) {
            this.passengersManageService.multiSearchMemberLists(this.page.page, this.page.size, this.page.sort).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                this.resolveListResponse(res);
            }, error => {
            }, () => {
                this.loading.hide();
                this.notify.onResponse.emit();
            });
        } else {
            const condition = '?page=' + this.page.page + '&size=' + this.page.size + '&sort=' + this.page.sort + '&enabled.equals=' + true;
            this.passengersManageService.getByCondition(condition).pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
                this.resolveListResponse(res);
            }, error => {
            }, () => {
                this.loading.hide();
                this.notify.onResponse.emit();
            });
        }

    }

    resolveListResponse(res) {

        if (res['body']) {
            this.rows = res['body'];
            const data = [];
            this.rows.forEach(item => {
                data.push({
                    'mallId': item['sourceMall'],
                    'mobile': item['mobile']
                });
                const leve = this.levels_se.filter(l => l.level === item.level);
                item['level'] = leve ? (leve[0] ? leve[0].levelName : item.level) : item.level;
            });
            // this.passengersManageService.getMemberPoints(data).subscribe(ref => {
            //     console.log('ref:', ref);
            //     if (ref && ref instanceof Array){
            //         this.rows.forEach(item1 => {
            //             item1['point'] = ref.filter(item2 => item2['mobile'] === item1['mobile'])[0]['point'];
            //         });
            //     }
            // });


            // this.transformTags();
            this.page.count = parseInt(res.headers.get('X-Total-Count'), 10);
            if (this.rows.length === 0) {
                this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
            }
        }
    }


    transformTags() {
        this.rows.forEach(row => {
            if (row.tags.length > 0) {
                row.tags = row.tags.map(tag => tag.name).join(',');

            }
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
        this.columns.forEach(column => {
            if (column.value !== '') {
                if (column.name === 'level') {
                    const leve = this.levels_se.filter(l => l.levelName === column.value);
                    column.value = leve ? (leve[0] ? leve[0].level : column.value) : column.value;
                }
                multiSearch.push({name: column.name, value: column.value, type: column.type});
            }
        });
        this.passengersManageService.multiSearchMemberLists(this.page.page, this.page.size, this.page.sort, multiSearch).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res['body']) {
                this.rows = res['body'];
                const data = [];
                this.rows.forEach(item => {
                    data.push({
                        'mallId': item['sourceMall'],
                        'mobile': item['mobile']
                    });
                    const leve = this.levels_se.filter(l => l.level === item.level);
                    item['level'] = leve ? (leve[0] ? leve[0].levelName : item.level) : item.level;
                });
                // this.passengersManageService.getMemberPoints(data).subscribe(ref => {
                //     console.log('ref:', ref);
                //     if (ref && ref instanceof Array){
                //         this.rows.forEach(item1 => {
                //             item1['point'] = ref.filter(item2 => item2['mobile'] === item1['mobile'])[0]['point'];
                //         });
                //     }
                // });
                // this.transformTags();
                this.page.count = parseInt(res.headers.get('X-Total-Count'), 10);
                if (this.rows.length === 0) {
                    this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
                }
            }
        }, error => {
        }, () => {
            this.loading.hide();
            this.notify.onResponse.emit();
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
    navigateDetail(event) {
        this.loading.show();
        this.router.navigate(['/apps/passengersManage/passengersManageDetail/' + event.id]).then(() => {
            this.loading.hide();
        });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}


import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../services/notify-asyn.service';
import {takeUntil} from 'rxjs/operators';
import {MallManageService} from './mall-manage.service';

@Component({
    selector: 'app-mall-manage',
    templateUrl: './mall-manage.component.html',
    styleUrls: ['./mall-manage.component.scss']
})
export class MallManageComponent implements OnInit, OnDestroy {

    private _unsubscribeAll: Subject<any> = new Subject();

    @Input()
    selectedRows = [];
    @Input()
    checkbox = false;
    @Input()
    overPanel = false;
    @Input()
    createButton = true;
    @Input()
    singleSelect = false;
    @Input()
    selectedRow = null;
    @Output()
    dataSelect: EventEmitter<any> = new EventEmitter();
    @Input()
    selectedFiled = 'id';

    @Input()
    hasHeader = true;

    customButtons = []; // 自定义按钮组
    @Output()
    sendCheckInfo: EventEmitter<any> = new EventEmitter();
    @Input()
    hasCheckAllFlag = false;
    @Input()
    popUpYes = false;
    rows = [];
    columns = [];
    page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};

    constructor(
        private snackBar: MatSnackBar,
        private translate: TranslateService,
        private mallService: MallManageService,
        private router: Router,
        private loading: FuseProgressBarService,
        private notify: NotifyAsynService
    ) {
    }

    ngOnInit() {
        this.getCustomButtons();
        this.getColumns();
        setTimeout(() => {
            this.initSearch();
        });
    }

    /** 自定义按钮组*/
    getCustomButtons() {
        if (this.overPanel) {
            if (this.hasCheckAllFlag){
                this.customButtons = [
                    {
                        name: '选择所有', class: 'dark-yellow-button', fn: () => {
                            this.toShowDefaultCheck(true);
                        }
                    },
                    {
                        name: '取消所有', class: 'dark-yellow-button', fn: () => {
                            this.toShowDefaultCheck(false);
                        }
                    }
                ];
            }
        } else {
            this.customButtons = [
                {
                    name: '新建', iconFont: 'iconadd1', class: 'dark-yellow-button', fn: () => {
                        this.create();
                    }
                }
            ];
        }
    }

    toShowDefaultCheck(event) {
        if (event) {
            this.mallService.getMallList(0, 0x3f3f3f3f, 'lastModifiedDate,desc', null , this.popUpYes).subscribe(res => {
                const count = res['content'].length;
                this.sendCheckInfo.emit({flag: event, body: res['content'], count: count});
            });
        } else {
            this.sendCheckInfo.emit({flag: event});
        }
    }

    onSelect(event) {
        this.dataSelect.emit(event);
    }

    getColumns() {
        this.columns = [
            {name: 'mallId', translate: 'mall.mallId', value: ''},
            {name: 'mallName', translate: 'mall.mallName', value: '', type: 'input'},
            {name: 'position', translate: 'mall.position', value: ''},
            {name: 'address', translate: 'mall.address', value: ''},
            {
                name: 'enabled',
                translate: 'mall.status',
                type: 'select',
                options: [
                    {translate: 'normal', value: true},
                    {translate: 'frozen', value: false}
                ],
                value: ''
            },
            {name: 'lastModifiedBy', translate: 'mall.lastModifiedBy', value: ''},
            {name: 'lastModifiedDate', translate: 'mall.lastModifiedDate', value: ''},
        ];
    }

    initSearch() {
        this.loading.show();
        this.mallService.getMallList(this.page.page, this.page.size, this.page.sort , null  , this.popUpYes ).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                this.rows = res.content;
                this.page.count = res.totalElements;
                if (this.rows.length === 0) {
                    this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
                }
                this.notify.onResponse.emit();
                this.loading.hide();
            }
        });
    }

    onSearch() {
        this.loading.show();
        const multiSearch = [];
        this.columns.forEach(column => {
            if (column.value !== '') {
                multiSearch.push({name: column.name, value: column.value, type: column.type});
            }
        });
        this.mallService.getMallList(this.page.page, this.page.size, this.page.sort, multiSearch , this.popUpYes).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                this.rows = res.content;
                this.page.count = res.totalElements;
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

    getDetail(event) {
        this.router.navigate(['apps/mallManage/edit/' + event.id]);
    }

    create() {
        this.router.navigate(['apps/mallManage/create']).then();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}

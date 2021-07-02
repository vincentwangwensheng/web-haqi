import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {MatDialog, MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MembersListServiceService} from '../membersListService/members-list-service.service';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {takeUntil} from 'rxjs/operators';
import {CouponParameter} from '../../../../services/EcouponService/CouponParameter';


@Component({
    selector: 'app-members-list',
    templateUrl: './members-list.component.html',
    styleUrls: ['./members-list.component.scss']
})

// 成员列表 积分供应商列表
export class MembersListComponent implements OnInit, OnDestroy {

    @ViewChild('MembersListDetailDialog', {static: true}) MembersListDetailDialog: TemplateRef<any>;

    /** 浮动模式选择标签*/
    @Input()
    selectedRows = [];
    @Input()
    overPanel = false;
    @Output()
    dataSelect: EventEmitter<any> = new EventEmitter();
    @Input()
    checkbox = false;
    @Input()
    singleSelect = false;
    @Input()
    selectedRow: any; // 单个选中，传一个对象
    @Input()
    memberId = '';

    private _unsubscribeAll: Subject<any> = new Subject();
    rows = [];
    columns = [];
    page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};
    MemberID: string;

    constructor(
        private snackBar: MatSnackBar,
        private translate: TranslateService,
        private routeInfo: ActivatedRoute,
        private router: Router,
        public  dialog: MatDialog,
        private loading: FuseProgressBarService,
        private membersListService: MembersListServiceService,
        private notify: NotifyAsynService,
    ) {
    }

    ngOnInit() {
        this.getColumns();
        setTimeout(() => {
            this.initSearch();
        });
    }


    onSelect(event) {
        this.dataSelect.emit(event);
    }


    // 获取表头和显示key  利用引用传递 异步更改options
    getColumns() {
        this.columns = [
            {name: 'id', translate: 'BonusPointUnion.MembersList.memberId', value: ''},
            {name: 'memberName', translate: 'BonusPointUnion.MembersList.memberName', type: 'input', value: ''},
            {name: 'authMethod', translate: 'BonusPointUnion.MembersList.authMethod', value: ''},
            {name: 'url', translate: 'BonusPointUnion.MembersList.url', value: ''},
            {name: 'lastModifiedBy', translate: 'airport.store.lastModifiedBy', value: ''},
            {name: 'lastModifiedDate', translate: 'airport.store.lastModifiedDate', value: ''},
            {name: 'enabled', translate: 'BonusPointUnion.MembersList.enable', value: ''},
        ];
    }


    // 初始化列表数据
    initSearch() {
        this.loading.show();
        this.membersListService.getMemberList(this.page.page, this.page.size, this.page.sort ).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {

                if (this.memberId) {
                    res['body'].forEach( r => {
                        if (r.memberId !== this.memberId) {
                            this.rows.push(r);
                        }
                    });
                } else {
                    this.rows = res['body'];
                }
                this.page.count = res['headers'].get('X-Total-Count');
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


    openDialog() {
        this.MemberID = CouponParameter.Member_ID;
        if (!this.dialog.getDialogById('MembersListDetailDialogClass')) {
            this.dialog.open(this.MembersListDetailDialog, {
                id: 'MembersListDetailDialogClass',
                width: '520px',
                height: '400px'
            }).afterClosed().subscribe(res => {
                this.router.navigateByUrl('apps/MembersListComponent');
            });
        }
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
                multiSearch.push({name: column.name, value: column.value, type: column.type});
            }
        });
        this.membersListService.getMemberList(this.page.page, this.page.size, this.page.sort, multiSearch ).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                if (this.memberId) {
                    res['body'].forEach( r => {
                        if (r.memberId !== this.memberId) {
                            this.rows.push(r);
                        }
                    });
                } else {
                    this.rows = res['body'];
                }
                this.page.count = res['headers'].get('X-Total-Count');
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

    // 排序
    onSort(event) {
        this.page.sort = event;
        this.onSearch();
    }

    // 详情跳转
    getDetail(event) {
        if (event) {
            this.MemberID = event.id;
        }
        if (!this.dialog.getDialogById('MembersListDetailDialogClass')) {
            this.dialog.open(this.MembersListDetailDialog, {
                id: 'MembersListDetailDialogClass',
                width: '520px',
                height: '400px' ,
                hasBackdrop: true ,
            }).afterClosed().subscribe(res => {
                this.onSearch();
            });
        }
        /* this.router.navigate(['/apps/MembersDetailComponent/' + event.id]).then(res => {
             this.loading.hide();
         });*/
    }


    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}

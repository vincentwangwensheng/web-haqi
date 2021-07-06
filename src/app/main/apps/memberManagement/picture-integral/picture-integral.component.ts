import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {MatDialog, MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {takeUntil} from 'rxjs/operators';
import {MemberLevelService} from '../../../../services/memberLevelService/member-level.service';

@Component({
    selector: 'app-picture-integral',
    templateUrl: './picture-integral.component.html',
    styleUrls: ['./picture-integral.component.scss']
})
export class PictureIntegralComponent implements OnInit, OnDestroy {
    // 列表数据
    private _unsubscribeAll: Subject<any> = new Subject();
    columns = [];
    page = {page: 0, size: 10, count: 0, sort: 'createdDate,desc'};
    rows = [];
    // 详情页数据
    detail: any;
    operator = ''; // 操作人
    imgShow = false;
    imgBaseUrl = '';
    autoAdopt: any;

    saveId: any;

    // 购买记录
    constructor(private memberLevelService: MemberLevelService,
                private snackBar: MatSnackBar,
                private translate: TranslateService,
                private router: Router,
                private loading: FuseProgressBarService,
                private dateTransform: NewDateTransformPipe,
                private notify: NotifyAsynService,
                public dialog: MatDialog
    ) {
    }

    ngOnInit() {
        this.imgBaseUrl = sessionStorage.getItem('baseUrl') + 'file/api/file/showImg?saveId=';
        this.operator = sessionStorage.getItem('username');
        this.getColumns();
        this.initSearch();
        this.toGetAutoAdopt();
    }

    // 获取是否自动审核状态
    toGetAutoAdopt() {
        this.memberLevelService.toGetAutoAdopt().pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.autoAdopt = res;
        });
    }

    // 获取表头和显示key
    getColumns() {
        this.columns = [
            {name: 'mobile', translate: '手机号', type: 'input', value: '', sort: true},
            {name: 'mallId', translate: '商场ID', type: '', value: '', sort: true},
            {name: 'mallName', translate: '商场名称', type: '', value: '', sort: true},
            {name: 'storeId', translate: '商户ID', type: '', value: '', sort: true},
            {name: 'storeName', translate: '店铺名称', type: '', value: '', sort: true},
            {name: 'firstLevelBuss', translate: '一级业态', type: '', value: '', sort: true},
            {name: 'secondLevelBuss', translate: '二级业态', type: '', value: '', sort: true},
            {name: 'point', translate: '积分', type: '', value: ''},
            {name: 'amount', translate: '消费金额', type: '', value: '', sort: true},
            {name: 'status', translate: '状态', type: '', value: '', sort: true},
            {name: 'lastModifiedDate', translate: '修改时间', type: '', value: '', sort: true},
            {name: 'lastModifiedBy', translate: '修改人', type: '', value: '', sort: true}
        ];
    }

    // 初始化列表数据
    initSearch(multiSearch?) {
        this.loading.show();
        this.memberLevelService.searchSelfPointsList(this.page.page, this.page.size, this.page.sort, multiSearch).pipe(takeUntil(this._unsubscribeAll)).subscribe(res_json => {
            if (res_json) {
                this.rows = [];
                this.rows = res_json['body'];
                if (this.rows.length !== 0) {
                    this.rows.forEach(item => {
                        if (item['status'] === 'AUDIT') {
                            item['status'] = '待审核';
                        } else if (item['status'] === 'ADOPT') {
                            item['status'] = '已审核';
                        } else if (item['status'] === 'REFUSE') {
                            item['status'] = '已驳回';
                        }
                    });
                }
                this.page.count = res_json['headers'].get('X-Total-Count');
                this.notify.onResponse.emit();
                if (this.rows.length === 0) {
                    this.snackBar.open(this.translate.instant('未查询到数据'), '✖');
                }
            }
            this.loading.hide();
        }, error => {
            this.loading.hide();
        }, () => {
            this.loading.hide();
        });
    }

    // 搜索
    onSearch() {
        const multiSearch = [];
        this.columns.forEach(column => {
            if (column.value !== '') {
                multiSearch.push(column);
            }
        });
        this.initSearch(multiSearch);
    }

    // 搜索清除
    clearSearch() {
        this.onSearch();
    }

    // 分页
    onPage(event) {
        this.page.page = event.page;
        this.onSearch();
    }

    // 排序
    onSort(event) {
        this.page.sort = event;
        this.onSearch();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // 获取退款详详情信息并打开弹出框
    getDetail(event, MatDialogFrozen) {
        this.dialog.open(MatDialogFrozen, {
            id: 'frozenTips',
            width: '428px',
            height: '450px',
            position: {top: '100px'}
        });
        this.imgShow = false;
        this.detail = event;
        console.log(this.detail);
        this.saveId = event.fileId;
    }

    // 查看会员详情
    goToMemberDetail(id) {
        this.loading.show();
        this.dialog.closeAll();
        this.router.navigate(['/apps/passengersManage/passengersManageDetail/' + id]).then(() => {
            this.loading.hide();
        });
    }

    // 通过
    approvingPass() {
        this.loading.show();
        this.detail['lastModifiedBy'] = this.operator;
        this.memberLevelService.getSelfPointPass(this.detail).pipe(takeUntil(this._unsubscribeAll)).subscribe(res_json => {
            if (res_json) {
                this.initSearch();
                this.detail = {};
            }
            this.dialog.closeAll();
            this.loading.hide();
        }, error => {
            this.loading.hide();
        }, () => {
            this.loading.hide();
        });
    }

    // 驳回
    approvingReject() {
        if (!this.detail['remarks']) {
            this.snackBar.open('请输入原因描述', '✖');
        } else {
            this.loading.show();
            this.detail['lastModifiedBy'] = this.operator;
            this.memberLevelService.getSelfPointRefuses(this.detail).pipe(takeUntil(this._unsubscribeAll)).subscribe(res_json => {
                if (res_json) {
                    this.initSearch();
                    this.detail = {};
                }
                this.dialog.closeAll();
                this.loading.hide();
            }, error => {
                this.loading.hide();
            }, () => {
                this.loading.hide();
            });
        }
    }

    // 开启自动审核
    automaticReview(event) {
        // this.snackBar.open('开发中-自动审核：' + event, '✖');
        const isAutoAdopt = !event;
        if (this.autoAdopt !== isAutoAdopt) {
            this.memberLevelService.toSetAutoAdopt(isAutoAdopt).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                this.autoAdopt = isAutoAdopt;
                if (isAutoAdopt) {
                    this.snackBar.open('开启自动审核成功', '✖');
                } else {
                    this.snackBar.open('关闭自动审核成功', '✖');
                }

            });
        }

    }

}

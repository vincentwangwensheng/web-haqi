import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {Router} from '@angular/router';
import {MatDialogRef} from '@angular/material/dialog/typings/dialog-ref';
import {Subject} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {MembersListServiceService} from '../membersListService/members-list-service.service';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {CouponParameter} from '../../../../services/EcouponService/CouponParameter';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-add-rule',
    templateUrl: './add-rule.component.html',
    styleUrls: ['./add-rule.component.scss']
})
// 新建积分
export class AddRuleComponent implements OnInit {
    @ViewChild('SelectAddWhich', {static: true}) SelectAddWhich: TemplateRef<any>;
    SelectAddWhichDialog: MatDialogRef<any>;
    private _unsubscribeAll: Subject<any> = new Subject();
    rows = [];
    columns = [];
    DialogClosePara = 'tz';
    page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};

    constructor(
        public dialog: MatDialog,
        private router: Router,
        private snackBar: MatSnackBar,
        private translate: TranslateService,
        private loading: FuseProgressBarService,
        private memberService: MembersListServiceService,
        private notify: NotifyAsynService,
    ) {
    }

    ngOnInit() {
        this.getColumns();
        setTimeout(() => {
            this.initSearch();
        });
        // 先打开一个弹框提供选择
        this.openSelectAddWhichDialog();
    }


    // 获取表头和显示key  利用引用传递 异步更改options
    getColumns() {
        this.columns = [
            {name: 'id', translate: 'BonusPointUnion.BonusPointRules.id', value: ''},
            {name: 'type', translate: 'BonusPointUnion.BonusPointRules.type', type: '', value: '', needTranslate: true},
            {name: 'ruleName', translate: 'BonusPointUnion.BonusPointRules.ruleName', type: 'input', value: ''},
            {name: 'desc', translate: 'BonusPointUnion.BonusPointRules.desc', value: ''},
            {name: 'lastModifiedBy', translate: 'BonusPointUnion.BonusPointRules.lastModifiedBy', type: '', value: ''},
            {name: 'lastModifiedDate', translate: 'BonusPointUnion.BonusPointRules.lastModifiedDate', value: ''},
            {name: 'enabled', translate: 'BonusPointUnion.BonusPointRules.enable', value: ''},
        ];
    }

    // 初始化列表数据
    initSearch() {
        this.loading.show();
        this.memberService.getRuleList(this.page.page, this.page.size, this.page.sort).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                /*       res.content.forEach( r => {
                           if (r.type === CouponParameter.Rule_INTERACT){
                               r.type = this.translate.instant('BonusPointUnion.BonusPointRules.INTERACT');
                           } else {
                               r.type = this.translate.instant('BonusPointUnion.BonusPointRules.CONSUME');
                           }

                       });
       */
                this.rows = res.content;
                this.page.count = res.totalElements;
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
            multiSearch.push({name: column.name, value: column.value, type: column.type});
        });
        this.memberService.getRuleList(this.page.page, this.page.size, this.page.sort, multiSearch).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                /*         res.content.forEach( r => {
                             if (r.type === CouponParameter.Rule_INTERACT){
                                 r.type = this.translate.instant('BonusPointUnion.BonusPointRules.INTERACT');
                             } else {
                                 r.type = this.translate.instant('BonusPointUnion.BonusPointRules.CONSUME');
                             }
                         });*/
                this.rows = res.content;
                this.page.count = res.totalElements;
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
        this.loading.show();
        this.router.navigate(['/apps/RulesDetailComponent/' + event.id]).then(res => {
            this.loading.hide();
        });
    }


    openSelectAddWhichDialog() {
        if (!this.dialog.getDialogById('SelectAddWhichDialogClass')) {
            this.SelectAddWhichDialog = this.dialog.open(this.SelectAddWhich, {
                id: 'SelectAddWhichDialogClass',
                width: '35%',
                height: '43%' ,
                hasBackdrop: true ,
            });
            this.SelectAddWhichDialog.afterClosed().subscribe(res => {
                if (this.DialogClosePara !== res) {
                    this.router.navigateByUrl('apps/BonusPointRulesComponent');
                }
            });
        }
    }

    // 跳转消费积分
    toConsume() {
        if (this.SelectAddWhichDialog) {
            this.SelectAddWhichDialog.close(this.DialogClosePara);
        }
        this.router.navigateByUrl('apps/BonusPointRulesComponent/AddConsumeBonusPointRuleComponent/' + CouponParameter.ADD_Rule_CONSUME);
    }

    // 跳转互动积分
    toInteracts() {
        if (this.SelectAddWhichDialog) {
            this.SelectAddWhichDialog.close(this.DialogClosePara);
        }
        this.router.navigateByUrl('apps/BonusPointRulesComponent/AddInteractsBonusPointRuleComponent/' + CouponParameter.ADD_Rule_INTERACT);
    }
}

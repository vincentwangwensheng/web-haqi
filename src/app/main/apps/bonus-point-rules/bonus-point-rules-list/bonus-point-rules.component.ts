import {Component, OnDestroy, OnInit} from '@angular/core';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {MatSnackBar} from '@angular/material';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {Router} from '@angular/router';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {TranslateService} from '@ngx-translate/core';
import {MembersListServiceService} from '../membersListService/members-list-service.service';
import {CouponParameter} from '../../../../services/EcouponService/CouponParameter';

@Component({
  selector: 'app-bonus-point-rules',
  templateUrl: './bonus-point-rules.component.html',
  styleUrls: ['./bonus-point-rules.component.scss']
})

// 积分规则列表
export class BonusPointRulesComponent implements OnInit  , OnDestroy{
    private _unsubscribeAll: Subject<any> = new Subject();
    rows = [];
    columns = [];
    page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};
  constructor(
      private snackBar: MatSnackBar,
      private translate: TranslateService,
      private router: Router,
      private loading: FuseProgressBarService,
      private memberService: MembersListServiceService,
      private notify: NotifyAsynService,
  ) { }

  ngOnInit() {
      this.getColumns();
      setTimeout(() => {
          this.initSearch();
      });
  }



    // 获取表头和显示key  利用引用传递 异步更改options
    getColumns() {
        this.columns = [
            {name: 'id', translate: 'BonusPointUnion.BonusPointRules.id', value: ''},
            {name: 'type', translate: 'BonusPointUnion.BonusPointRules.type', type: '', value: '' , needTranslate: true},
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
        this.memberService.getRuleById(event.id).pipe().subscribe(
            res => {
                const ruleType = res['ruleDTO'].type;
                if ( ruleType === CouponParameter.Rule_INTERACT) {
                    // 跳转互动积分
                    this.router.navigate(['/apps/BonusPointRulesComponent/AddInteractsBonusPointRuleComponent/' + event.id]).then( () => {
                        this.loading.hide();
                    });
                } else {
                    // 跳转消费积分
                    this.router.navigate(['/apps/BonusPointRulesComponent/AddConsumeBonusPointRuleComponent/' + event.id]).then( () => {
                        this.loading.hide();
                    });
                }
            }
        );




        // /apps/RulesDetailComponent/ 原来的详情页

    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}

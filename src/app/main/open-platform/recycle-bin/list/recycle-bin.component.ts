import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {HttpClient} from '@angular/common/http';
import {MatDialog, MatSnackBar} from '@angular/material';
import {Utils} from '../../../../services/utils';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {Router} from '@angular/router';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {TranslateService} from '@ngx-translate/core';
import {takeUntil} from 'rxjs/operators';
import {MatDialogRef} from '@angular/material/dialog/typings/dialog-ref';
import {OpenCenterService} from '../../openCenterService/open-center.service';

@Component({
  selector: 'app-recycle-bin',
  templateUrl: './recycle-bin.component.html',
  styleUrls: ['./recycle-bin.component.scss']
})
export class RecycleBinComponent implements OnInit  , OnDestroy {
    @ViewChild('deleteApp', {static: true}) deleteApp: TemplateRef<any>;

    private _unsubscribeAll: Subject<any> = new Subject();

    rows = [];
    columns = [];
    page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};

  //  detailMenu = [];

    delRef: MatDialogRef<any>;

    filter = [];

  constructor(
      private snackBar: MatSnackBar,
      private translate: TranslateService,
      private router: Router,
      private utils: Utils,
      private http: HttpClient,
      public  dialog: MatDialog,
      private loading: FuseProgressBarService,
      private dateTransform: NewDateTransformPipe,
      private openCenterService: OpenCenterService,
      private notify: NotifyAsynService
  ) { }

  ngOnInit() {
      this.getColumns();
      this.initSearch();
   //   this.getDetailMenu();

  }



    // 获取表头和显示key
    getColumns() {
        this.columns = [
            {name: 'username', translate: 'open.app.username', type: '', value: ''},
            {name: 'tokenSN', translate: 'open.app.tokenSN', type: '', value: ''},
            {name: 'api', translate: 'open.app.api', type: '', value: ''},
            {
                name: 'reviewResult', translate: 'open.app.reviewStatus', type: '', value: '', needTranslate: true ,
                options: [
                    {translate: 'open.app.AUDIT', value: false + '&reviewStatus.equals=false'}, // 待审核
                    {translate: 'open.app.REJECTED',  value: false + '&reviewStatus.equals=true'}, // 已驳回
                    {translate: 'open.app.CERTIFIED', value: true + '&reviewStatus.equals=true'} // 已认证
                ]
            },
            //  {name: 'enabled', translate: 'open.app.enabled', type: '', value: ''},
            {name: 'tokenExpiredTime', translate: 'open.app.tokenExpiredTime', type: '', value: ''},
            {name: 'lastModifiedBy', translate: 'open.app.lastModifiedBy', type: '', value: ''},
            {name: 'lastModifiedDate', translate: 'open.app.lastModifiedDate', type: '', value: ''},
        ];
    }


    // 初始化列表数据
    initSearch() {
        this.loading.show();
        this.filter.push({name: 'reviewResult', value:  false + '&reviewStatus.equals=false'});
        this.openCenterService.openapiReview(this.page.page, this.page.size, this.page.sort , null , this.filter).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                this.rows = res['body'];
                this.setStatus(res['body']);
                this.page.count = res['headers'].get('X-Total-Count');
                this.notify.onResponse.emit(); // 拿到大小时，完成发射流事件
                if (this.rows.length === 0) { // 如果是空数组返回了
                    this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
                }
            }
        }, error => {
            this.loading.hide();

        }, () => {
            this.loading.hide();
            this.notify.onResponse.emit();
        });
    }

    // 搜索
    onSearch() {
        this.loading.show();
        const multiSearch = this.utils.transformColumns(this.columns);
        this.openCenterService.openapiReview(this.page.page, this.page.size, this.page.sort, multiSearch  , this.filter).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {

                this.rows = res['body'];
                this.setStatus(res['body']);
                this.page.count = res['headers'].get('X-Total-Count');
                this.notify.onResponse.emit(); // 拿到大小时，完成发射流事件
                if (this.rows.length === 0) { // 如果是空数组返回了
                    this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
                }
            }
            this.loading.hide();
        }, error => {
            this.loading.hide();

        }, () => {
            this.loading.hide();
            this.notify.onResponse.emit(); // 拿到大小时 流程完成发射事件
        });
    }

    // 搜索清除
    clearSearch() {
        this.onSearch();
    }


    setStatus(param){
        for (let i = 0; i < param.length; i++){
            const p = param[i];
            if (p['reviewStatus'] === true) {
                // 已经审核
                if (p['reviewResult'] === true) {
                    p['reviewResult'] = 'CERTIFIED1'; // '已通过';
                } else {
                    p['reviewResult'] =  'REJECTED' ; // '已驳回';
                }
            } else {
                // 未审核
                p['reviewResult'] = 'AUDIT'; // '待审核';
            }

        }
    }


    /** 详情操作菜单*/
    // getDetailMenu() {
    //     this.detailMenu = [
    //         {
    //             translate: '详情', icon: 'edit', fn: (event) => {
    //                 this.getDetail(event);
    //             }
    //         },
    //         {
    //             translate: '恢复', icon: 'autorenew', fn: (event) => {
    //                 this.recoveryApp(event);
    //             }
    //         }];
    // }

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

    // 详情跳转
    getDetail(event) {
        this.loading.show();
        const p = event.tokenSN + '&' + event.tokenExpiredTime + '&'
            + event.api + '&' + event.reviewStatus + '&' + event.reviewResult + '&' + event.username;
        this.router.navigate(['/open/recycleBin/edit/' + p]).then(res => {
            this.loading.hide();
        });
    }

    createMyAPP() {
        this.loading.show();
        this.router.navigate(['/open/myApps/add']).then(res => {
            this.loading.hide();
        });
    }


    recoveryApp(e) {
        if (!this.dialog.getDialogById('deleteAppClass')) {
            this.delRef = this.dialog.open(this.deleteApp, {
                id: 'deleteAppClass',
                width: '320px',
                height: '150px',
                hasBackdrop: true
            });
            this.delRef.afterClosed().subscribe(res => {
                if (res === 'yes'){
                    // 拿到ID
                    this.onSearch();
                }
            });

        }
    }

    delDialogClose(){
        this.delRef.close('yes');
    }


    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}

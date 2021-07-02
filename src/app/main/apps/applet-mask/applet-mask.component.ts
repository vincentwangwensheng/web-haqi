import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {NotifyAsynService} from '../../../services/notify-asyn.service';
import {MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../@fuse/components/progress-bar/progress-bar.service';
import {NewDateTransformPipe} from '../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {takeUntil} from 'rxjs/operators';
import {AppletMaskServiceService} from './appletMaskService/applet-mask-service.service';
import {AppletMaskParameter} from './appletMaskService/AppletMaskParameter';

@Component({
  selector: 'app-applet-mask',
  templateUrl: './applet-mask.component.html',
  styleUrls: ['./applet-mask.component.scss']
})
export class AppletMaskComponent implements OnInit  , OnDestroy{
    private _unsubscribeAll: Subject<any> = new Subject();
    rows = [];
    columns = [];
    page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};
  constructor(
      private snackBar: MatSnackBar,
      private translate: TranslateService,
      private router: Router,
      private loading: FuseProgressBarService,
      private appletMaskServiceService: AppletMaskServiceService,
      private dateTransform: NewDateTransformPipe ,
      private notify: NotifyAsynService
  ) { }

  ngOnInit() {
      this.getColumns();
      this.initSearch();
  }

    // 获取表头和显示key
    getColumns() {
        this.columns = [
            {name: 'popupId', translate: 'AppletMask.list.popupId', type: '', value: ''},
            {name: 'popupName', translate: 'AppletMask.list.popupName', type: 'input', value: ''},
            {name: 'popupType', translate: 'AppletMask.list.popupType', type: 'select', value: '' , needTranslate: true ,
                options: [
                    {translate: 'AppletMask.list.POPUP_PICTURE', value: AppletMaskParameter.POPUP_PICTURE},
                    {translate: 'AppletMask.list.POPUP_COUPON', value: AppletMaskParameter.POPUP_COUPON}
                ], },
            {name: 'validity', translate: 'AppletMask.list.validity', type: '', value: ''},
          /*  {name: 'createdBy', translate: 'AppletMask.list.createdBy', type: '', value: ''},
            {name: 'createdDate', translate: 'AppletMask.list.createdDate', type: '', value: ''},*/
            {name: 'popupStatus', translate: 'AppletMask.list.popupStatus', type: '', value: ''},
            {name: 'createdBy', translate: '创建人', value: ''},
            {name: 'createdDate', translate: '创建时间', value: ''},
            {name: 'lastModifiedBy', translate: 'AppletMask.list.lastModifiedBy', type: '', value: ''},
            {name: 'lastModifiedDate', translate: 'AppletMask.list.lastModifiedDate', type: '', value: ''},
          /* 还差【状态、修改人、修改时间、】 {name: 'lastModifiedDate', translate: 'AppletMask.list.popupId', type: '', value: ''},*/
        ];
    }

    // 初始化列表数据
    initSearch() {
        this.loading.show();
        this.appletMaskServiceService.searchPopupInfos(this.page.page, this.page.size, this.page.sort).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                for (let y = 0; y < res.body.length; y++) {
                    res['body'][y]['validity'] = this.dateTransform.transform(res['body'][y]['popupStartTime'])
                                                       + ' - ' + this.dateTransform.transform(res['body'][y]['popupEndTime'])  ;
                /*    if (res['body'][y]['popupType'] === AppletMaskParameter.POPUP_PICTURE){
                        res['body'][y]['popupType'] = this.translate.instant('AppletMask.list.POPUP_PICTURE');
                    } else {
                        res['body'][y]['popupType'] = this.translate.instant('AppletMask.list.POPUP_COUPON');
                    }*/

                }
                this.rows = res.body;
               // this.page.count =  res.headers.get('x-total-count');
                this.notify.onResponse.emit(); // 拿到大小时 流程完成发射事件
                if (this.rows.length === 0) { // 如果是空数组返回了
                    this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
                } else { // 查询大小
                     this.appletMaskServiceService.getPopupInfoCount().pipe(takeUntil(this._unsubscribeAll)).subscribe(count_ => {
                         if (count_) {
                             this.page.count = Number(count_);
                         }
                     }, error1 => {
                     } , () => {
                         this.loading.hide();
                         this.notify.onResponse.emit(); // 拿到大小时 流程完成发射事件
                     });
                }
            }
        }, error => {
            this.loading.hide();

        }, () => {  this.loading.hide(); });
    }

    // 搜索
    onSearch() {
        this.loading.show();
        const multiSearch = [];
        this.columns.forEach(column => {
            if (column.value !== '') {
                multiSearch.push({name: column.name, value: column.value, type: column.type});
            }
        });
        this.appletMaskServiceService.searchPopupInfos(this.page.page, this.page.size, this.page.sort, multiSearch).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                 for (let y = 0; y < res['body'].length; y++) {
                     res['body'][y]['validity'] = this.dateTransform.transform(res['body'][y]['popupStartTime'])
                         + ' - ' + this.dateTransform.transform(res['body'][y]['popupEndTime'])  ;
                  /*   if (res['body'][y]['popupType'] === AppletMaskParameter.POPUP_PICTURE){
                         res['body'][y]['popupType'] = this.translate.instant('AppletMask.list.POPUP_PICTURE');
                     } else {
                         res['body'][y]['popupType'] = this.translate.instant('AppletMask.list.POPUP_COUPON');
                     }
*/
                 }
                this.rows = res['body'];
              //  this.page.count =  res['headers'].get('x-total-count');
                this.notify.onResponse.emit(); // 拿到大小时 流程完成发射事件
                if (this.rows.length === 0) { // 如果是空数组返回了
                    this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
                } else { // 查询大小
                      this.appletMaskServiceService.getPopupInfoCount().pipe(takeUntil(this._unsubscribeAll)).subscribe(count_ => {
                          if (count_) {
                              this.page.count = Number(count_);
                          }
                      }, error1 => {
                      } , () => {
                          this.loading.hide();
                          this.notify.onResponse.emit(); // 拿到大小时 流程完成发射事件
                      });
                }
            }
            this.loading.hide();
        }, error => {
            this.loading.hide();

        } , () => { this.loading.hide(); });
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

    // 详情跳转
    getDetail(event) {
        this.loading.show();
        this.router.navigate(['/apps/AppletMaskList/AppletMaskAddDetail/' + event.id]).then(res => {
            this.loading.hide();
        });
    }

    // 新增跳转 <!--[createButton]="true" (create)="CreatCoupon()" -->
    CreateLot(){
        this.loading.show();
        this.router.navigate(['/apps/AppletMaskList/AppletMaskAddDetail/' + AppletMaskParameter.POPUP_ADD]).then(res => {
            this.loading.hide();
        });
    }



    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }


}

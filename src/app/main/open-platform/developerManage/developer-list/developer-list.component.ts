import {Component, OnDestroy, OnInit} from '@angular/core';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Utils} from '../../../../services/utils';
import {HttpClient} from '@angular/common/http';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {OpenCenterService} from '../../openCenterService/open-center.service';

@Component({
    selector: 'app-developer-list',
    templateUrl: './developer-list.component.html',
    styleUrls: ['./developer-list.component.scss']
})
export class DeveloperListComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject();
    rows = [];
    columns = [];
    page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};
    filter = [];
    listType = 'developerList';
    createButton = false;

    constructor(
        private snackBar: MatSnackBar,
        private translate: TranslateService,
        private router: Router,
        private utils: Utils,
        private http: HttpClient,
        private loading: FuseProgressBarService,
        private dateTransform: NewDateTransformPipe,
        private openCenterService: OpenCenterService,
        private notify: NotifyAsynService,
        private routeInfo: ActivatedRoute,
    ) {
    }

    ngOnInit() {
        this.getColumns();
        this.routeInfo.data.pipe(takeUntil(this._unsubscribeAll)).subscribe(
            data => {
                const type = data.operation;
                this.listType = type;
                if (type === 'examine') {
                    this.createButton = false;
                }
            }
        );
        this.initSearch();
    }


    // 获取表头和显示key
    getColumns() {
        this.columns = [
            {name: 'name', translate: 'open.developer.name', type: '', value: ''},
            {name: 'username', translate: 'open.developer.username', type: '', value: ''},
            {name: 'companyName', translate: 'open.developer.companyName', type: '', value: ''},
            {
                name: 'reviewResult', translate: 'open.developer.reviewStatus', type: '', value: '', needTranslate: true ,
                options: [
                    {translate: 'open.developer.AUDIT', value: false + '&reviewStatus.equals=false'}, // 待审核
                    {translate: 'open.developer.REJECTED', value: false + '&reviewStatus.equals=true'}, // 已驳回
                    {translate: 'open.developer.CERTIFIED', value:  true + '&reviewStatus.equals=true'} // 已认证
                ]
            },
            {name: 'lastModifiedBy', translate: 'open.developer.lastModifiedBy', type: '', value: ''},
            {name: 'lastModifiedDate', translate: 'open.developer.lastModifiedDate', type: '', value: ''},
        ];
    }

    // 初始化列表数据
    initSearch() {
        this.loading.show();
        if (this.listType === 'examine') {
            this.filter.push({name: 'reviewResult', value:  false + '&reviewStatus.equals=false'});
        }
        this.openCenterService.getAttestReview(this.page.page, this.page.size, this.page.sort , null , this.filter).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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
        this.openCenterService.getAttestReview(this.page.page, this.page.size, this.page.sort, multiSearch  , this.filter).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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

    setStatus(param){
        for (let i = 0; i < param.length; i++){
            const p = param[i];
            if (p['reviewStatus'] === true) {
                // 已经审核
                if (p['reviewResult'] === true) {
                    p['reviewResult'] = 'CERTIFIED'; // '已认证';
                } else {
                    p['reviewResult'] =  'REJECTED' ; // '已驳回';
                }
            } else {
                // 未审核
                p['reviewResult'] = 'AUDIT'; // '待审核';
            }

        }
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
        const p =  event.companyName + '&' + event.licenseId + '&'  + event.licenseImageId + '&' + event.email
                   + '&' + event.name + '&' + event.username + '&' + event.reviewStatus + '&' + event.reviewResult;

        if (this.listType === 'examine'){
            this.router.navigate(['/open/developerExamineList/examine/' + p]).then(res => {
                this.loading.hide();
            });
        } else {
            this.router.navigate(['/open/developerList/edit/' + p]).then(res => {
                this.loading.hide();
            });
        }


    }



    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}

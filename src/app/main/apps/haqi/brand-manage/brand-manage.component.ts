import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {takeUntil} from 'rxjs/operators';
import {BrandManageService} from './brand-manage.service';

@Component({
    selector: 'app-brand-manage',
    templateUrl: './brand-manage.component.html',
    styleUrls: ['./brand-manage.component.scss']
})
export class BrandManageComponent implements OnInit, OnDestroy {

    private _unsubscribeAll: Subject<any> = new Subject();
    rows = [];
    columns = [];
    page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};

    constructor(
        private snackBar: MatSnackBar,
        private translate: TranslateService,
        private router: Router,
        private loading: FuseProgressBarService,
        private notify: NotifyAsynService,
        private brandManageService: BrandManageService,
    ) {

    }

    ngOnInit(): void {
        this.getColumns();
        this.initSearch();
    }

    // 获取表头和显示key
    getColumns() {
        this.columns = [
            {name: 'id', translate: 'ID', value: ''},
            {name: 'name', translate: 'brand.name', type: 'input', value: ''}, //  品牌名称
            {name: 'english', translate: 'brand.english', value: ''}, //  英文名称
            {
                name: 'enabled', translate: 'brand.enabled', type: 'select', value: '',  //  品牌维护
                options: [
                    {translate: 'brand.normal', value: true},
                    {translate: 'brand.frozen', value: false}
                ]
            },
            {name: 'lastModifiedBy', translate: 'brand.lastModifiedBy', value: ''},  //  修改人
            {name: 'lastModifiedDate', translate: 'brand.lastModifiedDate', value: ''},   //  修改时间
        ];
    }

    // 初始化列表数据
    initSearch() {
        this.loading.show();
        this.brandManageService.multiSearchBrandLists(this.page.page, this.page.size, this.page.sort).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res['content']) {
                // this.rows = res['body']['content']; // this.transFormRes(res['body']['content']) ;
                // this.page.count = res['body']['totalElements'];
                this.rows = res['content']; // this.transFormRes(res['body']['content']) ;
                this.page.count = res['totalElements'];
                if (this.rows.length === 0) {
                    this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
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
        this.loading.show();
        const multiSearch = [];
        this.columns.forEach(column => {
            if (column.value !== '') {
                multiSearch.push({name: column.name, value: column.value, type: column.type});
            }
        });
        this.brandManageService.multiSearchBrandLists(this.page.page, this.page.size, this.page.sort, multiSearch).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                // this.rows = res['body']['content']; // this.transFormRes(res['body']['content']) ;
                // this.page.count = res['body']['totalElements'];
                this.rows = res['content']; // this.transFormRes(res['body']['content']) ;
                this.page.count = res['totalElements'];
                if (this.rows.length === 0) {
                    this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
                }
            }
            this.loading.hide();
            this.notify.onResponse.emit();
        }, error => {

        }, () => {
            this.loading.hide();
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
    getDetail(event) {
        this.loading.show();
        this.router.navigate(['/apps/brandManage/Detail/' + event.id]).then(res => {
            this.loading.hide();
        });
    }

    // 处理返回结果
    transFormRes(res) {
        for (let j = 0; j < res.length; j++) {
            res[j]['labelNames'] = '';
            if (res[j]['labels'] && res[j]['labels'].length !== 0) {
                for (let i = 0; i < res[j]['labels'].length; i++) {
                    if (i < res[j]['labels'].length - 1) {
                        res[j]['labelNames'] += res[j]['labels'][i]['name'] + ',';
                    } else {
                        res[j]['labelNames'] += res[j]['labels'][i]['name'];
                    }
                }
            }
        }
        return res;
    }


    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // 跳转套新增页面
    createBrand() {
        this.loading.show();
        this.router.navigate(['/apps/brandManage/create']).then(res => {
            this.loading.hide();
        });
    }

}

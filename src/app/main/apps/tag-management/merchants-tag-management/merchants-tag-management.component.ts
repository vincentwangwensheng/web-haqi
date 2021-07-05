import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {TagManagementService} from '../../../../services/tagManagementService/tag-management.service';
import {fuseAnimations} from '../../../../../@fuse/animations';

@Component({
    selector: 'app-merchants-tag-management',
    templateUrl: './merchants-tag-management.component.html',
    styleUrls: ['./merchants-tag-management.component.scss'],
    animations: fuseAnimations
})
export class MerchantsTagManagementComponent implements OnInit, OnDestroy {
    /** 浮动模式选择标签*/
    @Input()
    selectedRows = [];
    @Input()
    overPanel = false;
    @Output()
    dataSelect: EventEmitter<any> = new EventEmitter();
    @Input()
    showButton = true;
    @Input()
    checkbox = false;
    @Input()
    tagType: 'MEMBER' | 'ACTIVITY' | 'STORE' | '' = ''; // 悬浮时的筛选条件
    filter = [];
    @Input()
    isCustomTag = false;


    private _unsubscribeAll: Subject<any> = new Subject();
    rows = [];
    columns = [];
    page = {page: 0, size: 10, count: 0, sort: 'id,desc'};

    currentProject = '';

    TagFact = ''; // 事实标签
    TagModel = ''; // 模型标签
    TagForecast = ''; // 预测标签
    constructor(
        private snackBar: MatSnackBar,
        private translate: TranslateService,
        private router: Router,
        private loading: FuseProgressBarService,
        private tagManagementService: TagManagementService,
        private notify: NotifyAsynService,
    ) {
        if (localStorage.getItem('currentProject')) {
            this.currentProject = localStorage.getItem('currentProject');
        }
    }

    ngOnInit() {
        this.TagFact     = this.translate.instant('TagManagement.MerchantsTagManagement.Fact'); // 事实标签
        this.TagModel    = this.translate.instant('TagManagement.MerchantsTagManagement.Model'); // 模型标签
        this.TagForecast = this.translate.instant('TagManagement.MerchantsTagManagement.Forecast'); // 预测标签

        this.getColumns();
        setTimeout(() => {
            this.initSearch();
        });
    }

    onSelect(event) {
        this.dataSelect.emit(event);
    }


    getColumns() {
        this.columns = [
            {name: 'tagName', translate: 'TagManagement.MerchantsTagManagement.name', type: 'input', value: ''},
            /*{name: 'storeNumber', translate: 'TagManagement.MerchantsTagManagement.storeNumber', type: '', value: ''},*/
            {
                name: 'firstLevel',
                translate: 'TagManagement.MerchantsTagManagement.firstLevel',
                type: 'select',
                value: '',
                options: [
                    {translate: 'TagManagement.MerchantsTagManagement.Fact',     value: this.TagFact},
                    {translate: 'TagManagement.MerchantsTagManagement.Model',    value: this.TagModel},
                    {translate: 'TagManagement.MerchantsTagManagement.Forecast', value: this.TagForecast},
                    {translate: '自定义标签', value: '自定义标签'}
                ]
            },
            {name: 'secondLevel', translate: 'TagManagement.MerchantsTagManagement.secondLevel', type: '', value: ''},
            {name: 'tagRemarks', translate: 'TagManagement.MerchantsTagManagement.tagRemarks', value: ''},
            {
                name: 'tagType',
                needTranslateProject: true,
                translate: 'TagManagement.MerchantsTagManagement.tagType',
                type: 'select',
                options: [
                    {translate: this.currentProject + '.MEMBER', value: 'MEMBER'},
                    {translate: this.currentProject + '.ACTIVITY', value: 'ACTIVITY'},
                    {translate: this.currentProject + '.STORE', value: 'STORE'}
                ],
                value: ''
            },
            {name: 'createdBy', translate: 'TagManagement.MerchantsTagManagement.createdBy', type: '', value: ''},
            {name: 'createdDate', translate: 'TagManagement.MerchantsTagManagement.createdDate', value: ''},
            {name: 'lastModifiedBy', translate: 'TagManagement.MerchantsTagManagement.lastModifiedBy', value: ''},
            {
                name: 'lastModifiedDate',
                translate: 'TagManagement.MerchantsTagManagement.lastModifiedDate',
                type: '',
                value: ''
            },
        ];
        if (this.tagType) { // 去除类型选择
            this.columns = this.columns.filter(item => item.name !== 'tagType');
        }
        if (this.isCustomTag){ // 去除以及标签筛选
            this.columns.forEach(item => {
                if (item.name === 'firstLevel'){
                    item.type = '';
                }
            });
        }
    }

    initSearch() {
        this.loading.show();
        if (this.tagType) {
            this.filter = [{name: 'tagType', value: this.tagType}];
        }
        if (this.isCustomTag){
            this.filter = [{name: 'firstLevel', value: '自定义标签'}, {name: 'secondLevel', value: '自定义标签'}];
        }
        this.tagManagementService.searchTagList(this.page.page, this.page.size, this.page.sort, null, this.filter).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                // this.rows = res['body'];
                // this.page.count = res['headers'].get('X-Total-Count');
                this.rows = res;
                this.page.count = 1;
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
            if (column.value !== '') {
                multiSearch.push({name: column.name, value: column.value, type: column.type});
            }
        });
        if (this.isCustomTag){
            this.filter = [{name: 'firstLevel', value: '自定义标签'}, {name: 'secondLevel', value: '自定义标签'}];
        }
        this.tagManagementService.searchTagList(this.page.page, this.page.size, this.page.sort, multiSearch, this.filter).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                // this.rows = res['body'];
                // this.page.count = res['headers'].get('X-Total-Count');
                this.rows = res;
                this.page.count = 1;
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
    getDetail(event) {
        this.loading.show();
        this.router.navigate(['/apps/MerchantsTagManagement/TagDetailManagement/' + event.id]).then(res => {
            this.loading.hide();
        });
    }

    // 跳转到创建新标签页面
    createTag() {
        this.router.navigate(['/apps/MerchantsTagManagement/createMerchantsTag']).then();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}

import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../services/notify-asyn.service';
import {PassengersManageService} from '../../../services/passengersManageService/passengers-manage.service';
import {NewDateTransformPipe} from '../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {takeUntil} from 'rxjs/operators';
import {MessageTemplateService} from './message-template.service';
import {StoreManageService} from '../store-mange/store.manage.service';

@Component({
    selector: 'app-message-template',
    templateUrl: './message-template.component.html',
    styleUrls: ['./message-template.component.scss']
})
export class MessageTemplateComponent implements OnInit, OnDestroy {

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


    private _unsubscribeAll: Subject<any> = new Subject();
    rows = [];
    columns = [];
    page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};

    constructor(
        private snackBar: MatSnackBar,
        private translate: TranslateService,
        private router: Router,
        private loading: FuseProgressBarService,
        private merchantService: StoreManageService,
        private notify: NotifyAsynService,
        private passengersManageService: PassengersManageService,
        private newDateTransformPipe: NewDateTransformPipe,
        private messageTemplateService: MessageTemplateService,
    ) {

    }

    ngOnInit(): void {
        this.getColumns();
        setTimeout(() => {
            this.initSearch();
        });
    }

    onSelect(event) {
        this.dataSelect.emit(event);
    }

    // 获取表头和显示key
    getColumns() {
        const support1 = this.translate.instant('messageTemplate.Support1'); // 国都互联
        const support2 = this.translate.instant('messageTemplate.SupportKC'); // 科传
        const MarketingSMS = this.translate.instant('messageTemplate.MarketingSMS'); // 营销短信
        const SystemNotification = this.translate.instant('messageTemplate.SystemNotification'); // 系统通知
        const AbnormalAlarm = this.translate.instant('messageTemplate.AbnormalAlarm'); // 异常报警
        this.columns = [
            {name: 'messageTemplateName', translate: 'messageTemplate.Name', type: 'input', value: ''}, // 模板名称
            {
                name: 'messageSendSupport', translate: 'messageTemplate.SendSupport', value: '', type: 'select', options: [
                    {translate: 'messageTemplate.Support1', value: support1}, // 国都互联
                    {translate: 'messageTemplate.SupportKC', value: support2} // 科传
                ]
            },
            {
                name: 'messageTemplateType', translate: 'messageTemplate.Type', value: '', type: 'select', options: [ // 模板类型
                    {translate: 'messageTemplate.MarketingSMS', value: MarketingSMS}, // 营销短信
                    {translate: 'messageTemplate.SystemNotification', value: SystemNotification}, // 系统通知
                    {translate: 'messageTemplate.AbnormalAlarm', value: AbnormalAlarm}, // 异常报警
                ]
            },
            {name: 'messageTemplateContent', translate: 'messageTemplate.Content', value: ''}, // 模板内容
            {
                name: 'templateStatus', translate: 'messageTemplate.Status', value: '', type: 'select', options: [ // 状态
                    {translate: 'messageTemplate.NORMAL', value: 'NORMAL'}, // 正常
                    {translate: 'messageTemplate.FROZEN', value: 'FROZEN'} // 冻结
                ]
            },
            {name: 'lastModifiedBy', translate: 'messageTemplate.lastModifiedBy', value: ''}, // 修改人
            {name: 'lastModifiedDate', translate: 'messageTemplate.lastModifiedDate', value: ''}, //  修改时间

        ];
    }

    // 初始化列表数据
    initSearch() {

        this.loading.show();
        this.messageTemplateService.searchArticleList(this.page.page, this.page.size, this.page.sort).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res['body']) {
                this.parseStatus(res['body']);
                this.rows = res['body'];
                this.page.count = parseInt(res.headers.get('X-Total-Count'), 10);
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
        this.messageTemplateService.searchArticleList(this.page.page, this.page.size, this.page.sort, multiSearch).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res['body']) {
                this.rows = res['body'];
                this.parseStatus(res['body']);
                this.page.count = parseInt(res.headers.get('X-Total-Count'), 10);
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
        this.router.navigate(['/apps/messageTemplate/edit/' + event.id]).then(res => {
            this.loading.hide();
        });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // 跳转套新增页面
    createActivity() {
        this.loading.show();
        this.router.navigate(['/apps/messageTemplate/add']).then(res => {
            this.loading.hide();
        });
    }

// 处理模板状态
    parseStatus(param) {
        for (let i = 0; i < param.length; i++) {
            if (param[i]['templateStatus'] === 'NORMAL') {
                param[i]['templateStatus'] = this.translate.instant('messageTemplate.NORMAL'); // 正常
            } else if (param[i]['templateStatus'] === 'FROZEN') {
                param[i]['templateStatus'] = this.translate.instant('messageTemplate.FROZEN'); // 冻结
            }
        }
    }

}

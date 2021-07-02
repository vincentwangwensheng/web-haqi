import {Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {AppointmentService} from '../appointment-service/appointment.service';
import {MatDialog, MatSnackBar} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {TranslateService} from '@ngx-translate/core';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {Utils} from '../../../../services/utils';


/** 事件列表 **/
@Component({
    selector: 'app-appointment',
    templateUrl: './appointment.component.html',
    styleUrls: ['./appointment.component.scss']
})
export class AppointmentComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject();
    rows = [];
    columns = [];
    page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};
    ground: string;
    se: string;
    active: string;
    tlKey = '';
    IncidentType = []; // 类型
    IncidentTypeSource = []; //

    constructor(
        private snackBar: MatSnackBar,
        private translate: TranslateService,
        private routeInfo: ActivatedRoute,
        private router: Router,
        public  dialog: MatDialog,
        private loading: FuseProgressBarService,
        private notify: NotifyAsynService,
        private dateTransform: NewDateTransformPipe,
        private document: ElementRef,
        private utils: Utils,
        private appointmentService: AppointmentService
    ) {

        if (localStorage.getItem('currentProject')) {
            this.tlKey = localStorage.getItem('currentProject');
        }
    }

    ngOnInit() {

        this.ground = this.translate.instant('appointment.list.' + this.tlKey + '.ground');
        this.se = this.translate.instant('appointment.list.' + this.tlKey + '.se');
        this.active = this.translate.instant('appointment.list.' + this.tlKey + '.activity');
        this.getColumns();
        this.getIncidentType().then( (res) => {
            res.forEach(r => {
                this.IncidentType.push({translate: r.value, value: r.key});
            });
            this.IncidentTypeSource = res;
        }).finally( () => {
            this.initSearch();
        });
    }


    getIncidentType() {
        return new Promise<any>((resolve, reject) => {
            this.appointmentService.getIncidentType().pipe(takeUntil(this._unsubscribeAll)).subscribe(
                res => {
                    resolve(res);
                },
                error1 => {  reject(error1); }
            );
        });
    }


    // 获取表头和显示key
    getColumns() {
        this.columns = [
            {
                name: 'incidentName',
                translate: 'appointment.list.' + this.tlKey + '.incidentName',
                type: 'input',
                value: ''
            },
            {
                name: 'type', translate: 'appointment.list.' + this.tlKey + '.type', type: 'select', value: '',
                options: this.IncidentType,
            },
            {name: 'desc', translate: 'appointment.list.' + this.tlKey + '.desc', type: '', value: ''},
            {name: 'automatic', translate: 'appointment.list.' + this.tlKey + '.automatic', type: '', value: ''},
            {name: 'enabled', translate: 'appointment.list.' + this.tlKey + '.enabled', type: 'select', value: '' ,
                options: [
                    {translate: this.translate.instant('appointment.CRUD.' + this.tlKey + '.normal') , value: true},
                    {translate: this.translate.instant('appointment.CRUD.' + this.tlKey + '.frozen') , value: false}
                ]
            },
            {
                name: 'validity',
                translate: 'appointment.list.' + this.tlKey + '.validity',
                type: '',
                value: '',
                sort: false
            },
            {
                name: 'lastModifiedBy',
                translate: 'appointment.list.' + this.tlKey + '.lastModifiedBy',
                type: '',
                value: ''
            },
            {
                name: 'lastModifiedDate',
                translate: 'appointment.list.' + this.tlKey + '.lastModifiedDate',
                type: '',
                value: ''
            },
        ];
    }

    // 初始化列表数据
    initSearch() {
        this.loading.show();
        this.appointmentService.getIncidentList(this.page.page, this.page.size, this.page.sort).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                const content = res.body.content;
                content.forEach(r => {
                    const beTime = this.dateTransform.transform(r.beginTime);
                    const endTime = this.dateTransform.transform(r.endTime);
                    r['validity'] = beTime + ' - ' + endTime;
                    this.IncidentTypeSource.forEach(s => {
                        if (r.type === s.key) {
                            r.type = s.value;
                        }
                    });
                });

                this.rows = content;
                this.page.count = res.body.totalElements;
                this.notify.onResponse.emit(); // 拿到大小时 流程完成发射事件
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
        this.appointmentService.getIncidentList(this.page.page, this.page.size, this.page.sort, multiSearch).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                const content = res.body.content;
                content.forEach(r => {
                    r['validity'] = this.dateTransform.transform(r.beginTime) + ' - ' + this.dateTransform.transform(r.endTime);
                    this.IncidentTypeSource.forEach(s => {
                        if (r.type === s.key) {
                            r.type = s.value;
                        }
                    });
                });
                this.rows = content;
                this.page.count = res.body.totalElements;
                this.notify.onResponse.emit(); // 拿到大小时 流程完成发射事件
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
        this.router.navigate(['/apps/appointmentList/edit/' + event.id]).then(res => {
            this.loading.hide();
        });
    }


    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}

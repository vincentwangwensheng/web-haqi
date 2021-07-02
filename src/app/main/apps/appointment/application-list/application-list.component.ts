import {Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {Utils} from '../../../../services/utils';
import {MatDialog, MatSnackBar} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {AppointmentService} from '../appointment-service/appointment.service';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {TranslateService} from '@ngx-translate/core';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {takeUntil} from 'rxjs/operators';
import {fuseAnimations} from '../../../../../@fuse/animations';

@Component({
    selector: 'app-application-list',
    templateUrl: './application-list.component.html',
    styleUrls: ['./application-list.component.scss'] ,
    animations: fuseAnimations
})

/** 申请列表 **/
export class ApplicationListComponent implements OnInit, OnDestroy {
    @ViewChild('applicationDetailTe', {static: true}) applicationDetailTe: TemplateRef<any>;
    private _unsubscribeAll: Subject<any> = new Subject();

    applyId: string;
    rows = [];
    columns = [];
    page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};
    applyStatus = [];
    applyStatusSource = [];
    tlKey = ''; // 环境
    IncidentType = []; // 类型
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
        this.getColumns();
        this.getApplyStatus().then(res => {
            res.forEach(r => {
                this.applyStatus.push({translate: 'appointment.apply.' + this.tlKey + '.' + r.key , value: r.key});
            });
            this.applyStatusSource = res;
            // return  new Promise<any>((resolve, reject) => {
            //     resolve('111'); 如果这里返回一个 new Promise 将在下一个then里面收到值
            // });
        }).then( (p) => {
            // console.log(p , '----'); 上一个then返回的  resolve('111');
            this.getIncidentType().then((res1) => {
                res1.forEach(r => {
                    this.IncidentType.push({translate: r.value, value: r.key});
                });
            });
        }).finally( () => {
            this.initSearch();
        });

    }


    // 类型
    getIncidentType() {
        return  new Promise<any>((resolve, reject) => {
            this.appointmentService.getIncidentType().pipe(takeUntil(this._unsubscribeAll)).subscribe(
                res => {
                    resolve(res);
                },
                error1 => { reject(error1); }
            );
        });
    }

    getApplyStatus() {
        return  new Promise<any>((resolve, reject) => {
            this.appointmentService.getApplyStatus().pipe(takeUntil(this._unsubscribeAll)).subscribe(
                res => {
                    resolve(res);
                },
                error1 => { reject(error1); }
            );
        });
    }

    // 获取表头和显示key
    getColumns() {
        this.columns = [
            {name: 'applyMobile', translate: 'appointment.apply.' + this.tlKey + '.applyMobile', type: 'input', value: ''},
            {name: 'incidentName', translate: 'appointment.apply.' + this.tlKey + '.incidentName', type: '', value: ''},
            {name: 'type', translate: 'appointment.apply.' + this.tlKey + '.type', type: 'select', value: '' , options: this.IncidentType},
            {name: 'automatic', translate: 'appointment.apply.' + this.tlKey + '.automatic', type: '', value: ''},
            {name: 'remainCount', translate: 'appointment.apply.' + this.tlKey + '.remainCount', type: '', value: ''},
            {name: 'validity', translate: 'appointment.apply.' + this.tlKey + '.validity', type: '', value: '', sort: false},
            {
                name: 'status',
                translate: 'appointment.apply.' + this.tlKey + '.status',
                type: 'select',
                value: '',
                options: this.applyStatus
            },
            {name: 'createdBy', translate: '创建人', value: ''},
            {name: 'createdDate', translate: '创建时间', value: ''},
            {name: 'lastModifiedBy', translate: 'appointment.apply.'   + this.tlKey +  '.lastModifiedBy', type: '', value: ''},
            {name: 'lastModifiedDate', translate: 'appointment.apply.' + this.tlKey +  '.lastModifiedDate', type: '', value: ''},
        ];
    }

    // 初始化列表数据
    initSearch() {
        this.loading.show();
        this.appointmentService.getApplyList(this.page.page, this.page.size, this.page.sort).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                const content = res.body.content;
                content.forEach(c => {
                    c['validity'] = this.dateTransform.transform(c.beginTime) + '-' + this.dateTransform.transform(c.endTime);
                    this.applyStatusSource.forEach(s => {
                        if (c.status === s.key) {
                            c.status = s.value;
                        }
                    });
                    this.IncidentType.forEach( r => {
                        if (r.value === c.type) {
                            c.type = r.translate;
                        }
                    });

                    if (c['remainCount'] === -1){
                        c.remainCount = '无限制';
                    }
                    if (c['remainCount'] < -1) {
                        c.remainCount = '数据异常';
                    }
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
        this.appointmentService.getApplyList(this.page.page, this.page.size, this.page.sort, multiSearch).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                const content = res.body.content;
                content.forEach(c => {
                    c['validity'] = this.dateTransform.transform(c.beginTime) + '-' + this.dateTransform.transform(c.endTime);
                    this.applyStatusSource.forEach(s => {
                        if (c.status === s.key) {
                            c.status = s.value;
                        }
                    });
                    this.IncidentType.forEach( r => {
                        if (r.value === c.type) {
                            c.type = r.translate;
                        }
                    });


                    if (c['remainCount'] === -1){
                        c['remainCount'] = this.translate.instant('appointment.CRUD.noLimit'); //  '无限制';
                    }
                    if (c['remainCount'] < -1) {
                        c.remainCount = this.translate.instant('appointment.CRUD.dataError'); // '数据异常';
                    }

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
        if (event) {
            this.applyId = event.id;
        }
        if (!this.dialog.getDialogById('applicationDetailTeClass')) {
            this.dialog.open(this.applicationDetailTe, {
                id: 'applicationDetailTeClass',
                width: '570px',
                height: '430px' ,
                hasBackdrop: true
            }).afterClosed().subscribe(res => {
                setTimeout(() => {
                    this.onSearch();
                } , 500);
            });
        }
    }


    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}

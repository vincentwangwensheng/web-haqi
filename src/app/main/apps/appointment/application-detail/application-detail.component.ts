import {Component, ElementRef, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {takeUntil} from 'rxjs/operators';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {MatDialog, MatSnackBar} from '@angular/material';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {TranslateService} from '@ngx-translate/core';
import {Utils} from '../../../../services/utils';
import {AppointmentService} from '../appointment-service/appointment.service';
import {CurrencyPipe} from '@angular/common';
import {Subject} from 'rxjs';
import {AppointmentPara} from '../appointment-service/AppointmentPara';
import {fuseAnimations} from '../../../../../@fuse/animations';
import {InjectConfirmDialogComponent} from '../../../../components/inject-confirm-dialog/inject-confirm-dialog.component';

@Component({
    selector: 'app-application-detail',
    templateUrl: './application-detail.component.html',
    styleUrls: ['./application-detail.component.scss'],
    animations: fuseAnimations
})

/** 申请详情 **/
export class ApplicationDetailComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject();
    options: FormGroup;

    @Input()
    applyId: string;

    applySource: any ; // 当前页显示的数据

    statusAudit: any; // 默认待确认状态
    status: any;
    remainCountHas = true;

    applyStatus = [];  // 状态集合

    tlKey = ''; // 环境

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
        private currency: CurrencyPipe,
        private appointmentService: AppointmentService
    ) {
        this.options = new FormBuilder().group({
            reject: new FormControl({value: '', disabled: false}, [Validators.required]),
        });

        if (localStorage.getItem('currentProject')) {
            this.tlKey = localStorage.getItem('currentProject');
        }
    }

    //   id: 0,
    //             applyId: '',  // 申请编号
    //             applyMobile: '', // 申请人 （电话）
    //             applyName: '',  // 申请人 昵称
    //             automatic: false, // 自动确认
    //             beginTime: '',
    //             endTime: '',
    //             incidentId: '',  // 申请事件编号
    //             incidentName: '',  // 申请事件名称
    //             type: '', // 事件类型
    //             reject: '',  // 驳回理由
    //             status: '',  // 状态
    //             enabled: '', // 是否有效
    //             createdBy: '',
    //             createdDate: '',
    //             lastModifiedBy: '',
    //             lastModifiedDate: '',
    ngOnInit() {
        this.applySource = [];
        this.statusAudit = AppointmentPara.AUDIT;
        this.status = AppointmentPara.OVERDUE;
        this.getApplyStatus();
    }


    getApplyById() {
        this.appointmentService.getApplyById(this.applyId).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {

                if (Number(res.remainCount) === 0) {
                    this.remainCountHas = true;
                } else {
                    this.remainCountHas = false;
                }

                if (res.status !== AppointmentPara.AUDIT) {
                    this.options.disable();
                }

                this.applyStatus.forEach(r => {
                    if (r.key === res.status) {
                        this.status = r.key;
                        res.status = r.value;
                    }
                });
                this.applySource = res;

                this.options.patchValue(res);

            }
        );
    }


    upConfirm() {
        // 确认
        const rowContent = this.options.getRawValue();
        this.applySource.reject = rowContent.reject;
        this.applySource.status = AppointmentPara.CONFIRM;
        this.appointmentService.applies(this.applySource).pipe().subscribe(
            res => {
                this.snackBar.open(this.translate.instant('appointment.apply.' + this.tlKey + '.tips1'), '✖'); // 确认成功！！！
            }
        );
    }

    upReject() {
        // 驳回
        const rowContent = this.options.getRawValue();
        this.applySource.reject = rowContent.reject;
        this.applySource.status = AppointmentPara.REJECTED;
        this.appointmentService.applies(this.applySource).pipe().subscribe(
            res => {
                this.snackBar.open(this.translate.instant('appointment.apply.' + this.tlKey + '.tips2'), '✖'); // 驳回成功！！！
            }
        );
    }

    // 履约
    toPerformance(){
        this.dialog.open(InjectConfirmDialogComponent, {
            id: 'del', width: '400px', data: {
                title: '提示',
                content: '请确认是否履约',
                cancelButton: true
            }
        }).afterClosed().subscribe( res => {
            if (res) {
                this.appointmentService.performance(this.applySource.applyId , this.applySource.applyMobile).pipe().subscribe(
                    res_ => {
                        this.snackBar.open(this.translate.instant('appointment.apply.' + this.tlKey + '.tips3'), '✖'); // 驳回成功！！！
                        document.getElementById('dialog_close').click();
                    }
                );
            }
        });

    }


    getApplyStatus() {
        this.appointmentService.getApplyStatus().pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                this.applyStatus = res;
                this.getApplyById();
            }
        );
    }


    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}

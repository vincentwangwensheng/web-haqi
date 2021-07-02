import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog, MatSnackBar} from '@angular/material';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {HttpClient} from '@angular/common/http';
import {TranslateService} from '@ngx-translate/core';
import {Utils} from '../../../../services/utils';
import {DomSanitizer} from '@angular/platform-browser';
import {OpenCenterService} from '../../openCenterService/open-center.service';
import {CurrencyPipe} from '@angular/common';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {fuseAnimations} from '../../../../../@fuse/animations/index';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-developer-data',
    templateUrl: './developer-data.component.html',
    styleUrls: ['./developer-data.component.scss'],
    animations: fuseAnimations
})
export class DeveloperDataComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject();

    title = '开发者资料';  // 标题

    dataForm: any;

    Authed = ''; // 判断是否已经认证 error是没有认证   wait待审核   auth 已认证  sum 审核未通过

    personalData = [];
    constructor(
        private routeInfo: ActivatedRoute,
        private router: Router,
        private http: HttpClient,
        public dialog: MatDialog,
        private utils: Utils,
        private translate: TranslateService,
        private dateTransform: NewDateTransformPipe,
        private snackBar: MatSnackBar,
        private sanitizer: DomSanitizer,
        private loading: FuseProgressBarService,
        private openCenterService: OpenCenterService,
        private currency: CurrencyPipe
    ) {
        this.dataForm = new FormBuilder().group({
            type: new FormControl({value: '1', disabled: false}, [Validators.required]),  // 评论编号
        });
    }

    ngOnInit() {
        this.attestDetail();
    }

    // 获取有无认证信息
    attestDetail() {
        this.openCenterService.attestDetail().pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                this.personalData = res;
                if (!res.reviewStatus) {
                    this.Authed = 'wait';
                } else {
                    if (res.reviewResult) {
                        this.Authed = 'auth';
                    } else {
                        this.Authed = 'sum';
                    }
                }
            },
            error1 => {
                this.snackBar.open('认证后才能查看资料~', '✖');
                this.Authed = 'error';
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}

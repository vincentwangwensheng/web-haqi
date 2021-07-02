import {Component, HostListener, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {fuseAnimations} from '../../../../@fuse/animations';
import {MatDialog, MatSnackBar} from '@angular/material';
import {ECouponServiceService} from '../../../services/EcouponService/ecoupon-service.service';
import {FuseProgressBarService} from '../../../../@fuse/components/progress-bar/progress-bar.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {NotifyAsynService} from '../../../services/notify-asyn.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-coupon-reissue',
    templateUrl: './coupon-reissue.component.html',
    styleUrls: ['./coupon-reissue.component.scss'],
    animations: fuseAnimations
})
export class CouponReissueComponent implements OnInit, OnDestroy {
    private _unsubscribeAll = new Subject();
    responsive = false;
    currentMember = null;
    selectedMember = null;

    currentCoupon = null;
    selectedCoupon = null;

    currentActivity = null;
    selectedActivity = null;

    buttonDisabled = false;

    rows = [];
    columns = [];
    page = {page: 0, size: 8, count: 0, sort: 'lastModifiedDate,desc'};


    constructor(
        private dialog: MatDialog,
        private loading: FuseProgressBarService,
        private snackBar: MatSnackBar,
        private notify: NotifyAsynService,
        private translate: TranslateService,
        private couponService: ECouponServiceService
    ) {
        this.responsive = window.innerWidth <= 959;

    }

    ngOnInit() {
        this.getColumns();
        this.initSearch();
    }

    @HostListener('window:resize', ['$event.target.innerWidth'])
    windowResize(event) {
        this.responsive = event <= 959;
        this.initSearch();
    }

    removeMember() {
        this.currentMember = null;
    }

    removeCoupon() {
        this.currentCoupon = null;
    }

    // 选择补发对象
    openMemberSelect(memberTemplate) {
        this.selectedMember = this.currentMember;
        this.dialog.open(memberTemplate, {id: 'memberSelect', width: '80%'}).afterClosed().subscribe(res => {
            if (res) {
                this.currentMember = this.selectedMember;
            } else {
                this.selectedMember = null;
            }
        });
    }

    openCouponSelect(couponTemplate) {
        this.selectedCoupon = this.currentCoupon;
        this.dialog.open(couponTemplate, {id: 'couponSelect', width: '80%'}).afterClosed().subscribe(res => {
            if (res) {
                this.currentCoupon = this.selectedCoupon;
            } else {
                this.selectedCoupon = null;
            }
        });
    }

    /** 选择营销活动，可选*/
    openActivity(activities: TemplateRef<any>) {
        this.selectedActivity = this.currentActivity;
        this.dialog.open(activities, {id: 'activity', width: '80%'}).afterClosed().subscribe(res => {
            if (res) {
                this.currentActivity = this.selectedActivity;
            } else {
                this.selectedActivity = null;
            }
        });

    }

    onActivitySelect(event) {
        this.selectedActivity = event;
    }

    onMemberSelect(event) {
        this.selectedMember = event;
    }

    onCouponSelect(event) {
        this.selectedCoupon = event;
    }

    // 发放
    reissue() {
        this.loading.show();
        this.buttonDisabled = true;
        this.couponService.pickupManual(this.currentCoupon.number, this.currentMember.mobile, this.currentActivity).subscribe(res => {

            let message = '成功为手机号为 “' + this.currentMember.mobile + '” 的常旅客会员补发了 “' + this.currentCoupon.name + '” 电子券！';
            if (this.currentActivity) {
                message = '在 “' + this.currentActivity.name + '” 活动中' + message;
            }
            this.snackBar.open(message);
            this.onSearch();
            this.loading.hide();
            this.buttonDisabled = false;
        }, error1 => {
            this.loading.hide();
            this.buttonDisabled = false;
        });
    }

    getColumns() {
        this.columns = [
            {name: 'mobile', translate: '手机号', value: ''},
            {name: 'name', translate: '电子券名称', value: '', sort: false, type: 'input', source: 'coupon'},
            {name: 'code', translate: '核销编码', value: '', sort: false},
            {name: 'createdBy', translate: '操作人', value: '', source: 'code'},
            {name: 'createdDate', translate: '操作时间', value: '', source: 'code', type: 'date'}
        ];
    }

    initSearch() {
        this.loading.show();
        this.couponService.getReissueHistory(this.page.page, this.page.size, this.page.sort).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.rows = [];
            const list = res.body;
            if (list && list.length > 0) {
                list.forEach(data => {
                    const code = data['code'];
                    const coupon = data['coupon'];
                    Object.assign(coupon, code);
                    this.rows.push(coupon);
                });
            }
            this.page.count = Number(res.headers.get('X-Total-Count'));
            if (this.rows.length === 0) {
                this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
            }
            this.notify.onResponse.emit();
            this.loading.hide();
        }, error1 => {
            this.loading.hide();
            this.notify.onResponse.emit();
        });
    }

    onSearch() {
        this.loading.show();
        const multiSearch = [];
        this.columns.forEach(column => {
            if (column.value !== '') {
                if (column.source) { // 拼接特殊字段查询code.xxx.contains  / coupon.xxxx.contains
                    const newColumn: any = {};
                    Object.assign(newColumn, column);
                    newColumn.name = newColumn.source + '.' + newColumn.name;
                    multiSearch.push(newColumn);
                } else {
                    multiSearch.push(column);
                }
            }
        });
        this.couponService.getReissueHistory(this.page.page, this.page.size, this.page.sort, multiSearch).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.rows = [];
            const list = res.body;
            if (list && list.length > 0) {
                list.forEach(data => {
                    const code = data['code'];
                    const coupon = data['coupon'];
                    Object.assign(coupon, code);
                    this.rows.push(coupon);
                });
            }
            this.page.count = Number(res.headers.get('X-Total-Count'));
            if (this.rows.length === 0) {
                this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
            }
            this.notify.onResponse.emit();
            this.loading.hide();
        }, error1 => {
            this.loading.hide();
            this.notify.onResponse.emit();
        });

    }

    onPage(event) {
        this.page.page = event.page;
        this.onSearch();
    }

    onSort(event) {
        this.page.sort = event;
        this.onSearch();
    }


    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}

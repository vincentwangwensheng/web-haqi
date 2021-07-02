import {Component, OnInit} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {FuseProgressBarService} from '../../../../@fuse/components/progress-bar/progress-bar.service';
import {Utils} from '../../../services/utils';
import {FormControl} from '@angular/forms';
import {BusinessForecastService} from './business-forecast.service';
import {fuseAnimations} from '../../../../@fuse/animations';
import {debounceTime} from 'rxjs/operators';

@Component({
    selector: 'app-business-forecast',
    templateUrl: './business-forecast.component.html',
    styleUrls: ['./business-forecast.component.scss'],
    animations: fuseAnimations
})
export class BusinessForecastComponent implements OnInit {
    activityTypes =
        [
            {type: ActivityType.DEFAULT, translate: '一般活动'},
            {type: ActivityType.GROUP, translate: '分组活动'},
            {type: ActivityType.POINT, translate: '积分活动'},
            {type: ActivityType.GROUPBUY, translate: '团购活动'}
        ];
    activityControl = new FormControl('');
    selectedType = ActivityType.DEFAULT;
    selectedActivity: any;
    currentActivity: any;

    columns = [];

    totalReviewCoupons = []; // saiku返回的总活动券核销数据
    totalCouponSale = []; // saiku返回的活动销售金额
    totalCouponSingleSale = []; // saiku返回的券带动销售金额
    totalReviewIds = []; // 活动分析中有的活动id
    totalMembers = []; // saiku返回的客流量 活动参与人数
    emptyMsg = '未查询到已核销的历史活动数据！';

    isResult = false; // 是否计算结果

    constructor(
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private loading: FuseProgressBarService,
        private service: BusinessForecastService,
        private utils: Utils,
    ) {
    }

    ngOnInit() {
        this.getReviewActivity();
        this.getColumns();
    }

    getColumns() {
        this.columns = [
            {name: 'id', translate: 'marketingManage.tableHead.id', value: ''},
            {name: 'name', translate: 'marketingManage.tableHead.name', type: 'input', value: ''},
            {name: 'validity', translate: '有效期', value: ''},
            {
                name: 'reviewResult', translate: 'marketingManage.tableHead.newStatus', value: ''
            },
            {name: 'lastModifiedBy', translate: 'marketingManage.tableHead.lastModifiedBy', value: ''},
            {name: 'lastModifiedDate', translate: 'marketingManage.tableHead.lastModifiedDate', value: ''},
        ];
    }

    // 获取历史活动核销数据
    getReviewActivity() {
        this.service.getSaikuData('tickettypecountrate_bcia').subscribe(res => {
            this.totalReviewCoupons = res.cellset;
            this.totalReviewCoupons.forEach((item, index) => {
                if (!this.totalReviewIds.includes(item[0].value) && index > 0) {
                    this.totalReviewIds.push(item[0].value);
                }
            });
        });
        this.service.getSaikuData('ticketnetamount_bcia').subscribe(res => {
            this.totalCouponSale = res.cellset;
        });
        this.service.getSaikuData('activityticketamount_bcia').subscribe(res => {
            this.totalCouponSingleSale = res.cellset;
        });
        this.service.getSaikuData('sumactivevipcoupon_bcia').subscribe(res => {
            this.totalMembers = res.cellset;
        });
    }

    // 获取存在的活动
    getTotalReview() {
        return new Promise(resolve => {
            this.service.getSaikuData('tickettypecountrate_bcia').pipe(debounceTime(200)).subscribe(res => {
                this.totalReviewCoupons = res.cellset;
                this.totalReviewCoupons.forEach((item, index) => {
                    if (!this.totalReviewIds.includes(item[0].value) && index > 0) {
                        this.totalReviewIds.push(item[0].value);
                    }
                });
                resolve();
            });
        });
    }

    // 选择活动类型
    onSelectChange(event) {
        this.activityControl.reset();
        this.currentActivity = null;
        this.selectedType = event.value;
    }

    // 过滤整数输入
    filterInt(event, coupon, field) {
        const max = 999999999999;
        const min = 1;
        if (this.utils.isNumber(event.target.value)) {
            if (event.target.value > max) {
                event.target.value = max;
            } else if (event.target.value < min) {
                event.target.value = min;
            }
        } else {
            event.target.value = this.utils.replaceAllToNumber(event.target.value);
        }
        coupon[field] = event.target.value;
    }

    // 转化为小数百分比
    filterFloat(event, coupon, field) {
        const max = 100;
        const min = 0;
        console.log(event.target.value);
        let beforeSep = false;
        // 在%之前删除内容
        if (event.target.value.includes('%')) {
            beforeSep = true;
        }
        event.target.value = event.target.value.replace(/%/g, '');
        // 从末尾开始删除时，删除%前的数字
        if (event.target.value.length <= coupon[field].length) {
            if (!beforeSep) {
                event.target.value = event.target.value.substring(0, event.target.value.length - 1);
            }
            // 如果删除到.为最后一位，则直接删除.
            if (event.target.value && event.target.value.indexOf('.') === event.target.value.length - 1) {
                event.target.value = event.target.value.substring(0, event.target.value.length - 1);
            }
        }
        if (this.utils.isFixed2(event.target.value)) {
            if (event.target.value > max) {
                event.target.value = max;
            } else if (event.target.value < min) {
                event.target.value = min;
            }
        } else {
            event.target.value = this.utils.replaceAllToFixed2(event.target.value);
        }
        coupon[field] = event.target.value;
        if (event.target.value) {
            event.target.value = event.target.value + '%';
        }
    }

    resetRatio(ratio, coupon) {
        console.log(ratio);
        ratio.value = coupon['writeOffRatio'];
        coupon['customRatio'] = coupon['writeOffRatio'].replace('%', '');
    }

    resetIssue(issue, coupon) {
        issue.value = coupon['issue'];
        coupon['customIssue'] = coupon['issue'];
    }

    // 客流变动处理
    filterMemberFloat(event, activity, field) {
        const max = 9999999;
        const min = 0;
        if (this.utils.isFixed1(event.target.value)) {
            console.log(event.target.value);
            if (event.target.value > max) {
                event.target.value = max;
            } else if (event.target.value < min) {
                event.target.value = min;
            }
        } else {
            console.log(event.target.value);
            event.target.value = this.utils.replaceAllToFixed1(event.target.value);
        }
        activity[field] = event.target.value;
    }


    // 点击按钮
    onResultClick() {
        if (Array.isArray(this.currentActivity.coupons) && this.currentActivity.coupons.filter(item => item.checked).length > 0) {
            this.loading.show();
            setTimeout(() => {
                this.getResult();
                this.isResult = true;
                this.loading.hide();
            }, 300);
        } else if (this.currentActivity.coupons.filter(item => item.notCorrect).length > 0) {
            this.loading.show();
            setTimeout(() => {
                this.snackBar.open('当前活动和已核销活动无匹配数据，无法进行计算！');
                this.loading.hide();
            }, 300);
        }
        else {
            this.snackBar.open('请选择电子券规则后再进行计算！');
        }
    }

    // 计算结果
    getResult() {
        this.currentActivity.totalDriveAmount = 0;
        this.currentActivity.totalSaleAmount = 0;
        this.currentActivity.selectedCoupons = JSON.parse(JSON.stringify(this.currentActivity.coupons.filter(item => item.checked)));
        this.currentActivity.selectedCoupons.forEach(coupon => {
            const customDriveAmount = coupon.amount * coupon.customIssue * coupon.customRatio / 100 * coupon.driveRatio / 100 * this.currentActivity.customRatio;
            const customSaleAmount = customDriveAmount / coupon.saleRatio * 100;
            console.log(customDriveAmount);
            console.log(customSaleAmount);
            coupon.customDriveAmount = customDriveAmount.toFixed(0);
            coupon.customSaleAmount = customSaleAmount.toFixed(0);
            this.currentActivity.totalDriveAmount += customDriveAmount;
            this.currentActivity.totalSaleAmount += customSaleAmount;
        });
    }


    // 打开活动选择
    openActivitySelect(activityTemplate) {
        this.selectedActivity = this.currentActivity;
        this.loading.show();
        this.getTotalReview().then(() => {
            if (!this.dialog.getDialogById('activity')) {
                this.dialog.open(activityTemplate, {id: 'activity', width: '80%'}).afterClosed().subscribe(res => {
                    if (res) {
                        this.currentActivity = this.selectedActivity;
                        this.activityControl.setValue(this.currentActivity.name, {emitEvent: false});
                        if (this.selectedType === ActivityType.GROUP) {
                            const filter = [{name: 'activityId', value: this.currentActivity.id}];
                            this.service.getCouponGroups(0, 0x3f3f3f3f, 'lastModifiedDate,desc', null, filter).subscribe(r => {
                                this.currentActivity.coupons = [];
                                r.forEach(item => {
                                    if (item.coupons && item.coupons.length > 0) {
                                        item.coupons.forEach(coupon => {
                                            coupon.group = item.name;
                                            this.currentActivity.coupons.push(coupon);
                                        });
                                    }
                                });
                                this.getCouponSaleData();
                            });
                        } else {
                            this.getCouponSaleData();
                        }
                    } else {
                        this.selectedActivity = null;
                    }
                });
            }
        });
    }

    // 计算券销售数据
    getCouponSaleData() {
        this.currentActivity.coupons.forEach(coupon => {
            const currentActivitySale = this.totalCouponSale.find(item => Number(item[0].value) === this.currentActivity.id);
            const reviewCoupon = this.totalReviewCoupons.find(c => c[1].value === coupon.name);
            const couponSingleSale = this.totalCouponSingleSale.find(c => c[1].value === coupon.name);
            if (reviewCoupon) {
                // 单张券发放数量量
                coupon.issue = Number(reviewCoupon[3].value.replace(/,/g, ''));
                coupon['customIssue'] = coupon.issue;
                // 单张券核销数量
                coupon.writeOff = Number(reviewCoupon[4].value.replace(/,/g, ''));
                // 单张券核销比例
                coupon['customRatio'] = Number((coupon.writeOff * 100 / coupon.issue).toFixed(2));
                coupon.writeOffRatio = coupon['customRatio'] + '%';
                // 单张券促销金额
                coupon.promotionAmount = coupon.writeOff * coupon.amount;
                // 单张券销售金额  未知
                if (couponSingleSale) {
                    coupon.saleAmount = Number(couponSingleSale[2].value.replace(/,/g, ''));
                } else {
                    coupon.saleAmount = 0;
                }
                // 单张券销售金额除以促销金额---带动比
                coupon.driveRatio = Number((coupon.saleAmount * 100 / coupon.promotionAmount).toFixed(2));
                if (currentActivitySale) {
                    // 该活动总券销售金额
                    coupon.totalSale = Number(currentActivitySale[1].value.replace(/,/g, ''));
                    // 单张券占该活动比例---促销占比
                    coupon.saleRatio = Number((coupon.saleAmount * 100 / coupon.totalSale).toFixed(2));
                } else {
                    coupon.saleRatio = 0;
                    coupon.totalSale = 0;
                }
            } else {
                coupon.notCorrect = true;
            }
        });
        // 如果营销活动和分析数据匹配
        if (this.currentActivity.coupons.filter(item => !item.notCorrect).length > 0) {
            // 获取当前活动参与人数
            const currentActivityMembers = this.totalMembers.find(item => Number(item[0].value) === this.currentActivity.id);
            if (currentActivityMembers) {
                this.currentActivity.totalMembers = Number(currentActivityMembers[1].value.replace(/,/g, ''));
            } else {
                this.currentActivity.totalMembers = 0;
            }
            this.currentActivity.customRatio = '1.0';
        }
    }

    onDataSelect(data) {
        this.selectedActivity = data;
    }

}

// 活动类型
enum ActivityType {
    DEFAULT = 'DEFAULT',
    GROUP = 'GROUP',
    POINT = 'POINT',
    GROUPBUY = 'GROUPBUY'
}

import {Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {
    CouponMaintainEntity,
    ECouponServiceService,
    SystemParameter
} from '../../../../../services/EcouponService/ecoupon-service.service';
import {FuseProgressBarService} from '../../../../../../@fuse/components/progress-bar/progress-bar.service';
import {MatDialog, MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {takeUntil} from 'rxjs/operators';
import {Router} from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';
import {CouponParameter} from '../../../../../services/EcouponService/CouponParameter';
import {fuseAnimations} from '../../../../../../@fuse/animations';

@Component({
    selector: 'app-add-securities-rules',
    templateUrl: './add-securities-rules.component.html',
    styleUrls: ['./add-securities-rules.component.scss'],
    animations: fuseAnimations
})
export class AddSecuritiesRulesComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject();

    Coupon_Maintain_ID = CouponParameter.COUPONRULE_ADDTU;
    systemParameter: SystemParameter;
  //  CouponMaintainDataSource: CouponMaintainEntity;    // 声明一个券维护实体，为新增做准备
    btuDis = false;
    constructor(
        public dialog: MatDialog,
        private document: ElementRef,
        private couponService: ECouponServiceService,
        private snackBar: MatSnackBar,
        private sanitizer: DomSanitizer,
        private loading: FuseProgressBarService,
        private router: Router,
        private translate: TranslateService,
    ) {
    }

    ngOnInit() {
        // this.CouponMaintainDataSource = new CouponMaintainEntity();
         this.systemParameter = new SystemParameter();
    }

    // 点击保存
    toSaveBtu(){
        this.systemParameter.CouponEditOK = CouponParameter.COUPONRULE_ADDTOSAVE;
    }

    // 保存
    toSave(event) {
        setTimeout(() => {
            this.systemParameter.CouponEditOK = CouponParameter.OTHER;
        } , 1000);

        const flag = this.setVerification(event);
        if (flag) {
            return true ;
        }
        if (event.source === CouponParameter.BCIA_TT_CRM) {
            this.btuDis = true;
            this.loading.show();
            this.couponService.ImportCrmTicket(event).pipe(takeUntil(this._unsubscribeAll)).subscribe(
                (res) => {
                    // 添加券
                    this.router.navigateByUrl('apps/CouponMaintainComponent');
                    this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.PageTwice.PageFirstAdd.tips1'), '✖');
                },
                error1 => {
                    this.btuDis = false;
                    this.loading.hide();
                },
                () => {
                    this.btuDis = false;
                    this.loading.hide();
                });
        } else {
            setTimeout( () => {
                this.btuDis = true;
            });
            event.expireRuleDays = null;
            const cangif = event.maxGift + '';
            const can_gif = cangif.split('');
            if (can_gif.length > 1 && can_gif[0] === '0'){
                event.maxGift = cangif.substring(1 , cangif.length);
            }
            event.maxGift = Number(event.maxGift);
            event.timeBegin = this.couponService.formatToZoneDateTime(event.timeBegin);
            event.timeEnd = this.couponService.formatToZoneDateTime(event.timeEnd);
            event.createdBy = sessionStorage.getItem('username');
            event.lastModifiedBy = sessionStorage.getItem('username');
            this.loading.show();
            // console.log('event,,,' , event);
            this.couponService.CreatCouponCodes(event).pipe(takeUntil(this._unsubscribeAll)).subscribe(
                res => {
                    this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.PageTwice.PageFirstAdd.tips1'), '✖');
                    this.router.navigateByUrl('apps/CouponMaintainComponent');
                },
                error1 => {
                    this.btuDis = false;
                    this.loading.hide();
                },
                () => {
                    this.btuDis = false;
                    this.loading.hide();
                });

        }
    }

    toCancel() {
        this.router.navigateByUrl('apps/CouponMaintainComponent');
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }



    setVerification(event) {
        if (event.source === CouponParameter.BCIA_TT_CRM) {
            try {
                if (!event.name) {
                    // 券名称不能为空
                    this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.AddSecuritiesRules.Tips_name'), '✖');
                    return true;
                }
                if (!event.outId) {
                    // 外部券ID不能为空
                    this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.AddSecuritiesRules.Tips_OutId'), '✖');
                    return true;
                }
                if (!event.image) {
                    // image不能为空
                    this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.AddSecuritiesRules.Tips_CouponImage'), '✖');
                    return true;
                }
                if (!event.description) {
                    this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.AddSecuritiesRules.Tips_desc'), '✖');
                    return true;
                }
            }catch (e) {
                console.log(e);
                this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.AddSecuritiesRules.Tips_mine'), '✖');
                return true;
            }
        } else {
            // 券名称
            try {
                if (!event.name) {
                    this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.AddSecuritiesRules.Tips_name'), '✖');
                    return true;
                }
                // 满减券or现金券 this.CouponRuleType
                if (event.rule === CouponParameter.CASH) {
                    // 现金券
                    event.threshold = null;
                    if (!event.amount) {
                        this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.AddSecuritiesRules.Tips_CashAmount'), '✖');
                        return true;
                    }
                } else if (event.rule  === CouponParameter.FULL_BREAK_DISCOUNT) {
                    // 满减
                    if (!event.threshold && event.threshold !== 0) {
                        this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.AddSecuritiesRules.Tips_Threshold'), '✖');
                        return true;
                    }
                    if (!event.amount && event.amount !== 0) {
                        this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.AddSecuritiesRules.Tips_amount'), '✖');
                        return true;
                    }
                } else {
                    // 商品券
                    event.threshold = null;
                    if (!event.amount) {
                        this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.AddSecuritiesRules.Tips_ValueAmount'), '✖');
                        return true;
                    }
                }

                if (!event.timeBegin){
                    this.snackBar.open( this.translate.instant('ElectronicVoucherManagement.AddSecuritiesRules.Tips_timeBegin'), '✖');
                    return true;
                }
                if (!event.timeEnd){
                    this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.AddSecuritiesRules.Tips_timeEnd'), '✖');
                    return true;
                }

                if (event.expireRule !== CouponParameter.PERIOD ) {
                    // 发放后生效【领取后有效时长】
                    event.expireRule =  event.expireRuleDays;
                    if ( event.expireRuleMinute === null ||  event.expireRuleMinute === ''){
                        event.expireRuleMinute = 1;
                    }
                    event.expireRuleTimeBegin = null;
                    event.expireRuleTimeEnd = null;
                } else {
                    // 核销固定周期
                    if (!event.expireRuleTimeBegin) {
                        this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.AddSecuritiesRules.Tips_expireRuleTimeBegin'), '✖');
                        return true;
                    }
                    if (!event.expireRuleTimeEnd) {
                        this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.AddSecuritiesRules.Tips_expireRuleTimeEnd'), '✖');
                        return true;
                    }
                    event.expireRuleTimeBegin = this.couponService.formatToZoneDateTime(event.expireRuleTimeBegin);
                    event.expireRuleTimeEnd = this.couponService.formatToZoneDateTime(event.expireRuleTimeEnd);
                }
                if (!event.image){
                    this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.AddSecuritiesRules.Tips_CouponImage'), '✖');
                    return true;
                }

                if (!event.level) {
                    this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.AddSecuritiesRules.Tips_level'), '✖');
                    return true;
                }
                if (!event.maxPickup) {
                    this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.AddSecuritiesRules.Tips_maxPickup'), '✖');
                    return true;
                }
                if (!event.maxPickupDaily) {
                    this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.AddSecuritiesRules.Tips_maxPickupDaily'), '✖');
                    return true;
                }
                if (event.canGift === true) {
                    if (!this.IsNull2(event.maxGift) ){
                        this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.AddSecuritiesRules.Tips_transTimes'), '✖');
                        return true;
                    }
                }
                if (!event.bizType) {
                    if (!event.store){
                        this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.AddSecuritiesRules.Tips_store_bizType'), '✖');
                        return true;
                    }
                }
                if (!event.store) {
                    if (!event.bizType) {
                        this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.AddSecuritiesRules.Tips_store_bizType'), '✖');
                        return true;
                    }
                }
                if (!event.limitPerOrder) {
                    this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.AddSecuritiesRules.Tips_limitPerOrder'), '✖');
                    return true;
                }

                if (!event.showValidity){
                    event.showValidity = 0;
                } else {
                    event.showValidity   =  Number(event.showValidity );
                }

                if (!event.capacity) {
                    this.snackBar.open( this.translate.instant('ElectronicVoucherManagement.BatchNum100'), '✖');
                    event.capacity = 100;
                }

                if (!event.description) {
                    this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.AddSecuritiesRules.Tips_desc'), '✖');
                    return true;
                }
            }catch (e) {
                console.log(e);
                this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.AddSecuritiesRules.Tips_mine'), '✖');
            }
        }
        return false ;
    }


    IsNull(para) {
        if ('undefined' !== para && undefined !== para && '' !== para && null !== para) {
            return true;
        } else {
            return false;
        }
    }


    IsNull2(para) {
        if ('undefined' !== para && undefined !== para && '' !== para && null !== para ) {
            const para1 = Number(para);
            if (para1 > 0){
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

}




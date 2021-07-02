import {Component, HostListener, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {MatDialog, MatSnackBar} from '@angular/material';
import {FuseProgressBarService} from '../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../services/notify-asyn.service';
import {TranslateService} from '@ngx-translate/core';
import {map, startWith, takeUntil} from 'rxjs/operators';
import {fuseAnimations} from '../../../../@fuse/animations';
import {FormControl, FormGroup} from '@angular/forms';
import {IntegralAdjustmentService} from '../../../services/integralAdjustmentService/integral-adjustment.service';

@Component({
    selector: 'app-integral-adjustment',
    templateUrl: './integral-adjustment.component.html',
    styleUrls: ['./integral-adjustment.component.scss'],
    animations: fuseAnimations
})
export class IntegralAdjustmentComponent implements OnInit, OnDestroy {
    responsive = false; // 响应式参数
    currentMember = null;
    private _unsubscribeAll = new Subject();
    adjustDetail: FormGroup;
    mallList = [];
    filterMallList: Observable<string[]>;
    storeList = [];
    filterStoreList: Observable<string[]>;
    hasStoreList = false;
    rule: any;
    providerList = [];  // 之前的选择积分供应商列表
    pointSelect = [];  // 选择积分供应商列表
    selectedShops: any;  // 选择商铺
    selectedMalls: any;  // 关联商场
    mallId = '';
    selectedMember = null;
    rows = [];
    columns = [];
    page = {page: 0, size: 8, count: 0, sort: 'createdDate,desc'};
    editorContent = null;

    constructor(
        private dialog: MatDialog,
        private loading: FuseProgressBarService,
        private snackBar: MatSnackBar,
        private notify: NotifyAsynService,
        private translate: TranslateService,
        private integralAdjustmentService: IntegralAdjustmentService
    ) {
        this.responsive = window.innerWidth <= 959;
        this.adjustDetail = new FormGroup({
            mobile: new FormControl('', this.noEmptyValidator),
            type: new FormControl('REPLENISH', this.noEmptyValidator),
            provider: new FormControl('哈奇智能商业运营', this.noEmptyValidator),
            mallInfo: new FormControl('', this.noEmptyValidator),
            storeInfo: new FormControl(''),
            serialNumber: new FormControl('', this.noEmptyValidator),
            amount: new FormControl('', this.noEmptyValidator),
            point: new FormControl('', this.noEmptyValidator),
            orderTime: new FormControl(null)
        });
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

    noEmptyValidator(control: FormControl) {
        if (control.value === null || control.value === undefined) {
            return {isEmpty: true};
        } else {
            if (control.value.toString().trim() === '') {
                return {isEmpty: true};
            }
        }
    }

    /********************************** 调整对象 ******************************************/
    // 选择调整对象
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

    onMemberSelect(event) {
        this.selectedMember = event;
    }

    removeMember() {
        this.currentMember = null;
    }

    // 根据商户编号获取积分规则
    toGetRuleByStoreNo() {
        if (this.adjustDetail.value['storeInfo']) {
            this.hasStoreList = true;
            this.adjustDetail.patchValue({
                'amount': '',
                'point': ''
            });
            this.integralAdjustmentService.toGetRuleByStoreNo(this.adjustDetail.value['storeInfo'].split(' | ')[1]).subscribe(ref => {
                if (ref && ref['amount'] !== null && ref['point'] !== null) {
                    this.adjustDetail.patchValue({
                        'amount': ref['amount'],
                        'point': ref['point']
                    });
                    this.rule = Number(ref['point'] / ref['amount']).toFixed(2);
                } else {
                    this.snackBar.open('消费金额或积分为null，不能获取积分规则');
                }
            }, error1 => {
                this.adjustDetail.get('matAutocomplete').patchValue('');
                console.log(error1);
            });
        }
    }

    // 根据积分规则获取积分
    toGetPoint() {
        if (((/^\d+(\.\d+)?$/)).test(this.adjustDetail.value['amount'])) {
            this.adjustDetail.patchValue({'point': Number(this.rule) * this.adjustDetail.value['amount']});
        } else {
            this.snackBar.open('消费金额必须大于0的小数或整数');
        }
    }

    inputAdjustPoint(event) {
        const reg = /(^-?[0-9]\d*$)/;
        if (reg.test(event.target.value)) {
            const inputNumber = Number(event.target.value);
            if (inputNumber === 0) { // 限制输入
                event.target.value = 1;
            }
        } else { // 不是数字 \D匹配不是数字
            if (event.target.value.toString().indexOf('-') === 0) {
                // 是负数
                event.target.value = '-' + event.target.value.substring(1).replace(/\D/g, '');
            }else{
                // 是正数
                event.target.value = event.target.value.replace(/\D/g, '');
            }

        }
        this.adjustDetail.get('point').patchValue(event.target.value);
    }



    // 保存调整信息
    saveAdjustDetail() {
        if ('REPLENISH' === this.adjustDetail.value['type']) {
            if (!this.currentMember) {
                this.snackBar.open('请添加的调整对象');
                return;
            } else if (!this.currentMember.mobile) {
                this.snackBar.open('已选择的调整对象-手机号不能为空');
                return;
            } else if (!this.adjustDetail.controls['provider'].valid) {
                this.snackBar.open('积分供应商不能为空');
                return;
            } else if (!this.adjustDetail.controls['mallInfo'].valid) {
                this.snackBar.open('请选择商场');
                return;
            } else if (!this.adjustDetail.controls['type'].valid) {
                this.snackBar.open('调整原因不能为空');
                return;
            } else if (!this.adjustDetail.controls['storeInfo'].valid) {
                this.snackBar.open('请选择店铺');
                return;
            } else if (!this.adjustDetail.controls['serialNumber'].valid) {
                this.snackBar.open('流水单号不能为空');
                return;
            } else if (!this.adjustDetail.controls['amount'].valid) {
                this.snackBar.open('消费金额不能为空');
                return;
            } else if (!this.adjustDetail.controls['orderTime'].valid || null === this.adjustDetail.controls['orderTime'].value) {
                this.snackBar.open('订单时间不能为空');
                return;
            }else if (this.adjustDetail.controls['amount'].valid) {
                if (this.adjustDetail.value['amount'].length > 8) {
                    this.snackBar.open('消费金额最多只能填写8位数');
                    return;
                }
            }
        }else if ('ADJUST' === this.adjustDetail.value['type']) {
            if (!this.currentMember) {
                this.snackBar.open('请添加的调整对象');
                return;
            } else if (!this.currentMember.mobile) {
                this.snackBar.open('已选择的调整对象-手机号不能为空');
                return;
            } else if (!this.adjustDetail.controls['provider'].valid) {
                this.snackBar.open('积分供应商不能为空');
                return;
            } else if (!this.adjustDetail.controls['mallInfo'].valid) {
                this.snackBar.open('请选择商场');
                return;
            } else if (!this.adjustDetail.controls['type'].valid) {
                this.snackBar.open('调整原因不能为空');
                return;
            } else if (!this.adjustDetail.controls['storeInfo'].valid) {
                this.snackBar.open('请选择店铺');
                return;
            }  else if (!this.adjustDetail.controls['point'].valid) {
                this.snackBar.open('调整积分不能为空');
                return;
            }
           const reg = /^-?[1-9]\d*$/;
            if (!reg.test(this.adjustDetail.value['point'])) {
                this.snackBar.open('调整积分请输入整数');
                return;
            }
        }

        // 流水单号不能重复
/*        this.integralAdjustmentService.toGetPointHistorySerialNumber(this.adjustDetail.value['serialNumber']).subscribe(res => {
            if (res.body.length === 0) {
                this.saveAdjustDetailAfterCheckSerialNumber();
            } else {
                const array = [];
                res.body.forEach((item) => {
                    array.push(item['serialNumber']);
                });
                if (array.includes(this.adjustDetail.value['serialNumber'])) {
                    this.snackBar.open('请输入正确的流水单号');
                } else {
                    this.saveAdjustDetailAfterCheckSerialNumber();
                }
            }
        }, error1 => {
            console.log(error1);
        });*/

        this.saveAdjustDetailAfterCheckSerialNumber();


    }

    saveAdjustDetailAfterCheckSerialNumber() {
        let data = null;
        if ('REPLENISH' === this.adjustDetail.value['type']) {
            data = {
                'amount': this.adjustDetail.value['amount'],
                'mallId': this.adjustDetail.value['mallInfo'].split(' | ')[1],
                'mobile': this.currentMember.mobile,
                'provider': this.adjustDetail.value['provider'],
                'serialNumber': this.adjustDetail.value['serialNumber'],
                'storeId': this.adjustDetail.value['storeInfo'].split(' | ')[1],
                'type': this.adjustDetail.value['type'],
                'orderTime': this.formatToZoneDateTime(this.adjustDetail.value['orderTime']),
                'desc': this.editorContent
            };
        }else if ('ADJUST' === this.adjustDetail.value['type']) {
            data = {
                'mallId': this.adjustDetail.value['mallInfo'].split(' | ')[1],
                'mobile': this.currentMember.mobile,
                'point': this.adjustDetail.value['point'],
                'provider': this.adjustDetail.value['provider'],
                'storeId': this.adjustDetail.value['storeInfo'].split(' | ')[1],
                'type': this.adjustDetail.value['type'],
                'desc': this.editorContent
            };
        }

        this.loading.show();
        this.integralAdjustmentService.toSaveAdjustPoint(data).subscribe(res => {
            this.snackBar.open('提交成功');
            this.initSearch();
            this.adjustDetail.reset();
            this.editorContent = null;
            this.adjustDetail.patchValue({
                provider: '哈奇智能商业运营',
                type: 'REPLENISH'
            });
   /*         this.adjustDetail.patchValue({
                'provider': this.providerList[0].memberName,
                'type': '消费补录'
            });*/
            this.currentMember = null;
            setTimeout(() => {
                this.loading.hide();
            }, 2000);
        }, error1 => {
            this.loading.hide();
            console.log(error1);
        });
    }

    // // 打开积分供应商列表弹窗
    // openPointSupplier(PointSupplier){
    //     if (!this.dialog.getDialogById('PointSupplier_C')) {
    //         if (this.providerList) {
    //             this.pointSelect = [];
    //             Object.assign(this.pointSelect, this.providerList);
    //         }
    //         this.dialog.open(PointSupplier, {id: 'PointSupplier_C', width: '80%'}).afterClosed().subscribe(res => {
    //             if (res) {
    //                 Object.assign(this.providerList, this.pointSelect);
    //                 this.adjustDetail.get('provider').patchValue(this.providerList['memberName']);
    //             } else {
    //                 this.pointSelect = [];
    //             }
    //         });
    //     }
    // }
    //
    // // 选择积分供应商列表事件
    // selectPoint(e){
    //     this.pointSelect = e ;
    // }

    // 打开商户弹窗
    openStore(storeTemplate){
        if (!this.dialog.getDialogById('storeTemplate_C')) {
            if (this.storeList) {
                this.selectedShops = [];
                Object.assign(this.selectedShops, this.storeList);
            }
            this.dialog.open(storeTemplate, {id: 'storeTemplate_C', width: '80%'}).afterClosed().subscribe(res => {
                if (res) {
                    Object.assign(this.storeList, this.selectedShops);
                    this.adjustDetail.get('storeInfo').patchValue(this.selectedShops['storeName'] + ' | ' + this.selectedShops['storeId'] );
                    // this. toGetRuleByStoreNo();
                } else {
                    this.selectedShops = [];
                }
            });
        }
    }

    // 选择商户事件
    onSelectShop(e){
        this.selectedShops = e;
    }

    // 打开商场弹窗
    openMall(mallTemplate){
        if (!this.dialog.getDialogById('mallTemplate_C')) {
            if (this.mallList) {
                this.selectedMalls = [];
                Object.assign(this.selectedMalls, this.mallList);
            }
            this.dialog.open(mallTemplate, {id: 'mallTemplate_C', width: '80%'}).afterClosed().subscribe(res => {
                if (res) {
                    Object.assign(this.mallList, this.selectedMalls);
                    this.mallId =  this.selectedMalls['mallId'];
                    this.adjustDetail.get('mallInfo').patchValue(this.selectedMalls['mallName'] + ' | ' + this.selectedMalls['mallId'] );
                    this.adjustDetail.get('storeInfo').patchValue('');
                } else {
                    this.selectedMalls = [];
                }
            });
        }
    }

    // 选择商场
    onSelectMalls(e){
        this.selectedMalls = e;
    }

    /********************************** 操作记录 ******************************************/
    getColumns() {
        this.columns = [
            {name: 'mobile', translate: '手机号', value: '', source: '', type: 'input'},
            {name: 'provider', translate: '积分供应商', value: ''},
            {name: 'changePoint', translate: '调整积分', value: ''},
            {name: 'type', translate: '调整原因', value: ''},
            {name: 'createdBy', translate: '操作人', value: ''},
            {name: 'createdDate', translate: '操作时间', value: '', source: '', type: 'date'}
        ];
    }

    initSearch() {
        this.loading.show();
        this.integralAdjustmentService.toGetPointHistory(this.page.page, this.page.size, this.page.sort).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.rows = [];
            const list = res.body;
            this.formatHistoryList(list);
            if (list && list.length > 0) {
                list.forEach(data => {
                    this.rows.push(data);
                });
            }
            this.page.count = Number(res.headers.get('X-Total-Count'));
            if (this.rows.length === 0) {
                this.snackBar.open(this.translate.instant('未查询到数据'), '✖');
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
        this.integralAdjustmentService.toGetPointHistory(this.page.page, this.page.size, this.page.sort, multiSearch).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.rows = [];
            const list = res.body;
            this.formatHistoryList(list);
            if (list && list.length > 0) {
                list.forEach(data => {
                    this.rows.push(data);
                });
            }
            this.page.count = Number(res.headers.get('X-Total-Count'));
            if (this.rows.length === 0) {
                this.snackBar.open(this.translate.instant('未查询到数据'), '✖');
            }
            this.notify.onResponse.emit();
            this.loading.hide();
        }, error1 => {
            this.loading.hide();
            this.notify.onResponse.emit();
        });

    }

    formatHistoryList(list) {
        list.forEach(item => {
            if ('REPLENISH' === item.type) {
                item.type = '积分补录';
            }else if ('ADJUST' === item.type) {
                item.type = '积分调整';
            }
        });
    }

    formatToZoneDateTime(dateStr) {
        try {
            const date = new Date(dateStr);
            return date.toISOString();
        } catch (e) {
            return dateStr;
        }
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

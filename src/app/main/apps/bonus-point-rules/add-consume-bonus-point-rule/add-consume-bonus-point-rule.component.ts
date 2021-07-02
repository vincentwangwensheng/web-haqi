import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {MembersListServiceService, RuleDTO, StoreDTOS} from '../membersListService/members-list-service.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {CouponParameter} from '../../../../services/EcouponService/CouponParameter';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {fuseAnimations} from '../../../../../@fuse/animations';

@Component({
  selector: 'app-add-consume-bonus-point-rule',
  templateUrl: './add-consume-bonus-point-rule.component.html',
  styleUrls: ['./add-consume-bonus-point-rule.component.scss'] ,
  animations: fuseAnimations
})
export class AddConsumeBonusPointRuleComponent implements OnInit , OnDestroy{
    private _unsubscribeAll: Subject<any> = new Subject();
    sysPara: SysPara;
    rulePara: RuleDTOPara;
    NumberTag =  [];
    StoreNameList = [];
    NumberTagDelList = [];
    StoreTagList = [];
    options: FormGroup;
    consumeRuleDTO: RuleDTO; // 消费积分备份
    bussiness: BusinessNumberTagSource; // 业态
    storeDTOS = [];          // 商户备份
    btuDis: boolean; // 设置保存等按钮不可用
    constructor(
        private router: Router,
        public dialog: MatDialog,
        private routeInfo: ActivatedRoute,
        private snackBar: MatSnackBar,
        private translate: TranslateService,
        private memberService: MembersListServiceService,
    ) {
        this.options = new FormBuilder().group({
            id: new FormControl(null, [Validators.required] ),
            ruleName: new FormControl(null, [Validators.nullValidator] ),
            type: new FormControl(CouponParameter.Rule_CONSUME, [Validators.required] ),
            desc: new FormControl(null, [Validators.required] ),
            enabled: new FormControl(true, [Validators.required] ),
            amount: new FormControl(null, [Validators.required] ),
            point: new FormControl(null, [Validators.required] ),
            createdBy: new FormControl(sessionStorage.getItem('username'), [Validators.required] ),
            createdDate: new FormControl(null, [Validators.required] ),
            lastModifiedBy: new FormControl(null, [Validators.required] ),
            lastModifiedDate: new FormControl(null, [Validators.required] ),
        });
    }

  ngOnInit() {
      this.sysPara = new SysPara();
      this.bussiness = new BusinessNumberTagSource();
      this.btuDis = false;
      this.routeInfo.params.pipe(takeUntil(this._unsubscribeAll)).subscribe((param: Params) => this.sysPara.CONSUME_ID = param.id);
      this.initPara();
    }


    initPara(){
        this.rulePara = new RuleDTOPara();
        // 初始化一系列参数
        this.sysPara.RuleStrutsList = [
            {value: this.translate.instant('BonusPointUnion.normal'), viewValue: true} ,
            {value: this.translate.instant('BonusPointUnion.frozen'), viewValue: false}
        ];
        this.sysPara.StoreDis = true;
        if (this.sysPara.CONSUME_ID === CouponParameter.ADD_Rule_CONSUME) {
            this.sysPara.consume_title =  this.translate.instant('BonusPointUnion.BonusPointRules.addConsumeBonusPointRule');
            this.sysPara.SAVE_CANCEL = true;
            this.sysPara.EDIT_RETURN = false;
            this.sysPara.BTU_DIS = false;
            this.sysPara.BTU_BIZTYPE = false;
            this.setNumTag();
        } else {
            this.sysPara.consume_title =  this.translate.instant('BonusPointUnion.BonusPointRules.ConsumeBonusPointRuleDetail') ; // '消费积分详情';
            this.sysPara.SAVE_CANCEL = false;
            this.sysPara.EDIT_RETURN = true;
            this.sysPara.BTU_DIS = true;
            this.sysPara.BTU_BIZTYPE = true;
            this.getConsumeData();
        }
    }

    getConsumeData(){
      // 在这里写详情的逻辑 , 获取所有的详情信息
        this.memberService.getRuleById(this.sysPara.CONSUME_ID).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                  if (res) {
                      this.consumeRuleDTO = res[this.sysPara.RulePara];
                      this.storeDTOS = res[this.sysPara.StorePara];
                      this.options.controls.id.patchValue(res[this.sysPara.RulePara].id);
                      this.options.controls.ruleName.patchValue(res[this.sysPara.RulePara].ruleName);
                      this.options.controls.desc.patchValue(res[this.sysPara.RulePara].desc);
                      this.options.controls.amount.patchValue(res[this.sysPara.RulePara].amount);
                      this.options.controls.point.patchValue(res[this.sysPara.RulePara].point);
                      this.options.controls.enabled.patchValue(res[this.sysPara.RulePara].enabled);
                      this.options.controls.createdBy.patchValue(res[this.sysPara.RulePara].createdBy);
                      this.options.controls.createdDate.patchValue(res[this.sysPara.RulePara].createdDate);
                      this.options.controls.lastModifiedBy.patchValue(res[this.sysPara.RulePara].lastModifiedBy);
                      this.options.controls.lastModifiedDate.patchValue(res[this.sysPara.RulePara].lastModifiedDate);
                      this.options.controls.ruleName.disable();
                      this.options.controls.desc.disable();
                      this.options.controls.amount.disable();
                      this.options.controls.point.disable();
                      this.options.controls.enabled.disable();
                      this.sysPara.BTU_DIS = true;
                      this.StoreNameList = res[this.sysPara.StorePara];
                      this.setNumTag();
                  }
            }
        );
    }



    toSave(){
        const f = this.VerificationField();
        if (f) {
            return ;
        }
        this.btuDis = true;
        if (this.sysPara.CONSUME_ID === CouponParameter.ADD_Rule_CONSUME){
            this.saveConsume();
        } else {
            this.updateConsume();
        }
    }

    saveConsume(){
        const storeDTOSList: Array<StoreDTOS> = [];
        this.StoreNameList.forEach(
            r => {
                if (!r.disabled){
                    const store: StoreDTOS = new StoreDTOS();
                    store.id = r.id;
                    store.ruleId = null ;
                    store.storeName = r.storeName;
                    store.storeNo = r.storeNo;
                    store.createdBy = sessionStorage.getItem('username');
                    store.createdDate = null ;
                    store.lastModifiedBy = null;
                    store.lastModifiedDate = null;
                    storeDTOSList.push(store);
                }
            }
        );
        const rule = { ruleDTO: this.options.value , storeDTOS: storeDTOSList}  ;
        this.memberService.createRule(rule).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                if (res.status === 200){
                    // this.btuDis = false;
                     // 保存成功
                    this.snackBar.open(this.translate.instant('BonusPointUnion.saveSuccess'), '✖');
                    this.router.navigateByUrl('/apps/BonusPointRulesComponent');
                }
            } , error1 => {
                this.btuDis = false;
            }
        );
    }

    updateConsume(){
        const storeDTOSList: Array<StoreDTOS> = [];
        this.StoreNameList.forEach(
            r => {
                if (!r.disabled){
                    const store: StoreDTOS = new StoreDTOS();
                    store.id = r.id;
                    store.ruleId = this.sysPara.CONSUME_ID;
                    store.storeName = r.storeName;
                    store.storeNo = r.storeNo;
                    store.createdBy = r.createdBy;
                    store.createdDate = r.createdDate ;
                    store.lastModifiedBy = r.lastModifiedBy;
                    store.lastModifiedDate = r.lastModifiedDate;
                    storeDTOSList.push(store);
                }
            }
        );
        const rule = { ruleDTO: this.options.value , storeDTOS: storeDTOSList}  ;
        this.memberService.updateRule(rule).pipe().subscribe(
            res => {
                if (res.status === 200){
                   // this.btuDis = false;
                    // 修改成功
                        this.snackBar.open(this.translate.instant('BonusPointUnion.editSuccess'), '✖');
                        this.router.navigateByUrl('/apps/BonusPointRulesComponent');
                }
            } ,
            error1 => {
                this.btuDis = false;
            }
        );

    }

    VerificationField(){
        // 验证

        if (this.options.value[this.rulePara.ruleName] === null || this.options.value[this.rulePara.ruleName] === ''){
            // 规则名称不能为空
            this.snackBar.open(this.translate.instant('BonusPointUnion.tips.RuleNameNotNull'), '✖');
            return true;
        }
        if (this.options.value[this.rulePara.desc] === null || this.options.value[this.rulePara.desc] === ''){
            // 规则简介不能为空
            this.snackBar.open(this.translate.instant('BonusPointUnion.tips.RuleDescNotNull'), '✖');
            return true;
        }
        if (this.options.value[this.rulePara.amount] === null || this.options.value[this.rulePara.amount] === ''){
            // 元不能为空
            this.snackBar.open(this.translate.instant('BonusPointUnion.tips.amountNotNull'), '✖');
            return true;
        }
        if (this.options.value[this.rulePara.point] === null || this.options.value[this.rulePara.point] === ''){
            // 多少积分不能为空
            this.snackBar.open(this.translate.instant('BonusPointUnion.tips.pointNotNull'), '✖');
            return true;
        }
        if (this.StoreNameList.length === 0) {
            // 此规则需对应至少一个店铺
            this.snackBar.open(this.translate.instant('BonusPointUnion.tips.hasOneStore'), '✖');
            return true;
        }
        return false;
    }


    changeEditStruts(){
        this.sysPara.SAVE_CANCEL = true;
        this.sysPara.EDIT_RETURN = false;
        this.options.controls.ruleName.enable();
        this.options.controls.desc.enable();
        this.options.controls.amount.enable();
        this.options.controls.point.enable();
        this.options.controls.enabled.enable();
        if (this.StoreNameList.length !== 0) {
            this.sysPara.BTU_BIZTYPE = true;
        } else {
            this.sysPara.BTU_BIZTYPE = false;
        }
        if (this.bussiness.BusinessTag.length !== 0) {
            this.sysPara.BTU_DIS = true;
        } else {
            this.sysPara.BTU_DIS = false;
        }
    }

    toCancel(){
        if (this.sysPara.CONSUME_ID === CouponParameter.ADD_Rule_CONSUME) {
            this.router.navigateByUrl('/apps/AddRuleComponent');
        } else {
            // 详情就返回之前的数据
            this.sysPara.SAVE_CANCEL = false;
            this.sysPara.EDIT_RETURN = true;
            this.options.controls.ruleName.patchValue(this.consumeRuleDTO.ruleName);
            this.options.controls.desc.patchValue(this.consumeRuleDTO.desc);
            this.options.controls.amount.patchValue(this.consumeRuleDTO.amount);
            this.options.controls.point.patchValue(this.consumeRuleDTO.point);
            this.options.controls.enabled.patchValue(this.consumeRuleDTO.enabled);
            this.StoreNameList = [];
            this.StoreNameList = this.storeDTOS;
            this.StoreTagList = [];
            this.NumberTag = [];
            this.NumberTagDelList = [];
            this.options.controls.ruleName.disable();
            this.options.controls.desc.disable();
            this.options.controls.amount.disable();
            this.options.controls.point.disable();
            this.options.controls.enabled.disable();
            this.sysPara.BTU_DIS = true;
            this.setNumTag();
        }
    }



    // 删除一个可选项并设置为可点
    removeStore(k , store){
         const store_num = JSON.stringify(this.StoreNameList);
         const store_json = JSON.parse(store_num);
        store_json.splice(k , 1);
        this.StoreNameList = [];
        this.StoreNameList = store_json;
        const NumberTag_s = JSON.stringify(this.NumberTag);
        const NumberTag_j = JSON.parse(NumberTag_s);

        for (let r = 0 ; r < NumberTag_j.length ; r++) {
            if (NumberTag_j[r].id === store.id) {
                this.NumberTag.splice(r , 1);
            }
        }
        this.NumberTagDelList.push(store);
        const num_tag = JSON.stringify(this.NumberTag);
        this.StoreTagList = JSON.parse(num_tag);
        this.setNumTag();
        if (this.StoreNameList.length !== 0) {
            this.sysPara.BTU_BIZTYPE = true;
        } else {
            this.sysPara.BTU_BIZTYPE = false;
        }
    }

    // 设置店铺弹框的可选项
    setNumTag(){
        // 在这里限查出所有的已经添加了规则的店铺
        if (this.NumberTag.length === 0) {
            this.memberService.getRuleStores().pipe(takeUntil(this._unsubscribeAll)).subscribe(
                res => {
                    for (let i = 0  ; i < res.length ; i++){
                        res[i][this.rulePara.disabled] = true;
                        if (this.sysPara.CONSUME_ID !== CouponParameter.ADD_Rule_CONSUME) {
                            if (this.StoreNameList.length !== 0) {
                                this.StoreNameList.forEach( s => {
                                    if (s.id === res[i].id) {
                                        res[i][this.rulePara.disabled] = false;
                                    }
                                });
                            }
                        }

                    }
                    const res_str = JSON.stringify(res);
                    this.NumberTag = JSON.parse(res_str);
                    for (let i = 0 ; i < res.length; i++) {
                        if (this.NumberTagDelList.length !== 0) {
                            this.NumberTagDelList.forEach( r => {
                                if (r.id === res[i].id) {
                                    this.NumberTag.slice(i , 1);
                                }
                            });
                        }
                    }
                    const numTag_str = JSON.stringify(this.NumberTag);
                    const numTag_json = JSON.parse(numTag_str) ;
                    this.StoreTagList = numTag_json;
                }
            );
        }
    }

    // 打开弹框
    openBonusPointDialog(consumeBonusPointDialog){
        this.sysPara.StoreDis = true;
        if (!this.dialog.getDialogById('consumeBonusPointDialog_')) {
            this.dialog.open(consumeBonusPointDialog, {id: 'consumeBonusPointDialog_', width: '80%'}).afterClosed().subscribe(
                res => {
                   if (res){
                           this.StoreNameList = [];
                           const numTag_str = JSON.stringify(this.NumberTag);
                           const numTag_json = JSON.parse(numTag_str) ;
                           this.StoreTagList = numTag_json;
                           numTag_json.forEach( r => {
                               if (!r.disabled) {
                                   this.StoreNameList.push(r);
                               }
                           });
                       if (this.NumberTagDelList.length !== 0){
                           const del_list = JSON.stringify(this.NumberTagDelList);
                           const del_json = JSON.parse(del_list);
                           for (let d = 0 ; d < del_json.length ; d++){
                               this.StoreTagList.forEach( r => {
                                   if (del_json[d].id === r.id) {
                                       this.NumberTagDelList.slice(d , 1);
                                   }
                               });
                           }
                       }
                       if (this.StoreNameList.length !== 0) {
                           this.sysPara.BTU_BIZTYPE = true;
                       } else {
                           this.sysPara.BTU_BIZTYPE = false;
                       }

                    } else {
                        this.NumberTag = [] ;
                        const StoreTagList_str = JSON.stringify(this.StoreTagList);
                        this.NumberTag = JSON.parse(StoreTagList_str);
                   }
                }
            );
        }
    }

    SelectDialog(event){
        this.NumberTag = event;
    }



    removeTag(k , tag){
     const str_tag = JSON.stringify( this.bussiness.BusinessTag);
     const json_tag = JSON.parse(str_tag);
     json_tag.splice(k , 1);
     this.bussiness.BusinessTag = [] ;
     this.bussiness.BusinessTag = json_tag;
     const Tag_s = JSON.stringify(this.bussiness.BusinessNumberTag);
     const Tag_j = JSON.parse(Tag_s);

     for (let r = 0 ; r < Tag_j.length ; r++) {
            if (Tag_j[r].id === tag.id) {
                this.bussiness.BusinessNumberTag.splice(r , 1);
            }
        }
     if (this.bussiness.BusinessTag.length !== 0) {
            this.sysPara.BTU_DIS = true;
     } else {
            this.sysPara.BTU_DIS = false;
     }
    }


    // 打开业态限制的框框
    openFormLimitationDialog(FormLimitationDialog) {
        this.sysPara.StoreDis = false;
        if (!this.dialog.getDialogById('FormLimitationDialog1_')) {
            this.dialog.open(FormLimitationDialog, {id: 'FormLimitationDialog1_', width: '80%'}).afterClosed().subscribe(
                res => {
                    if (res){
                        const tag = JSON.stringify(this.bussiness.BusinessNumberTag);
                        this.bussiness.BusinessTag = JSON.parse(tag);
                        if (this.bussiness.BusinessTag.length !== 0) {
                            this.sysPara.BTU_DIS = true;
                        } else {
                            this.sysPara.BTU_DIS = false;
                        }
                    }
                }
            );
        }
    }

    businessTagSelect(event){
        this.bussiness.BusinessNumberTag = event;
    }






    toReturn(){
        // if (this.sysPara.CONSUME_ID === CouponParameter.ADD_Rule_CONSUME) {
        //     this.router.navigateByUrl('/apps/AddRuleComponent');
        // } else {
        //     this.router.navigateByUrl('/apps/BonusPointRulesComponent');
        // }
        history.back();
    }



    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}

export class SysPara {
    CONSUME_ID: string;              // 详情或者新增传过来的ID
    consume_title: string;           // 页面的标题
    EDIT_RETURN: boolean;            // 编辑返回
    SAVE_CANCEL: boolean;           // 保存取消
    RuleStrutsList: Array<{value: number | null | undefined | string , viewValue: number | null | undefined | string | boolean}>;
    BTU_DIS: boolean;                // 点击选中店铺的按钮是否可选
    BTU_BIZTYPE: boolean;                // 点击选中业态的按钮是否可选
    RulePara  = 'ruleDTO';
    StorePara = 'storeDTOS';
    StoreDis: boolean; // 业态/商铺 按钮二选一
}

export class RuleDTOPara {
    id = 'id';
    ruleName = 'ruleName';
    type = 'type';
    desc = 'desc';
    enabled = 'enabled';
    amount = 'amount';
    point = 'point';
    createdBy = 'createdBy';
    createdDate = 'createdDate';
    lastModifiedBy = 'lastModifiedBy';
    lastModifiedDate = 'lastModifiedDate';
    disabled = 'disabled';
}


export class BusinessNumberTagSource {
    BusinessNumberTag = [];
    BusinessTag = [];
    BusinessLabelPre = false;
}
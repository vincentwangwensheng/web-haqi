import {Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {InteractRuleDTOS, MembersListServiceService} from '../membersListService/members-list-service.service';
import {CouponParameter} from '../../../../services/EcouponService/CouponParameter';
import {MatSnackBar} from '@angular/material';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {fuseAnimations} from '../../../../../@fuse/animations';

@Component({
  selector: 'app-add-interacts-bonus-point-rule',
  templateUrl: './add-interacts-bonus-point-rule.component.html',
  styleUrls: ['./add-interacts-bonus-point-rule.component.scss'] ,
  animations: fuseAnimations
})
export class AddInteractsBonusPointRuleComponent implements OnInit , OnDestroy{

    private _unsubscribeAll: Subject<any> = new Subject();
  //  ruleDto: RuleDTO;
    All_Data_BF: any;
    firstPoint = '5';
    ZERO = 0;
    interactRuleAttendance: InteractRuleDTOS; // 签到奖励积分
    interactRuleRegister: InteractRuleDTOS;   // 注册奖励积分
    interactRuleCollarCoupons: InteractRuleDTOS;   // 领券奖励积分
    interactRuleComment: InteractRuleDTOS;   // 评论奖励积分
    interactShare: InteractRuleDTOS;       // 分享奖励积分
    interactCheckboxPara: InteractCheckboxPara; // 页面其他控制参数
    interactRulePara: InteractRulePara;
    FormRuleDto: FormGroup;
    FormRuleAttendance: FormGroup;  // 签到奖励积分
    FormRuleRegister: FormGroup;  // 注册奖励积分
    FormRuleCollarCoupons: FormGroup;  // 领券奖励积分
    FormRuleComment: FormGroup;  // 评论奖励积分
    FormRuleShare: FormGroup;  // 评论奖励积分
    btuDis: boolean; // 设置按钮是禁用还是启用
    constructor(
        private router: Router,
        private translate: TranslateService,
        private routeInfo: ActivatedRoute,
        private snackBar: MatSnackBar,
        private document: ElementRef,
        private memberService: MembersListServiceService,
    ) {
        // 主实体
        this.FormRuleDto = new FormBuilder().group({
            id: new FormControl(null, [Validators.required] ),
            ruleName: new FormControl(null, [Validators.nullValidator] ),
            type: new FormControl(CouponParameter.Rule_INTERACT, [Validators.required] ),
            desc: new FormControl(null, [Validators.required] ),
            enabled: new FormControl(true, [Validators.required] ),
            amount: new FormControl(null, [Validators.required] ),
            point: new FormControl(null, [Validators.required] ),
            createdBy: new FormControl(sessionStorage.getItem('username'), [Validators.required] ),
            createdDate: new FormControl(null, [Validators.required] ),
            lastModifiedBy: new FormControl(sessionStorage.getItem('username'), [Validators.required] ),
            lastModifiedDate: new FormControl(null, [Validators.required] ),
        });
        // 签到奖励积分
        this.FormRuleAttendance = new FormBuilder().group({
            point: new FormControl(null ),
        });
        // 注册奖励送积分
        this.FormRuleRegister = new FormBuilder().group({
            point: new FormControl(this.firstPoint),
        });
        // 领券奖励积分
        this.FormRuleCollarCoupons = new FormBuilder().group({
            upperLimit: new FormControl({ value: this.firstPoint , disabled: true}),
            point: new FormControl(this.firstPoint),
        });
        // 评论奖励积分
        this.FormRuleComment = new FormBuilder().group({
            upperLimit: new FormControl({ value: this.firstPoint , disabled: true}),
            point: new FormControl(this.firstPoint ),
        });
        // 分享奖励积分
        this.FormRuleShare = new FormBuilder().group({
            point: new FormControl(null ),
            period: new FormControl(CouponParameter.RULE_DAY),
        });
    }

  ngOnInit() {
      // 初始化变量
      this.initSourceData();
      this.routeInfo.params.pipe(takeUntil(this._unsubscribeAll)).subscribe((param: Params) => this.interactCheckboxPara.interactsId = param.id);
      this.initSource();
  }


    // 获取所有的详情信息
    getConsumeData(){
        // 在这里写详情的逻辑 , 获取所有的详情信息
        this.memberService.getRuleById(this.interactCheckboxPara.interactsId).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                if (res) {
                    this.All_Data_BF = res;
                    this.editSetData(res);
                    this.interactCheckboxPara.EDIT_BTU_DIS = true;
                    this.FormRuleDto.controls.ruleName.disable();
                    this.FormRuleDto.controls.desc.disable();
                    this.FormRuleDto.controls.enabled.disable();
                    this.FormRuleAttendance.controls.point.disable();
                    this.FormRuleRegister.controls.point.disable();
                    this.FormRuleCollarCoupons.controls.point.disable();
                    this.FormRuleCollarCoupons.controls.upperLimit.disable();
                    this.FormRuleComment.controls.point.disable();
                    this.FormRuleComment.controls.upperLimit.disable();
                    this.FormRuleShare.controls.point.disable();
                    this.FormRuleShare.controls.period.disable();
                }
            }
        );
    }

    initSource(){
      // 设置分享积分的年月日选择
       this.getInteractRulePeriod();
        if (this.interactCheckboxPara.interactsId === CouponParameter.ADD_Rule_INTERACT ) {
            this.interactCheckboxPara.interactsTitle =  this.translate.instant('BonusPointUnion.BonusPointRules.addInteractsBonusPointRule');
            this.interactCheckboxPara.SAVE_CANCEL = true;
            this.interactCheckboxPara.EDIT_RETURN = false;
            this.interactCheckboxPara.EDIT_BTU_DIS = false;
            this.FormRuleAttendance.get(this.interactRulePara.point).setValidators(Validators.required);
            this.FormRuleShare.get(this.interactRulePara.point).setValidators(Validators.required);
        } else {
            this.interactCheckboxPara.interactsTitle = this.translate.instant('BonusPointUnion.BonusPointRules.ConsumeBonusPointRuleDetail'); //  '消费积分详情';
            this.interactCheckboxPara.SAVE_CANCEL = false;
            this.interactCheckboxPara.EDIT_RETURN = true;
            this.interactCheckboxPara.EDIT_BTU_DIS = true;
            this.getConsumeData();
        }
   }

    // 获取日期选中框的数据
    getInteractRulePeriod(){
        this.memberService.getInteractRulePeriod().pipe().subscribe(
            res => {
                this.interactCheckboxPara.CouponDays = res;
            }
        );
    }

    toSave(){
        const re_b =  this.interactVerification();
        if (re_b){
            return;
        }
        this.btuDis = true;
        this.interactRuleAttendance.point = this.document.nativeElement.querySelector('#Attendance_bonusPoint').value;
        this.interactRuleRegister.point =  this.document.nativeElement.querySelector('#Register_bonusPoint').value;
        this.interactRuleCollarCoupons.upperLimit =  this.document.nativeElement.querySelector('#CollarCoupons_upperLimit').value;
        this.interactRuleCollarCoupons.point =  this.document.nativeElement.querySelector('#CollarCoupons_bonusPoint').value;
        this.interactRuleComment.upperLimit =  this.document.nativeElement.querySelector('#Comment_upperLimit').value;
        this.interactRuleComment.point =  this.document.nativeElement.querySelector('#Comment_bonusPoint').value;
        this.interactShare.point =  this.document.nativeElement.querySelector('#Share_bonusPoint').value;
        this.interactShare.period =  this.FormRuleShare.controls.period.value;
        this.CheckboxParaCollarCouponsPoint();
        this.CheckboxParaCommentPoint();
        const interactList: Array<InteractRuleDTOS> = [];
        interactList.push(this.interactRuleAttendance);
        interactList.push(this.interactRuleRegister);
        interactList.push(this.interactRuleCollarCoupons);
        interactList.push(this.interactRuleComment);
        interactList.push(this.interactShare);
        let Ru_List: any;
        Ru_List = {ruleDTO: this.FormRuleDto.value  , interactRuleDTOS: interactList};
        if (this.interactCheckboxPara.interactsId === CouponParameter.ADD_Rule_INTERACT){
            this.memberService.createRule(Ru_List).pipe().pipe(takeUntil(this._unsubscribeAll)).subscribe(
                res => {
                    if (res.status === 200){
                       // this.btuDis = false;
                        // 保存成功
                        this.snackBar.open( this.translate.instant('BonusPointUnion.saveSuccess'), '✖');
                        this.router.navigateByUrl('/apps/BonusPointRulesComponent');
                    }
                },
                error1 => {  this.btuDis = false; }
            );
        } else {
            this.memberService.updateRule(Ru_List).pipe().pipe(takeUntil(this._unsubscribeAll)).subscribe(
                res => {
                    if (res.status === 200){
                        // 修改成功
                       // this.btuDis = false;
                        this.snackBar.open(this.translate.instant('BonusPointUnion.editSuccess'), '✖');
                        this.router.navigateByUrl('/apps/BonusPointRulesComponent');
                    }
                },
                error1 => { this.btuDis = false; }
            );
        }

    }

    toReturn(){
        // if (this.interactCheckboxPara.interactsId === CouponParameter.ADD_Rule_INTERACT) {
        //     this.router.navigateByUrl('/apps/AddRuleComponent');
        // } else {
        //     this.router.navigateByUrl('/apps/BonusPointRulesComponent');
        // }
        history.back();
    }

    toEdit(){
        if (this.interactCheckboxPara.interactsId === CouponParameter.ADD_Rule_INTERACT) {
            // 新建
            this.interactCheckboxPara.SAVE_CANCEL = false;
            this.interactCheckboxPara.EDIT_RETURN = true;
        } else {
            // 详情
            this.interactCheckboxPara.SAVE_CANCEL = true;
            this.interactCheckboxPara.EDIT_RETURN = false;
            this.interactCheckboxPara.EDIT_BTU_DIS = false;
            this.FormRuleDto.controls.ruleName.enable();
            this.FormRuleDto.controls.desc.enable();
            this.FormRuleDto.controls.enabled.enable();
            this.FormRuleAttendance.controls.point.enable();
            this.FormRuleRegister.controls.point.enable();
            this.FormRuleCollarCoupons.controls.point.enable();
            this.FormRuleCollarCoupons.controls.upperLimit.enable();
            this.FormRuleComment.controls.point.enable();
            this.FormRuleComment.controls.upperLimit.enable();
            this.FormRuleShare.controls.point.enable();
            this.FormRuleShare.controls.period.enable();
        }
    }

    toCancel(){
        if (this.interactCheckboxPara.interactsId === CouponParameter.ADD_Rule_INTERACT){
            // 新建
            this.router.navigateByUrl('/apps/AddRuleComponent');
        } else {
            // 详情
            this.interactCheckboxPara.SAVE_CANCEL = false;
            this.interactCheckboxPara.EDIT_RETURN = true;
            this.interactCheckboxPara.EDIT_BTU_DIS = true;
            this.editSetData(this.All_Data_BF);
            this.FormRuleDto.controls.ruleName.disable();
            this.FormRuleDto.controls.desc.disable();
            this.FormRuleDto.controls.enabled.disable();
            this.FormRuleAttendance.controls.point.disable();
            this.FormRuleRegister.controls.point.disable();
            this.FormRuleCollarCoupons.controls.point.disable();
            this.FormRuleCollarCoupons.controls.upperLimit.disable();
            this.FormRuleComment.controls.point.disable();
            this.FormRuleComment.controls.upperLimit.disable();
            this.FormRuleShare.controls.point.disable();
            this.FormRuleShare.controls.period.disable();
        }

    }

    editSetData(res){
        // 第一块儿
        this.FormRuleDto.controls.id.patchValue(res[this.interactCheckboxPara.ruleDTOPara].id);
        this.FormRuleDto.controls.ruleName.patchValue(res[this.interactCheckboxPara.ruleDTOPara].ruleName);
        this.FormRuleDto.controls.desc.patchValue(res[this.interactCheckboxPara.ruleDTOPara].desc);
        this.FormRuleDto.controls.enabled.patchValue(res[this.interactCheckboxPara.ruleDTOPara].enabled);
        this.FormRuleDto.controls.createdBy.patchValue(res[this.interactCheckboxPara.ruleDTOPara].createdBy);
        this.FormRuleDto.controls.createdDate.patchValue(res[this.interactCheckboxPara.ruleDTOPara].createdDate);
        this.FormRuleDto.controls.lastModifiedBy.patchValue(res[this.interactCheckboxPara.ruleDTOPara].lastModifiedBy);
        this.FormRuleDto.controls.lastModifiedDate.patchValue(res[this.interactCheckboxPara.ruleDTOPara].lastModifiedDate);
        res[this.interactCheckboxPara.interactRulePara].forEach( ru => {
            if (ru.name === CouponParameter.RULE_CHECK_IN) {
                // 第二块儿 签到奖励积分
                this.FormRuleAttendance.controls.point.patchValue(ru.point);
                this.interactRuleAttendance.id = ru.id;
                this.interactRuleAttendance.ruleId = ru.ruleId;
                this.interactRuleAttendance.enabled = ru.enabled;
                this.interactRuleAttendance.app = ru.app;
                this.interactRuleAttendance.applet = ru.applet;
                this.interactRuleAttendance.createdBy = ru.createdBy;
                this.interactRuleAttendance.createdDate = ru.createdDate;
                this.interactRuleAttendance.lastModifiedBy = ru.lastModifiedBy;
                this.interactRuleAttendance.lastModifiedDate = ru.lastModifiedDate;
            } else if (ru.name === CouponParameter.RULE_REGISTERED){
                // 注册奖励积分
                this.FormRuleRegister.controls.point.patchValue(ru.point);
                this.interactRuleRegister.enabled = ru.enabled;
                this.interactRuleRegister.id = ru.id;
                this.interactRuleRegister.ruleId = ru.ruleId;
                this.interactRuleRegister.createdBy = ru.createdBy;
                this.interactRuleRegister.createdDate = ru.createdDate;
                this.interactRuleRegister.lastModifiedBy = ru.lastModifiedBy;
                this.interactRuleRegister.lastModifiedDate = ru.lastModifiedDate;
            } else if (ru.name === CouponParameter.RULE_COUPON){
                // 领劵奖励积分
                this.FormRuleCollarCoupons.controls.point.patchValue(ru.point);
                this.FormRuleCollarCoupons.controls.upperLimit.patchValue(ru.upperLimit);
                this.interactRuleCollarCoupons.enabled = ru.enabled;
                this.interactRuleCollarCoupons.id = ru.id;
                this.interactRuleCollarCoupons.ruleId = ru.ruleId;
                this.interactRuleCollarCoupons.createdBy = ru.createdBy;
                this.interactRuleCollarCoupons.createdDate = ru.createdDate;
                this.interactRuleCollarCoupons.lastModifiedBy = ru.lastModifiedBy;
                this.interactRuleCollarCoupons.lastModifiedDate = ru.lastModifiedDate;
                this.interactRuleCollarCoupons.upperLimit = ru.upperLimit;
                this.CheckboxParaCollarCouponsPoint();
            } else if (ru.name === CouponParameter.RULE_COMMENT) {
                // 评论奖励积分
                this.FormRuleComment.controls.point.patchValue(ru.point);
                this.FormRuleComment.controls.upperLimit.patchValue(ru.upperLimit);
                this.interactRuleComment.enabled = ru.enabled;
                this.interactRuleComment.id = ru.id;
                this.interactRuleComment.ruleId = ru.ruleId;
                this.interactRuleComment.createdBy = ru.createdBy;
                this.interactRuleComment.createdDate = ru.createdDate;
                this.interactRuleComment.lastModifiedBy = ru.lastModifiedBy;
                this.interactRuleComment.lastModifiedDate = ru.lastModifiedDate;
                this.interactRuleComment.upperLimit = ru.upperLimit;
                this.CheckboxParaCommentPoint();
            } else if (ru.name === CouponParameter.RULE_SHARE){
                // 分享奖励积分
                this.FormRuleShare.controls.point.patchValue(ru.point);
                this.FormRuleShare.controls.period.patchValue(ru.period);
                this.interactShare.enabled = ru.enabled;
                this.interactShare.app = ru.app;
                this.interactShare.applet = ru.applet;
                this.interactShare.id = ru.id;
                this.interactShare.ruleId = ru.ruleId;
                this.interactShare.createdBy = ru.createdBy;
                this.interactShare.createdDate = ru.createdDate;
                this.interactShare.lastModifiedBy = ru.lastModifiedBy;
                this.interactShare.lastModifiedDate = ru.lastModifiedDate;
            }
        });
    }

    // 验证
    interactVerification(){
          if ( this.FormRuleDto.controls.ruleName.value === ''
              || this.FormRuleDto.controls.ruleName.value === null){
              // 名称不能为空
              this.snackBar.open(this.translate.instant('BonusPointUnion.tips.RuleNameNotNull'), '✖');
              return true;
          }
          if ( this.FormRuleDto.controls.desc.value  === ''
              || this.FormRuleDto.controls.desc.value === null){
              // 简介不能为空
              this.snackBar.open(this.translate.instant('BonusPointUnion.tips.RuleDescNotNull'), '✖');
              return true;
          }
          if (this.interactRuleAttendance.enabled){
             if ( this.document.nativeElement.querySelector('#Attendance_bonusPoint').value === ''
                 ||  this.document.nativeElement.querySelector('#Attendance_bonusPoint').value === null) {
                 // 签到奖励积分被启用了，请填首次签到需奖励的积分
                    this.snackBar.open(this.translate.instant('BonusPointUnion.tips.BonusPointsForSigningInTips'), '✖');
                    return true;
             }
          }
          if (this.interactRuleRegister.enabled){
              if (this.document.nativeElement.querySelector('#Register_bonusPoint').value === ''
                  || this.document.nativeElement.querySelector('#Register_bonusPoint').value === null){
                  // 注册奖励积分被启用了，请填首次注册需奖励的积分
                  this.snackBar.open(this.translate.instant('BonusPointUnion.tips.RegisteredBonusPointsTips'), '✖');
                  return true;
              }
          }
          if (this.interactRuleCollarCoupons.enabled){
               if (this.document.nativeElement.querySelector('#CollarCoupons_upperLimit').value === ''
                  || this.document.nativeElement.querySelector('#CollarCoupons_upperLimit').value === null){
                   // 领券奖励积分被启用了，请填积分上限
                  this.snackBar.open(this.translate.instant('BonusPointUnion.tips.RewardCeilingTips'), '✖');
                  return true;
              }
              if (this.document.nativeElement.querySelector('#CollarCoupons_bonusPoint').value === ''
                  || this.document.nativeElement.querySelector('#CollarCoupons_bonusPoint').value === null){
                   // 领券奖励积分被启用了，请填谢奖励的积分
                  this.snackBar.open(this.translate.instant('BonusPointUnion.tips.RewardCeilingTipsUpperLimit'), '✖');
                  return true;
              }
          }
          if (this.interactRuleComment.enabled){
              if (this.document.nativeElement.querySelector('#Comment_upperLimit').value === ''
                  || this.document.nativeElement.querySelector('#Comment_upperLimit').value === null){
                  // 评论奖励积分被启用了，请填积分上限
                  this.snackBar.open(this.translate.instant('BonusPointUnion.tips.CollectCouponsZAwardTips1'), '✖');
                  return true;
              }
              if (this.document.nativeElement.querySelector('#Comment_bonusPoint').value === ''
                  || this.document.nativeElement.querySelector('#Comment_bonusPoint').value === null){
                  // 评论奖励积分被启用了，请填谢奖励的积分
                  this.snackBar.open(this.translate.instant('BonusPointUnion.tips.CollectCouponsZAwardTips2'), '✖');
                  return true;
              }
          }
          if (this.interactShare.enabled){
              if (this.document.nativeElement.querySelector('#Share_bonusPoint').value === ''
                  || this.document.nativeElement.querySelector('#Share_bonusPoint').value === null){
                  // 分享奖励积分被启用了，请填写奖励积分
                  this.snackBar.open(this.translate.instant('BonusPointUnion.tips.ShareBonusPointsTips'), '✖');
                  return true;
              }
          }
          return false;
    }

    // 是否启用按钮
    toggleChange(interactName, event){
        if (this.interactCheckboxPara.interactRuleAttendance === interactName){
            this.interactRuleAttendance.enabled = event.checked;
            if (this.interactRuleAttendance.enabled ) {
                this.FormRuleAttendance.get(this.interactRulePara.point).setValidators(Validators.required);
                this.FormRuleAttendance.get(this.interactRulePara.point).patchValue(' ');
                this.FormRuleAttendance.get(this.interactRulePara.point).patchValue(null);
            } else {
                this.FormRuleAttendance.get(this.interactRulePara.point).patchValue(' ');
                this.FormRuleAttendance.get(this.interactRulePara.point).clearValidators();
                this.FormRuleAttendance.get(this.interactRulePara.point).patchValue(null);
            }
        }
        if (this.interactCheckboxPara.interactRuleRegister === interactName){
            this.interactRuleRegister.enabled = event.checked;
            if (this.interactRuleRegister.enabled ) {
                this.FormRuleRegister.get(this.interactRulePara.point).setValidators(Validators.required);
                this.FormRuleRegister.get(this.interactRulePara.point).patchValue(this.firstPoint);
               // this.FormRuleRegister.get('point').patchValue(null);
            } else {
                this.FormRuleRegister.get(this.interactRulePara.point).patchValue(this.firstPoint);
                this.FormRuleRegister.get(this.interactRulePara.point).clearValidators();
               // this.FormRuleRegister.get('point').patchValue(null);
            }
        }
        if (this.interactCheckboxPara.interactRuleCollarCoupons === interactName){
            this.interactRuleCollarCoupons.enabled = event.checked;

            if (this.interactRuleCollarCoupons.enabled ) {
                this.FormRuleCollarCoupons.get(this.interactRulePara.point).setValidators(Validators.required);
                this.FormRuleCollarCoupons.get(this.interactRulePara.point).patchValue(this.firstPoint);
                // this.FormRuleCollarCoupons.get('point').patchValue(null);
                this.FormRuleCollarCoupons.get(this.interactRulePara.upperLimit).setValidators(Validators.required);
                this.FormRuleCollarCoupons.get(this.interactRulePara.upperLimit).patchValue(this.firstPoint);
               // this.FormRuleCollarCoupons.get('upperLimit').patchValue(null);
            } else {
                this.FormRuleCollarCoupons.get(this.interactRulePara.point).patchValue(this.firstPoint);
                this.FormRuleCollarCoupons.get(this.interactRulePara.point).clearValidators();
              //  this.FormRuleCollarCoupons.get('point').patchValue(null);
                this.FormRuleCollarCoupons.get(this.interactRulePara.upperLimit).patchValue(this.firstPoint);
                this.FormRuleCollarCoupons.get(this.interactRulePara.upperLimit).clearValidators();
              //  this.FormRuleCollarCoupons.get('upperLimit').patchValue(null);
            }
        }
        if (this.interactCheckboxPara.interactRuleComment === interactName){
            this.interactRuleComment.enabled = event.checked;
            if (this.interactRuleComment.enabled ) {
                this.FormRuleComment.get(this.interactRulePara.point).setValidators(Validators.required);
                this.FormRuleComment.get(this.interactRulePara.point).patchValue(this.firstPoint);
                // this.FormRuleCollarCoupons.get('point').patchValue(null);
                this.FormRuleComment.get(this.interactRulePara.upperLimit).setValidators(Validators.required);
                this.FormRuleComment.get(this.interactRulePara.upperLimit).patchValue(this.firstPoint);
                // this.FormRuleCollarCoupons.get('upperLimit').patchValue(null);
            } else {
                this.FormRuleComment.get(this.interactRulePara.point).patchValue(this.firstPoint);
                this.FormRuleComment.get(this.interactRulePara.point).clearValidators();
                //  this.FormRuleCollarCoupons.get('point').patchValue(null);
                this.FormRuleComment.get(this.interactRulePara.upperLimit).patchValue(this.firstPoint);
                this.FormRuleComment.get(this.interactRulePara.upperLimit).clearValidators();
                //  this.FormRuleCollarCoupons.get('upperLimit').patchValue(null);
            }

        }
        if (this.interactCheckboxPara.interactShare === interactName){
            this.interactShare.enabled = event.checked;

            if (this.interactShare.enabled ) {
                this.FormRuleShare.get(this.interactRulePara.point).setValidators(Validators.required);
                this.FormRuleShare.get(this.interactRulePara.point).patchValue(' ');
                this.FormRuleShare.get(this.interactRulePara.point).patchValue(null);
            } else {
                this.FormRuleShare.get(this.interactRulePara.point).patchValue(' ');
                this.FormRuleShare.get(this.interactRulePara.point).clearValidators();
                this.FormRuleShare.get(this.interactRulePara.point).patchValue(null);
            }
        }
    }

    // 签到选择框
    checkboxChange(interactName , fieldName , event){
        if (this.interactCheckboxPara.interactRuleAttendance === interactName){
              if (fieldName ===  this.interactRulePara.app) {
                  this.interactRuleAttendance.app = event.checked;
                  if ( !event.checked ){
                      this.interactRuleAttendance.applet === false ? this.interactRuleAttendance.applet = true : this.interactRuleAttendance.app = event.checked;
                  }
              }
              if (fieldName ===  this.interactRulePara.applet) {
                  this.interactRuleAttendance.applet = event.checked;
                if (!event.checked ){
                    this.interactRuleAttendance.app === false ? this.interactRuleAttendance.app = true : this.interactRuleAttendance.applet = event.checked;
                }
             }
        }
        if (this.interactCheckboxPara.interactCheckboxPara === interactName){
              if (fieldName ===  this.interactCheckboxPara.CollarCouponsPointPara) {
                  if (event.checked === false) {
                      this.interactRuleCollarCoupons.upperLimit = this.ZERO; //
                      this.FormRuleCollarCoupons.controls.upperLimit.disable();
                  } else {
                      this.FormRuleCollarCoupons.controls.upperLimit.enable();
                  }
              }
              if (fieldName ===   this.interactCheckboxPara.CommentPointPara ) {
                  if (event.checked === false) {
                      this.interactRuleComment.upperLimit = this.ZERO;
                      this.FormRuleComment.controls.upperLimit.disable();
                  } else {
                      this.FormRuleComment.controls.upperLimit.enable();
                  }
             }
        }
        if (this.interactCheckboxPara.interactShare === interactName){
            if (fieldName ===  this.interactRulePara.app) {
                this.interactShare.app = event.checked;
                if ( !event.checked ){
                    this.interactShare.applet === false ? this.interactShare.applet = true : this.interactShare.app = event.checked;
                }
            }
            if (fieldName === this.interactRulePara.applet) {
                this.interactShare.applet = event.checked;
                if (!event.checked ){
                    this.interactShare.app === false ? this.interactShare.app = true : this.interactShare.applet = event.checked;
                }
            }
        }
     }


    // 设置积分上限的那个选择框
    CheckboxParaCollarCouponsPoint(){
        if (this.interactRuleCollarCoupons.upperLimit > this.ZERO ){
            this.interactCheckboxPara.CollarCouponsPoint = true;
        } else {
            this.interactCheckboxPara.CollarCouponsPoint = false;
        }
    }
    // 设置积分上限的那个选择框
    CheckboxParaCommentPoint(){
        if (this.interactRuleComment.upperLimit > this.ZERO ){
            this.interactCheckboxPara.CommentPoint = true;
        } else {
            this.interactCheckboxPara.CommentPoint = false;
        }
    }

    // 初始化初始变量
   initSourceData(){
        // 积分规则实体
       // this.ruleDto = new RuleDTO();
       // this.ruleDto.id = null;
       // this.ruleDto.ruleName = null;
       // this.ruleDto.type = null;
       // this.ruleDto.desc = null;
       // this.ruleDto.enabled = true;
       // this.ruleDto.terminalNo = null;
       // this.ruleDto.businessType = null;
       // this.ruleDto.rmb = null;
       // this.ruleDto.point = null;
       // this.ruleDto.createdBy = sessionStorage.getItem('username');
       // this.ruleDto.createdDate = null;
       // this.ruleDto.lastModifiedBy = sessionStorage.getItem('username');
       // this.ruleDto.lastModifiedDate = null;
       // 签到奖励积分
       this.interactRuleAttendance = new InteractRuleDTOS();
       this.interactRulePara = new InteractRulePara();
       this.interactCheckboxPara = new InteractCheckboxPara();
       this.initInteract(this.interactCheckboxPara.interactRuleAttendance);
       this.interactRuleRegister  = new InteractRuleDTOS();   // 注册奖励积分
       this.initInteract(this.interactCheckboxPara.interactRuleRegister);
       this.interactRuleCollarCoupons  = new InteractRuleDTOS();   // 领券奖励积分
       this.initInteract(this.interactCheckboxPara.interactRuleCollarCoupons);
       this.interactRuleComment  = new InteractRuleDTOS();   // 评论奖励积分
       this.initInteract(this.interactCheckboxPara.interactRuleComment);
       this.interactShare  = new InteractRuleDTOS();      // 分享奖励积分
       this.initInteract(this.interactCheckboxPara.interactShare);
       this.FormRuleCollarCoupons.controls.upperLimit.enable();
       this.FormRuleComment.controls.upperLimit.enable();
       this.interactCheckboxPara.RuleStrutsList = [
           {value: this.translate.instant('BonusPointUnion.normal') , viewValue: true},
           {value: this.translate.instant('BonusPointUnion.frozen') , viewValue: false},
       ];
       this.btuDis = false;
   }
   // 初始化初始变量
   initInteract(p){
       this[p].id = null;
       if (this.interactCheckboxPara.interactRuleAttendance === p){
           this[p].name = CouponParameter.RULE_CHECK_IN;
           this[p].desc = this.translate.instant('BonusPointUnion.BonusPointRules.BonusPointsForSigningIn') + '，' +
               this.translate.instant('BonusPointUnion.BonusPointRules.DailyFirstSignInReward') ;  // '签到奖励积分，每日首次签到奖励';
           this[p].enabled = true;
           this[p].app = true;
           this[p].applet = false;
           this[p].upperLimit = null;
           this[p].point = null;
           this[p].period = CouponParameter.RULE_DAY;
       }
       if (this.interactCheckboxPara.interactRuleRegister === p){
           this[p].name = CouponParameter.RULE_REGISTERED;
           this[p].desc = this.translate.instant('BonusPointUnion.BonusPointRules.RegisteredBonusPoints') + '，' +
               this.translate.instant('BonusPointUnion.BonusPointRules.RewardForFirstRegistrationAndLanding'); // '注册奖励积分，首次注册登录奖励';
           this[p].enabled = false;
           this[p].app = false;
           this[p].applet = false;
           this[p].upperLimit = null;
           this[p].point = this.firstPoint;
           this[p].period = CouponParameter.RULE_ONCE;
       }
       if (this.interactCheckboxPara.interactRuleCollarCoupons === p){
           this[p].name = CouponParameter.RULE_COUPON;
           this[p].desc = this.translate.instant('BonusPointUnion.BonusPointRules.BonusPointsForCollectingBonds') + '，' +
               this.translate.instant('BonusPointUnion.BonusPointRules.CollectCouponsZAward'); // '领劵奖励积分，领取优惠券/张奖励';
           this[p].enabled = false;
           this[p].app = false;
           this[p].applet = false;
           this[p].upperLimit = this.firstPoint;
           this[p].point = this.firstPoint;
           this[p].period = CouponParameter.RULE_DAY;
           this.CheckboxParaCollarCouponsPoint();
       }
       if (this.interactCheckboxPara.interactRuleComment === p){
           this[p].name = CouponParameter.RULE_COMMENT;
           this[p].desc = this.translate.instant('BonusPointUnion.BonusPointRules.ReviewBonusPoints') + '，' +
               this.translate.instant('BonusPointUnion.BonusPointRules.CommentOnceReward'); /// '评论奖励积分，发表评论/次奖励';
           this[p].enabled = false;
           this[p].app = false;
           this[p].applet = false;
           this[p].upperLimit = this.firstPoint;
           this[p].point = this.firstPoint;
           this[p].period = CouponParameter.RULE_DAY;
           this.CheckboxParaCommentPoint();
       }
       if (this.interactCheckboxPara.interactShare === p){
           this[p].name = CouponParameter.RULE_SHARE;
           this[p].desc = this.translate.instant('BonusPointUnion.BonusPointRules.ShareBonusPoints') + '，' +
               this.translate.instant('BonusPointUnion.BonusPointRules.ShareRewardsForTheFirstTime'); // '分享奖励积分，首次分享奖励';
           this[p].enabled = true;
           this[p].app = true;
           this[p].applet = false;
           this[p].upperLimit = null;
           this[p].point = null;
           this[p].period = CouponParameter.RULE_DAY;
       }
       this[p].ruleId = null;
       this[p].createdBy = sessionStorage.getItem('username');
       this[p].createdDate = null;
       this[p].lastModifiedBy = sessionStorage.getItem('username');
       this[p].lastModifiedDate = null;
   }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}


export class InteractCheckboxPara {
    CollarCouponsPoint = true;   // 领券奖励积分的  积分  选择框控制变量
    CommentPoint = true;        // 评论奖励积分的   积分  选择框控制变量
    RuleStrutsList: Array<{value: number | null | undefined | string , viewValue: number | null | undefined | string | boolean}>;
    EDIT_RETURN: boolean;           // 编辑返回
    SAVE_CANCEL: boolean;           // 保存取消
    interactsTitle: string;         // 标题
    interactsId: string;
    CouponDays: any;                // 日期选择框
    EDIT_BTU_DIS: boolean;         // 设置编辑页面的按钮-选中按钮是否可用
    ruleDTOPara = 'ruleDTO';
    interactRulePara = 'interactRuleDTOS';
    interactRuleAttendance = 'interactRuleAttendance'; // 签到奖励积分
    interactRuleRegister = 'interactRuleRegister';   // 注册奖励积分
    interactRuleCollarCoupons = 'interactRuleCollarCoupons';   // 领券奖励积分
    interactRuleComment = 'interactRuleComment';   // 评论奖励积分
    interactShare = 'interactShare';       // 分享奖励积分\
    interactCheckboxPara = 'interactCheckboxPara';
    CollarCouponsPointPara = 'CollarCouponsPoint';
    CommentPointPara = 'CommentPoint';
}
export class InteractRulePara {
    id = 'id';
    name = 'name';
    desc = 'desc';
    enabled = 'enabled';
    app = 'app';
    applet = 'applet';
    period = 'period';
    upperLimit = 'upperLimit';
    point = 'point';
    ruleId = 'ruleId';
    createdBy = 'createdBy';
    createdDate = 'createdDate';
    lastModifiedBy = 'lastModifiedBy';
    lastModifiedDate = 'lastModifiedDate';
}
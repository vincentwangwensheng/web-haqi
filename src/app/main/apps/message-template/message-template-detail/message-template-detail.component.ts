import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog, MatSnackBar} from '@angular/material';
import {MessageTemplateService} from '../message-template.service';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {fuseAnimations} from '../../../../../@fuse/animations';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-message-template-detail',
    templateUrl: './message-template-detail.component.html',
    styleUrls: ['./message-template-detail.component.scss'] ,
    animations: fuseAnimations
})
export class MessageTemplateDetailComponent implements OnInit {
    profileForm = new FormGroup({
        messageTemplateName: new FormControl('', Validators.required), // 模板名称
        messageSendSupport: new FormControl('', Validators.required),
        messageTemplateType: new FormControl('', Validators.required),
        templateStatus: new FormControl('', Validators.required),
        messageTemplateContent: new FormControl('', Validators.required),
        messageTemplateSign: new FormControl('', Validators.required),
        lastModifiedBy: new FormControl(''),
        lastModifiedDate: new FormControl(''),
    });
    pageFlag;

    pageTitle;

    primitiveData; // 详情获取的原始数据
    saveButtonStatus = false; // 保存按钮状态

    TemplateType = []; // 模板类型

    SendSupport = []; // 短信供货商

    Status = []; // 状态

    messageTeSource = []; // 模板合集
    messageTeID = '0';

    messageTePra = [];


    constructor(private activatedRoute: ActivatedRoute,
                private snackBar: MatSnackBar,
                private messageTemplateService: MessageTemplateService,
                private router: Router,
                public  dialog: MatDialog,
                private translate: TranslateService,
                private dateTransform: NewDateTransformPipe) {
    }

    ngOnInit() {
        this.initSelect();
        this.pageFlag = this.activatedRoute.snapshot.data['operation'];
        if ('create' === this.pageFlag) {
            this.pageTitle =  this.translate.instant('messageTemplate.newTemplate'); // 新建模板
            this.profileForm.get('messageTemplateContent').patchValue( this.translate.instant('messageTemplate.DefaultTemplate1')); // 尊敬的会员${name}您好,优惠券已经发送到您卡包，请注意查收，祝您生活愉快！
            this.profileForm.get('messageSendSupport').patchValue( this.translate.instant('messageTemplate.Support1')); // 国都互联
            this.profileForm.get('messageTemplateType').patchValue( this.translate.instant('messageTemplate.MarketingSMS')); // 营销短信
            this.profileForm.get('templateStatus').patchValue('NORMAL'); // NORMAL

        } else if ('detail' === this.pageFlag) {
            this.pageTitle = this.translate.instant('messageTemplate.templateDetail'); // 模板详情
            this.profileForm.disable();
            const id = +this.activatedRoute.snapshot.paramMap.get('id');
            this.messageTemplateService.getTemplateById(id).subscribe((res) => {
                this.primitiveData = res;
                res['lastModifiedDate'] = this.dateTransform.transform(res['lastModifiedDate']);
                this.profileForm.patchValue(res);
            });
        }
    }

    initSelect(){

        // 短信供货商
        this.SendSupport = [
            {id: this.translate.instant('messageTemplate.Support1'), value:  this.translate.instant('messageTemplate.Support1')} ,  // 国都互联
            {id: this.translate.instant('messageTemplate.SupportKC') , value: this.translate.instant('messageTemplate.SupportKC') }  // 科传
        ];

        // 模板类型
        this.TemplateType = [
            {id: this.translate.instant('messageTemplate.MarketingSMS') , value: this.translate.instant('messageTemplate.MarketingSMS')} ,  // 营销短信
            {id: this.translate.instant('messageTemplate.SystemNotification'), value: this.translate.instant('messageTemplate.SystemNotification')} ,  // 系统通知
            {id: this.translate.instant('messageTemplate.AbnormalAlarm') , value: this.translate.instant('messageTemplate.AbnormalAlarm')} ,  // 异常报警
        ];

        // 状态
        this.Status = [
            {id: 'NORMAL' , value: this.translate.instant('messageTemplate.NORMAL')} ,  // 正常
            {id: 'FROZEN' , value: this.translate.instant('messageTemplate.FROZEN')} ,  // 冻结
        ];

        // 模板
        this.messageTeSource = [
            {id: '1' ,  value: this.translate.instant('messageTemplate.DefaultTemplate1') },  // 亲爱的${name}，欢迎您成为${level}会员，我们为您准备了丰富的活动与权益，期待您的关注呦～
            {id: '2' ,  value: this.translate.instant('messageTemplate.DefaultTemplate2') },  // 尊敬的会员${name}您好,优惠券已经发送到您卡包，请注意查收，祝您生活愉快！
            /* {id: '3' ,  value: '亲爱的${name}，感谢您对我们的关注，您的活跃值已达到了“****”，${level}提升到了${level}更多权益期待您的继续关注呦～' },
             {id: '4' ,  value: '亲爱的${name}，您购买的“卡券名称”将于“xx/xx/xx”到期，记得不要错过呦～' },
             {id: '5' ,  value: '亲爱的${name}，您在“购买”活动中获得了“数量”积分，积分账户总额${point}，我们的积分可以当钱花呦～多多关注吧！' },
             {id: '6' ,  value: '亲爱的${name}，您的“数量”张“券名称”已使用成功，祝您购物愉快呦～' },
             {id: '7' ,  value: '亲爱的${name}，您成功购买“券名称”，“券名称”已发到您的券包中，快来兑换吧～' },
             {id: '8' ,  value: '亲爱的${name}，您已累计签到“xx”天，我们为您准备了多重签到大礼，快来吧～' },
             {id: '9' ,  value: '亲爱的${name}，您关注的“xx”活动还有“xx”天到期，抓紧时间快来参加吧' },
             {id: '10' , value: '亲爱的${name}，我们已上新了“xx”活动，期待您的参加呦～' },
             {id: '11' , value: '亲爱的${name}，您已成功预约“xx”服务，预约时间：“xx/xx/xx”，期待您的光临呦～' },
             {id: '12' , value: '亲爱的${name}，您的预约已成功取消，期待下次光临呦～' },
             {id: '13' , value: '亲爱的${name}，您已成功报名“xx”活动，活动开始时间：“xx/xx/xx”，不要错过呦～' },
             {id: '14' , value: '亲爱的${name}，您已成功领取“xx”电子券' },
             {id: '15' , value: '亲爱的${name}，您的“xx”退款申请，由于“xx”原因，未被审核通过，很遗憾呢～' },
             {id: '16' , value: '亲爱的${name}，您的“xx”退款申请，已审核通过，退款将在“x”工作日到账～' },*/
        ];

        // 变量参数
        this.messageTePra = [
            {param: '${name}'      , CNParam: this.translate.instant('messageTemplate.numberName') },  // 会员昵称
            {param: '${mobile}'    , CNParam: this.translate.instant('messageTemplate.numberMobile')},  // 手机号
            {param: '${gender}'    , CNParam: this.translate.instant('messageTemplate.numberGender')},  // 性别
            {param: '${level}'     , CNParam: this.translate.instant('messageTemplate.numberLevel')},  // 会员等级
            {param: '${point}'     , CNParam: this.translate.instant('messageTemplate.numberPoint')},  // 积分总额
            {param: '${birthday}'  , CNParam: this.translate.instant('messageTemplate.numberBirthday')},  // 生日
        ];
    }


    // 保存数据
    onSave() {
        if (!this.profileForm.get('messageTemplateName').value) {
            this.snackBar.open(this.translate.instant('messageTemplate.tips1'), '✖');  // 模板名称不能为空
            return;
        }
        if (!this.profileForm.get('messageSendSupport').value) {
            this.snackBar.open(this.translate.instant('messageTemplate.tips2'), '✖');  // 短信供应商不能为空
            return;
        }
        if (!this.profileForm.get('messageTemplateType').value) {
            this.snackBar.open(this.translate.instant('messageTemplate.tips3'), '✖');  // 模板类型不能为空
            return;
        }
        if (!this.profileForm.get('templateStatus').value) {
            this.snackBar.open(this.translate.instant('messageTemplate.tips4'), '✖');  // 状态不能为空
            return;
        }
        if (!this.profileForm.get('messageTemplateContent').value) {
            this.snackBar.open(this.translate.instant('messageTemplate.tips5'), '✖');  // 模板内容不能为空
            return;
        }
        if (!this.profileForm.get('messageTemplateSign').value) {
            this.snackBar.open(this.translate.instant('messageTemplate.tips6'), '✖');  // 模板签名不能为空
            return;
        }
        this.profileForm.value['messageSendType'] = 'SM';
        this.saveButtonStatus = true;
        this.messageTemplateService.createMessageTemplate(this.profileForm.value).subscribe(() => {
            this.router.navigate(['/apps/messageTemplate']).then(() => {
                this.snackBar.open(this.translate.instant('messageTemplate.tips7'), '✖');  // 新建模板成功
            });
        }, () => {
            this.saveButtonStatus = false;
        });
    }

    // 返回
    goHistory() {
        window.history.go(-1);
    }

    // 编辑
    onEdit() {
        this.pageFlag = 'edit';
        this.pageTitle = this.translate.instant('messageTemplate.editTemplate');  // 模板编辑
        this.profileForm.enable();
    }

    onCancel() {
        this.pageFlag = 'detail';
        this.pageTitle = this.translate.instant('messageTemplate.templateDetail');  // 模板详情
        this.profileForm.disable();
        this.profileForm.patchValue(this.primitiveData);
    }

    onUpdate() {
        if (!this.profileForm.get('messageTemplateName').value) {
            this.snackBar.open(this.translate.instant('messageTemplate.tips1'), '✖');  // 模板名称不能为空
            return;
        }
        if (!this.profileForm.get('messageSendSupport').value) {
            this.snackBar.open(this.translate.instant('messageTemplate.tips2'), '✖');  // 短信供应商不能为空
            return;
        }
        if (!this.profileForm.get('messageTemplateType').value) {
            this.snackBar.open(this.translate.instant('messageTemplate.tips3'), '✖');  // 模板类型不能为空
            return;
        }
        if (!this.profileForm.get('templateStatus').value) {
            this.snackBar.open(this.translate.instant('messageTemplate.tips4'), '✖');  // 状态不能为空
            return;
        }
        if (!this.profileForm.get('messageTemplateContent').value) {
            this.snackBar.open(this.translate.instant('messageTemplate.tips5'), '✖');  // 模板内容不能为空
            return;
        }
        if (!this.profileForm.get('messageTemplateSign').value) {
            this.snackBar.open(this.translate.instant('messageTemplate.tips6'), '✖');  // 模板签名不能为空
            return;
        }
        this.profileForm.value['messageSendType'] = 'SM';
        const id = +this.activatedRoute.snapshot.paramMap.get('id');
        this.profileForm.value['id'] = id;
        delete this.profileForm.value['lastModifiedDate'];
        this.saveButtonStatus = true;
        this.messageTemplateService.updateMessageTemplate(this.profileForm.value).subscribe(() => {
            this.router.navigate(['/apps/messageTemplate']).then(() => {
                this.snackBar.open(this.translate.instant('messageTemplate.tips8'), '✖');  // 编辑模板成功
            });
        }, () => {
            this.saveButtonStatus = false;
        });


    }

      openMessageTe(messageTe){
          if (!this.dialog.getDialogById('messageTeClass')) {
              this.dialog.open(messageTe, {
                  id: 'messageTeClass',
                  width: '520px',
                  height: '350px' ,
                  hasBackdrop: true
              });
          }
      }

    cliMess(m){
        this.messageTeID = m.id;
        this.profileForm.get('messageTemplateContent').patchValue(m.value);
    }


}

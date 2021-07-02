import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {MatDialog, MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {takeUntil} from 'rxjs/operators';
import {FuseProgressBarService} from '../../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../../../services/notify-asyn.service';
import {AppletMaskServiceService} from '../../appletMaskService/applet-mask-service.service';
import {NewDateTransformPipe} from '../../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {ActivatedRoute, Router} from '@angular/router';
import {fuseAnimations} from '../../../../../../@fuse/animations';
import {MessageSubscribeService} from '../message-subscribe.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-message-subscribe-detail',
  templateUrl: './message-subscribe-detail.component.html',
  styleUrls: ['./message-subscribe-detail.component.scss'],
  animations: fuseAnimations
})
export class MessageSubscribeDetailComponent implements OnInit, AfterViewInit {
  title: any;
  operation = '';
  @ViewChild('verticalComponent', {static: true})
  verticalComponent: any;
  id = 0;

  itemList = [
    {index: 1, name: '供应商配置'},
    {index: 2, name: '库模板'},
    {index: 3, name: '配置模板'},
  ];
  itemInfo =  {index: 1, name: '供应商配置'};
  templateForm: FormGroup;

  /** 供应商 **/
  providerTypeList: any; // 供应商类型数组
  eventList = []; // 事件数组
  templatePluginWayInit = ''; // 供应商不可以修改后，访问不到form中的值


  /** 库模板 **/
  listTotal: any; // 总数据
  listTotalInit = []; // 总数据缓存
  pageList = []; // 当夜数据
  rowKey =  [{name: 'priTmplId'}, { name: 'title'}, {name: 'example'}];
  rowHeader: any;
  page = {page: 0, size: 8, count: 0}; // 分页
  recordColumnWidth;
  timeStamp; // 浏览器视口变化防抖
  titleSearch = '';
  externalInfo: any;
  templateChecked: any;

  /** 配置模板 **/
  templateContent = ''; // 配置模板信息
  // 订阅消息
  keyWordList = []; // 配置关键词数组
  keyWordListChecked = []; // 已选关键词数组
  // 短信消息
  dataDictionary: any;

  constructor(
      private dialog: MatDialog,
      private loading: FuseProgressBarService,
      private snackBar: MatSnackBar,
      private notify: NotifyAsynService,
      public activatedRoute: ActivatedRoute,
      private router: Router,
      private messageSubscribeService: MessageSubscribeService
  ) {
    this.templateForm = new FormGroup({
      templatePluginWay: new FormControl('', Validators.required),
      templateName: new FormControl('', Validators.required),
      templateStatus: new FormControl(true, Validators.required),
      templateContent: new FormControl('', Validators.required)
    });

  }

  ngOnInit() {
    this.getBasicInfo();
    this.getProviderTypeList();
    this.getDictionaries();
    this.weChatTemplateList();
  }

  // 获取消息供应商的类型(get)
  getProviderTypeList(){
    this.messageSubscribeService.getProviderTypeList().subscribe(res => {
      if (res){
        this.providerTypeList = res;
      } else {
        this.providerTypeList = [];
      }
    }, error => {
      console.log(error);
    });
  }

  // 获取数据字典(get)
  getDictionaries(){
    this.messageSubscribeService.getDictionaries().subscribe(res => {
      if (res){
        this.dataDictionary = res;
      } else {
        this.dataDictionary = [];
      }
    }, error => {
      console.log(error);
    });
  }

  getBasicInfo(){
    this.activatedRoute.data.subscribe(res => {
      this.operation = res['operation'];
      if (this.operation === 'detail'){
        this.getDetailInfo();
      }
    });
    this.title = new Map([
      ['create', '消息供应商新增'],
      ['detail', '消息供应商详情'],
      ['edit', '消息供应商编辑']
    ]);
    this.rowHeader = new Map([
      ['priTmplId', '关键字'], ['title', '标题'], ['example', '举例']
    ]);
    this.eventList = [
      {name: '积分变动', value: false},
      {name: '停车入场', value: false},
      {name: '停车缴费', value: false},
      {name: '等级变动', value: false},
      {name: '会员注册', value: false},
      {name: '会员登录', value: false},
      {name: '评论回复', value: false},
      {name: '反馈回复', value: false},
      {name: '活动审核', value: false}
    ];
    this.keyWordList = [
      {name: '积分变动', value: false},
      {name: '停车入场', value: false},
      {name: '停车缴费', value: false},
      {name: '等级变动', value: false},
      {name: '会员注册', value: false},
      {name: '会员登录', value: false},
      {name: '评论回复', value: false}
    ];
  }

  getDetailInfo() {
    this.id = this.activatedRoute.snapshot.queryParams['id'];
    this.messageSubscribeService.getMessageProviderTemplateById(this.id).subscribe(res => {
      if (res) {
        this.templateForm.patchValue({
          templatePluginWay: res['templatePluginWay'],
          templateName: res['templateName'],
          templateStatus: res['templateStatus'] === 'NORMAL' ? true : false,
          templateContent: res['templateContent'],
        });
        this.templatePluginWayInit = res['templatePluginWay'];
        this.templateChecked = res['externalCode'];
        if (this.templatePluginWayInit === 'SUBMSGWX'){
          this.messageSubscribeService.weChatTemplateList().subscribe(ref => {
            if (ref && ref instanceof Array){
              this.externalInfo = ref.filter(item => item['priTmplId'] === this.templateChecked);
            }
          }, error => {
            console.log(error);
          });
        } else {
          this.externalInfo = null;
        }
      }
      this.templateForm.disable();
    }, error => {
      console.log(error);
    });
  }

  sendItemInfo(event){
    this.itemInfo['name'] = event['name'];
    this.itemInfo['index'] = event['index'];
  }

  // 下一步
  nextStep(){
    if (this.itemInfo['index'] === 1) {
      this.templateForm.get('templatePluginWay').markAsTouched({onlySelf: true});
      this.templateForm.get('templateName').markAsTouched({onlySelf: true});
      if ((this.templateForm.value['templatePluginWay'] && this.templateForm.value['templateName']) || (this.templatePluginWayInit && this.templateForm.value['templateName'])) {
        if (this.templateForm.value['templatePluginWay'] === 'SMSTT' || this.templatePluginWayInit === 'SMSTT'){
          this.verticalComponent.nextStep();
        }
        this.verticalComponent.nextStep();
      }
    } else if (this.itemInfo['index'] === 2) {
     if (!this.templateChecked) {
       this.snackBar.open('请选择一条模板！', '✖');
     } else {
       this.verticalComponent.nextStep();
     }
    }
  }

  // 上一步
  lastStep(){
    // 详情页中的templateForm.value['templatePluginWay']拿不到值
    if (this.itemInfo['index'] === 3 && (this.templateForm.value['templatePluginWay'] === 'SMSTT' || this.templatePluginWayInit === 'SMSTT')) {
      this.verticalComponent.lastStep();
      this.verticalComponent.lastStep();
    } else {
      this.verticalComponent.lastStep();
    }
  }

  /****************** 供应商配置 ***********************/


  /***************** 库模板 ****************/
  // 微信接口--获取当前帐号下的个人模板列表
  weChatTemplateList(){
    this.messageSubscribeService.weChatTemplateList().subscribe(res => {
      if (res){
        this.listTotal = res;
        this.listTotalInit = this.listTotal;
        this.page.count = this.listTotal.length;
        this.onUserList();
      } else {
        this.listTotal = [];
      }
      this.listTotalInit = this.listTotal;
      this.page.count = this.listTotal.length;
      this.onUserList();
    }, error => {
      console.log(error);
    });
  }

  search(event){
    if (event.target.value.trim() !== '') {
      this.titleSearch = event.target.value.trim();
      this.listTotal = this.listTotal.filter(item => {
        return item['title'].indexOf(this.titleSearch) > -1;
      });
    } else {
      this.listTotal = this.listTotalInit;
    }
    this.page.count = this.listTotal.length;
    this.onUserList();
  }

  // 全维护列表
  onUserList() {
    this.page.page = 0;
    this.page.size = 8;
    this.userTurn();
  }

  // 真正的翻页
  userTurn(){
    this.pageList =  [];
    const start = this.page.page * this.page.size;
    let end = this.page.page * this.page.size + this.page.size;
    if (end >= this.listTotal.length) {
      end = this.listTotal.length;
    }
    for (let i = start ; i < end ; i++ ) {
      this.pageList.push(this.listTotal[i]);
    }
  }

  // 翻页
  onPage(event) {
    this.page.page = event.offset;
    this.userTurn();
  }

  getColumnWidth() {
    if (document.getElementById('rightContentList')){
      const columnWidth = (document.getElementById('rightContentList').offsetWidth) - 200;
      this.recordColumnWidth = columnWidth / (this.rowKey.length);
      window.addEventListener('resize' , () => {
        if (this.timeStamp){
          clearTimeout(this.timeStamp);
        }
        this.timeStamp = setTimeout(() => {
          this.getColumnWidth();
        }, 100);
      });
    }
  }

  getTemplateCheckedInfo(){
    this.externalInfo = this.listTotalInit.filter(item => item['priTmplId'] === this.templateChecked);
  }

  ngAfterViewInit(): void {
    setTimeout( () => {
      this.getColumnWidth();
    });
  }

  /***************** 配置模板 ****************/
  getKeyWordListchecked(){
    this.keyWordListChecked = this.keyWordList.filter(item => {
      return item['value'] === true;
    });
  }

  editProject(){
    this.operation = 'edit';
    this.templateForm.enable();
    this.templateForm.get('templatePluginWay').disable();
  }

  // 新增保存
  addSaveProject(){
    this.templateForm.markAllAsTouched();
    if (this.templateForm.value['templatePluginWay'] !== 'SUBMSGWX'){
      this.externalInfo = null;
    }
    if (!this.templateForm.valid){
      this.snackBar.open('请完善新增信息！', '✖');
    } else {
      const data = {
        'createdBy': '',
        'createdDate': '',
        'lastModifiedBy': '',
        'lastModifiedDate': '',
        'externalCode': this.externalInfo ? this.externalInfo[0]['priTmplId'] : '',
        'externalContent': this.externalInfo ? this.externalInfo[0]['content'] : '',
        'templateContent': this.templateForm.value['templateContent'],
        'templateName': this.templateForm.value['templateName'],
        'templatePluginWay': this.templateForm.value['templatePluginWay'],
        'templateStatus': this.templateForm.value['templateStatus'] ? 'NORMAL' : 'FROZEN'
      };
      this.messageSubscribeService.addMessageProviderTemplate(data).subscribe(res => {
        this.snackBar.open('新建成功！', '✖');
        this.router.navigate(['apps/appletMaskMessageSubscribe']);
      }, error => {
        console.log(error);
      });
    }
  }

  // 编辑保存
  editSaveProject(){
    this.templateForm.markAllAsTouched();
    if (!this.templateChecked && this.templateForm.value['templatePluginWay']  === 'SUBMSGWX'){
      this.snackBar.open('请选择一条模板！', '✖');
    } else if (!this.templateForm.valid){
      this.snackBar.open('请完善新增信息！', '✖');
    } else {
      const data = {
        'createdBy': '',
        'createdDate': '',
        'lastModifiedBy': '',
        'lastModifiedDate': '',
        'id': this.id,
        'externalCode': this.externalInfo ? this.externalInfo[0]['priTmplId'] : '',
        'externalContent': this.externalInfo ? this.externalInfo[0]['content'] : '',
        'templateContent': this.templateForm.value['templateContent'],
        'templateName': this.templateForm.value['templateName'],
        'templatePluginWay': this.templatePluginWayInit,
        'templateStatus': this.templateForm.value['templateStatus'] ? 'NORMAL' : 'FROZEN'
      };
      this.messageSubscribeService.updateMessageProviderTemplate(data).subscribe(res => {
        this.snackBar.open('编辑成功！', '✖');
        this.router.navigate(['apps/appletMaskMessageSubscribe']);
      }, error => {
        console.log(error);
      });
    }
  }

  goBack(){
    if (this.operation !== 'detail' && this.operation !== 'create') {
      this.operation = 'detail';
      this.getDetailInfo();
    } else {
      this.router.navigate(['apps/appletMaskMessageSubscribe']);
    }
  }

}

// this.listTotal = [
//   {
//     'priTmplId': '111111111',
//     'title': '购买成功通知',
//     'content': '商品名称:{{thing1.DATA}}\n订单编号:{{character_string2.DATA}}\n支付时间:{{date3.DATA}}\n支付金额:{{amount4.DATA}}\n',
//     'example': '商品名称:咖啡券\n订单编号:AB_00001\n支付时间:2019-10-22\n支付金额:9.9\n',
//     'type': 2
//   }, {
//     'priTmplId': '22222222222222',
//     'title': '购买成功通知',
//     'content': '商品名称:{{thing1.DATA}}\n订单编号:{{character_string2.DATA}}\n支付时间:{{date3.DATA}}\n支付金额:{{amount4.DATA}}\n',
//     'example': '商品名称:咖啡券\n订单编号:AB_00001\n支付时间:2019-10-22\n支付金额:9.9\n',
//     'type': 2
//   }, {
//     'priTmplId': '33333333333',
//     'title': '购买成功通知',
//     'content': '商品名称:{{thing1.DATA}}\n订单编号:{{character_string2.DATA}}\n支付时间:{{date3.DATA}}\n支付金额:{{amount4.DATA}}\n',
//     'example': '商品名称:咖啡券\n订单编号:AB_00001\n支付时间:2019-10-22\n支付金额:9.9\n',
//     'type': 2
//   }, {
//     'priTmplId': '4444444444',
//     'title': '购买成功通知',
//     'content': '商品名称:{{thing1.DATA}}\n订单编号:{{character_string2.DATA}}\n支付时间:{{date3.DATA}}\n支付金额:{{amount4.DATA}}\n',
//     'example': '商品名称:咖啡券\n订单编号:AB_00001\n支付时间:2019-10-22\n支付金额:9.9\n',
//     'type': 2
//   }, {
//     'priTmplId': '555555555555',
//     'title': '购买成功通知',
//     'content': '商品名称:{{thing1.DATA}}\n订单编号:{{character_string2.DATA}}\n支付时间:{{date3.DATA}}\n支付金额:{{amount4.DATA}}\n',
//     'example': '商品名称:咖啡券\n订单编号:AB_00001\n支付时间:2019-10-22\n支付金额:9.9\n',
//     'type': 2
//   }, {
//     'priTmplId': '6666666',
//     'title': '购买成功通知',
//     'content': '商品名称:{{thing1.DATA}}\n订单编号:{{character_string2.DATA}}\n支付时间:{{date3.DATA}}\n支付金额:{{amount4.DATA}}\n',
//     'example': '商品名称:咖啡券\n订单编号:AB_00001\n支付时间:2019-10-22\n支付金额:9.9\n',
//     'type': 2
//   }, {
//     'priTmplId': '777777777',
//     'title': '购买成功通知',
//     'content': '商品名称:{{thing1.DATA}}\n订单编号:{{character_string2.DATA}}\n支付时间:{{date3.DATA}}\n支付金额:{{amount4.DATA}}\n',
//     'example': '商品名称:咖啡券\n订单编号:AB_00001\n支付时间:2019-10-22\n支付金额:9.9\n',
//     'type': 2
//   }, {
//     'priTmplId': '888888888888',
//     'title': '购买成功通知',
//     'content': '商品名称:{{thing1.DATA}}\n订单编号:{{character_string2.DATA}}\n支付时间:{{date3.DATA}}\n支付金额:{{amount4.DATA}}\n',
//     'example': '商品名称:咖啡券\n订单编号:AB_00001\n支付时间:2019-10-22\n支付金额:9.9\n',
//     'type': 2
//   }, {
//     'priTmplId': '9999999999',
//     'title': '购买成功通知',
//     'content': '商品名称:{{thing1.DATA}}\n订单编号:{{character_string2.DATA}}\n支付时间:{{date3.DATA}}\n支付金额:{{amount4.DATA}}\n',
//     'example': '商品名称:咖啡券\n订单编号:AB_00001\n支付时间:2019-10-22\n支付金额:9.9\n',
//     'type': 2
//   }, {
//     'priTmplId': '1010101010',
//     'title': '购买成功通知',
//     'content': '商品名称:{{thing1.DATA}}\n订单编号:{{character_string2.DATA}}\n支付时间:{{date3.DATA}}\n支付金额:{{amount4.DATA}}\n',
//     'example': '商品名称:咖啡券\n订单编号:AB_00001\n支付时间:2019-10-22\n支付金额:9.9\n',
//     'type': 2
//   }, {
//     'priTmplId': '1212121212',
//     'title': '购买成功通知',
//     'content': '商品名称:{{thing1.DATA}}\n订单编号:{{character_string2.DATA}}\n支付时间:{{date3.DATA}}\n支付金额:{{amount4.DATA}}\n',
//     'example': '商品名称:咖啡券\n订单编号:AB_00001\n支付时间:2019-10-22\n支付金额:9.9\n',
//     'type': 2
//   }, {
//     'priTmplId': '13131313131',
//     'title': '购买成功通知',
//     'content': '商品名称:{{thing1.DATA}}\n订单编号:{{character_string2.DATA}}\n支付时间:{{date3.DATA}}\n支付金额:{{amount4.DATA}}\n',
//     'example': '商品名称:咖啡券\n订单编号:AB_00001\n支付时间:2019-10-22\n支付金额:9.9\n',
//     'type': 2
//   }, {
//     'priTmplId': '1414141414',
//     'title': '购买成功通知',
//     'content': '商品名称:{{thing1.DATA}}\n订单编号:{{character_string2.DATA}}\n支付时间:{{date3.DATA}}\n支付金额:{{amount4.DATA}}\n',
//     'example': '商品名称:咖啡券\n订单编号:AB_00001\n支付时间:2019-10-22\n支付金额:9.9\n',
//     'type': 2
//   }, {
//     'priTmplId': 'DNLXr8XcYx4hwluoo7pI98YS44eywnj1x1p0W_J15F0',
//     'title': '购买成功通知',
//     'content': '商品名称:{{thing1.DATA}}\n订单编号:{{character_string2.DATA}}\n支付时间:{{date3.DATA}}\n支付金额:{{amount4.DATA}}\n',
//     'example': '商品名称:咖啡券\n订单编号:AB_00001\n支付时间:2019-10-22\n支付金额:9.9\n',
//     'type': 2
//   }
// ];

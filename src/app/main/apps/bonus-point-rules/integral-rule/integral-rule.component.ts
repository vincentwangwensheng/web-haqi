import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {ActivatedRoute, Router} from '@angular/router';
import {AppletMaskServiceService} from '../../applet-mask/appletMaskService/applet-mask-service.service';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {TranslateService} from '@ngx-translate/core';
import {fuseAnimations} from '../../../../../@fuse/animations';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Subject} from 'rxjs';
import {IntegralRuleService} from './integral-rule.service';
import {take, takeUntil} from 'rxjs/operators';
import {MemberLevelService} from '../../../../services/memberLevelService/member-level.service';
import {AccountManageService} from '../../account-manage/account-manage.service';
import {EditStoreService} from '../../mall-management/store-mange/edit-store/edit-store.service';

@Component({
    selector: 'app-integral-rule',
    templateUrl: './integral-rule.component.html',
    styleUrls: ['./integral-rule.component.scss'],
    animations: fuseAnimations
})
export class IntegralRuleComponent implements OnInit, AfterViewInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject();

    title: any;
    operation = '';
    @ViewChild('verticalComponent', {static: true})
    verticalComponent: any;

    itemList = [
        {index: 1, name: '基础规则设置'},
        {index: 2, name: '消费积分规则'},
        {index: 3, name: '互动积分规则'},
    ];
    itemInfo = {index: 1, name: '基础规则设置'};

    templateName = '';
    eventList = [];
    keyWordList = [];
    keyWordListChecked = [];

    /** 库模板 **/
    listTotal = []; // 总数据
    listTotalInit = []; // 总数据缓存
    pageList = []; // 当夜数据
    rowKey = [{name: 'title'}, {name: 'keyWords'}, {name: 'serviceItems'}];
    rowHeader: any;
    page = {page: 0, size: 8, count: 0}; // 分页
    recordColumnWidth;
    timeStamp; // 浏览器视口变化防抖
    titleSearch = '';
    onlineRegistrationStatus = true;
    tacticsStatus = true;
    interactRuleData: any = [];
    memberLevels: any;
    memberLevelDTOList = [];
    profileForm = new FormGroup({
        blocId: new FormControl(null, [Validators.required]),
        mallId: new FormControl(null, [Validators.required]),
        validityType: new FormControl('NOT'),
        time: new FormControl(null), // 开始时间
        rollType: new FormControl(null),
        rollDays: new FormControl(null),
        birthdayType: new FormControl('DAY'),
        birthdayNum: new FormControl(null)
    });

    // 集团的选择
    selectedGroup = null;
    // 集团页面
    currentGroup = null;
    // 商场数据
    currentMall = null;
    // 店铺数据
    storeList = [];
    @ViewChild('picker', {static: false}) picker: any;

    @ViewChild('blockInput', {static: true}) blockInput: ElementRef;
    blocName = '';
    mallId = '';
    mallName = '';
    selectedMall = null;
    selectedStores = [];
    basicRule: any;
    consumeRuleDataArray: any;
    ruleNameArray = [];
    consumePointArray = [];

    disabledRows = [];

    oneDaySignInStatus = true;
    clickGetCouponStatus = true;
    clearCouponStatus = true;
    signPoint = null;
    registerPoint = null;
    clickGetCoupon = null;
    clearCoupon = null;

    allDataJson = {};
    primitiveAllDataJson;
    constructor(
        private dialog: MatDialog,
        private loading: FuseProgressBarService,
        private snackBar: MatSnackBar,
        private notify: NotifyAsynService,
        public activatedRoute: ActivatedRoute,
        private router: Router,
        private appletMaskServiceService: AppletMaskServiceService,
        private dateTransform: NewDateTransformPipe,
        private translate: TranslateService,
        private integralRuleService: IntegralRuleService,
        private memberLevelService: MemberLevelService,
        private accountManageService: AccountManageService,
        private editStoreService: EditStoreService
    ) {
    }

    ngOnInit() {
        this.getBasicInfo();
        this.consumeRuleDataArray = [];
        this.getMemberLevelInfo();
        // this.memberLevels = [];
    }

    getBasicInfo() {
        this.activatedRoute.data.subscribe(res => {
            this.operation = res['operation'];
            if (this.operation === 'detail') {
                // this.getDetailInfo();
                this.profileForm.disable();
            }
        });
        this.title = new Map([
            ['create', '消息供应商新增'],
            ['detail', '消息供应商详情'],
            ['edit', '消息供应商编辑']
        ]);
        console.log('this.operation:', this.operation === 'create');
        console.log('this.title.get(operation):', this.title.get(this.operation));
        this.rowHeader = new Map([
            ['title', '标题'], ['keyWords', '关键字'], ['serviceItems', '服务类目']
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

        /*           this.integralRuleService.getConsumeRules().pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
               this.consumeRuleDataArray = res;
               if (this.consumeRuleDataArray.length > 0) {
                   for (let i = 0; i < this.consumeRuleDataArray.length; i++) {
                       this.ruleNameArray[i] = this.consumeRuleDataArray[i]['ruleName'];
                       this.consumePointArray[i] = this.consumeRuleDataArray[i]['point'];
                       this.storeList[i] = this.consumeRuleDataArray[i]['storeDTOS'];
                   }
               }else {
                   this.snackBar.open('消费积分规则尚未配置数据', '✖');
               }
           });*/
        const detailId = this.activatedRoute.snapshot.paramMap.get('id');

        this.integralRuleService.getIntegralRuleDetail(detailId).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.primitiveAllDataJson = res;

            // 基础规则部分数据
            this.basicRule = res['basicsRule'];
            if (null !== this.basicRule && null !== this.basicRule['id']) {
                this.profileForm.patchValue(this.basicRule);
                this.accountManageService.getBlocByBlocId(this.profileForm.value['blocId']).pipe(takeUntil(this._unsubscribeAll)).subscribe(blocRes => {
                    this.blocName = blocRes['blocName'];
                });
                this.editStoreService.getMallByMallId(this.profileForm.value['mallId']).pipe(takeUntil(this._unsubscribeAll)).subscribe(mallRes => {
                    this.mallName = mallRes['mallName'];
                });

                this.profileForm.value['id'] = this.basicRule['id'];
                for (let i = 0; i < this.basicRule['memberLevelDTOList'].length; i++) {
                    for (let j = 0 ; j < this.memberLevelDTOList.length; j++) {
                        if (this.memberLevelDTOList[j]['memberLevelId'] === this.basicRule['memberLevelDTOList'][i]['memberLevelId']) {
                            this.memberLevelDTOList[j]['multiple'] = this.basicRule['memberLevelDTOList'][i]['multiple'];
                            break;
                        }
                    }
                }
                // this.memberLevelDTOList = this.basicRule['memberLevelDTOList'];
                this.tacticsStatus =  this.basicRule['tactics'];
            }

            // 消费积分部分数据
            this.consumeRuleDataArray = res['consumeRules'];
            if (this.consumeRuleDataArray.length > 0) {
                for (let i = 0; i < this.consumeRuleDataArray.length; i++) {
                    this.ruleNameArray[i] = this.consumeRuleDataArray[i]['ruleName'];
                    this.consumePointArray[i] = this.consumeRuleDataArray[i]['point'];
                    this.storeList[i] = this.consumeRuleDataArray[i]['storeDTOS'];
                }
            }


            // 互动积分部分数据
            this.interactRuleData = res['interactRules'];
            for (let i = 0; i < this.interactRuleData['length']; i++) {
                if (this.interactRuleData[i].name === 'REGISTERED') {
                    this.registerPoint = this.interactRuleData[i].point;
                    this.onlineRegistrationStatus = this.interactRuleData[i].enabled;
                }else if (this.interactRuleData[i].name === 'CHECK_IN') {
                    this.signPoint = this.interactRuleData[i].point;
                    this.oneDaySignInStatus = this.interactRuleData[i].enabled;
                } else if (this.interactRuleData[i].name === 'GET') {
                    this.clickGetCoupon = this.interactRuleData[i].point;
                    this.clickGetCouponStatus = this.interactRuleData[i].enabled;
                } else if (this.interactRuleData[i].name === 'CLEAR') {
                    this.clearCoupon = this.interactRuleData[i].point;
                    this.clearCouponStatus = this.interactRuleData[i].enabled;
                }

            }
        });

    }

    sendItemInfo(event) {
        this.itemInfo['name'] = event['name'];
        this.itemInfo['index'] = event['index'];
    }

    // 下一步
    nextStep() {
        this.verticalComponent.nextStep();
    }

    // 上一步
    lastStep() {
        this.verticalComponent.lastStep();
    }

    /****************** 供应商配置 ***********************/

    /***************** 库模板 ****************/
    // 拿到所有的用户信息并过滤出当前所需要的


    search(event) {
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
    userTurn() {
        this.pageList = [];
        const start = this.page.page * this.page.size;
        let end = this.page.page * this.page.size + this.page.size;
        if (end >= this.listTotal.length) {
            end = this.listTotal.length;
        }
        for (let i = start; i < end; i++) {
            this.pageList.push(this.listTotal[i]);
        }
    }

    // 翻页
    onPage(event) {
        this.page.page = event.offset;
        this.userTurn();
    }

    getColumnWidth() {
        if (document.getElementById('rightContentList')) {
            const columnWidth = (document.getElementById('rightContentList').offsetWidth) - 50;
            this.recordColumnWidth = columnWidth / (this.rowKey.length + 1);
            window.addEventListener('resize', () => {
                if (this.timeStamp) {
                    clearTimeout(this.timeStamp);
                }
                this.timeStamp = setTimeout(() => {
                    this.getColumnWidth();
                }, 100);
            });
        }
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.getColumnWidth();
        });
    }

    /***************** 配置模板 ****************/
    getKeyWordListchecked() {
        this.keyWordListChecked = this.keyWordList.filter(item => {
            return item['value'] === true;
        });
    }

    editProject() {
        this.operation = 'edit';
        this.profileForm.enable();
    }

    // 新增保存
    addSaveProject() {
        console.log('addSaveProject()');
        if (null != this.currentGroup) {
            this.profileForm.value['blocId'] = this.currentGroup['blocId'];
        }
        if (null != this.currentMall) {
            this.profileForm.value['mallId'] = this.currentMall['mallId'];
        }
        if (!this.profileForm.valid) {
            this.snackBar.open('基础规则请填写完整数据', '✖');
            return;
        }
        if (null !== this.profileForm.value['time']) {
            this.profileForm.value['time'] = this.formatToZoneDateTime(this.profileForm.value['time']);
        }
        this.profileForm.value['memberLevelDTOList'] = this.memberLevelDTOList;
        this.profileForm.value['tactics'] = this.tacticsStatus;
        if (this.operation === 'edit') {
            this.profileForm.value['id'] = this.primitiveAllDataJson['basicsRule']['id'];
        }
        this.allDataJson['basicsRule'] =  this.profileForm.value; // 基础规则数据

        for (let i = 0; i < this.consumeRuleDataArray.length; i++) {
            if (null === this.ruleNameArray[i]) {
                this.snackBar.open('请填写规则' + (i + 1) + '的名称数据', '✖');
                return;
            }
            if (null === this.consumePointArray[i]) {
                this.snackBar.open('请填写规则' + (i + 1) + '的积分数据', '✖');
                return;
            }
            /*  if (this.consumeRuleDataArray[i]['storeDTOS'].length === 0) {
                  this.snackBar.open('请添加规则' + (i + 1) + '的店铺数据', '✖');
                  return;
              }*/
            this.consumeRuleDataArray[i]['ruleName'] = this.ruleNameArray[i];
            this.consumeRuleDataArray[i]['point'] = this.consumePointArray[i];
        }
        this.allDataJson['consumeRules'] =  this.consumeRuleDataArray; // 消费积分规则数据

        if (this.interactRuleData.length === 0) {
            this.interactRuleData.push({name: 'REGISTERED', point: this.registerPoint, enabled: this.onlineRegistrationStatus});
            this.interactRuleData.push({name: 'CHECK_IN', point: this.signPoint, enabled: this.oneDaySignInStatus});
            this.interactRuleData.push({name: 'GET', point: this.clickGetCoupon, enabled: this.clickGetCouponStatus});
            this.interactRuleData.push({name: 'CLEAR', point: this.clearCoupon, enabled: this.clearCouponStatus});
        }else{
            if (this.interactRuleData.length === 4) {
                this.interactRuleData.forEach(item => {
                    if (item.name === 'REGISTERED') {
                        item.point = this.registerPoint;
                        item.enabled = this.onlineRegistrationStatus;
                    }else if (item.name === 'CHECK_IN') {
                        item.point = this.signPoint;
                        item.enabled = this.oneDaySignInStatus;
                    } else if (item.name === 'GET') {
                        item.point = this.clickGetCoupon;
                        item.enabled = this.clickGetCouponStatus;
                    } else if (item.name = 'CLEAR') {
                        item.point = this.clearCoupon;
                        item.enabled = this.clearCouponStatus;
                    }
                });
            }else {
                this.interactRuleData.push({name: 'GET', point: this.clickGetCoupon, enabled: this.clickGetCouponStatus});
                this.interactRuleData.push({name: 'CLEAR', point: this.clearCoupon, enabled: this.clearCouponStatus});
            }

        }
        this.allDataJson['interactRules'] = this.interactRuleData;

        const pointRule = {blocId: this.profileForm.value['blocId'], mallId: this.profileForm.value['mallId']};
        if (this.operation === 'edit') {
            pointRule['id'] = this.primitiveAllDataJson['pointRule']['id'];
        }
        this.allDataJson['pointRule'] = pointRule;

        if (this.operation === 'create') {
            this.integralRuleService.createIntegralRule(this.allDataJson).pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
                this.snackBar.open('新建积分规则成功', '✖');
                this.router.navigate(['apps/BonusPointRulesComponent']).then();
            });
        }else if (this.operation === 'edit') {
            this.integralRuleService.modifyIntegralRule(this.allDataJson).pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
                this.snackBar.open('更新积分规则成功', '✖');
                this.router.navigate(['apps/BonusPointRulesComponent']).then();
            });
        }

    }

    goBack() {
        if (this.operation !== 'detail' && this.operation !== 'create') {
            this.operation = 'detail';
            this.getDetailInfo();
        } else {
            this.router.navigate(['apps/BonusPointRulesComponent']);
        }
        console.log('this.eventList:', this.eventList);
    }

    selectRuleSetting(index) {
        if (index === 1) {
            if (null != this.currentGroup) {
                this.profileForm.get('blocId').patchValue(this.currentGroup['blocId']);
                // this.profileForm.value['blocId'] = this.currentGroup['blocId'];
            }
            if (null != this.currentMall) {
                this.profileForm.get('mallId').patchValue(this.currentMall['mallId']);
                // this.profileForm.value['mallId'] = this.currentMall['mallId'];
            }
            if (!this.profileForm.valid) {
                if (this.operation !== 'detail') {
                    this.snackBar.open('请填写完整数据', '✖');
                    return;
                }
            }

 /*           this.integralRuleService.getConsumeRules().pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                this.consumeRuleDataArray = res;
                if (this.consumeRuleDataArray.length > 0) {
                    for (let i = 0; i < this.consumeRuleDataArray.length; i++) {
                        this.ruleNameArray[i] = this.consumeRuleDataArray[i]['ruleName'];
                        this.consumePointArray[i] = this.consumeRuleDataArray[i]['point'];
                        this.storeList[i] = this.consumeRuleDataArray[i]['storeDTOS'];
                    }
                }else {
                    this.snackBar.open('消费积分规则尚未配置数据', '✖');
                }
            });*/
        }else if (index === 2) {/*
            this.integralRuleService.getInteractRules().pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                if (null != res && res['length'] > 0) {
                    this.interactRuleData = res;
                    for (let i = 0; i < res['length']; i++) {
                        if (res[i].name === 'REGISTERED') {
                             this.registerPoint = res[i].point;
                             this.onlineRegistrationStatus = res[i].enabled;
                        }else if (res[i].name === 'CHECK_IN') {
                             this.signPoint = res[i].point;
                             this.oneDaySignInStatus = res[i].enabled;
                        }

                    }
                }

            });*/
        }else if (index === 0) {
            // this.getMemberLevelInfo();
        }

        if (this.itemInfo['index'] === this.itemList[index]['index']) {
            return;
        } else {
            this.itemInfo = this.itemList[index];
        }


    }

    changeClearRule(event) {
        if (event.value === 'NOT') {
            this.picker.picker.clear();
        }
    }

    onSelectBlocs(event) {
        this.selectedGroup = event;
    }

    onSelectMalls(event) {
        this.selectedMall = event;
    }

    onSelectStores(event) {
/*        if (event.length > 0) {
            if (event.length === this.selectedStores.length) {
                for (let i = 0; i < this.storeList.length; i++) {
                    for (let j = 0; j < this.storeList[i].length; j++) {
                        for (let k = 0; k < event.length; k++) {
                            if (event[k]['id'] === this.storeList[i][j]['id']) {
                                this.snackBar.open('改店铺已被规则' + (i + 1) + '选择过', '✖');
                                event.splice(k, 1);
                            }
                        }

                    }
                }
            }
        }*/
        this.selectedStores = event;
    }

    // 打开集团列表
    editGroups(groupManageTemplate: TemplateRef<any>) {


        this.selectedGroup = this.currentGroup;
        this.dialog.open(groupManageTemplate, {id: 'groupManageTemplate', width: '80%'}).afterClosed().subscribe(res => {
            if (res) {
                this.currentGroup = this.selectedGroup;
                if (null != this.currentGroup) {
                    this.blocName = this.currentGroup['blocName'];
                    this.profileForm.value['blocId'] = this.currentGroup['id'];
                    if (null != this.currentMall) {
                        this.getBasicRuleByBlocIdAndMallId(this.currentGroup.blocId, this.currentMall.mallId);
                    }
                }else {
                    this.blocName = '';
                }
            } else {
                this.selectedMall = null;
            }
        });
    }


    // 打开商场列表
    editMalls(mallTemplate: TemplateRef<any>) {

        this.selectedMall = this.currentMall;
        this.dialog.open(mallTemplate, {id: 'mallTemplate', width: '80%'}).afterClosed().subscribe(res => {
            if (res) {
                this.currentMall = this.selectedMall;
                if (null != this.currentMall) {
                    this.mallName = this.currentMall['mallName'];
                    this.mallId = this.currentMall['mallId'];
                    this.profileForm.value['mallId'] = this.currentMall['id'];
                    if (null != this.currentGroup) {
                        this.getBasicRuleByBlocIdAndMallId(this.currentGroup.blocId, this.currentMall.mallId);
                    }
                }else {
                    this.mallName = '';
                    this.mallId = '';
                }
            } else {
                this.selectedMall = null;
            }
        });


    }

    editStores(storeTemplate: TemplateRef<any>, index) {
        this.mallId = this.profileForm.value['mallId'];
        if (this.operation === 'detail') {
            return;
        }
        for (let i = 0; i < this.consumeRuleDataArray.length; i++) {

            if (i !== index){
                if (this.consumeRuleDataArray[i]['storeDTOS'].length > 0) {
                    this.disabledRows =  this.disabledRows.concat(this.consumeRuleDataArray[i]['storeDTOS']);
                }
            }
        }
        this.selectedStores = [];
        Object.assign(this.selectedStores, this.storeList[index]);
        this.dialog.open(storeTemplate, {id: 'storeTemplate', width: '80%'}).afterClosed().subscribe(res => {
            if (res) {
                this.storeList[index] = [];
                Object.assign(this.storeList[index], this.selectedStores);
                this.consumeRuleDataArray[index]['storeDTOS'] = [];
                if (this.storeList[index].length > 0) {
                    this.consumeRuleDataArray[index]['storeDTOS'] = [];
                    for (let i = 0; i < this.storeList[index].length; i++) {
                        this.consumeRuleDataArray[index]['storeDTOS'].push({
                            // consumeRuleId: (index + 1),
                            // id: this.storeList[index][i]['id'],
                            storeId: this.storeList[index][i]['storeId'],
                            storeName: this.storeList[index][i]['storeName']
                        });
                    }
                }

            } else {
                this.selectedStores = [];
            }
            this.disabledRows = [];
        });


    }

    addConsumeRules() {
        if (this.operation === 'detail') {
            return;
        }
        this.ruleNameArray.push(null);
        this.consumePointArray.push(null);
        this.selectedStores.push([]);
        const consumeRuleDataArrayLength = this.consumeRuleDataArray.length;
        this.consumeRuleDataArray.push({
            ruleName: null,
            point: null,
            storeDTOS: []
        });
    }


    // 根据blocId和mallId查询基本配置数据

    getBasicRuleByBlocIdAndMallId(blocId, mallId) {
        this.integralRuleService.getBasicRuleByBlocIdAndMallId(blocId, mallId).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.basicRule = res;
            if (null !== this.basicRule && null !== this.basicRule['id']) {
                this.snackBar.open('该商场已有配置参数,请选择其他商场配置！', '✖');
                this.mallName = null;
                this.profileForm.get('mallId').patchValue(null);
                return;
                this.profileForm.patchValue(this.basicRule);
                this.profileForm.value['id'] = this.basicRule['id'];
                for (let i = 0; i < this.basicRule['memberLevelDTOList'].length; i++) {
                    for (let j = 0 ; j < this.memberLevelDTOList.length; j++) {
                        if (this.memberLevelDTOList[j]['memberLevelId'] === this.basicRule['memberLevelDTOList'][i]['memberLevelId']) {
                            this.memberLevelDTOList[j]['multiple'] = this.basicRule['memberLevelDTOList'][i]['multiple'];
                            break;
                        }
                    }
                }
                // this.memberLevelDTOList = this.basicRule['memberLevelDTOList'];
                this.tacticsStatus =  this.basicRule['tactics'];
            } else {
                // this.snackBar.open('请为该商场配置参数', '✖');
            }
        });
    }

    onUpdateBasicRule() {/*
        if (null != this.currentGroup) {
            this.profileForm.value['blocId'] = this.currentGroup['blocId'];
        }
        if (null != this.currentMall) {
            this.profileForm.value['mallId'] = this.currentMall['mallId'];
        }
        if (!this.profileForm.valid) {
            this.snackBar.open('请填写完整数据', '✖');
            return;
        }
        if (null !== this.profileForm.value['time']) {
            this.profileForm.value['time'] = this.formatToZoneDateTime(this.profileForm.value['time']);
        }
        this.profileForm.value['memberLevelDTOList'] = this.memberLevelDTOList;
        this.profileForm.value['tactics'] = this.tacticsStatus;
        this.integralRuleService.createBasicRule(this.profileForm.value).pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            this.snackBar.open('更新配置成功', '✖');
        });*/
    }



    formatToZoneDateTime(dateStr) {
        try {
            const date = new Date(dateStr);
            return date.toISOString();
        } catch (e) {
            return dateStr;
        }
    }

    deleteConsumeRule(index){
        if (this.operation === 'detail') {
            return;
        }
        if (null != this.consumeRuleDataArray[index]['id']) {
            this.integralRuleService.deleteConsumeRule(this.consumeRuleDataArray[index]['id']).pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
                this.ruleNameArray.splice(index, 1);
                this.consumePointArray.splice(index, 1);
                this.consumeRuleDataArray.splice(index, 1);
                this.selectedStores.splice(index, 1);
                this.storeList.splice(index , 1);
            });
        }else {
            this.ruleNameArray.splice(index, 1);
            this.consumePointArray.splice(index, 1);
            this.consumeRuleDataArray.splice(index, 1);
            this.selectedStores.splice(index, 1);
            this.storeList.splice(index , 1);
        }

    }

    updateConsumeRules() {
        if (this.consumeRuleDataArray.length > 0) {
            for (let i = 0; i < this.consumeRuleDataArray.length; i++) {
                if (null === this.ruleNameArray[i]) {
                    this.snackBar.open('请填写规则' + (i + 1) + '的名称数据', '✖');
                    return;
                }
                if (null === this.consumePointArray[i]) {
                    this.snackBar.open('请填写规则' + (i + 1) + '的积分数据', '✖');
                    return;
                }
              /*  if (this.consumeRuleDataArray[i]['storeDTOS'].length === 0) {
                    this.snackBar.open('请添加规则' + (i + 1) + '的店铺数据', '✖');
                    return;
                }*/
                this.consumeRuleDataArray[i]['ruleName'] = this.ruleNameArray[i];
                this.consumeRuleDataArray[i]['point'] = this.consumePointArray[i];
            }

            this.integralRuleService.createConsumeRule(this.consumeRuleDataArray).pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
                this.snackBar.open('更新成功', '✖');
                this.loading.show();
                this.integralRuleService.getConsumeRules().pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                    this.consumeRuleDataArray = res;
                    if (this.consumeRuleDataArray.length > 0) {
                        for (let i = 0; i < this.consumeRuleDataArray.length; i++) {
                            this.ruleNameArray[i] = this.consumeRuleDataArray[i]['ruleName'];
                            this.consumePointArray[i] = this.consumeRuleDataArray[i]['point'];
                            this.storeList[i] = this.consumeRuleDataArray[i]['storeDTOS'];
                        }
                    }
                    this.loading.hide();
                }, error1 => {
                    this.loading.hide();
                });

            });
        }
        else {
            this.snackBar.open('请添加消费积分规则', '✖');
            return;
        }
    }

    changeOnlineRegistrationStatus() {
       this.onlineRegistrationStatus = !this.onlineRegistrationStatus;
    }
    changeOneDaySignInStatus() {
        this.oneDaySignInStatus = !this.oneDaySignInStatus;
    }

    changeClickGetCouponStatus() {
        this.clickGetCouponStatus = !this.clickGetCouponStatus;
    }

    changeClearCouponStatus() {
        this.clearCouponStatus = !this.clearCouponStatus;
    }


    changeTacticsStatus() {
        this.tacticsStatus = !this.tacticsStatus;
    }

    updateInteractRules() {
        if (this.interactRuleData.length === 0) {
            this.interactRuleData.push({name: 'REGISTERED', point: this.registerPoint, enabled: this.onlineRegistrationStatus});
            this.interactRuleData.push({name: 'CHECK_IN', point: this.signPoint, enabled: this.oneDaySignInStatus});
        }else{
            this.interactRuleData.forEach(item => {
                if (item.name === 'REGISTERED') {
                    item.point = this.registerPoint;
                    item.enabled = this.onlineRegistrationStatus;
                }else if (item.name === 'CHECK_IN') {
                    item.point = this.signPoint;
                    item.enabled = this.oneDaySignInStatus;
                }
            });
        }
        this.integralRuleService.updateInteractRules(this.interactRuleData).pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            this.snackBar.open('更新成功', '✖');
        });
    }

        getMemberLevelInfo() {this.memberLevelService.searchMemberLevelList('?page=0&size=100&sort=levelMin').pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.memberLevels = res['body'];
            if (null != this.memberLevels && this.memberLevels.length > 0) {
                for (let i = 0; i < this.memberLevels.length; i++) {
                    this.memberLevelDTOList.push({memberLevelId: this.memberLevels[i].id, multiple: null});
                }
            }
            if ('detail' === this.operation) {
                this.getDetailInfo();
            }

        }
    );
    }


    basicRuleFormDisable() {
        this.profileForm.disable();
    }



    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }


}

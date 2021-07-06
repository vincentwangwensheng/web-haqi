import { Component, OnInit } from '@angular/core';
import {Utils} from '../../../../services/utils';
import {MatDialog, MatSnackBar} from '@angular/material';
import {MemberLevelService} from '../../../../services/memberLevelService/member-level.service';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {DateTransformPipe} from '../../../../pipes/date-transform/date-transform.pipe';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-member-setting',
  templateUrl: './member-setting.component.html',
  styleUrls: ['./member-setting.component.scss']
})
export class MemberSettingComponent implements OnInit {
  itemList = [
    {index: 1, name: '等级设置'},
    {index: 2, name: '卡样设置'},
    {index: 3, name: '权益设置'},
    {index: 4, name: '停车到场'}
  ];
  itemInfo =  {index: 1, name: '等级设置'};
  dialogFlag = '';
  // 等级设置
  initialData: any; // 从接口获取的-初始会员基础设置数据
  initialDataInfo = []; // 从接口获取的-初始会员基础设置数据
  firstCardName = null; // 第一张会员卡名称
  firstCardOperation = 'create';
  cardValue = []; // 除第一张会员卡以后信息
  myForm: FormGroup;
  imageUrl = '';
  // 权益设置
  equityExplain = '';
  // 停车到场
  currentCouponRule = null;
  selectedCouponRule = null;
  configBeginTime: any; // 设置开始时间
  configEndTime: any; // 设置结束时间
  parkingForm: FormGroup;

  constructor(
      private utils: Utils,
      private dialog: MatDialog,
      private snackBar: MatSnackBar,
      private memberLevelService: MemberLevelService,
      private loading: FuseProgressBarService,
      private dateTransform: NewDateTransformPipe,
  ) {
    this.myForm = new FormGroup({
      equityInfo: new FormControl('', Validators.required)
    });
    this.parkingForm = new FormGroup({
      parkCouponId: new FormControl('', Validators.required),
      beginTime: new FormControl('', Validators.required),
      endTime: new FormControl('', Validators.required),
    });
  }

  ngOnInit() {
    this.imageUrl = sessionStorage.getItem('baseUrl') + 'file/api/file/showImg?saveId=';
    this.searchMemberLevelList();
    this.initTimeConfig();
  }

  sendItemInfo(event){
    this.itemInfo['name'] = event['name'];
    this.itemInfo['index'] = event['index'];
  }

  /*********************等级设置*******************/
  // 获取会员基础设置信息
  searchMemberLevelList(){
    this.loading.show();
    this.initialData = [];
    this.memberLevelService.searchMemberLevelList('?sort=levelMin').subscribe(res => {
      if (res['body']) {
        this.initialData = res['body'];
        for (let i = 0; i < res['body']['length']; i++) {
          // 权益信息有空的则将权益信息清空
          if (res['body'][i]['levelremarks'].length !== 0) {
            this.myForm.get('equityInfo').setValue(res['body'][i]['levelremarks'][0]['remark']);
            this.parkingForm.get('parkCouponId').setValue(res['body'][i]['levelremarks'][0]['parkCouponId']);
            this.parkingForm.get('beginTime').setValue(this.dateTransform.transform(res['body'][i]['levelremarks'][0]['beginTime'], '-'));
            this.parkingForm.get('endTime').setValue(this.dateTransform.transform(res['body'][i]['levelremarks'][0]['endTime'], '-'));
          } else {
            this.myForm.get('equityInfo').setValue('');
            this.parkingForm.get('parkCouponId').setValue('');
            this.parkingForm.get('beginTime').setValue('');
            this.parkingForm.get('endTime').setValue('');
          }
        }
        this.initialDataInfo = [];
        this.initialData.forEach(item => {
          this.initialDataInfo.push({
            'id': item['id'],
            'levelName': item['levelName'],
            'levelpic': item['levelpic'],
            'levelpicChange': item['levelpic'] ? item['levelpic']['fileId'] : null,
            'enable': item['enable']
          });
        });
      } else {
        this.snackBar.open('查询数据为空', '✖');
      }
    }, () => {
      this.loading.hide();
    }, () => {
      this.loading.hide();
    });
  }

  // 校验等级设置数据
  onSaveBasic(closeOrderDialog){
    // this.myForm.get('levelNumStart').markAsTouched({onlySelf: true});
    // if (!this.myForm.get('levelNumStart').valid) {
    //   return;
    // }
    // 只校验已启用的卡等级
    const initialDataEnabled = this.initialData.filter(item => item['enable']);
    const length = initialDataEnabled.length;
    if (length > 0) {
      for (let i = 0; i < length; i++) {
        if (initialDataEnabled[i]['levelName'] === '') {
          this.snackBar.open('请输入会员卡名称', '✖');
          return;
        }
        if (initialDataEnabled[i]['levelMin'] === '') {
          this.snackBar.open('请输入积分门槛', '✖');
          return;
        }
        if (i > 0 && (initialDataEnabled[i]['levelMin'] <= initialDataEnabled[i - 1]['levelMin'])) {
          this.snackBar.open('请输入正确的成长值区间', '✖');
          return;
        }
      }
      this.dialogFlag = 'basics';
      this.dialog.open(closeOrderDialog, {id: 'frozenTips', width: '350px'}).afterOpened().subscribe(res => {});
    }
  }

  toOnSaveBasic(){
    const data = [];
    this.initialData.forEach(item => {
      data.push({
        'enable': item['enable'],
        'id': item['id'],
        'level': item['level'],
        'levelMin': item['levelMin'],
        'levelName': item['levelName'],
        // 'levelNumStart': item['levelNumStart'],
        'levelNumStart': ''
      });
    });
    this.loading.show();
    this.memberLevelService.createMemberLevel(data).subscribe(() => {
      this.searchMemberLevelList();
      this.dialog.closeAll();
      this.snackBar.open('保存成功', '✖');
    }, () => {
      this.loading.hide();
      this.dialog.closeAll();
    }, () => {
      this.loading.hide();
      this.dialog.closeAll();
    });
  }

  // 控制页码数字输入
  cardValueInput(event) {
    const reg = /(^[0-9]\d*$)/;
    if (reg.test(event.target.value)) {
      const inputNumber = Number(event.target.value);
      if (inputNumber === 0) {
        event.target.value = 1;
      }
    } else { // 不是数字 \D匹配不是数字
      event.target.value = event.target.value.replace(/\D/g, '');
    }
  }

  /*********************卡样设置*******************/
  uploadImage(image) {
    this.utils.uploadImage().then(res => {
      image['levelpicChange'] = res;
      image['levelpic'] = res;
    });
  }

  updateCardStyleSet(closeOrderDialog){
    // const result = this.initialDataInfo.some(item => {
    //   return (item['levelpicChange'] === null || item['levelpicChange'] === '') && item['enable'];
    // });
    const resultList = [];
    this.initialDataInfo.forEach(item => {
      if ((item['levelpicChange'] === null || item['levelpicChange'] === '') && item['enable']){
        resultList.push(item);
      }
    });
    if (resultList.length !== 0) {
      this.snackBar.open(resultList[0]['levelName'] + '-有图片未上传！', '✖');
    } else {
      this.dialogFlag = 'cardStyle';
      this.dialog.open(closeOrderDialog, {id: 'frozenTips', width: '350px'}).afterOpened().subscribe(res => {});
    }
  }

  toUpdateCardStyleSet(){
    const data = [];
    this.initialDataInfo.forEach(item => {
      data.push({
        'levelId': item['id'],
        'levelName': item['levelName'],
        'levelPicId': item['levelpicChange'],
      });
    });
    this.loading.show();
    this.memberLevelService.updateMemberLevels(data).subscribe(() => {
      this.searchMemberLevelList();
      this.dialog.closeAll();
      this.snackBar.open('保存成功', '✖');
    }, () => {
      this.loading.hide();
      this.dialog.closeAll();
    }, () => {
      this.loading.hide();
      this.dialog.closeAll();
    });
  }

  /*********************权益设置*******************/
  onEditorCreatedPri(editor) {
    this.utils.onEditorCreated(editor, this.equityExplain);
  }

  updateEquitySet(closeOrderDialog){
    this.myForm.get('equityInfo').markAsTouched({onlySelf: true});
    if (this.myForm.get('equityInfo').valid) {
      // const result = this.initialDataInfo.some(item => {
      //   return (item['levelpic'] === null || item['levelpic'] === '') && item['enable'];
      // });
      const resultList = [];
      this.initialDataInfo.forEach(item => {
        if ((item['levelpicChange'] === null || item['levelpicChange'] === '') && item['enable']){
          resultList.push(item);
        }
      });
      if (resultList.length !== 0) {
        this.snackBar.open(resultList[0]['levelName'] + '-有图片未上传！', '✖');
      } else {
        this.dialogFlag = 'equity';
        this.dialog.open(closeOrderDialog, {id: 'frozenTips', width: '350px'}).afterOpened().subscribe(res => {});
      }
    }
  }

  toUpdateEquitySet(){
    const data = [];
    for (let i = 0; i < this.initialData.length; i++) {
      if (this.initialData[i]['levelremarks'].length !== 0){
        data.push({
          'levelId': this.initialData[i]['id'],
          'levelName': this.initialData[i]['levelName'],
          'levelRemark': this.myForm.value['equityInfo'],
          'levelRemarkId': this.initialData[i]['levelremarks'][0]['id']
        });
      } else {
        data.push({
          'levelId': this.initialData[i]['id'],
          'levelName': this.initialData[i]['levelName'],
          'levelRemark': this.myForm.value['equityInfo'],
          'levelRemarkId': null
        });
      }
    }
    this.loading.show();
    this.memberLevelService.updateLevelremarks(data).subscribe(() => {
      this.searchMemberLevelList();
      this.dialog.closeAll();
      this.snackBar.open('保存成功', '✖');
    }, () => {
      this.loading.hide();
      this.dialog.closeAll();
    }, () => {
      this.loading.hide();
      this.dialog.closeAll();
    });
  }

  /*********************停车到场*******************/
  initTimeConfig() {
    this.configBeginTime = {
      enableTime: true,
      time_24hr: true,
      enableSeconds: true,
      defaultHour: '0',
      defaultMinute: '0',
      defaultSeconds: '0'
    };
    this.configEndTime = {
      enableTime: true,
      time_24hr: true,
      enableSeconds: true,
      defaultHour: '23',
      defaultMinute: '59',
      defaultSeconds: '59'
    };
  }

  // 选择券规则
  openMemberSelect(memberTemplate) {
    this.dialog.open(memberTemplate, {id: 'memberSelect', width: '80%'}).afterClosed().subscribe(res => {
      if (res) {
        this.currentCouponRule = this.selectedCouponRule;
        this.parkingForm.get('parkCouponId').setValue(this.currentCouponRule.id);
      } else {
        this.currentCouponRule = null;
      }
    });
  }

  onMemberSelect(event) {
    this.selectedCouponRule = event;
  }

  // 删除券规则
  removeMember() {
    this.currentCouponRule = null;
    this.parkingForm.get('parkCouponId').setValue('');
  }

  onSourceDate(e, endTime, startTime, p) {
    if (p === 'startTime') {
      e.setHours(23);
      e.setMinutes(59);
      e.setSeconds(59);
    }
    'startTime' === p ? endTime.picker.set('minDate', e) : startTime.picker.set('maxDate', e);
  }

  updateParkingSet(closeOrderDialog) {
    const resultList = [];
    this.initialDataInfo.forEach(item => {
      if ((item['levelpicChange'] === null || item['levelpicChange'] === '') && item['enable']) {
        resultList.push(item);
      }
    });
    if (resultList.length !== 0) {
      this.snackBar.open(resultList[0]['levelName'] + '-有图片未上传！', '✖');
    } else {
      this.dialogFlag = 'parking';
      this.dialog.open(closeOrderDialog, {id: 'frozenTips', width: '350px'}).afterOpened().subscribe(res => {
      });
    }
  }

  toUpdateParkingSet() {
    const data = [];
    for (let i = 0; i < this.initialData.length; i++) {
      if (this.initialData[i]['levelremarks'].length !== 0){
        data.push({
          'levelId': this.initialData[i]['id'],
          'levelName': this.initialData[i]['levelName'],
          'levelRemark': this.myForm.value['equityInfo'],
          'parkCouponId': this.parkingForm.value['parkCouponId'],
          'beginTime': new Date(this.parkingForm.value['beginTime']).toISOString(),
          'endTime': new Date(this.parkingForm.value['endTime']).toISOString(),
          'levelRemarkId': this.initialData[i]['levelremarks'][0]['id']
        });
      } else {
        data.push({
          'levelId': this.initialData[i]['id'],
          'levelName': this.initialData[i]['levelName'],
          'levelRemark': this.myForm.value['equityInfo'],
          'parkCouponId': this.parkingForm.value['parkCouponId'],
          'beginTime': new Date(this.parkingForm.value['beginTime']).toISOString(),
          'endTime': new Date(this.parkingForm.value['endTime']).toISOString(),
          'levelRemarkId': null
        });
      }
    }
    this.loading.show();
    this.memberLevelService.updateLevelremarks(data).subscribe(() => {
      this.searchMemberLevelList();
      this.dialog.closeAll();
      this.snackBar.open('保存成功', '✖');
    }, () => {
      this.loading.hide();
      this.dialog.closeAll();
    }, () => {
      this.currentCouponRule = null;
      this.loading.hide();
      this.dialog.closeAll();
    });
  }

  toSureOrderCreate() {
    if (this.dialogFlag === 'basics'){
      this.toOnSaveBasic();
    } else if (this.dialogFlag === 'cardStyle'){
      this.toUpdateCardStyleSet();
    } else if (this.dialogFlag === 'equity'){
      this.toUpdateEquitySet();
    } else if (this.dialogFlag === 'parking') {
      this.toUpdateParkingSet();
    }
  }
}



// // 添加会员卡
// addCard(param){
//   this.myForm.get('levelNumStart').markAsTouched({onlySelf: true});
//   if (!this.myForm.get('levelNumStart').valid) {
//     return;
//   }
//   if (this.cardValue.length > 7){
//     this.snackBar.open('最多只能设置9个卡等级', '✖');
//     return;
//   }
//   if ('firstCard' === param) {
//     /*第一个添加按钮 只有添加按钮没有减少按钮*/
//     if (!this.firstCardName){
//       this.snackBar.open('请输入会员卡名称', '✖');
//     } else {
//       if (this.firstCardOperation === 'create') { // 初始化时一条数据都没有，直接新增
//         const firstCardModel = {levelName: this.firstCardName, levelMin: 0, levelNum: '1',
//           levelNumStart: this.myForm.value['levelNumStart'], level: '0001'};
//         this.loading.show();
//         this.memberLevelService.createMemberLevel(firstCardModel).subscribe(() => {
//           this.firstCardOperation = 'edit';
//           this.cardValue.push({name: null, value: null});
//         }, () => {
//           this.loading.hide();
//         }, () => {
//           this.loading.hide();
//         });
//       } else { // 初始化时只有一条数据，修改后点击新增按钮相当于编辑第一条数据
//         const firstCardModel = {id: this.initialData[0]['id'], levelName: this.firstCardName, levelMin: 0, levelNum: '1',
//           levelNumStart: this.myForm.value['levelNumStart'], level: '0001', 'levelpic': this.initialData[0]['levelpic']};
//         this.loading.show();
//         this.memberLevelService.updateMemberLevelData(firstCardModel).subscribe(() => {
//           this.cardValue.push({name: null, value: null});
//         }, () => {
//           this.loading.hide();
//         }, () => {
//           this.loading.hide();
//         });
//       }
//     }
//   } else if ('cardValue' === param) {
//     /*第二个及以后的添加按钮 添加按钮+减少按钮*/
//     const levelName = this.cardValue[this.cardValue.length - 1]['name'];
//     const levelMin = this.cardValue[this.cardValue.length - 1]['value'];
//     if (this.cardValue.length > 1) {
//       if (this.cardValue[this.cardValue.length - 1]['value'] <= this.cardValue[this.cardValue.length - 2]['value']) {
//         this.snackBar.open('请输入正确的成长值区间', '✖');
//         return;
//       }
//     }
//     if (!levelName) {
//       this.snackBar.open('请输入会员卡名称', '✖');
//     } else if (!levelMin) {
//       this.snackBar.open('请输入成长值区间', '✖');
//     } else {
//       const id = this.cardValue[this.cardValue.length - 1]['id'];
//       if (id) {
//         const updateModel = {id: id, levelName: levelName, levelMin: levelMin, levelNum: this.cardValue.length + 1 + '',
//           levelNumStart: this.myForm.value['levelNumStart'], level: '000' + (this.cardValue.length + 1),
//           'levelpic': this.cardValue[this.cardValue.length - 1]['levelpic']};
//         this.loading.show();
//         this.memberLevelService.updateMemberLevelData(updateModel).subscribe((res) => {
//           this.cardValue.push({name: null, value: null});
//         }, () => {
//           this.loading.hide();
//         }, () => {
//           this.loading.hide();
//         });
//       } else {
//         const createModel = { levelName: levelName, levelMin: levelMin, levelNum: this.cardValue.length + 1 + '',
//           levelNumStart: this.myForm.value['levelNumStart'], level: '000' + (this.cardValue.length + 1)};
//         this.loading.show();
//         this.memberLevelService.createMemberLevel(createModel).subscribe((res) => {
//           const resultId = res['body']['id'];
//           this.cardValue[this.cardValue.length - 1]['id'] = resultId;
//           this.cardValue.push({name: null, value: null});
//         }, () => {
//           this.loading.hide();
//         }, () => {
//           this.loading.hide();
//         });
//       }
//     }
//   }
// }
//
// // 删去会员卡
// deleteCard(index) {
//   const id = this.cardValue[index]['id'];
//   if (id) {
//     this.loading.show();
//     this.memberLevelService.deleteMemberLevelData(id).subscribe(() => {
//       this.cardValue.splice(this.cardValue.length - 1, 1);
//       this.searchMemberLevelList();
//     }, () => {
//       this.loading.hide();
//     }, () => {
//       this.loading.hide();
//     });
//   } else {
//     this.cardValue.splice(this.cardValue.length - 1, 1);
//   }
// }

// // 保存数据
// onSaveBasic(closeOrderDialog){
//   this.myForm.get('levelNumStart').markAsTouched({onlySelf: true});
//   if (!this.myForm.get('levelNumStart').valid) {
//     return;
//   }
//   if (this.cardValue.length > 0) {
//     if (this.cardValue.length > 1) {
//       if (this.cardValue[this.cardValue.length - 1]['value'] <= this.cardValue[this.cardValue.length - 2]['value']) {
//         this.snackBar.open('请输入正确的成长值区间', '✖');
//         return;
//       }
//     }
//     if (!this.cardValue[this.cardValue.length - 1]['name']) {
//       this.snackBar.open('请输入会员卡名称', '✖');
//     } else if (!this.cardValue[this.cardValue.length - 1]['value']) {
//       this.snackBar.open('请输入成长值区间', '✖');
//     } else {
//       this.dialogFlag = 'basics';
//       this.dialog.open(closeOrderDialog, {id: 'frozenTips', width: '350px'}).afterOpened().subscribe(res => {});
//     }
//   } else {
//     if (!this.firstCardName) {
//       this.snackBar.open('请输入会员卡名称', '✖');
//     } else {
//       this.dialogFlag = 'basics';
//       this.dialog.open(closeOrderDialog, {id: 'frozenTips', width: '350px'}).afterOpened().subscribe(res => {});
//     }
//   }
// }
//
// toOnSaveBasic(){
//   if (this.cardValue.length > 0) {
//     const id = this.cardValue[this.cardValue.length - 1]['id'];
//     const levelName = this.cardValue[this.cardValue.length - 1]['name'];
//     const levelMin = this.cardValue[this.cardValue.length - 1]['value'];
//     if (id) {
//       const updateModel = {id: id, levelName: levelName, levelMin: levelMin, levelNum: this.cardValue.length + 1 + '',
//         levelNumStart: this.myForm.value['levelNumStart'], level: '000' + (this.cardValue.length + 1)};
//       this.loading.show();
//       this.memberLevelService.updateMemberLevelData(updateModel).subscribe((res) => {
//         this.firstCardName = null;
//         this.cardValue = [];
//         this.searchMemberLevelList();
//         this.dialog.closeAll();
//         this.snackBar.open('保存成功', '✖');
//       }, () => {
//         this.loading.hide();
//       }, () => {
//         this.loading.hide();
//       });
//     } else {
//       const createModel = { levelName: levelName, levelMin: levelMin, levelNum: this.cardValue.length + 1 + '',
//         levelNumStart: this.myForm.value['levelNumStart'], level: '000' + (this.cardValue.length + 1)};
//       this.loading.show();
//       this.memberLevelService.createMemberLevel(createModel).subscribe((res) => {
//         this.firstCardName = null;
//         this.cardValue = [];
//         this.searchMemberLevelList();
//         this.dialog.closeAll();
//         this.snackBar.open('保存成功', '✖');
//       }, () => {
//         this.loading.hide();
//       }, () => {
//         this.loading.hide();
//       });
//     }
//   } else {
//     if (this.firstCardOperation === 'create') { // 初始化时一条数据都没有，直接新增
//       const firstCardModel = {levelName: this.firstCardName, levelMin: 0, levelNum: '1',
//         levelNumStart: this.myForm.value['levelNumStart'], level: '0001'};
//       this.loading.show();
//       this.memberLevelService.createMemberLevel(firstCardModel).subscribe(() => {
//         this.firstCardName = null;
//         this.cardValue = [];
//         this.searchMemberLevelList();
//         this.dialog.closeAll();
//         this.snackBar.open('保存成功', '✖');
//       }, () => {
//         this.loading.hide();
//       }, () => {
//         this.loading.hide();
//       });
//     } else { // 初始化时只有一条数据，修改后点击新增按钮相当于编辑第一条数据
//       const firstCardModel = {levelName: this.firstCardName, levelMin: 0, id: this.initialData[0]['id'], levelNum: '1',
//         levelNumStart: this.myForm.value['levelNumStart'], level: '0001'};
//       this.loading.show();
//       this.memberLevelService.updateMemberLevelData(firstCardModel).subscribe(() => {
//         this.firstCardName = null;
//         this.cardValue = [];
//         this.searchMemberLevelList();
//         this.dialog.closeAll();
//         this.snackBar.open('保存成功', '✖');
//       }, () => {
//         this.loading.hide();
//       }, () => {
//         this.loading.hide();
//       });
//     }
//   }
// }

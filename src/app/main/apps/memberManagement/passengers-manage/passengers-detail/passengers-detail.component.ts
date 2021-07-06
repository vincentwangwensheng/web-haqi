import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {fuseAnimations} from '../../../../../../@fuse/animations';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {takeUntil} from 'rxjs/operators';
import {PassengersManageService} from '../../../../../services/passengersManageService/passengers-manage.service';
import {NewDateTransformPipe} from '../../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {Subject} from 'rxjs';
import {RelationPassengerTagsService} from '../../../relation-passenger-tags/relation-passenger-tags.service';
import {MatDialog} from '@angular/material';
import {CouponManageService} from '../../../haqi/coupon-manage/coupon-manage.service';
import {DatePipe} from '@angular/common';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MerchantsTagManagementComponent} from "../../../haqi/merchants-tag-management/merchants-tag-management.component";

@Component({
  selector: 'app-passengers-detail',
  templateUrl: './passengers-detail.component.html',
  styleUrls: ['./passengers-detail.component.scss'],
  animations: [fuseAnimations]
})
export class PassengersDetailComponent implements OnInit {
  private _unsubscribeAll: Subject<any> = new Subject();
  detailForm: FormGroup;
  enabled = true;
  showDetail = false;
  configEnd: any;
  configStart: any;
  form: any;
  pointHistoryListInit: any;
  pointHistoryList: any;
  pointType: any;
  currentPointInfo: any;
  levels_se = [];
  config = {
    enableTime: false,
    time_24hr: true,
    enableSeconds: true,
    defaultHour: '0',
    defaultMinute: '0',
    defaultSeconds: '0'
  };
  basicForm: FormGroup;
  detailInfo = null;
  showCoupon = true;
  couponInfoList = [];
  couponInfoListFilter = [];

  selectedTags = [];
  @ViewChild('tagTemplate', {static: true})
  merchantTag: MerchantsTagManagementComponent;

  constructor(
      private router: Router,
      private snackBar: MatSnackBar,
      private dialog: MatDialog,
      private activatedRoute: ActivatedRoute,
      private dateTransform: NewDateTransformPipe,
      public datePipe: DatePipe,
      private  relationPassengerTagsService: RelationPassengerTagsService,
      private couponManageService: CouponManageService,
      private passengers: PassengersManageService
  ) {
    this.form = new FormBuilder().group({
      salesTimeBegin: new FormControl({value: '', disabled: false}, null),  // 消费时间
      salesTimeEnd: new FormControl({value: '', disabled: false}, null),  // 消费时间
    });
    this.detailForm = new FormGroup({
      avatar: new FormControl(''),
      name: new FormControl(''),
      id: new FormControl(''), // CRM会员ID
      level: new FormControl(''), // 会员等级
      enabled: new FormControl(''), // 会员状态
      mobile: new FormControl(''), // 电话号码
      birthday: new FormControl(''), // 生日
      sourceStore: new FormControl(''), // 注册门店
      point: new FormControl(''), // 积分
      labs: new FormControl([]), // 标签列表（根据手机号获取）
      memberLevels:  new FormControl(''), // 会员等级列表列表
      memberPoints:  new FormControl('') // 积分消费记录列表
    });
    this.basicForm = new FormGroup({
      name: new FormControl('', Validators.required),
      gender: new FormControl('男', Validators.required),
      birthday: new FormControl('', Validators.required),
      enabled: new FormControl(true),
      identity: new FormControl({value: 'identity', disabled: true}),
      identityNumber: new FormControl({value: '', disabled: true})
    });
  }

  ngOnInit() {
    this.initTimeConfig(); // 初始化时间参数
    this.initLevels().then( re => {
        this.toGetMembersById();
    });
  }

  toGetMembersById() {
    this.passengers.getMembersById(this.activatedRoute.snapshot.params['id']).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      const detail = res;
      this.detailInfo = JSON.parse(JSON.stringify(res));
      const leve =  this.levels_se.filter( l => l.level === detail.level);
      detail['level'] = leve ? (leve[0] ? leve[0].levelName : detail.level ) : detail.level;
      this.detailForm.patchValue({
        avatar: detail['avatar'],
        name: detail['name'],
        id: detail['id'],
        level: detail['level'],
        enabled: detail['enabled'],
        mobile: detail['mobile'],
        birthday: detail['birthday'],
        point: detail['point'],
        sourceStore: detail['sourceStore']
      });
      this.toSearchPassengerSelectedTagsByMoblie(detail['mobile']);
      // 根据手机号和mallId查询会员当前积分
      this.relationPassengerTagsService.getMemberPoint(detail['sourceMall'], detail['mobile']).subscribe((ref1) => {
        this.currentPointInfo = ref1;
      });
      // 根据手机号和mallId查询会员积分历史清单
      this.relationPassengerTagsService.getPointHistory(detail['mobile']).subscribe((ref2) => {
        this.pointHistoryListInit = ref2;
        if (this.pointHistoryListInit && this.pointHistoryListInit.length !== 0) {
          this.pointHistoryListInit.forEach(item => {
            item['validTime'] = this.dateTransform.transform(item['validTime']); // item['validTime'].slice(0, 10);
          });
        }
        // 积分流水类型
        this.relationPassengerTagsService.getPointHistoryType().subscribe((ref3) => {
          this.pointType = ref3;
          if (this.pointType && this.pointType.length !== 0 && this.pointHistoryListInit && this.pointHistoryListInit.length !== 0) {
            // 积分类型转换
            this.pointType.forEach(item1 => {
              this.pointHistoryListInit.forEach(item2 => {
                if (item1['key'] === item2['type']){
                  item2['type'] = item1['value'];
                }
              });
            });
            this.pointHistoryList = JSON.parse(JSON.stringify(this.pointHistoryListInit));
          }
        });
      });
      this.getCouponInfoByMobile(detail['mobile']);
    });
  }

  // 根据手机号查询关联的标签
  toSearchPassengerSelectedTagsByMoblie(mobile){
    this.relationPassengerTagsService.searchPassengerSelectedTags(mobile).subscribe((ref) => {
      if (ref) {
        const list = [];
        ref['memberTag'].forEach(item => {
          list.push(item);
        });
        this.detailForm.patchValue({
          labs: list
        });
        // 包含自定义标签则去匹配自定义标签
        this.selectedTags = [];
        const itemList = list.filter(item => item['selfSign']);
        itemList.forEach(item => {
          this.selectedTags.push({
            id: item['id'],
            tagName: item['tagName'],
            disabled: true
          });
        });
      }
    });
  }

  getCouponInfoByMobile(moblie){
    const search = [{name: 'userId', value: moblie}];
    this.couponManageService.toGetCouponList(0, 10000, 'lastModifiedDate,desc' , search, []).subscribe(res => {
      if (res['body']) {
        this.couponInfoList = res.body;
        this.couponInfoList.forEach(item => {
          item['couponName'] = item['coupon']['name'];
          if (item['clearBy']){
            item['clearBy'] = '已核销';
          } else {
            item['clearBy'] = '未核销';
          }
        });
        this.filterCouponInfoList(true);
      }
    });
  }

  filterCouponInfoList(flag){
    this.showCoupon = flag;
    const listIn = [];
    const listOut = [];
    this.couponInfoList.forEach(item => {
      if (
          (item['clearBy'] === '未核销') &&
          (Number(this.datePipe.transform(item['coupon']['beginTime'], 'yyyyMMddHHmmss')) <= Number(this.datePipe.transform(new Date(), 'yyyyMMddHHmmss'))) &&
          (Number(this.datePipe.transform(new Date(), 'yyyyMMddHHmmss')) <= Number(this.datePipe.transform(item['coupon']['endTime'], 'yyyyMMddHHmmss')))
      ){
        listIn.push(item);
      } else {
        listOut.push(item);
      }
    });
    if (flag){ // 持券-没有核销，在有效期内
      this.couponInfoListFilter =  listIn;
    } else { // 失效-已核销或在有效期外
      this.couponInfoListFilter =  listOut;
    }
  }

    initLevels() {
        return new Promise((re, rj) => {
            this.relationPassengerTagsService.searchMemberCardList(0, 0x3f3f3f, 'id,asc').pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                if (res.body) {
                    this.levels_se = res.body;
                    re(true);
                }
            });
        });

    }

  initTimeConfig() {
    this.configStart = {
      enableTime: true,
      time_24hr: true,
      enableSeconds: true,
      dateFormat: 'Y-m-d',
      defaultHour: '0',
      defaultMinute: '0',
      defaultSeconds: '0'
    };
    this.configEnd = {
      enableTime: true,
      time_24hr: true,
      enableSeconds: true,
      dateFormat: 'Y-m-d',
      defaultHour: '23',
      defaultMinute: '59',
      defaultSeconds: '59'
    };
  }

  cleanSearch() {
    this.pointHistoryList = this.pointHistoryListInit;
    this.form.get('salesTimeBegin').setValue('');
    this.form.get('salesTimeEnd').setValue('');
  }

  onSourceDate(event, endTime, StartTime, p) {
    'timeBegin' === p ? endTime.picker.set('minDate', event) : StartTime.picker.set('maxDate', event);
  }

  // 过滤开始时间 2020-10-01 00:00:00
  getSalesTimeBegin(event){
    const salesTimeBegin = event.replace(/-/g, '').slice(0, 8);
    this.pointHistoryList = this.pointHistoryListInit.filter(item => Number(this.toGetNumberByTime(item['validTime'])) >= Number(salesTimeBegin));
    if (this.form.value['salesTimeEnd']){
      this.pointHistoryList = this.pointHistoryList.filter(item => Number(this.toGetNumberByTime(item['validTime'])) <= Number(this.toGetNumberByTime(this.form.value['salesTimeEnd'])));
    }
  }

  // 过滤结束时间
  getSalesTimeEnd(event){
    const salesTimeEnd = event.replace(/-/g, '').slice(0, 8);
    this.pointHistoryList = this.pointHistoryListInit.filter(item => Number(this.toGetNumberByTime(item['validTime'])) <= Number(salesTimeEnd));
    if (this.form.value['salesTimeBegin']){
      this.pointHistoryList = this.pointHistoryList.filter(item => Number(this.toGetNumberByTime(item['validTime'])) >= Number(this.toGetNumberByTime(this.form.value['salesTimeBegin'])));
    }
  }

  toGetNumberByTime(data) {
    if (data && data.indexOf('-') > 0){
      return data.replace(/-/g, '').slice(0, 8);
    } else if (data && data.indexOf('/') > 0){
      return data.replace(/\//g, '').slice(0, 8);
    }
  }

  goBack() {
    this.router.navigate(['apps/passengersManage']);
  }

  // 快捷操作
  getRouterTo(url){
    this.router.navigate(['apps/' + url], {
      queryParams: {
        name: this.detailForm.value['name'],
        mobile: this.detailForm.value['mobile']
      }
    });
  }

  editProject(openDialog) {
    this.basicForm.patchValue({
      name: this.detailInfo['name'],
      gender: this.detailInfo['gender'],
      birthday: this.detailInfo['birthday'],
      enabled: this.detailInfo['enabled']
    });
    this.dialog.open(openDialog, {id: 'frozenTips', width: '450px', disableClose: false}).afterOpened().subscribe(ref => {});
  }

  toSureDo(){
    this.basicForm.markAllAsTouched();
    if (this.basicForm.valid) {
      const data = JSON.parse(JSON.stringify(this.detailInfo));
      data['name'] = this.basicForm.value['name'];
      data['gender'] = this.basicForm.value['gender'];
      data['birthday'] = this.basicForm.value['birthday'];
      data['enabled'] = this.basicForm.value['enabled'];
      this.passengers.updateMembers(data).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        this.dialog.closeAll();
        this.goBack();
      }, error => {
        console.log(error);
      });
    }
  }

  /************* 自定义标签 ***************/
  // 删除选中标签
  remove(tag){
    const data = {
      'mobile': this.detailForm.value['mobile'],
      'tagList': [{
        'delete': true,
        'firstLevel': '自定义标签',
        'id': tag['id'],
        'score': 0,
        'secondLevel': '自定义标签',
        'tagName': tag['tagName'],
        'tagType': 'MEMBER'
      }]
    };
    this.passengers.updatePassengerTags(data).subscribe(ref => {
      this.toSearchPassengerSelectedTagsByMoblie(this.detailForm.value['mobile']);
      this.snackBar.open('删除标签成功！');
    });
  }

  /** 选择标签*/
  selectTag(tagTemplate: TemplateRef<any>) {
    this.dialog.open(tagTemplate, {id: 'tagTemplate', width: '80%', disableClose: true}).afterClosed().subscribe(res => {
      if (res) {
        const tagList = [];
        this.selectedTags.forEach(item => {
          tagList.push({
            'delete': false,
            'firstLevel': '自定义标签',
            // 'id': 0,
            'score': 0,
            'secondLevel': '自定义标签',
            'tagName': item['tagName'],
            'tagType': 'MEMBER'
          });
        });
        const data = {
          'mobile': this.detailForm.value['mobile'],
          'tagList': tagList
        };
        this.passengers.updatePassengerTags(data).subscribe(ref => {
          this.toSearchPassengerSelectedTagsByMoblie(this.detailForm.value['mobile']);
          this.snackBar.open('添加标签成功！');
          this.dialog.closeAll();
        });
      } else {
        this.selectedTags = [];
      }
    });
  }

  // checkbox 选中
  onSelect(event) {
    this.selectedTags = event;
  }

}

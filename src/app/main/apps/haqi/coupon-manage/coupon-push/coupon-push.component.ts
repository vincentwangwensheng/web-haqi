import {Component, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import {Subject} from 'rxjs';
import {MatDialog, MatSnackBar} from '@angular/material';
import {FuseProgressBarService} from '../../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../../../services/notify-asyn.service';
import {TranslateService} from '@ngx-translate/core';
import {takeUntil} from 'rxjs/operators';
import {fuseAnimations} from '../../../../../../@fuse/animations';
import {CouponManageService} from '../../../haqi/coupon-manage/coupon-manage.service';
import {ActivatedRoute} from '@angular/router';
import {MemberLevelService} from '../../../../../services/memberLevelService/member-level.service';

@Component({
  selector: 'app-coupon-push',
  templateUrl: './coupon-push.component.html',
  styleUrls: ['./coupon-push.component.scss'],
  animations: fuseAnimations
})
export class CouponPushComponent implements OnInit, OnDestroy {
  private _unsubscribeAll = new Subject();
  rows = [];
  columns = [];
  page = {page: 0, size: 8, count: 0, sort: 'lastModifiedDate,desc'};
  filter = [];
  canClick = false;

  // 推送对象
  currentDriverList = [];
  selectedDriverList = [];
  currentGroupMemberList = [];
  selectedGroupMemberList = [];

  allMemberList = [];

  // 券规则
  currentCouponRule = null;
  selectedCouponRule = null;

  constructor(
      private dialog: MatDialog,
      private loading: FuseProgressBarService,
      private snackBar: MatSnackBar,
      private notify: NotifyAsynService,
      private translate: TranslateService,
      private activatedRoute: ActivatedRoute,
      private couponManageService: CouponManageService,
      private memberLevelService: MemberLevelService
  ) {
  }

  ngOnInit() {
    const name = this.activatedRoute.snapshot.queryParams['name'];
    const mobile = this.activatedRoute.snapshot.queryParams['mobile'];
    if (name && mobile){
      this.getMemberInitInfo(mobile);
    }
    this.getColumns();
    this.initSearch();
  }

  getMemberInitInfo(mobile){
    const search = [{name: 'mobile', value: mobile, type: 'input'}];
    this.couponManageService.multiSearchMemberLists(0, 10, 'lastModifiedDate,desc', search).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res['body'] && res['body'].length !== 0) {
        Object.assign(this.currentDriverList, res['body']);
      }
    }, error => {
    }, () => {
    });
  }

  /********操作对象********/
  // 打开员工列表
  openDriverList(mallTemplate: TemplateRef<any>) {
    this.selectedDriverList = [];
    // Object.assign(this.selectedDriverList, this.currentDriverList);
    this.dialog.open(mallTemplate, {id: 'tagTemplate', width: '80%'}).afterClosed().subscribe(res => {
      if (res) {
        // this.currentDriverList = [];
        this.selectedDriverList.forEach(item => {
          const memberFlag = this.allMemberList.find(member => member['mobile'] === item['mobile']);
          if (undefined === memberFlag || memberFlag === null || memberFlag.length === 0) {
            this.allMemberList.push(item);
          }
        });
        // Object.assign(this.currentDriverList, this.selectedDriverList.concat(this.currentDriverList));
      } else {
        // Object.assign(this.selectedDriverList, this.currentDriverList);
      }
    });
  }


  openGroupMemberList(groupMemberTemplate: TemplateRef<any>) {

    this.selectedGroupMemberList = [];
    // Object.assign(this.selectedDriverList, this.currentDriverList);
    this.dialog.open(groupMemberTemplate, {id: 'groupMemberTemplate', width: '80%'}).afterClosed().subscribe(res => {
      if (res) {
        // this.currentDriverList = [];

        this.selectedGroupMemberList.forEach(groupMember => {
          const noRepeatMembers = [];
          const mobiles = [];
          groupMember.members.forEach(member => {
            mobiles.push(member['mobile']);
          });
          this.memberLevelService.toGetAllMembersByMobilesData(0, 0x3f3f3f3f, 'id', mobiles).subscribe(result => {
              const selectedMembers = result['content'];
              selectedMembers.forEach(item => {
                const memberFlag = this.allMemberList.find(member => member['mobile'] === item['mobile']);
                if (undefined === memberFlag || memberFlag === null || memberFlag.length === 0) {
                  this.allMemberList.push(item);
                }
              });
          });
        });
        const aaa = this.allMemberList;

        // Object.assign(this.currentGroupMemberList, this.selectedGroupMemberList.concat(this.currentGroupMemberList));
      } else {
        // Object.assign(this.selectedDriverList, this.currentDriverList);
      }
    });
  }


  onDriverSelect(event){
    this.selectedDriverList = event;
  }

  onGroupMemberSelect(event) {
    this.selectedGroupMemberList = event;
  }

  // 删除操作对象
  deleteDriver(index){
    this.currentDriverList.splice(index, 1);
  }

  deleteAllMember(index){
    this.allMemberList.splice(index, 1);
  }

  /************ 选择券规则 *************/
  // 选择券规则
  openMemberSelect(memberTemplate) {
    this.dialog.open(memberTemplate, {id: 'memberSelect', width: '80%'}).afterClosed().subscribe(res => {
      if (res) {
        this.currentCouponRule = this.selectedCouponRule;
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
  }

  saveCouponPush() {
    if (this.allMemberList.length === 0){
      this.snackBar.open(this.translate.instant('操作对象不能为空'), '✖');
    } else if (!this.currentCouponRule){
      this.snackBar.open(this.translate.instant('请选择套餐'), '✖');
    } else {
      const driverLicenseIdList = this.allMemberList.map(item => item['mobile']);
      const data = {
        'couponNumber': this.currentCouponRule['number'],
        'userList': driverLicenseIdList
      };
      this.snackBar.open('待开发！', '✖');
      return;
      this.canClick = true;
      this.couponManageService.toGiveCoupon(data).subscribe(res => {
        this.snackBar.open('发送成功！', '✖');
        this.initSearch(null);
        this.allMemberList = [];
        this.currentDriverList = [];
        this.selectedDriverList = [];
        this.selectedGroupMemberList = [];
        this.currentCouponRule = null;
        this.selectedCouponRule = null;
        if (this.canClick) {
          this.canClick = false;
        }
      }, error => {
        if (this.canClick) {
          this.canClick = false;
        }
      });
    }
  }


  /************************************ 操作记录 ***************************************/
  // 初始化列表数据
  initSearch(multiSearch?) {
    this.loading.show();
    this.couponManageService.toGetCouponPushList(this.page.page, this.page.size, this.page.sort, multiSearch, this.filter).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res) {
        this.rows = res;
        // this.page.count = res['headers'].get('X-Total-Count');
        this.page.count = 1;
        if (this.rows.length === 0) {
          this.snackBar.open(this.translate.instant('未查询到数据'), '✖');
        } else {
          this.rows.forEach(item => {
            item['couponName'] = item['coupon']['name'];
            item['createdBy'] = item['createdBy'];
            item['createdDate'] = item['createdDate'];
          });
        }
        this.notify.onResponse.emit();
      }
      if (!res['body']) {
        this.snackBar.open(this.translate.instant('未查询到数据'), '✖');
      }
      this.loading.hide();
    }, error => {
      this.notify.onResponse.emit();
      this.loading.hide();
    }, () => {
      this.loading.hide();
    });
  }

  // 搜索
  onSearch() {
    const multiSearch = [];
    this.columns.forEach(column => {
      if (column.value !== '') {
        multiSearch.push(column);
      }
    });
    this.initSearch(multiSearch);
  }

  // 搜索清除
  clearSearch() {
    this.onSearch();
  }

  // 分页
  onPage(event) {
    this.page.page = event.page;
    this.onSearch();
  }

  // 排序
  onSort(event) {
    this.page.sort = event;
    this.onSearch();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  getColumns() {
    this.columns = [
      {name: 'userId', translate: '手机号', value: ''},
      {name: 'couponName', translate: '券名称', value: ''},
      {name: 'code', translate: '券编码', value: '', type: 'input'},
      {name: 'lastModifiedBy', translate: '操作人', value: ''},
      {name: 'lastModifiedDate', translate: '操作时间', value: '', type: 'date'}
    ];
  }

}


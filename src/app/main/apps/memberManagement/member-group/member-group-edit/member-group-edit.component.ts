import {Component, HostListener, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialog, MatSnackBar} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../../../services/notify-asyn.service';
import {TranslateService} from '@ngx-translate/core';
import {MemberLevelService} from '../../../../../services/memberLevelService/member-level.service';
import {takeUntil} from 'rxjs/operators';
import {Utils} from '../../../../../services/utils';

@Component({
  selector: 'app-member-group-edit',
  templateUrl: './member-group-edit.component.html',
  styleUrls: ['./member-group-edit.component.scss']
})
export class MemberGroupEditComponent implements OnInit, OnDestroy {
  responsive = false; // 响应式参数
  private _unsubscribeAll = new Subject();

  // 分群关系
  id = 0;
  baseForm: FormGroup;
  filterMallById: Observable<any>;
  filterMallByName: Observable<any>;
  mallSources = []; // 商场选择
  relations = [{
    'relationType': 'AND',
    'relationValue': []
  }];
  selectedTags = [];
  categoryMemberNumber = '';
  categoryStatus = '';

  rows = [];
  columns = [];
  page = {page: 0, size: 8, count: 0, sort: 'createdDate,desc'};
  mobiles = []; // 根据页面的relationShip查询复合条件的所有会员价的手机号
  memberNumber = 0;
  isCanSave = false;
  editFlag = false; // 编辑/保存标记
  canAddTagFlag = true; // 能否为成员添加标签标记

  constructor(
      private dialog: MatDialog,
      private router: Router,
      private loading: FuseProgressBarService,
      private snackBar: MatSnackBar,
      private notify: NotifyAsynService,
      private utils: Utils,
      private translate: TranslateService,
      public activatedRoute: ActivatedRoute,
      private memberLevelService: MemberLevelService
  ) {
    this.responsive = window.innerWidth <= 959;
    this.baseForm = new FormBuilder().group({
      mallId: new FormControl({value: '', disabled: true}, Validators.required),
      mallName: new FormControl({value: '', disabled: true}, Validators.required),
      categoryName: new FormControl({value: '', disabled: true}),
      categoryDescribe: new FormControl({value: '', disabled: true})
    });
  }

  ngOnInit() {
    this.getColumns();
    this.initMallOptions();
    this.id = this.activatedRoute.snapshot.queryParams['id'];
    this.toGetMemberCategory();
  }

  @HostListener('window:resize', ['$event.target.innerWidth'])
  windowResize(event) {
    this.responsive = event <= 959;
  }

  // 回退到列表
  goBack() {
    history.back();
  }

  /********************************** 分群规则 ******************************************/
  // 根据id获取常旅客分群信息
  toGetMemberCategory() {
    this.memberLevelService.toGetMemberCategory(this.id).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res) {
        this.baseForm.patchValue({
          'categoryName': res['categoryName'],
          'categoryDescribe': res['categoryDescribe'],
          'mallId': res['storeId'],
          'mallName': res['storeName']
        });
        this.relations = JSON.parse(res['memberCategoryQueryVM'])['relations'][0]['relations'];
        this.categoryMemberNumber = res['categoryMemberNumber'];
        this.categoryStatus = res['categoryStatus'];
        this.refreshMember();
        this.notify.onResponse.emit();
      }
    }, error1 => {
      this.snackBar.open('根据id获取分群详情失败', '✖');
      this.loading.hide();
    });
  }

  // 刷新成员(根据分群规则获取手机号，从而获取成员列表)
  refreshMember(){
    if (this.checkedValue()) {
      const data = {
        'relations': [
          {
            'relationType': 'AND',
            'relations': this.relations
          }
        ]
      };
      // 清空成员列表
      this.rows = [];
      this.page.count = 0;
      this.memberLevelService.toGetMobilesWithMemberCategory(data).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        this.mobiles = res;
        if (this.mobiles.length === 0) {
          this.snackBar.open('根据选择的标签获取的成员手机号为空，无法获取成员列表', '✖');
        } else {
          this.isCanSave = true;
          this.initSearch();
        }
      }, error1 => {
        this.snackBar.open('刷新成员失败', '✖');
        this.loading.hide();
      });
    }
  }

  // 添加规则
  addCard(){
    this.relations.push({'relationType': 'AND', 'relationValue': []});
    this.isCanSave = false;
  }

  // 删除规则
  removeCard(i) {
    if (this.relations.length <= 1) {
      this.snackBar.open(this.translate.instant('标签规则不能为空'), '✖');
    } else {
      this.relations.splice(i, 1);
      this.isCanSave = false;
    }
  }

  // 删除选中标签
  remove(i, j){
    this.relations[i]['relationValue'].splice(j, 1);
    this.isCanSave = false;
  }

  // checkbox 选中
  onSelect(event) {
    this.selectedTags = event;
  }

  /** 选择标签*/
  editTag(i, tagTemplate: TemplateRef<any>) {
    this.selectedTags = [];
    this.relations[i]['relationValue'].forEach(item => {
      this.selectedTags.push({'id': item['id'], 'tagName': item['name']});
    });
    this.dialog.open(tagTemplate, {id: 'tagTemplate', width: '80%'}).afterClosed().subscribe(res => {
      if (res) {
        this.relations[i]['relationValue'] = [];
        this.selectedTags.forEach(item => {
          this.relations[i]['relationValue'].push({'id': item['id'], 'name': item['tagName']});
        });
      } else {
        this.selectedTags = [];
      }
    });
    this.isCanSave = false;
  }

  // 分群规则基础信息校验
  checkedValue(): Boolean {
    const categoryName = this.baseForm.value['categoryName'];
    const categoryDescribe = this.baseForm.value['categoryDescribe'];
    if (categoryName === null || categoryName === undefined || categoryName.toString().trim() === '') {
      this.snackBar.open('分群名称不能为空', '✖');
      return false;
    } else if (categoryDescribe === null || categoryDescribe === undefined || categoryDescribe.toString().trim() === '') {
      this.snackBar.open('分群描述不能为空', '✖');
      return false;
    } else if (this.relations.length === 0) {
      this.snackBar.open('分群标签不能为空', '✖');
      return false;
    } else if (this.relations.length !== 0) {
      if (this.relations.find(item => item['relationValue'].length === 0)) {
        this.snackBar.open('分群标签不能为空', '✖');
        return false;
      } else {
        return true;
      }
    } else if (this.mobiles.length === 0) {
      this.snackBar.open('根据分群规则查出的会员的手机号为空', '✖');
      return false;
    } else {
      return true;
    }
  }

  /** 编辑和保存*/
  openEdit() {
    this.editFlag = true;
    this.canAddTagFlag = false;
  }

  // 编辑保存分群规则
  toEditSave() {
    if (this.checkedValue()) {
      const data = {
        'id': this.id,
        'storeId': this.baseForm.value['mallId'],
        'storeName': this.baseForm.value['mallName'],
        'categoryName': this.baseForm.value['categoryName'],
        'categoryDescribe': this.baseForm.value['categoryDescribe'],
        'categoryMemberNumber': this.categoryMemberNumber,
        'categoryStatus': this.categoryStatus,
        'mobiles': this.mobiles,
        'memberNumber': this.memberNumber,
        'memberCategoryQueryVM': {
        'relations': [{'relationType': 'AND', 'relations': this.relations}]
        }
      };
      this.loading.show();
      this.memberLevelService.toUpdateMemberCategory(data).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        this.loading.show();
        this.dialog.closeAll();
        this.editFlag = false;
        this.canAddTagFlag = true;
        this.loading.hide();
      }, error1 => {
        this.loading.hide();
      });
    }
  }

  /********************************** 成员列表 ******************************************/
  initMallOptions(data?) {
    return new Promise((resolve, reject) => {
      this.memberLevelService.getMallList(0, 0x3f3f3f3f, 'lastModifiedDate,desc').subscribe(res => {
        if (res.content && res.content.length > 0) {
          this.mallSources = res.content.filter(item => item.enabled);
          this.filterMallById = this.utils.getFilterOptions(this.baseForm.get('mallId'), this.mallSources, 'mallId', 'mallName');
          this.filterMallByName = this.utils.getFilterOptions(this.baseForm.get('mallName'), this.mallSources, 'mallName', 'mallId');
          if (data && data.blocId) {
            const mall = res.content.find(item => item.mallId === data.mallId);
            if (mall && mall.mallName) {
              data.mallName = mall.mallName;
            }
          }
        }
        resolve(data);
      }, error1 => resolve(data));
    });
  }

  // 选中name补全id或者互选
  onSelectionChange(option, controlId, field) {
    this.baseForm.get(controlId).setValue(option[field], {emitEvent: false});
    if (controlId === 'mallId' || controlId === 'mallName') {
      this.filterMallById = this.utils.getFilterOptions(this.baseForm.get('mallId'), this.mallSources, 'mallId', 'mallName');
      this.filterMallByName = this.utils.getFilterOptions(this.baseForm.get('mallName'), this.mallSources, 'mallName', 'mallId');
    }
  }

  getColumns() {
    this.columns = [
      {name: 'id', translate: 'ID', value: ''},
      {name: 'name', translate: '姓名', value: ''},
      {name: 'mobile', translate: '手机号', value: '', type: 'input'},
      {name: 'level', translate: '会员等级', value: ''},
      {name: 'point', translate: '会员积分', value: ''},
      {name: 'source', translate: '会员来源', value: ''},
      {name: 'enabled', translate: '会员状态', value: ''}
    ];
  }

  initSearch() {
    this.loading.show();
    const mobiles = {
      'mobile': null,
      'mobiles': this.mobiles
    };
    this.memberLevelService.toGetAllMembersByMobiles(this.page.page, this.page.size, this.page.sort, mobiles).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.rows = [];
      const list = res.body['content'];
      if (list && list.length > 0) {
        list.forEach(data => {
          this.rows.push(data);
        });
      }
      this.page.count = Number(res.body['totalElements']);
      this.memberNumber = Number(res.body['totalElements']);
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
        multiSearch.push(column);
      }
    });
    const mobiles = {
      'mobile': '',
      'mobiles': this.mobiles
    };
    if (multiSearch.length !== 0) {
      mobiles['mobile'] = multiSearch[0]['value'];
    } else {
      mobiles['mobile'] = null;
    }
    this.memberLevelService.toGetAllMembersByMobiles(this.page.page, this.page.size, this.page.sort, mobiles).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.rows = [];
      const list = res.body['content'];
      if (list && list.length > 0) {
        list.forEach(data => {
          this.rows.push(data);
        });
      }
      this.page.count = Number(res.body['totalElements']);
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

  // 为成员添加标签
  toGetTagMemberCategories(){
    this.loading.show();
    this.memberLevelService.toGetTagMemberCategories(this.id).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.snackBar.open(this.translate.instant('为生成的成员添加标签成功'), '✖');
      this.loading.hide();
    }, error1 => {
      this.loading.hide();
    });
  }
}

import {Component, HostListener, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {fuseAnimations} from '../../../../../@fuse/animations';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {PassengersManageService} from '../../../../services/passengersManageService/passengers-manage.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {MatDialog, MatSnackBar} from '@angular/material';
import {Coupon} from '../../marketing-manage/marketing-manage-add/marketing-manage-add.component';
import {IntegralHistoryService} from '../../../../services/integral-history/integral-history.service';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {RelationPassengerTagsService} from '../../relation-passenger-tags/relation-passenger-tags.service';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';

@Component({
    selector: 'app-passengers-manage-detail',
    templateUrl: './passengers-manage-detail.component.html',
    styleUrls: ['./passengers-manage-detail.component.scss'],
    animations: [fuseAnimations]
})
export class PassengersManageDetailComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject();
    responsive = false; // 响应式标记 区分大小屏展示模式
    mCouponColumnWidth;
    storeColumns = [{name: 'createDate'}, {name: 'desc'}]; // 行头
    tlKey = ''; // 国际化前缀标识

    // 基本信息
    member: Member = new Member(); // 常旅客详情
    baseForm: FormGroup;
    editFlag = false; // 编辑/保存标记
    options = [{field: 'normal', value: true}, {field: 'frozen', value: false}]; // 基本信息-状态
    config = {};

    // 标签
    tags = []; // 手机号关联的会员标签
    tagsInit = [];  // 初始化手机号关联的会员标签
    storeTags = []; // 手机号关联的品牌标签
    selectedTags = [];

    // 股份会员
    BCIAMember = {left: [], right: [], img: ''};

    // 日上免税
    sunRiseMember = {left: [], right: [], img: ''};

    // 积分详情
    profileForm = new FormGroup({
        startTime: new FormControl(''),
        endTime: new FormControl(''),
    });
    selectStore: Coupon = null; // 选择对应的店铺
    selectStores = [];
    page = {page: 0, size: 5, count: 0}; // 分页
    coupons: any;
    @ViewChild('integralTemplate', {static: true})
    integralTemplate: TemplateRef<any>; // 积分详情弹出框锚点
    configStart = {enableTime: true, time_24hr: true, enableSeconds: true, defaultHour: '0', defaultMinute: '0', defaultSeconds: '0'};
    configEnd = {enableTime: true, time_24hr: true, enableSeconds: true, defaultHour: '23', defaultMinute: '59', defaultSeconds: '59'};
    startPicker: any;
    endPicker: any;

    constructor(private activatedRoute: ActivatedRoute,
                private dialog: MatDialog,
                private passengers: PassengersManageService,
                private  integralHistoryService: IntegralHistoryService,
                private snackBar: MatSnackBar,
                private loading: FuseProgressBarService,
                private dateTransform: NewDateTransformPipe,
                private  relationPassengerTagsService: RelationPassengerTagsService) {
        this.tlKey = 'passengers.' + localStorage.getItem('currentProject') + '.';
        this.baseForm = new FormBuilder().group({
            id: new FormControl({value: '', disabled: true}),
            birthday: new FormControl({value: '', disabled: true}),
            mobile: new FormControl({value: '', disabled: true}),
            createdDate: new FormControl({value: '', disabled: true}),
            idCardNumber: new FormControl({value: '', disabled: true}),
            source: new FormControl({value: '', disabled: true}),
            level: new FormControl({value: '', disabled: true}),
            enabled: new FormControl({value: '', disabled: true})
        });
        this.responsive = window.innerWidth <= 959;
    }

    static formatToZoneDateTime(dateStr) {
        const date = new Date(dateStr);
        return date.toISOString();
    }

    ngOnInit() {
        this.toGetMembersById();
        this.getColumnWidth();
    }

    // 获取常旅客详情
    toGetMembersById() {
        this.passengers.getMembersById(this.activatedRoute.snapshot.params['id']).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            res.createdDate = this.dateTransform.transform(res.createdDate , '-');
            this.baseForm.patchValue(res);
            this.member = res;
            if (localStorage.getItem('currentProject') === 'hq'){
                this.getMembers();
            }
            // 根据手机号查询关联的标签
            this.relationPassengerTagsService.searchPassengerSelectedTags(res['mobile']).subscribe((res1) => {
                if (localStorage.getItem('currentProject') === 'hq'){
                    if (res1['memberTag'] && res1['storeTag']) {
                        this.tags = res1['memberTag'];
                        // 防止tags和tagsInit指向同一个变量
                        res1['memberTag'].forEach(item => {
                            this.tagsInit.push(item);
                        });
                        this.storeTags = res1['storeTag'];
                    } else {
                        this.tags = res1;
                        res1.forEach(item => {
                            this.tagsInit.push(item);
                        });
                        this.storeTags = [];
                    }
                } else {
                    this.tags = res1['memberTag'];
                    res1['memberTag'].forEach(item => {
                        this.tagsInit.push(item);
                    });
                    this.storeTags = res1['storeTag'];
                }
            });
        });
    }

    // 获取会员信息（机场部分需要）
    getMembers() {
        const vipA = {MallId: 'BCIA', Mobile: this.member.mobile};
        this.passengers.getVipDis(vipA, vipA['MallId']).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res.body && res.body.length > 0) {
                const vipDis = res.body[0];
                this.BCIAMember.left = [
                    {key: 'name', value: vipDis.SurName},
                    {key: 'sex', value: vipDis.Sex},
                    {key: 'phone', value: vipDis.Mobile},
                    {key: 'email', value: vipDis.VipEmail},
                    {key: 'IDCard', value: vipDis.VipId},
                    {key: 'birthday', value: vipDis.BirthdayYYYY + '/' + vipDis.BirthdayMM + '/' + vipDis.BirthdayDD},
                ];
                this.BCIAMember.right = [
                    {key: 'carLicense', value: vipDis.CarNumber},
                    {key: 'memberNumber', value: vipDis.VipCode},
                    {key: 'memberLevel', value: vipDis.Grade},
                    {key: 'memberCard', value: vipDis.VipCardNo},
                    {key: 'memberType', value: vipDis.IdCardType},
                    {key: 'activateMall', value: vipDis.OpenCardMallId}
                ];
            }
        });
        const vipB = {MallId: 'SUNRISE', Mobile: this.member.mobile};
        this.passengers.getVipDis(vipB, vipB['MallId']).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res.body && res.body.length > 0) {
                const vipDis = res.body[0];
                this.sunRiseMember.left = [
                    {key: 'name', value: vipDis.SurName},
                    {key: 'sex', value: vipDis.Sex},
                    {key: 'phone', value: vipDis.Mobile},
                    {key: 'email', value: vipDis.VipEmail},
                    {key: 'IDCard', value: vipDis.VipId},
                    {key: 'birthday', value: vipDis.BirthdayYYYY + '/' + vipDis.BirthdayMM + '/' + vipDis.BirthdayDD}
                ];
                this.sunRiseMember.right = [
                    {key: 'carLicense', value: vipDis.CarNumber},
                    {key: 'memberNumber', value: vipDis.VipCode},
                    {key: 'memberLevel', value: vipDis.Grade},
                    {key: 'memberCard', value: vipDis.VipCardNo},
                    {key: 'memberType', value: vipDis.IdCardType},
                    {key: 'activateMall', value: vipDis.OpenCardMallId}
                ];
            }
        });
    }

    /** 选择标签*/
    editTag(tagTemplate: TemplateRef<any>) {
        this.selectedTags = [];
        Object.assign(this.selectedTags, this.tags);
        this.dialog.open(tagTemplate, {id: 'tagTemplate', width: '80%'}).afterClosed().subscribe(res => {
            if (res) {
                this.tags = [];
                Object.assign(this.tags, this.selectedTags);
            } else {
                this.selectedTags = [];
            }
        });
    }

    // checkbox 选中
    onSelect(event) {
        this.selectedTags = event;
    }

    /** 编辑和保存*/
    openEdit() {
        this.editFlag = true;
        this.baseForm.get('birthday').enable();
        this.baseForm.get('enabled').enable();
        this.baseForm.get('idCardNumber').enable();
    }

    saveEdit() {
        const member = this.baseForm.getRawValue();
        this.member.birthday = member.birthday;
        this.member.idCardNumber = member.idCardNumber;
        this.member.enabled = member.enabled;
        member.createdDate = new Date(member.enabled).toISOString();
        this.member['createdDate'] =  member.createdDate;
        this.passengers.updateMembers(this.member).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.baseForm.get('birthday').disable();
            this.baseForm.get('enabled').disable();
            this.baseForm.get('idCardNumber').disable();
            if (this.tags.find(item => item['tagName'] === null)){
                this.snackBar.open('会员标签列表里面的标签名称不能有空', '✖');
                return;
            }
            // const data = this.checkTags();
            this.editFlag = false;
            // this.relationPassengerTagsService.updatePassengerTags({mobile: member.mobile, tagList: data}).subscribe(() => {});
        });
    }

    // 编辑后的标签与初始化的标签对比，删除掉的标签'delete': true
    checkTags(): any{
        const data = [];
        if (this.tagsInit.length === 0) {
            this.tags.forEach(item => {
                data.push({
                    'delete': false,
                    'firstLevel': item['firstLevel'],
                    'id': item['id'],
                    'score': 0,
                    'secondLevel': item['firstLevel'],
                    'tagName': item['tagName'],
                    'tagType': item['tagType']
                });
            });
        } else {
            if (this.tags.length !== 0) {
                this.tags.forEach(item => {
                    data.push({
                        'delete': false,
                        'firstLevel': item['firstLevel'],
                        'id': item['id'],
                        'score': 0,
                        'secondLevel': item['firstLevel'],
                        'tagName': item['tagName'],
                        'tagType': item['tagType']
                    });
                });
                const tagsInitLength = this.tagsInit.length;
                for (let i = 0; i < tagsInitLength; i++){
                    if (!this.tags.find(item => item['id'] === this.tagsInit[i]['id'])) {
                        data.push({
                            'delete': true,
                            'firstLevel': this.tagsInit[i]['firstLevel'],
                            'id': this.tagsInit[i]['id'],
                            'score': 0,
                            'secondLevel': this.tagsInit[i]['firstLevel'],
                            'tagName': this.tagsInit[i]['tagName'],
                            'tagType': this.tagsInit[i]['tagType']
                        });
                    }
                }
            } else {
                this.tagsInit.forEach(item => {
                    data.push({
                        'delete': true,
                        'firstLevel': item['firstLevel'],
                        'id': item['id'],
                        'score': 0,
                        'secondLevel': item['firstLevel'],
                        'tagName': item['tagName'],
                        'tagType': item['tagType']
                    });
                });
            }
        }
        return data;
    }

    // 删除标签
    remove(i) {
        this.tags.splice(i, 1);
    }

    // 积分详情
    onIntegralDetail() {
        this.profileForm.get('startTime').patchValue(null);
        this.profileForm.get('endTime').patchValue(null);
        this.selectStore = null;
        this.selectStores = [];
        this.page.page = 0;
        this.page.size = 5;
        this.integralHistoryService.multiSearchStoreLists(this.page.page, this.page.size, 'createDate,desc').subscribe((res) => {
            if (res.status === 200) {
                if (res['body']) {
                    this.coupons = this.changeResult(res['body']['content']);
                    this.page.count = res['body']['totalElements'];
                    this.dialog.open(this.integralTemplate, {
                        id: 'integralDialogId',
                        width: '625px',
                        height: '450px'
                    }).afterClosed().subscribe(r => {
                    });
                } else {
                }
            }
        });
    }

    // 积分查询
    searchIntegral() {
        let beginTimeValue = this.profileForm.get('startTime').value;
        let endTimeValue = this.profileForm.get('endTime').value;
        if ((!beginTimeValue && !endTimeValue) || (beginTimeValue && endTimeValue)) {
            if (!beginTimeValue) {
                this.loading.show();
                this.integralHistoryService.multiSearchStoreLists(this.page.page, this.page.size, 'createDate,desc').subscribe((res) => {
                    if (res.status === 200) {
                        if (res['body']['content']) {
                            this.coupons = this.changeResult(res['body']['content']);
                            this.page.count = res['body']['totalElements'];
                        } else {
                            this.snackBar.open('查询结果为空', '✖');
                        }
                    }
                }, error1 => {
                    this.loading.hide();
                }, () => {
                    this.loading.hide();
                });
            } else {
                beginTimeValue = PassengersManageDetailComponent.formatToZoneDateTime(beginTimeValue);
                endTimeValue = PassengersManageDetailComponent.formatToZoneDateTime(endTimeValue);
                let param = '?page=' + this.page.page;
                param += '&size =' + this.page.size;
                param += '&sort=' + 'createDate,desc';
                param += '&createDate.greaterOrEqualThan=' + beginTimeValue;
                param += '&createDate.lessOrEqualThan=' + endTimeValue;
                this.loading.show();
                this.integralHistoryService.searchIntegralListByTime(param).subscribe(res => {
                    if (res['body']['content']) {
                        this.coupons = this.changeResult(res['body']['content']);
                        this.page.count = res['body']['totalElements'];
                    } else {
                        this.snackBar.open('查询结果为空', '✖');
                    }
                }, error1 => {
                    this.loading.hide();
                }, () => {
                    this.loading.hide();
                });
            }
        } else {
            this.snackBar.open('请输入完整的查询时间', '✖');
        }
    }

    // 开始时间选择后设定结束时间最小时间
    onStartSourceDate(event, endTime) {
        event.setHours(23);
        event.setMinutes(59);
        event.setSeconds(59);
        endTime.picker.set('minDate', event);
        this.endPicker = endTime;
    }

    // 反之
    onEndSourceDate(event, startTime) {
        startTime.picker.set('maxDate', event);
        this.startPicker = startTime;
    }

    // 翻页
    onPage(event) {
        this.page.page = event.offset;
        this.integralHistoryService.multiSearchStoreLists(event.offset, event.pageSize, 'createDate,desc').subscribe((res) => {
            if (res.status === 200) {
                if (res['body']) {
                    this.coupons = this.changeResult(res['body']['content']);
                } else {
                }
            }
        });
    }

    // 清空查询
    onClearTime() {
        this.profileForm.get('startTime').patchValue(null);
        this.profileForm.get('endTime').patchValue(null);
        if (this.startPicker) {
            this.startPicker.picker.set('maxDate', null);
        }
        if (this.endPicker) {
            this.endPicker.picker.set('minDate', null);
        }
        this.loading.show();
        this.integralHistoryService.multiSearchStoreLists(this.page.page, this.page.size, 'createDate,desc').subscribe((res) => {
            if (res.status === 200) {
                if (res['body']['content']) {
                    this.coupons = this.changeResult(res['body']['content']);
                    this.page.count = res['body']['totalElements'];
                } else {
                    this.snackBar.open('查询结果为空', '✖');
                }
            }
        }, error1 => {
            this.loading.hide();
        }, () => {
            this.loading.hide();
        });
    }

    // 将获取的积分转换模式
    changeResult(result) {
        for (let i = 0; i < result.length; i++) {
            result[i]['desc'] = result[i]['desc'] + ' ' + '+' + result[i]['point'] + '积分';
        }
        return result;
    }

    // 回退到列表
    goBack() {
        history.back();
    }

    // 获取列宽
    getColumnWidth() {
        const columnWidth = 625;
        this.mCouponColumnWidth = columnWidth / (this.storeColumns.length + 1);
    }

    @HostListener('window:resize', ['$event.target.innerWidth'])
    windowResize(event) {
        this.responsive = event <= 959;
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}

class Member {
    point: number;
    name: string;
    nickName: string;
    growth: number;
    mobile: string;
    birthday: string;
    enabled: any;
    tags: any;
    idCardNumber: any;
}


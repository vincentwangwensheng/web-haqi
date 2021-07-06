import {Component, OnDestroy, OnInit} from '@angular/core';
import {TagManagementService, Tags} from '../../../../../services/tagManagementService/tag-management.service';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {NewDateTransformPipe} from '../../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material';
import {Subject} from 'rxjs';
import {fuseAnimations} from '../../../../../../@fuse/animations';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-tag-detail-management',
    templateUrl: './tag-detail-management.component.html',
    styleUrls: ['./tag-detail-management.component.scss'],
    animations: fuseAnimations
})
export class TagDetailManagementComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject();
    TagDetail: Tags;
    TagDetailId: number;
    pageTitle: string; // 判断页面操作类型
    profileForm: any;
    saveButtonStatus = false; // 保存按钮状态
    tagTypes: any; // 标签类型
    firstLevel: any; // 一级标签
    currentProject = '';

    constructor(
        private translate: TranslateService,
        private routeInfo: ActivatedRoute,
        private tagManagementService: TagManagementService,
        private dateTransform: NewDateTransformPipe,
        private router: Router,
        private snackBar: MatSnackBar,
    ) {
        this.profileForm = new FormGroup({
            id: new FormControl({value: null, disabled: false}, Validators.required),
            tagName: new FormControl({value: null, disabled: false}, Validators.required),
            firstLevel: new FormControl({
                value: this.translate.instant('TagManagement.MerchantsTagManagement.Fact'),
                disabled: false
            }, Validators.required), // 默认事实
            secondLevel: new FormControl({value: null, disabled: false}, Validators.required),
            tagRemarks: new FormControl({value: null, disabled: false}, Validators.required),
            tagType: new FormControl({value: 'MEMBER', disabled: false}, Validators.required),
            tagSource: new FormControl({value: 'member', disabled: false}, Validators.required),
            memberTags: new FormControl({value: null, disabled: false}, Validators.required),
            memberStoreTags: new FormControl({value: null, disabled: false}, Validators.required),
            memberActivityTags: new FormControl({value: null, disabled: false}, Validators.required),
            lastModifiedBy: new FormControl({value: null, disabled: true}, Validators.required),
            lastModifiedDate: new FormControl({value: null, disabled: true}, Validators.required),
            selfSign: new FormControl(false)
        });
        if (localStorage.getItem('currentProject')) {
            this.currentProject = localStorage.getItem('currentProject');
        }
        this.profileForm.get('firstLevel').valueChanges.subscribe(res => {
            if (this.profileForm.get('firstLevel').value === '自定义标签'){
                this.profileForm.get('secondLevel').setValue('自定义标签');
                this.profileForm.get('secondLevel').disable();
            } else {
                this.profileForm.get('secondLevel').enable();
            }
        });
    }

    ngOnInit() {
        this.pageTitle = this.routeInfo.snapshot.data['operation'];
        this.initParam();
        if ('detail' === this.pageTitle) {
            this.routeInfo.params.subscribe(
                (param: Params) => {
                    this.TagDetailId = param.id;
                    this.getTagManagementDetail();
                });
        }


    }

    initParam() {
        this.profileForm.get('tagType').patchValue('MEMBER');
        this.profileForm.get('tagSource').patchValue('member');
        this.tagTypes = [
            // {
            //     id: 'MEMBER',
            //     value: this.translate.instant('TagManagement.MerchantsTagManagement.' + this.currentProject + '.MEMBER')
            // }, // 常旅客标签 / 会员标签
            // {id: 'ACTIVITY', value: this.translate.instant('TagManagement.MerchantsTagManagement.ACTIVITY')}, // 营销标签
            {id: 'MEMBER', value: '会员标签'},
            {id: 'STORE', value: this.translate.instant('TagManagement.MerchantsTagManagement.STORE')},  // 品牌标签
            {id: 'ACTIVITY', value: '营销标签'}

        ];
        this.profileForm.get('firstLevel').patchValue(this.translate.instant('TagManagement.MerchantsTagManagement.Fact')); // 事实
        this.firstLevel = [
            {
                id: this.translate.instant('TagManagement.MerchantsTagManagement.Fact'),
                value: this.translate.instant('TagManagement.MerchantsTagManagement.Fact')
            }, // 事实
            {
                id: this.translate.instant('TagManagement.MerchantsTagManagement.Model'),
                value: this.translate.instant('TagManagement.MerchantsTagManagement.Model')
            }, // 模型
            {
                id: this.translate.instant('TagManagement.MerchantsTagManagement.Forecast'),
                value: this.translate.instant('TagManagement.MerchantsTagManagement.Forecast')
            }, // 预测
            {
                id: '自定义标签',
                value: '自定义标签'
            },
        ];
    }


    getTagManagementDetail() {
        this.tagManagementService.getLabelById(this.TagDetailId).subscribe(res => {
            res[0].lastModifiedDate = this.dateTransform.transform(res[0].lastModifiedDate);
            this.TagDetail = res[0];
            this.profileForm.patchValue(res[0]);
            this.profileForm.disable();
        });
    }

    // 保存新建数据
    onSave() {
        const tags = this.profileForm.getRawValue();
        if (!this.IsNull(tags.tagName)) {
            this.snackBar.open(this.translate.instant('TagManagement.MerchantsTagManagement.tips1'), '✖'); //  标签名称不能为空
            return;
        }
        if (!this.IsNull(tags.secondLevel)) {
            this.snackBar.open(this.translate.instant('TagManagement.MerchantsTagManagement.tips2'), '✖'); //  二级分类不能为空
            return;
        }
        if (!this.IsNull(tags.tagRemarks)) {
            this.snackBar.open(this.translate.instant('TagManagement.MerchantsTagManagement.tips3'), '✖'); //  标签说明不能为空
            return;
        }
        this.saveButtonStatus = true;
        if (tags.tagType === 'MEMBER') {
            tags.tagSource = 'member';
        } else if (tags.tagType === 'ACTIVITY') {
            tags.tagSource = 'activity';
        } else {
            tags.tagSource = 'store';
        }
        if (this.profileForm.get('firstLevel').value === '自定义标签' && this.profileForm.get('secondLevel').value === '自定义标签'){
            tags.selfSign = true;
        }
        this.snackBar.open('待开发！');
        return;
        // this.tagManagementService.createMerchantTagList(tags).subscribe(
        //     () => {
        //         this.router.navigate(['/apps/MerchantsTagManagement']).then();
        //         this.snackBar.open(this.translate.instant('TagManagement.MerchantsTagManagement.tips4'), '✖'); //  新增商户标签成功
        //     }, () => {
        //         this.saveButtonStatus = false;
        //     }, () => {
        //
        //     }
        // );
    }


    // 编辑数据
    onEdit() {
        this.pageTitle = 'edit';
        this.profileForm.enable();
        if (this.profileForm.get('firstLevel').value === '自定义标签'){
            this.profileForm.get('secondLevel').disable();
        }
        this.profileForm.get('lastModifiedBy').disable();
        this.profileForm.get('lastModifiedDate').disable();
    }

    // 编辑页面取消操作
    onCancel() {
        this.pageTitle = 'detail';
        this.profileForm.patchValue(this.TagDetail);
        this.profileForm.disable();
    }

    // 编辑页面保存操作
    onUpdate() {
        const tags = this.profileForm.getRawValue();
        if (!this.IsNull(tags.tagName)) {
            this.snackBar.open(this.translate.instant('TagManagement.MerchantsTagManagement.tips1'), '✖'); //  标签名称不能为空
            return;
        }
        if (!this.IsNull(tags.secondLevel)) {
            this.snackBar.open(this.translate.instant('TagManagement.MerchantsTagManagement.tips2'), '✖'); //  二级分类不能为空
            return;
        }
        if (!this.IsNull(tags.tagRemarks)) {
            this.snackBar.open(this.translate.instant('TagManagement.MerchantsTagManagement.tips3'), '✖'); //  标签说明不能为空
            return;
        }
        this.saveButtonStatus = true;
        if (tags.tagType === 'MEMBER') {
            tags.tagSource = 'member';
        } else if (tags.tagType === 'ACTIVITY') {
            tags.tagSource = 'activity';
        } else {
            tags.tagSource = 'store';
        }
        if (this.profileForm.get('firstLevel').value === '自定义标签' && this.profileForm.get('secondLevel').value === '自定义标签'){
            tags.selfSign = true;
        }
        tags.lastModifiedDate = this.formatToZoneDateTime(tags.lastModifiedDate);
        this.snackBar.open('待开发！');
        return;
        // this.tagManagementService.updateMerchantTag(tags).subscribe(() => {
        //     this.router.navigate(['/apps/MerchantsTagManagement']).then();
        //     this.snackBar.open(this.translate.instant('TagManagement.MerchantsTagManagement.tips5'), '✖'); //  修改商户标签成功
        // }, () => {
        //     this.saveButtonStatus = false;
        // }, () => {
        //
        // });
    }

    IsNull(para) {
        if ('undefined' !== para && undefined !== para && '' !== para && null !== para) {
            return true;
        } else {
            return false;
        }
    }



    formatToZoneDateTime(dateStr) {
        try {
            const date = new Date(dateStr);
            return date.toISOString();
        } catch (e) {
            return dateStr;
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}

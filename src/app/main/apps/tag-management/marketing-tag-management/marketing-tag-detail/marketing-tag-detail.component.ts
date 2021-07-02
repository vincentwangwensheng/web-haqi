import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {NewDateTransformPipe} from '../../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {MarketingTagService} from '../../../../../services/marketingTagService/marketing-tag.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material';

@Component({
    selector: 'app-marketing-tag-detail',
    templateUrl: './marketing-tag-detail.component.html',
    styleUrls: ['./marketing-tag-detail.component.scss']
})
export class MarketingTagDetailComponent implements OnInit {

    TagDetail: any;
    TagDetailId: number;
    ResponsiveStruts: boolean;
    pageFLag: string; // 区分不同的页面详情标识
    pageTitle: string;
    profileForm = new FormGroup({
        name: new FormControl('', Validators.required),
        category: new FormControl('', Validators.required),
        subCategory: new FormControl('', Validators.required),
        description: new FormControl('', Validators.required),
    });
    saveButtonStatus = false;
    constructor(
        private routeInfo: ActivatedRoute,
        private dateTransform: NewDateTransformPipe,
        private marketingTagService: MarketingTagService,
        private snackBar: MatSnackBar,
        private router: Router,
    ) {
    }

    ngOnInit() {
        this.pageFLag = this.routeInfo.snapshot.data['operation'];
        if (this.pageFLag === 'detail') {
            this.pageTitle = '标签详情';
        } else if (this.pageFLag === 'create') {
            this.pageTitle = '新建标签';
        }
        const w_w = window.innerWidth;
        w_w >= 960 ? this.ResponsiveStruts = true : this.ResponsiveStruts = false;
        this.routeInfo.params.subscribe((param: Params) => this.TagDetailId = param.id);
        this.addWindowListener();
        if ('detail' === this.pageFLag) {
            this.getTagManagementDetail();
        }
    }

    addWindowListener() {
        window.addEventListener('resize', () => {
            const w_w = window.innerWidth;
            w_w >= 960 ? this.ResponsiveStruts = true : this.ResponsiveStruts = false;
        });
    }

    getTagManagementDetail() {
        this.marketingTagService.getDetailById(this.TagDetailId).subscribe(res => {
            if (res['enabled'] === true) {
                res['enabled'] = '正常';
            } else {
                res['enabled'] = '冻结';
            }
            res['createdDate'] = this.dateTransform.transform(res['createdDate']);
            res['lastModifiedDate'] = this.dateTransform.transform(res['lastModifiedDate']);
            this.TagDetail = res;
            this.profileForm.get('name').patchValue(res['name']);
            this.profileForm.get('category').patchValue(res['category']);
            this.profileForm.get('category').disable();
            this.profileForm.get('subCategory').patchValue(res['subCategory']);
            this.profileForm.get('description').patchValue(res['description']);
        });
    }

    // 返回到上级历史地址
    goHistory() {
        window.history.go(-1);
    }

    // 保存新建数据
    onSave() {
        if (!this.profileForm.value['name'].trim()) {
            this.snackBar.open('标签名称不能为空', '✖');
            return;
        }
        if (!this.profileForm.value['category']) {
            this.snackBar.open('一级分类不能为空', '✖');
            return;
        }
        if (!this.profileForm.value['subCategory'].trim()) {
            this.snackBar.open('二级分类不能为空', '✖');
            return;
        }
        if (!this.profileForm.value['description'].trim()) {
            this.snackBar.open('标签说明不能为空', '✖');
            return;
        }
        this.profileForm.value['enabled'] = true;
        this.saveButtonStatus = true;
        this.marketingTagService.createMarketingTagList(this.profileForm.value).subscribe(
            () => {
                this.router.navigate(['/apps/MarketingTagManagement']).then();
                this.snackBar.open('新增营销标签成功', '✖');
            }, () => {

            }, () => {
                this.saveButtonStatus = false;
            }
        );
    }

    // 编辑按钮操作
    onEdit(){
        this.pageFLag = 'edit';
        this.pageTitle = '编辑标签';
        this.profileForm.get('category').enable();
    }

    // 编辑页面保存操作
    onUpdate(){
        if (!this.profileForm.value['name'].trim()) {
            this.snackBar.open('标签名称不能为空', '✖');
            return;
        }
        if (!this.profileForm.value['category']) {
            this.snackBar.open('一级分类不能为空', '✖');
            return;
        }
        if (!this.profileForm.value['subCategory'].trim()) {
            this.snackBar.open('二级分类不能为空', '✖');
            return;
        }
        if (!this.profileForm.value['description'].trim()) {
            this.snackBar.open('标签说明不能为空', '✖');
            return;
        }
        this.profileForm.value['id'] = this.TagDetail.id;
        this.profileForm.value['enabled'] = true;
        this.saveButtonStatus = true;
        this.marketingTagService.updateMarketingTag(this.profileForm.value).subscribe(
            () => {
                this.router.navigate(['/apps/MarketingTagManagement']).then();
                this.snackBar.open('编辑营销标签成功', '✖');
            }, () => {
                this.saveButtonStatus = true;
            }, () => {

            }
        );
    }
    // 编辑页面取消操作
    onCancel(){
        this.pageFLag = 'detail';
        this.pageTitle = '标签详情';
        this.profileForm.get('name').patchValue(this.TagDetail['name']);
        this.profileForm.get('category').patchValue(this.TagDetail['category']);
        this.profileForm.get('category').disable();
        this.profileForm.get('subCategory').patchValue(this.TagDetail['subCategory']);
        this.profileForm.get('description').patchValue(this.TagDetail['description']);
    }

}

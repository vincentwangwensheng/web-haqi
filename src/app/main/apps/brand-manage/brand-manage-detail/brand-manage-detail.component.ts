import {Component, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {takeUntil} from 'rxjs/operators';
import {MatDialog, MatSnackBar} from '@angular/material';
import {FileTransferService} from '../../../../services/file-transfer.service';
import {Subject} from 'rxjs';
import {DomSanitizer} from '@angular/platform-browser';
import {BrandManageService} from '../brand-manage.service';
import {fuseAnimations} from '../../../../../@fuse/animations';
import {TranslateService} from '@ngx-translate/core';
import {environment} from '../../../../../environments/environment.hmr';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';

@Component({
    selector: 'app-brand-manage-detail',
    templateUrl: './brand-manage-detail.component.html',
    styleUrls: ['./brand-manage-detail.component.scss'],
    animations: fuseAnimations
})
export class BrandManageDetailComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject();
    editorContent = '';
    pageTitle = '品牌详情';
    pageFlag;
    quillReadonlyFlag = true;
    logoFormData: any;
    logoImgName: string;
    notUploading: boolean; // 是否在上传
    progressLoad: number;  // 上传长度
    uploadStatus = false; // 还未上传完成标识
    finishStatus = true; // 上传完成标识
    currentLogoImgSaveId; // 存储logo返回的id
    currentBrandImgSaveId; // 存储品牌图片返回的id
    logoImgSrc; // logo图片路径
    logoImgLoading = false;
    brandImgSrcArray = []; // brand图片路径 数组
    brandImgSaveIdArray = [];
    // 商户标签选择
    selectedTags = [];
    merchantTags = [];
    brandImg = []; // 商品图片
    primitiveData;  // 原始数据
    saveButtonFlag = false; // 保存按钮状态
    brandForm: any; // 表单
    enabledS: any; // 品牌状态
    quillConfig: any; // 富文本编辑框的配置项
    editor;   // 富文本
    upBrandFormData: any;

    constructor(
        private activatedRoute: ActivatedRoute,
        private snackBar: MatSnackBar,
        private fileTransferService: FileTransferService,
        private sanitizer: DomSanitizer,
        private dialog: MatDialog,
        private loading: FuseProgressBarService,
        private notify: NotifyAsynService,
        private translate: TranslateService,
        private brandManageService: BrandManageService,
        private router: Router,
    ) {
        this.brandForm = new FormGroup({
            id: new FormControl({value: '', disabled: true}, Validators.required),
            name: new FormControl({value: '', disabled: false}, Validators.required),
            english: new FormControl({value: '', disabled: false}, Validators.required),
            enabled: new FormControl({value: true, disabled: false}, Validators.required),
        });
    }

    ngOnInit() {
        this.setConfig();
        this.enabledS = [
            {id: true, value: this.translate.instant('brand.normal')}, // 正常
            {id: false, value: this.translate.instant('brand.frozen')}, // 冻结
        ];
        this.brandImgSrcArray = [
            {src: 'no', loading: false},
            {src: 'no', loading: false},
            {src: 'no', loading: false},
            {src: 'no', loading: false},
            {src: 'no', loading: false},
            {src: 'no', loading: false},
        ];
        this.getBrandInfo();
    }

    setConfig() {
        this.quillConfig = {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                ['blockquote', 'code-block'],
                [{'header': 1}, {'header': 2}],               // custom button values
                [{'list': 'ordered'}, {'list': 'bullet'}],
                [{'script': 'sub'}, {'script': 'super'}],      // superscript/subscript
                [{'indent': '-1'}, {'indent': '+1'}],          // outdent/indent
                [{'direction': 'rtl'}],                         // text direction
                [{'size': ['small', false, 'large', 'huge']}],  // custom dropdown
                [{'header': [1, 2, 3, 4, 5, 6, false]}],
                [{'color': []}, {'background': []}],          // dropdown with defaults from theme
                [{'font': []}],
                [{'align': []}],
                ['clean'],                                         // remove formatting button
                ['link', 'image']                         // link and image,
            ]
        };
    }

    getBrandInfo() {
        const id = +this.activatedRoute.snapshot.paramMap.get('id');
        this.pageFlag = this.activatedRoute.snapshot.data['operation'];
        if (this.pageFlag === 'detail') {
            this.loading.show();
            this.pageTitle = this.translate.instant('brand.detail');  // '品牌详情';
            this.brandManageService.getBrandDetailById(id).subscribe(res => {
                this.primitiveData = res;
                this.brandForm.patchValue(res);
                this.brandForm.disable();
                this.currentLogoImgSaveId = res['logo'];
                if (this.currentLogoImgSaveId) {
                    this.logoImgLoading = true;
                    this.fileTransferService.previewFile(this.currentLogoImgSaveId).pipe(takeUntil(this._unsubscribeAll)).subscribe(
                        rest => {
                            const fileReader = new FileReader();
                            fileReader.readAsDataURL(rest);
                            fileReader.onloadend = (res1) => {
                                const result = res1.target['result'];
                                this.logoImgSrc = this.sanitizer.bypassSecurityTrustUrl(result);
                                this.logoImgLoading = false;
                            };
                        });
                }
                this.editorContent = res['desc'];
                this.getTagsByBrand(res['id']);
                const brandImgIdArray = res['images'].split(',');
                for (let i = 0; i < brandImgIdArray.length; i++) {
                    this.brandImgSrcArray[i] = {src: 'no', loading: true};
                    this.fileTransferService.previewFile(brandImgIdArray[i]).pipe(takeUntil(this._unsubscribeAll)).subscribe(
                        rest => {
                            const fileReader = new FileReader();
                            fileReader.readAsDataURL(rest);
                            fileReader.onloadend = (res1) => {
                                const result = res1.target['result'];
                                this.brandImgSaveIdArray[i] = {saveID: brandImgIdArray[i]};
                                this.brandImgSrcArray[i] = {
                                    src: this.sanitizer.bypassSecurityTrustUrl(result),
                                    loading: false
                                };
                            };
                        },
                        error1 => {
                            this.brandImgSrcArray[i] = {src: 'no', loading: false};
                        }, () => {
                            this.brandImgSrcArray[i] = {src: 'no', loading: false};
                        });
                }
                this.loading.hide();
            });
        } else if (this.pageFlag === 'create') {
            this.pageTitle = this.translate.instant('brand.create');  // '品牌新建';
            this.quillReadonlyFlag = false;
        }
    }

    // 保存表单数据
    onSave() {
        if (!this.brandForm.valid) {
            this.snackBar.open(this.translate.instant('brand.tips4'), '✖'); //  请填写相关信息
            return;
        }
        if (!this.currentLogoImgSaveId) {
            this.snackBar.open(this.translate.instant('brand.tips5'), '✖'); //  请上传logo图片
            return;
        }
        if (!this.editorContent) {
            this.snackBar.open(this.translate.instant('brand.tips6'), '✖'); //  请填写品牌简介
            return;
        }
        if (this.merchantTags.length === 0) {
            this.snackBar.open(this.translate.instant('brand.tips7'), '✖'); //  请添加品牌标签
            return;
        }
        if (this.brandImgSrcArray.length === 0) {
            this.snackBar.open(this.translate.instant('brand.tips8'), '✖'); //  请添加品牌图片
            return;
        }
        let imgUpF = false;
        this.brandImgSrcArray.forEach(
            r => {
                if (r.src !== 'no') {
                    imgUpF = true;
                }
            }
        );
        if (!imgUpF) {
            this.snackBar.open(this.translate.instant('brand.tips8'), '✖'); //  请添加品牌图片
            return;
        }
        const brandFormValue = this.brandForm.value;
        brandFormValue['logo'] = this.currentLogoImgSaveId;
        brandFormValue['desc'] = this.editorContent;
        const saveIdCopy = [];
        this.brandImgSaveIdArray.forEach(r => {
            saveIdCopy.push(r.saveID);
        });
        let brandImgSaveId = '';
        for (let i = 0; i < saveIdCopy.length; i++) {
            if (i !== saveIdCopy.length - 1) {
                brandImgSaveId += saveIdCopy[i] + ',';
            } else {
                brandImgSaveId += saveIdCopy[i];
            }
        }
        brandFormValue['images'] = brandImgSaveId;
        delete brandFormValue['id'];
        this.saveButtonFlag = true;

        this.merchantTags.forEach(r => {
            r.tagType = 'STORE';
        });
        this.loading.show();
        this.brandManageService.createBrandInfo(brandFormValue).subscribe((res) => {
            const id = res.body['id'] + '';
            this.snackBar.open(this.translate.instant('brand.tips9'), '✖'); //  新建成功
            this.setBrandTags(id);

        }, () => {
            this.saveButtonFlag = false;
        });
    }

    // 编辑状态的取消
    onCancel() {
        this.pageFlag = 'detail';
        this.pageTitle = this.translate.instant('brand.detail');  // 品牌详情';
        this.brandImgSrcArray = [
            {src: 'no', loading: false},
            {src: 'no', loading: false},
            {src: 'no', loading: false},
            {src: 'no', loading: false},
            {src: 'no', loading: false},
            {src: 'no', loading: false},
        ];
        this.brandImgSaveIdArray = [];
        this.brandForm.patchValue(this.primitiveData);
        this.brandForm.disable();
        this.currentLogoImgSaveId = this.primitiveData['logo'];
        if (this.currentLogoImgSaveId) {
            this.logoImgLoading = true;
            this.fileTransferService.previewFile(this.currentLogoImgSaveId).pipe(takeUntil(this._unsubscribeAll)).subscribe(
                rest => {
                    const fileReader = new FileReader();
                    fileReader.readAsDataURL(rest);
                    fileReader.onloadend = (res1) => {
                        const result = res1.target['result'];
                        this.logoImgSrc = this.sanitizer.bypassSecurityTrustUrl(result);
                        this.logoImgLoading = false;
                    };
                });
        }
        this.editorContent = this.primitiveData['desc'];
        this.getTagsByBrand(this.primitiveData['id']);
        this.merchantTags = this.primitiveData['labels'];
        const brandImgIdArray = this.primitiveData['images'].split(',');
        for (let i = 0; i < brandImgIdArray.length; i++) {
            this.brandImgSrcArray[i] = {src: 'no', loading: true};
            this.fileTransferService.previewFile(brandImgIdArray[i]).pipe(takeUntil(this._unsubscribeAll)).subscribe(
                rest => {
                    const fileReader = new FileReader();
                    fileReader.readAsDataURL(rest);
                    fileReader.onloadend = (res1) => {
                        const result = res1.target['result'];
                        this.brandImgSaveIdArray[i] = {saveID: brandImgIdArray[i]};
                        this.brandImgSrcArray[i] = {src: this.sanitizer.bypassSecurityTrustUrl(result), loading: false};
                    };
                },
                error1 => {
                    this.brandImgSrcArray[i] = {src: 'no', loading: false};
                });

        }
    }

    // 编辑状态的保存
    onUpdate() {
        if (!this.brandForm.valid) {
            this.snackBar.open(this.translate.instant('brand.tips4'), '✖'); // ; 请填写相关信息
            return;
        }
        if (!this.currentLogoImgSaveId) {
            this.snackBar.open(this.translate.instant('brand.tips5'), '✖'); //  请上传logo图片
            return;
        }
        if (!this.editorContent) {
            this.snackBar.open(this.translate.instant('brand.tips6'), '✖'); //  请填写品牌简介
            return;
        }
        if (this.merchantTags.length === 0) {
            this.snackBar.open(this.translate.instant('brand.tips7'), '✖'); //  请添加品牌标签
            return;
        }
        if (this.brandImgSrcArray.length === 0) {
            this.snackBar.open(this.translate.instant('brand.tips8'), '✖'); //  请添加品牌图片
            return;
        }
        let imgUpF = false;
        this.brandImgSrcArray.forEach(
            r => {
                if (r.src !== 'no') {
                    imgUpF = true;
                }
            }
        );
        if (!imgUpF) {
            this.snackBar.open(this.translate.instant('brand.tips8'), '✖'); //  请添加品牌图片
            return;
        }
        const brandFormValue = this.brandForm.value;
        brandFormValue['logo'] = this.currentLogoImgSaveId;
        brandFormValue['desc'] = this.editorContent;
        const saveIdCopy = [];
        this.brandImgSaveIdArray.forEach(r => {
            if (r.saveID !== null) {
                saveIdCopy.push(r.saveID);
            }
        });

        let brandImgSaveId = '';
        for (let i = 0; i < saveIdCopy.length; i++) {
            if (i !== saveIdCopy.length - 1) {
                brandImgSaveId += saveIdCopy[i] + ',';
            } else {
                brandImgSaveId += saveIdCopy[i];
            }
        }
        brandFormValue['images'] = brandImgSaveId;
        brandFormValue['id'] = +this.activatedRoute.snapshot.paramMap.get('id');
        this.saveButtonFlag = true;
        this.brandManageService.updateBrandInfo(brandFormValue).subscribe((res) => {
            this.snackBar.open(this.translate.instant('brand.tips12'), '✖'); // 编辑成功
            this.setBrandTags(this.activatedRoute.snapshot.paramMap.get('id'));
        });
    }

    onEdit() {
        this.pageTitle = this.translate.instant('brand.edit'); //  '品牌编辑';
        this.pageFlag = 'update';
        this.brandForm.enable();
        this.brandForm.get('id').disable();
        this.quillReadonlyFlag = false;
    }

    // 打开上传Logo选项框
    openUploadLogoImgDialog(uploadLogoDialog) {
        if (this.pageFlag === 'detail') {
            return;
        }
        if (!this.dialog.getDialogById('uploadLogoDialog_')) {
            this.uploadStatus = false;
            this.finishStatus = true;
            this.logoFormData = null;
            this.logoImgName = '';
            this.dialog.open(uploadLogoDialog, {
                id: 'uploadLogoDialog_',
                width: '500px',
                height: '245px',
                hasBackdrop: true,
                position: {top: '200px'}
            });
        }
    }

    // 上传文件 选择并展示路径
    CouponImgUpload(e) {
        const oneM = 1024 * 1024;
        const file = e.target.files[0];
        if (file.size > oneM) {
            this.snackBar.open(this.translate.instant('brand.tips3'), '✖'); //  上传文件大小不能超过1M
            return;
        }
        this.logoFormData = new FormData();
        this.logoImgName = file.name;
        this.logoFormData.append('files', file);
    }

    // 上传logo图片
    onUploadLogoImg() {
        if (!this.logoFormData) {
            this.snackBar.open(this.translate.instant('brand.tips1'), '✖');  //  请选择一个文件
            return;
        }
        this.notUploading = false;
        this.loading.show();
        this.fileTransferService.uploadFile(this.logoFormData).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res.type === 1) {
                this.progressLoad = (res.loaded / res.total) * 100;  // 上传长度
            }
            if (res.status === 200) {
                this.progressLoad = 100;
                this.notUploading = true;
                this.uploadStatus = true;
                this.finishStatus = false;
                this.currentLogoImgSaveId = res['body'];
                this.loading.hide();
                if (this.currentLogoImgSaveId) {
                    this.logoImgLoading = true;
                    this.fileTransferService.previewFile(this.currentLogoImgSaveId).pipe(takeUntil(this._unsubscribeAll)).subscribe(rest => {
                        const fileReader = new FileReader();
                        fileReader.readAsDataURL(rest);
                        fileReader.onloadend = (res1) => {
                            const result = res1.target['result'];
                            this.logoImgSrc = this.sanitizer.bypassSecurityTrustUrl(result);
                            this.logoImgLoading = false;
                        };
                    });
                }
            }
        });
    }

    // 上传品牌图片
    upBrandImg(p, e, para) {
        const oneM = 1024 * 1024;
        const file = e.target.files[0];
        if (file.size > oneM) {
            this.snackBar.open(this.translate.instant('brand.tips3'), '✖'); //  上传文件大小不能超过1M
            return;
        }
        const imgType = 'image/jpg,image/png,image/gif,image/jpeg';
        const type = file.type;
        if (!imgType.includes(type)) {
            this.snackBar.open('请上传图片', '✖');
            return;
        }
        this.upBrandFormData = new FormData();
        this.upBrandFormData.append('files', file);
        if (para === 'brand') {
            this.brandImgSrcArray[p] = {src: 'no', loading: true};
        } else {
            this.logoImgLoading = true;
        }
        this.fileTransferService.uploadFileNotBar(this.upBrandFormData).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            const saveID = res;
            if (saveID) {
                this.fileTransferService.previewFile(saveID).pipe(takeUntil(this._unsubscribeAll)).subscribe(
                    rest => {
                        const fileReader = new FileReader();
                        fileReader.readAsDataURL(rest);
                        fileReader.onloadend = (res1) => {
                            const result = res1.target['result'];
                            if (para === 'brand') {
                                this.brandImgSaveIdArray[p] = {saveID: saveID};
                                this.brandImgSrcArray[p] = {
                                    src: this.sanitizer.bypassSecurityTrustUrl(result),
                                    loading: false
                                };
                            } else {
                                this.currentLogoImgSaveId = saveID;
                                this.logoImgSrc = this.sanitizer.bypassSecurityTrustUrl(result);
                                this.logoImgLoading = false;
                            }
                        };
                    },
                    error1 => {
                        if (para === 'brand') {
                            this.brandImgSrcArray[p] = {src: 'no', loading: false};
                        } else {
                            this.logoImgLoading = false;
                        }
                    });
            }
        });
    }

    // 删除品牌、logo图片
    delImg(i, p) {
        if (p === 'brand') {
            this.brandImgSaveIdArray[i] = {saveID: null};
            this.brandImgSrcArray[i] = {src: 'no', loading: false};
        } else {
            this.currentLogoImgSaveId = null;
            this.logoImgSrc = null;
        }
    }

    /********************* 品牌简介 *******************/
    // 富文本编辑框 图片处理
    EditorCreated(event) {
        const toolbar = event.getModule('toolbar');
        toolbar.addHandler('image', this.imageHandler.bind(this));
        this.editor = event;
    }

    imageHandler() {
        const Imageinput = document.createElement('input');
        Imageinput.setAttribute('type', 'file');
        Imageinput.setAttribute('accept', 'image/png, image/gif, image/jpeg, image/bmp, image/x-icon');
        Imageinput.classList.add('ql-image');
        Imageinput.addEventListener('change', () => {
            const file = Imageinput.files[0];
            const data: FormData = new FormData();
            data.append('files', file);
            if (Imageinput.files != null && Imageinput.files[0] != null) {
                this.brandManageService.FileUploadNotBar(data).pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
                    if (res !== undefined && res !== 'undefined') {
                        const range = this.editor.getSelection(true);
                        const index = range.index + range.length;
                        this.editor.setSelection(1 + range.index);
                        this.editor.insertEmbed(range.index, 'image', sessionStorage.getItem('baseUrl') + environment.CouponShowImg + '?saveId=' + res);
                        const desc = this.editorContent;
                        let changeValue = '';
                        if (this.IsNull(desc)) {
                            changeValue = desc + '<img src="' + sessionStorage.getItem('baseUrl') + environment.CouponShowImg + '?saveId=' + res + '">';
                        } else {
                            changeValue = '<img src="' + sessionStorage.getItem('baseUrl') + environment.CouponShowImg + '?saveId=' + res + '">';
                        }
                        this.editorContent = changeValue;
                        this.editor.focus();
                    }
                }, error1 => {
                    this.loading.hide();
                });
            }
        });
        Imageinput.click();
    }

    IsNull(para) {
        if ('undefined' !== para && undefined !== para && '' !== para && null !== para) {
            return true;
        } else {
            return false;
        }
    }

    /*********************** 品牌标签 ******************/
    // 获取标签
    getTagsByBrand(id) {
        this.brandManageService.getTagsByBrand(id).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                this.merchantTags = res['brandTag'];
            }
        );
    }

    // checkbox选中商户标签
    onSelectTags(event) {
        this.selectedTags = event;
    }

    // 打开选择标签列表
    editMerchantTagsTags(tagTemplate: TemplateRef<any>) {
        this.selectedTags = [];
        Object.assign(this.selectedTags, this.merchantTags);
        this.dialog.open(tagTemplate, {id: 'tagTemplate', width: '80%'}).afterClosed().subscribe(res => {
            if (res) {
                this.merchantTags = [];
                Object.assign(this.merchantTags, this.selectedTags);
            } else {
                this.selectedTags = [];
            }
        });
    }

    deleteTags(index) {
        this.merchantTags.splice(index, 1);
    }

    setBrandTags(id) {
        // 保存完成后 将标签信息存到对应的集合里
        const brandT: any = [];
        this.merchantTags.forEach(r => {
            brandT.push({id: r.id});
        });
        const brand_vm = {
            brandId: id,
            tagList: brandT
        };
        this.brandManageService.setBrandTags(brand_vm).pipe().subscribe(res => {
                this.saveButtonFlag = false;
                this.router.navigate(['/apps/brandManage']).then(() => {
                    this.snackBar.open(this.translate.instant('brand.tips10'), '✖'); //  标签绑定成功
                });
                this.loading.hide();
            }, error1 => {
                this.snackBar.open(this.translate.instant('brand.tips11'), '✖');  // 标签绑定失败
                this.saveButtonFlag = false;
                this.loading.hide();
            },
            () => {
                this.saveButtonFlag = false;
                this.loading.hide();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}

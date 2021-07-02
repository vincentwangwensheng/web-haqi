import {Component, OnChanges, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import {Subject} from 'rxjs';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog, MatSnackBar} from '@angular/material';
import {FileTransferService} from '../../../../services/file-transfer.service';
import {DomSanitizer} from '@angular/platform-browser';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {TranslateService} from '@ngx-translate/core';
import {takeUntil} from 'rxjs/operators';
import {AdvertisingScreenService} from '../advertising-screen.service';

@Component({
    selector: 'app-advertising-screen-detail',
    templateUrl: './advertising-screen-detail.component.html',
    styleUrls: ['./advertising-screen-detail.component.scss']
})
export class AdvertisingScreenDetailComponent implements OnInit, OnDestroy {

    private _unsubscribeAll: Subject<any> = new Subject();
    pageTitle = '广告屏新建';
    pageFlag;
    selectedMall = null;
    currentMall = null;
    mallName = '';


    imgFormData: any;
    imgName: string;
    carouselImgIndex = 0; // 当前图片索引
    notUploading: boolean; // 是否在上传
    progressLoad: number;  // 上传长度
    uploadStatus = false; // 还未上传完成标识
    finishStatus = true; // 上传完成标识
    currentImgSaveId: string; // 图片保存id
    imgArray = []; // 图片数组
    currentIndex;

    primitiveData;

    advertisingForm = new FormGroup({
        id: new FormControl(null),
        startTime: new FormControl(null, Validators.required), // 开始时间
        endTime: new FormControl(null, Validators.required), // 结束时间
        enabled: new FormControl(true),
        name: new FormControl(null, Validators.required), // 内容组名称
        mall: new FormControl(null, Validators.required), // 商场id
        image: new FormControl([])
    });

    constructor(private activatedRoute: ActivatedRoute,
                private snackBar: MatSnackBar,
                private fileTransferService: FileTransferService,
                private sanitizer: DomSanitizer,
                private dialog: MatDialog,
                private loading: FuseProgressBarService,
                private notify: NotifyAsynService,
                private translate: TranslateService,
                private router: Router,
                private advertisingScreenService: AdvertisingScreenService) {
    }

    ngOnInit() {
        this.advertisingForm.get('id').disable();
        this.getCurrentPageOperation();
    }

    getCurrentPageOperation() {
        this.pageTitle = this.activatedRoute.snapshot.data['title'];
        this.pageFlag = this.activatedRoute.snapshot.data['operation'];
        if ('detail' === this.pageFlag) {
            this.advertisingForm.disable();
            this.getDetailInfo();
        }
    }

    getDetailInfo() {
        const id = this.activatedRoute.snapshot.paramMap.get('id');
        this.advertisingScreenService.getAdvertisingDetail(id).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.primitiveData = res;
            this.advertisingForm.patchValue(res);
            this.getCarousel();
        });
    }

    getCarousel() {
        for (const item of this.advertisingForm.value['image']) {
            this.fileTransferService.previewFile(item).pipe(takeUntil(this._unsubscribeAll)).subscribe(
                rest => {
                    const fileReader = new FileReader();
                    fileReader.readAsDataURL(rest);
                    fileReader.onloadend = (res) => {
                        const result = res.target['result'];
                        this.imgArray.push({id: item, src: this.sanitizer.bypassSecurityTrustUrl(result)});
                    };
                }
            );
        }
        console.log(this.imgArray);
    }

    onFreeze() {
        this.advertisingForm.value['id'] = this.activatedRoute.snapshot.paramMap.get('id');
        this.advertisingForm.value['enabled'] = false;
        this.advertisingScreenService.updateAdvertising(this.advertisingForm.value).pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            this.snackBar.open('冻结成功', '✖');
            this.router.navigate(['/apps/advertisingScreen']).then();
        });
    }

    onEdit() {
        this.advertisingForm.enable();
        this.advertisingForm.get('id').disable();
        this.advertisingForm.get('enabled').disable();
        this.advertisingForm.get('mall').disable();
        this.pageFlag = 'update';
        this.pageTitle = '广告屏编辑';
    }

    onSave(confirmTemplate: TemplateRef<any>) {
        this.advertisingForm.markAllAsTouched();
        if (null === this.advertisingForm.value['mall'] || '' === this.advertisingForm.value['mall']) {
            this.snackBar.open('请填写商城名称', '✖');
            return;
        }
        if (null === this.advertisingForm.value['startTime'] || '' === this.advertisingForm.value['startTime']) {
            this.snackBar.open('请填写开始时间', '✖');
            return;
        }

        if (null === this.advertisingForm.value['endTime'] || '' === this.advertisingForm.value['endTime']) {
            this.snackBar.open('请填写结束时间', '✖');
            return;
        }

        if (null === this.advertisingForm.value['name'] || '' === this.advertisingForm.value['name']) {
            this.snackBar.open('请填写内容组名称', '✖');
            return;
        }

        this.advertisingForm.value['startTime'] = this.formatToZoneDateTime(this.advertisingForm.value['startTime']);
        this.advertisingForm.value['endTime'] = this.formatToZoneDateTime(this.advertisingForm.value['endTime']);

        if (this.pageFlag === 'create') {
            this.onCreate(confirmTemplate);
        } else if (this.pageFlag === 'update') {
            this.onUpdate();
        }
    }

    onCreate(confirmTemplate: TemplateRef<any>) {
        delete this.advertisingForm.value['id'];
        if (this.advertisingForm.value['enabled'] === true) {
            this.advertisingScreenService.getMall(this.advertisingForm.value['mall']).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                this.dialog.open(confirmTemplate, {
                    id: 'confirmTemplate',
                    width: '60%'
                }).afterClosed().subscribe(confirm => {
                    if (confirm === true) {
                        res['enabled'] = false;
                        this.advertisingScreenService.createAdvertising(this.advertisingForm.value).pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
                            this.snackBar.open('新建广告屏成功', '✖');
                            this.router.navigate(['/apps/advertisingScreen']).then();
                        });
                    }
                });
            }, err => {
                this.advertisingScreenService.createAdvertising(this.advertisingForm.value).pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
                    this.snackBar.open('新建广告屏成功', '✖');
                    this.router.navigate(['/apps/advertisingScreen']).then();
                });
            });
        }
    }

    onUpdate() {
        this.advertisingForm.value['id'] = this.primitiveData['id'];
        this.advertisingForm.value['enabled'] = this.primitiveData['enabled'];
        this.advertisingForm.value['mall'] = this.primitiveData['mall'];
        // this.advertisingForm.value['image'] = ['985', '990', '995', '1000'];
        this.advertisingScreenService.updateAdvertising(this.advertisingForm.value).pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            this.snackBar.open('编辑广告屏成功', '✖');
            this.router.navigate(['/apps/advertisingScreen']).then();
        });

    }

    onCancel() {
        this.pageTitle = '广告屏详情';
        this.pageFlag = 'detail';
        this.imgArray = [];
        this.getDetailInfo();
        this.advertisingForm.disable();
    }

    // 将yyyy-MM-d HH:mm:ss 转为 字符串
    formatToZoneDateTime(dateStr) {
        const date = new Date(dateStr);
        return date.toISOString();
    }

    onSelectMalls(event) {
        this.selectedMall = event;
    }

    // 打开商场列表
    editMalls(mallTemplate: TemplateRef<any>) {
        if (this.pageFlag === 'detail') {
            return;
        }
        this.selectedMall = this.currentMall;
        this.dialog.open(mallTemplate, {id: 'mallTemplate', width: '80%'}).afterClosed().subscribe(res => {
            if (res) {
                this.currentMall = this.selectedMall;
                if (null != this.currentMall) {
                    this.advertisingForm.get('mall').patchValue(this.currentMall['mallId']);
                } else {
                    this.advertisingForm.get('mall').patchValue('');
                }
            } else {
                this.selectedMall = null;
            }
        });
    }

    // 打开上传文件选项框
    openUploadImgDialog(uploadImgDialog) {
        if ('detail' === this.pageFlag) {
            return;
        }
        if (!this.dialog.getDialogById('uploadImageDialog_')) {
            this.uploadStatus = false;
            this.finishStatus = true;
            this.imgFormData = null;
            this.imgName = '';
            this.dialog.open(uploadImgDialog, {
                id: 'uploadImageDialog_',
                width: '500px',
                height: '245px',
                position: {top: '200px'}
            }).afterClosed().subscribe(() => {
                this.fileTransferService.previewFile(this.currentImgSaveId).pipe(takeUntil(this._unsubscribeAll)).subscribe(
                    rest => {
                        const fileReader = new FileReader();
                        fileReader.readAsDataURL(rest);
                        fileReader.onloadend = (res1) => {
                            const result = res1.target['result'];
                            this.imgArray.push({id: this.currentImgSaveId, src: this.sanitizer.bypassSecurityTrustUrl(result)});
                        };
                    }
                );
            });
        }
    }

    // 上传文件 选择并展示路径
    CouponImgUpload(e) {
        const oneM = 1024 * 1024;
        const file = e.target.files[0];
        if (file.size > oneM) {
            this.snackBar.open('上传文件大小不能超过1M', '✖');
            return;
        }
        this.imgFormData = new FormData();
        this.imgName = file.name;
        this.imgFormData.append('files', file);
    }

    // 上传文件
    onUploadImg() {
        if (!this.imgFormData) {
            this.snackBar.open('请选择一个文件', '✖');
            return;
        }
        this.notUploading = false;
        this.fileTransferService.uploadFile(this.imgFormData).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res.type === 1) {
                this.progressLoad = (res.loaded / res.total) * 100;  // 上传长度
            }
            if (res.status === 200) {
                this.progressLoad = 100;
                this.notUploading = true;
                this.uploadStatus = true;
                this.finishStatus = false;
                this.currentImgSaveId = res['body'];
                if (this.currentImgSaveId) {
                    this.advertisingForm.value['image'].push(this.currentImgSaveId);
                }
            }
        });
    }

    // 删除轮播图图片
    deleteCarouselImg(id) {
        for (let i = 0; i < this.imgArray.length; i++) {
            if ( this.imgArray[i].id === id) {
                this.imgArray.splice(i, 1);
                break;
            }
        }
        for (let i = 0; i < this.advertisingForm.value['image'].length; i++) {
            if ( this.advertisingForm.value['image'][i] === id) {
                this.advertisingForm.value['image'].splice(i, 1);
                break;
            }
        }
    }

    // 轮播图下一张
    nextImg(flag) {
        if (flag) {
            this.carouselImgIndex = (this.carouselImgIndex - 1 + this.imgArray.length) % this.imgArray.length;
        } else if (flag) {
            this.carouselImgIndex = (this.carouselImgIndex + 1) % this.imgArray.length;
        }
    }

    onStartSourceDate(event, endTime) {
        endTime.picker.set('minDate', event);
    }

    onEndSourceDate(event, startTime) {
        startTime.picker.set('maxDate', event);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}

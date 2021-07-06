import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog, MatSnackBar} from '@angular/material';
import {FileTransferService} from '../../../../../services/file-transfer.service';
import {DomSanitizer} from '@angular/platform-browser';
import {takeUntil} from 'rxjs/operators';
import {MemberLevelService} from '../../../../../services/memberLevelService/member-level.service';
import {FuseProgressBarService} from '../../../../../../@fuse/components/progress-bar/progress-bar.service';
import {environment} from '../../../../../../environments/environment.hmr';
import {ECouponServiceService} from '../../../../../services/EcouponService/ecoupon-service.service';

@Component({
    selector: 'app-member-card-detail',
    templateUrl: './member-card-detail.component.html',
    styleUrls: ['./member-card-detail.component.scss']
})
export class MemberCardDetailComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject();
    editorContent = '';
    pageFlag = '';
    pageTitle = '';
    readonlyFlag: boolean;
    settingInfoForm = new FormGroup({
        vipCode: new FormControl('', Validators.required),
        vipName: new FormControl('', Validators.required),
        condition: new FormControl('', Validators.required),
        startValue: new FormControl('', Validators.required),
        endValue: new FormControl('', Validators.required),
    });
    activityFormData: any;
    activityImgName: string;
    notUploading: boolean; // 是否在上传
    progressLoad: number;  // 上传长度
    uploadStatus = false; // 还未上传完成标识
    finishStatus = true; // 上传完成标识
    currentActivityImgSaveId: string; // 图片保存id
    imgSrc = null;
    initialMemberLevelData: any; // 原始数据
    quillConfigMember: any;
    memberEdit: any;

    constructor(private activatedRoute: ActivatedRoute, private dialog: MatDialog,
                private snackBar: MatSnackBar, private fileTransferService: FileTransferService,
                private sanitizer: DomSanitizer, private memberLevelService: MemberLevelService,
                private loading: FuseProgressBarService, private router: Router, private eCouponServiceService: ECouponServiceService,
    ) {
    }

    ngOnInit() {
        this.quillConfigMember = {
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
        this.pageFlag = this.activatedRoute.snapshot.data['operation'];
        if ('detail' === this.pageFlag) {
            this.pageTitle = '会员卡详情';
            this.readonlyFlag = true;
            this.setFormData();
            this.setFormDisable();
        } else if ('create' === this.pageFlag) {
            this.pageTitle = '新增会员卡';
            this.readonlyFlag = false;
            this.memberLevelService.searchMemberLevelList('?sort=levelMin').subscribe(res => {
                this.initialMemberLevelData = res['body'];
            });
        }


    }

    setFormData() {
        const id = +this.activatedRoute.snapshot.paramMap.get('id');
        this.memberLevelService.searchMemberLevelList('?id.equals=' + id).subscribe((res) => {
            this.initialMemberLevelData = res['body'];
            let member;
            for (let i = 0; i < this.initialMemberLevelData.length; i++) {
                if (id === this.initialMemberLevelData[i]['id']) {
                    member = this.initialMemberLevelData[i];
                }
            }
            if (member['levelpic']['fileId']) {
                this.currentActivityImgSaveId = member['levelpic']['fileId'];
                this.fileTransferService.previewFile(this.currentActivityImgSaveId).pipe(takeUntil(this._unsubscribeAll)).subscribe(
                    rest => {
                        const fileReader = new FileReader();
                        fileReader.readAsDataURL(rest);
                        fileReader.onloadend = (res1) => {
                            const result = res1.target['result'];
                            this.imgSrc = this.sanitizer.bypassSecurityTrustUrl(result);
                        };
                    },
                    error1 => {

                    });
            }
            this.settingInfoForm.get('vipCode').patchValue(id);
            this.settingInfoForm.get('vipName').patchValue(id);
            if (member['levelremarks'][0]['remark']) {
                this.editorContent = member['levelremarks'][0]['remark'];

            }
        }, () => {

        }, () => {

        });
    }

    setFormDisable() {
        this.settingInfoForm.get('vipCode').disable();
        this.settingInfoForm.get('vipName').disable();
        this.settingInfoForm.get('condition').disable();
    }

    setFormEnable() {
        this.settingInfoForm.get('vipCode').enable();
        this.settingInfoForm.get('vipName').enable();
        this.settingInfoForm.get('condition').enable();
        this.settingInfoForm.get('startValue').enable();
        this.settingInfoForm.get('endValue').enable();
    }

    // 保存
    onSave() {
        const id = this.settingInfoForm.get('vipName').value;
        if (!id) {
            this.snackBar.open('请选择会员卡名称', '✖');
            return;
        }
        if (!this.currentActivityImgSaveId) {
            this.snackBar.open('请添加卡样图片', '✖');
            return;
        }
        if (!this.editorContent) {
            this.snackBar.open('请输入权益说明', '✖');
            return;
        }
        let memberLevel = {};
        for (let i = 0; i < this.initialMemberLevelData.length; i++) {
            if (id === this.initialMemberLevelData[i]['id']) {
                memberLevel = this.initialMemberLevelData[i];
                break;
            }
        }
        memberLevel['fileId'] = this.currentActivityImgSaveId;
        memberLevel['levelRemark'] = this.editorContent;
        this.loading.show();
        this.memberLevelService.updateMemberLevelData(memberLevel).subscribe(() => {
            this.snackBar.open('新建成功');
            this.router.navigateByUrl('apps/memberCard');
        }, () => {
            this.loading.hide();
        }, () => {
            this.loading.hide();
        });
    }


    // 编辑
    onEdit() {
        this.pageFlag = 'edit';
        this.pageTitle = '会员卡编辑';
        this.setFormEnable();
        this.readonlyFlag = false;
    }

    // 编辑状态取消
    onCancel() {
        this.pageFlag = 'detail';
        this.pageTitle = '会员卡详情';
        this.setFormData();
        this.setFormDisable();
        this.readonlyFlag = true;
    }

    // 编辑状态的保存
    onUpdate() {
        const id = +this.activatedRoute.snapshot.paramMap.get('id');
        const remarkData = [];
        const levelData = [];
        let dataId;
        for (dataId = 0; dataId < this.initialMemberLevelData.length; dataId++) {
            if (id === this.initialMemberLevelData[dataId]['id']) {
                levelData.push({
                    'levelId': this.initialMemberLevelData[dataId]['id'],
                    'levelName': this.initialMemberLevelData[dataId]['levelName'],
                    'levelPicId': this.currentActivityImgSaveId
                });
                remarkData.push({
                    'levelId': this.initialMemberLevelData[dataId]['id'],
                    'levelName': this.initialMemberLevelData[dataId]['levelName'],
                    'levelRemarkId': this.initialMemberLevelData[dataId]['levelremarks'][0]['id'],
                    'levelRemark': this.editorContent
                });
                break;
            }
        }
        if (!this.editorContent) {
            this.snackBar.open('请输入权益说明', '✖');
            return;
        }
        if (!this.currentActivityImgSaveId) {
            this.snackBar.open('请添加卡样图片', '✖');
            return;
        }
        this.memberLevelService.updateMemberLevelData(this.initialMemberLevelData[dataId]).subscribe(() => {
            this.memberLevelService.updateMemberLevels(levelData).subscribe();
            this.memberLevelService.updateLevelremarks(remarkData).subscribe();
            this.router.navigateByUrl('/apps/memberCard');
            this.snackBar.open('会员卡编辑成功');
        });

        // let updateModel;
        // const id = +this.activatedRoute.snapshot.paramMap.get('id');
        // for (let i = 0; i < this.initialMemberLevelData.length; i++) {
        //     if (id === this.initialMemberLevelData[i]['id']) {
        //         updateModel = this.initialMemberLevelData[i];
        //     }
        // }
        // updateModel['levelpic']['fileId'] = this.currentActivityImgSaveId;
        // updateModel['levelremarks'][0]['remark'] = this.editorContent;
        // if (!this.editorContent) {
        //   this.snackBar.open('请输入权益说明', '✖');
        //   return;
        // }
        // if (!this.currentActivityImgSaveId) {
        //   this.snackBar.open('请添加卡样图片', '✖');
        //   return;
        // }
        // this.memberLevelService.updateMemberLevelData(updateModel).subscribe(() => {
        //     console.log(updateModel);
        //   this.router.navigateByUrl('/apps/memberCard');
        //   this.snackBar.open('会员卡编辑成功');
        // });
    }

    // 打开上传文件选项框
    openUploadImgDialog(uploadImgDialog) {
        if ('detail' === this.pageFlag) {
            return;
        }
        if (!this.dialog.getDialogById('uploadImageDialog_')) {
            this.uploadStatus = false;
            this.finishStatus = true;
            this.activityFormData = null;
            this.activityImgName = '';
            this.dialog.open(uploadImgDialog, {
                id: 'uploadImageDialog_',
                width: '500px',
                height: '245px',
                position: {top: '200px'}
            }).afterClosed().subscribe(
                () => {
                    if (this.currentActivityImgSaveId) {
                        this.fileTransferService.previewFile(this.currentActivityImgSaveId).pipe(takeUntil(this._unsubscribeAll)).subscribe(
                            rest => {
                                const fileReader = new FileReader();
                                fileReader.readAsDataURL(rest);
                                fileReader.onloadend = (res1) => {
                                    const result = res1.target['result'];
                                    this.imgSrc = this.sanitizer.bypassSecurityTrustUrl(result);
                                };
                            },
                            error1 => {

                            });
                    }
                }
            );
        }
    }

    // 上传券文件 选择并展示路径
    CouponImgUpload(e) {
        const oneM = 1024 * 1024;
        const file = e.target.files[0];
        if (file.size > oneM) {
            this.snackBar.open('上传文件大小不能超过1M', '✖');
            return;
        }
        this.activityFormData = new FormData();
        this.activityImgName = file.name;
        this.activityFormData.append('files', file);
    }

    // 上传文件
    onUploadImg() {
        if (!this.activityFormData) {
            this.snackBar.open('请选择一个文件', '✖');
            return;
        }
        this.notUploading = false;
        this.fileTransferService.uploadFile(this.activityFormData).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res.type === 1) {
                this.progressLoad = (res.loaded / res.total) * 100;  // 上传长度
            }
            if (res.status === 200) {
                this.progressLoad = 100;
                this.notUploading = true;
                this.uploadStatus = true;
                this.finishStatus = false;
                this.currentActivityImgSaveId = res['body'];
            } else {
            }
        }, error1 => {

        });
    }


    // 富文本编辑框 图片处理
    EditorCreatedMember(event) {
        const toolbar = event.getModule('toolbar');
        toolbar.addHandler('image', this.imageHandler.bind(this));
        this.memberEdit = event;
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
                this.eCouponServiceService.CouponFileUpload(data).pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {

                    if (res.status === 200 && res.body !== undefined) {
                        const range = this.memberEdit.getSelection(true);
                        const index = range.index + range.length;
                        this.memberEdit.insertEmbed(range.index, 'image', sessionStorage.getItem('baseUrl') + environment.CouponShowImg + '?saveId=' + res.body + '\n');
                        this.memberEdit.setSelection(1 + range.index);
                        if (this.editorContent !== undefined && this.editorContent !== 'undefined' && this.editorContent !== '' && this.editorContent !== null && this.editorContent !== 'null') {
                            this.editorContent = this.editorContent + '<img src="' + sessionStorage.getItem('baseUrl') + environment.CouponShowImg + '?saveId=' + res.body + '">';
                        } else {
                            this.editorContent = '<img src="' + sessionStorage.getItem('baseUrl') + environment.CouponShowImg + '?saveId=' + res.body + '">';
                        }
                        this.memberEdit.focus();
                    }
                }, error1 => {
                    this.loading.hide();
                });
            }
        });
        Imageinput.click();
    }


    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}

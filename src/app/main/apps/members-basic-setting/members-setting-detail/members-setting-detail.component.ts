import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {MatDialog, MatSnackBar} from '@angular/material';
import {takeUntil} from 'rxjs/operators';
import {FileTransferService} from '../../../../services/file-transfer.service';
import {Subject} from 'rxjs';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-members-setting-detail',
  templateUrl: './members-setting-detail.component.html',
  styleUrls: ['./members-setting-detail.component.scss']
})
export class MembersSettingDetailComponent implements OnInit, OnDestroy {
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
  currentActivityImgSaveId: string;
  imgSrc = null;

  constructor(private activatedRoute: ActivatedRoute, private dialog: MatDialog,
              private snackBar: MatSnackBar, private fileTransferService: FileTransferService,
              private sanitizer: DomSanitizer,
              ) { }
  ngOnInit() {
    this.pageFlag = this.activatedRoute.snapshot.data['operation'];
    if ('detail' === this.pageFlag) {
      this.pageTitle = '会员基础设置详情';
      this.readonlyFlag = true;
      this.setFormData();
      this.setFormDisable();
    } else if ('create' === this.pageFlag) {
      this.pageTitle = '新增会员卡';
      this.readonlyFlag = false;
    }
  }

  setFormData(){
    this.settingInfoForm.get('vipCode').patchValue('BCIA123456');
  }

  setFormDisable(){
    this.settingInfoForm.get('vipCode').disable();
    this.settingInfoForm.get('vipName').disable();
    this.settingInfoForm.get('condition').disable();
  }

  setFormEnable(){
    this.settingInfoForm.get('vipCode').enable();
    this.settingInfoForm.get('vipName').enable();
    this.settingInfoForm.get('condition').enable();
    this.settingInfoForm.get('startValue').enable();
    this.settingInfoForm.get('endValue').enable();
  }

  // 编辑
  onEdit(){
    this.pageFlag = 'edit';
    this.pageTitle = '会员基础设置编辑';
    this.setFormEnable();
    this.readonlyFlag = false;
  }
  // 编辑状态取消
  onCancel(){
    this.pageFlag = 'detail';
    this.pageTitle = '会员基础设置详情';
    this.setFormData();
    this.setFormDisable();
    this.readonlyFlag = true;
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
      this.dialog.open(uploadImgDialog, {id: 'uploadImageDialog_', width: '500px', height: '245px', position: {top: '200px'}}).afterClosed().subscribe(
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

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

}

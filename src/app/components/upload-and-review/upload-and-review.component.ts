import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {DomSanitizer} from '@angular/platform-browser';
import {MatDialog, MatSnackBar} from '@angular/material';
import {UploadAndReviewService} from './upload-and-review.service';

@Component({
  selector: 'app-upload-and-review',
  templateUrl: './upload-and-review.component.html',
  styleUrls: ['./upload-and-review.component.scss']
})
export class UploadAndReviewComponent implements OnInit {
  @Input()
  title = '';
  // 上传图片
  @Input()
  uploadFile: UploadFile;
  private _unsubscribeAll = new Subject();
  @Output()
  getImageSaveId: EventEmitter<any> = new EventEmitter<any>();

  constructor(
      private service: UploadAndReviewService,
      private sanitizer: DomSanitizer,
      private snackBar: MatSnackBar,
      private dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  /******活动图片******/
  // 打开上传文件选项框
  openUploadImgDiloag(uploadImgDloag) {
    if (!this.dialog.getDialogById('uploadImageDialog_')) {
      this.uploadFile.uploadStatus = false;
      this.uploadFile.finishStatus = true;
      this.uploadFile.fileData = null;
      this.uploadFile.imgName = '';
      this.dialog.open(uploadImgDloag, {
        id: 'uploadImageDialog_',
        width: '500px',
        height: '245px',
        position: {top: '200px'},
        hasBackdrop: true,
      });
    }
  }

  // 打开预览的文件框
  openPreviewDilog(previewImgDloag) {
    if (this.uploadFile.umgUploadSuccessId) {
      this.uploadFile.imgPreLoading = true;
      if (!this.dialog.getDialogById('previewImageDialog_')) {
        this.dialog.open(previewImgDloag, {
          id: 'previewImageDialog_',
          width: '690px',
          height: '300px',
          position: {top: '200px'},
          hasBackdrop: true,
        });
      }
      this.service.previewFile(this.uploadFile.umgUploadSuccessId).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(res);
        fileReader.onloadend = (res1) => {
          const result = res1.target['result'];
          this.uploadFile.imgSrc = this.sanitizer.bypassSecurityTrustUrl(result);
          this.uploadFile.imgPreLoading = false;
        };
      });
    }
  }

  // 上传券文件 选择并展示路径
  couponImgUpload(event) {
    const oneM = 1024 * 1024;
    const file = event.target.files[0];
    if (file.size > oneM) {
      this.snackBar.open('上传文件大小不能超过1M', '✖');
      return;
    }
    this.uploadFile.fileData = new FormData();
    this.uploadFile.imgName = file.name;
    this.uploadFile.fileData.append('files', file);
  }

  // 上传文件
  onUploadImg() {
    if (!this.uploadFile.fileData) {
      this.snackBar.open('请选择一个文件', '✖');
    } else {
      this.uploadFile.uploading = true;
      this.service.uploadFile(this.uploadFile.fileData).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        if (res.type === 1) {
          this.uploadFile.progressLoad = (res.loaded / res.total) * 100;  // 上传长度
        }
        if (res.status === 200) {
          this.uploadFile.previewImgStatus = true;
          this.uploadFile.progressLoad = 100;
          this.uploadFile.uploading = false;
          this.uploadFile.uploadStatus = true;
          this.uploadFile.finishStatus = false;
          this.uploadFile.umgUploadSuccessId = res['body'];
          this.getImageSaveId.emit({id: res['body']});
        }
      });
    }
  }

}

export class UploadFile {
  previewImgStatus = false; // 图片预览的状态
  progressLoad: number;  // 上传长度
  imgName: string; // 图片名称
  uploading = false; // 是否在上传 在上传则显示进度条
  fileData: any; // 图片数据
  uploadStatus = false; // 还未上传完成标识
  finishStatus = true; // 上传完成标识
  imgSrc = null; // 预览图片路径
  imgPreLoading = false; // 加载条
  umgUploadSuccessId: string; // 图片上传成功返回id
}

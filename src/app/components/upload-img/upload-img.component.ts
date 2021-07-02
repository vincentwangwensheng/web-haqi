import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {FuseProgressBarService} from '../../../@fuse/components/progress-bar/progress-bar.service';
import {NewDateTransformPipe} from '../../pipes/date-new-date-transform/new-date-transform.pipe';

@Component({
  selector: 'app-upload-img',
  templateUrl: './upload-img.component.html',
  styleUrls: ['./upload-img.component.scss']
})
export class UploadImgComponent implements OnInit {

    CouponFormData: any;    // 上传的文件信息
    couponImgName: string;  // 上传的文件的名称

    @Input()
    upTitle = '';  // 标题
    @Input()
    upImgSource: UpImg;
    @Input()
    showTmImg = false;  // 是否显示查看示例
    @Input()
    showTmImgUrl = 'assets/images/cards/codeIm.png';  // 查看示例默认图片


    @Output()
    ImgUploadData: EventEmitter<any> = new EventEmitter();

    @Output()
    closeDialog: EventEmitter<any> = new EventEmitter();

  constructor(
      private snackBar: MatSnackBar,
      private loading: FuseProgressBarService,
      private dateTransform: NewDateTransformPipe ,
      private translate: TranslateService,
      public dialog: MatDialog,
  ) { }

  ngOnInit() {
      if (!this.upImgSource.uploadDesc) {
          this.upImgSource.uploadDesc = this.translate.instant('ElectronicVoucherManagement.AddSecuritiesRules.Tips_uploadDesc');
      }
      if (!this.upImgSource.limitType) {
          this.upImgSource.limitType = 'image/jpg,image/png,image/gif,image/jpeg';
      }
      if (!this.upImgSource.limitM) {
          this.upImgSource.limitM = 1048576; // 默认1M
      }

  }



    // 上传券文件 选择并展示路径
    CouponImgUpload(e) {
        const file = e.target.files[0];
        if (file.size > this.upImgSource.limitM) {
            this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.AddSecuritiesRules.Tips_upLimit_Comm'), '✖');
            return;
        }
        const type = file.type;
        if (this.upImgSource.limitType !== '.' && this.upImgSource.limitType !== '' && this.upImgSource.limitType !== undefined) {
            if (!this.upImgSource.limitType.includes(type)) {
                this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.AddSecuritiesRules.Tips_upImgLimit'), '✖');
                return;
            }
        }
        this.CouponFormData = new FormData();
        this.couponImgName = file.name;
        this.CouponFormData.append('files', file);
    }

    // 真正的上传
    onUploadImg() {
        if (!this.CouponFormData) {
            this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.AddSecuritiesRules.Tips_changeFiles'), '✖');
            return;
        }
        const data = {
            CouponFormData: this.CouponFormData,
            fileName: this.couponImgName
        };

        this.ImgUploadData.emit(data);
    }

    // 关掉上传选择框
    closeUploadImg(p) {
        if (p === 'finish') {
            this.closeDialog.emit('hasClose');
        }

        this.CouponFormData = null;
        this.ImgUploadData = null;
        this.couponImgName = '';
        this.upImgSource.notUploading = true ;
        this.upImgSource.UpLoadStatus = false;
        this.upImgSource.FinishStatus = true;
    }


    openExImg(ExImg){
        if (!this.dialog.getDialogById('ExImgClass')) {
            this.dialog.open(ExImg, {id: 'ExImgClass', width: '350px', height: '350px' ,  hasBackdrop: true } );
        }
    }


}
// 上传图片
export class UpImg {
    ProgressLoad: number;  // 上传长度
    notUploading: boolean; // 是否在上传
    UpLoadStatus = false;  // 上传按钮的状态，是否可 用
    FinishStatus = true;   // 完成按钮的状态  是否可用
    limitM: number;       // 上传文件的限制大小
    limitType: string;   // 上传类型限制  类型 就是和 input选择文件的格式一样  image/jpg,image/png,image/gif,image/jpeg   //没有限制填.
    uploadDesc: string; // 上传文件限制描述
}

/*

使用案例
 html:
 <ng-template #UpLoadImg>
 <app-upload-img (ImgUploadData)="realUpload($event)" [upImgSource]="upImg_"  [upTitle]="'上传营业执照'" (closeDialog)="closeUPImg($event)"></app-upload-img>
 </ng-template>
 ts:
 1. 先创建一个如下的实体类 并 声明变量
 // 上传图片
 export class UpImg {
    ProgressLoad: number;  // 上传长度
    notUploading: boolean; // 是否在上传
    UpLoadStatus = false;  // 上传按钮的状态，是否可 用
    FinishStatus = true;   // 完成按钮的状态  是否可用
    limitM: number;       // 上传文件的限制大小
    limitType: string;   // 上传类型限制
    uploadDesc: string; // 上传文件限制描述
}

  upImg_: UpImg; // 声明变量

 2. 在打开时给其赋值。以下仅供参考
 this.upImg_ = new UpImg();
 this.upImg_.limitM = 2097152;
 this.upImg_.limitType = 'image/jpg,image/png,image/gif,image/jpeg';
 this.upImg_.uploadDesc = '测试测试测试';
 if (!this.dialog.getDialogById('UpLoadImgClassComm')) {
            this.dialog.open(UpLoadImg, {id: 'UpLoadImgClassComm',   width: '500px', height: '245px', position: {top: '200px'}});
        }

 3. 调用上传所需要的接口
 realUpload(e){
         this.couponService.CouponFileUpload(e.CouponFormData).pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
                // { reportProgress: true, observe: 'events'}  上传拿到进度的参数
               this.upImg_.notUploading = false; // 让进度条可以看见
               this.upImg_.UpLoadStatus = true;  // 设置上传按钮为不可点击
               if (res.type === 1) {
                   // 浏览器返回上传进度
                   this.upImg_.ProgressLoad = (res.loaded / res.total) * 100;  // 上传长度
               }
               if (res.status === 200) {
                   // 上传完成
                   this.upImg_.ProgressLoad = 100; // 将进度条的今天提到百分之百
                   this.upImg_.notUploading = true; // 让进度条影藏
                   this.upImg_.FinishStatus = false; // 将完成按钮设置为可点击
                   const imgID = res.body;   // 上传返回的数据
               }
           },
             error1 => {
                 this.upImg_.notUploading = true;  // 上传失败将进度条影藏
                 this.upImg_.UpLoadStatus = false; // 将上传按钮设置为可点击状态
             });
    }
4. css页面需设置弹出框的padding为0 . 如下【id不能相同---》UpLoadImgClassComm】

::ng-deep{
  #UpLoadImgClassComm{
    padding: 0px!important;
  }
}



 5. // 关掉上传选择框 标志上传完成，可在此进行操作。可以不用此方法
    closeUPImg(e){
        if (e === 'hasClose') {

        }
    }


6. 常见的上传格式。accept需要用官方写法才行
*.3gpp    audio/3gpp, video/3gpp
*.ac3    audio/ac3
*.asf       allpication/vnd.ms-asf
*.au           audio/basic
*.css           text/css
*.csv           text/csv
*.doc    application/msword
*.dot    application/msword
*.dtd    application/xml-dtd
*.dwg    image/vnd.dwg
*.dxf      image/vnd.dxf
*.gif            image/gif
*.htm    text/html
*.html    text/html
*.jp2            image/jp2
*.jpe       image/jpeg
*.jpeg    image/jpeg
*.jpg          image/jpeg
*.js       text/javascript, application/javascript
*.json    application/json
*.mp2    audio/mpeg, video/mpeg
*.mp3    audio/mpeg
*.mp4    audio/mp4, video/mp4
*.mpeg    video/mpeg
*.mpg    video/mpeg
*.mpp    application/vnd.ms-project
*.ogg    application/ogg, audio/ogg
*.pdf    application/pdf
*.png    image/png
*.pot    application/vnd.ms-powerpoint
*.pps    application/vnd.ms-powerpoint
*.ppt    application/vnd.ms-powerpoint
*.rtf            application/rtf, text/rtf
*.svf           image/vnd.svf
*.tif         image/tiff
*.tiff       image/tiff
*.txt           text/plain
*.wdb    application/vnd.ms-works
*.wps    application/vnd.ms-works
*.xhtml    application/xhtml+xml
*.xlc      application/vnd.ms-excel
*.xlm    application/vnd.ms-excel
*.xls           application/vnd.ms-excel
*.xlt      application/vnd.ms-excel
*.xlw      application/vnd.ms-excel
*.xml    text/xml, application/xml
*.zip            aplication/zip
*.xlsx     application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

*/

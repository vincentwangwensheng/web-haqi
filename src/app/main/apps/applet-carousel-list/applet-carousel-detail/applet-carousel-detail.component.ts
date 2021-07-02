import {Component, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog, MatSnackBar} from '@angular/material';
import {FileTransferService} from '../../../../services/file-transfer.service';
import {DomSanitizer} from '@angular/platform-browser';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {TranslateService} from '@ngx-translate/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {AppletCarouselService} from '../applet-carousel.service';
import * as d3 from 'd3';
import {MarketingManageService} from '../../marketing-manage/marketing-manage.service';
@Component({
  selector: 'app-applet-carousel-detail',
  templateUrl: './applet-carousel-detail.component.html',
  styleUrls: ['./applet-carousel-detail.component.scss']
})
export class AppletCarouselDetailComponent implements OnInit, OnDestroy {

  private _unsubscribeAll: Subject<any> = new Subject();
  pageTitle = '小程序轮播新建';
  pageFlag;
  selectedMall = null;
  currentMall = null;
  mallName = '';


  activityFormData: any;
  activityImgName: string;
  notUploading: boolean; // 是否在上传
  progressLoad: number;  // 上传长度
  uploadStatus = false; // 还未上传完成标识
  finishStatus = true; // 上传完成标识
  currentActivityImgSaveId: string; // 图片保存id
  imgSrc = []; // 轮播图路径
  loopImgId = []; // 轮播图片id
  ImgTrueFalse = [];
  carouselDataArray = []; // 轮播数据数组


  selectedTags = []; // 活动数据
  marketingTags = [];
  activityInfo = []; //  活动信息数据


  currentIndex = 0; // 当前轮播
  carouselInterval; // 当前轮播定时器

  primitiveData;

  profileForm = new FormGroup({
    id: new FormControl(null),
    startTime: new FormControl(null, Validators.required), // 开始时间
    endTime: new FormControl(null, Validators.required), // 结束时间
    loopStatus: new FormControl('NORMAL'),
    loopName:  new FormControl(null, Validators.required), // 轮播名称
    mallName: new FormControl(null, Validators.required), // 轮播名称

  });

  constructor( private activatedRoute: ActivatedRoute,
               private snackBar: MatSnackBar,
               private fileTransferService: FileTransferService,
               private sanitizer: DomSanitizer,
               private dialog: MatDialog,
               private loading: FuseProgressBarService,
               private notify: NotifyAsynService,
               private translate: TranslateService,
               private router: Router,
               private appletCarouselService: AppletCarouselService,
               private marketingManageService: MarketingManageService) { }

  ngOnInit() {
    this.profileForm.get('id').disable();
    this.getCurrentPageOperation();

    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
    this.setCarouselInterval();

  }


  getCurrentPageOperation() {
    this.pageTitle = this.activatedRoute.snapshot.data['title'];
    this.pageFlag = this.activatedRoute.snapshot.data['operation'];
    if ('detail' === this.pageFlag) {
      this.profileForm.disable();
      this.getDetailInfo();
    }
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
          // this.mallName = this.currentMall['mallName'];
          this.profileForm.get('mallName').patchValue(this.currentMall['mallName']);

        }else {
          this.profileForm.get('mallName').patchValue('');
          // this.mallName = '';
        }
      } else {
        this.selectedMall = null;
      }
    });


  }

  // 打开上传文件选项框
  openUploadImgDialog(uploadImgDialog, i) {
    /* if (this.activeTeTagSource.MarkTypeSource[i]['primitiveData']) {
         return;
     }*/
    if (this.pageFlag === 'detail') {
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
              if (i > this.loopImgId.length - 1) {
                this.loopImgId.push(this.currentActivityImgSaveId);
              } else {
                this.loopImgId[i] = this.currentActivityImgSaveId;
              }

              this.fileTransferService.previewFile(this.currentActivityImgSaveId).pipe(takeUntil(this._unsubscribeAll)).subscribe(
                  rest => {
                    const fileReader = new FileReader();
                    fileReader.readAsDataURL(rest);
                    fileReader.onloadend = (res1) => {
                      const result = res1.target['result'];
                      this.imgSrc[i] = this.sanitizer.bypassSecurityTrustUrl(result);
                      // this.ImgTrueFalse.push({src: this.sanitizer.bypassSecurityTrustUrl(result) , number : i });
                      this.ImgTrueFalse[i] = {src: this.sanitizer.bypassSecurityTrustUrl(result) , number : i };
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


  addCarouselPhoto() {
    this.carouselDataArray.push({type: 'LINK', value: null, id: null, outLink: true});
  }

  // 删除轮播图片
  deleteCarouselPhoto(index){
    if (this.pageFlag === 'detail') {
      return;
    }
    this.carouselDataArray.splice(index, 1);
    this.imgSrc.splice(index, 1);
    this.loopImgId.splice(index, 1);
  }

  changePType(i, event){
    const popupType = event.value;
    if (popupType === 'ACTIVITY') {
      this.carouselDataArray[i]['type'] = 'ACTIVITY';
    } else {
      // 链接,
      this.carouselDataArray[i]['type'] = 'LINK';
    }
    this.carouselDataArray[i]['value'] = '';
  }

  // checkbox选中营销标签
  onSelectTags(event){
    this.selectedTags = event;
  }


  addActivity(tagTemplate: TemplateRef<any> , i) {
   /* if (this.activeTeTagSource.MarkTypeSource[i]['primitiveData']) {
      return;
    }*/
   if ('LINK' === this.carouselDataArray[i]['type'] || this.pageFlag === 'detail') {
     return;
   }
    this.selectedTags = [];
    Object.assign(this.selectedTags, this.marketingTags);
    this.dialog.open(tagTemplate, {id: 'tagTemplate', width: '80%'}).afterClosed().subscribe(res => {
      if (res) {
        this.activityInfo.push({id: this.selectedTags['id'], name: this.selectedTags['name']});
        this.carouselDataArray[i]['value'] = 'ID ' + this.selectedTags['id'] + ' ' + this.selectedTags['name'];
        this.marketingTags = [];
        Object.assign(this.marketingTags, this.selectedTags);
      } else {
        this.selectedTags = [];
      }
    });
  }

  onEdit() {
    this.profileForm.enable();
    this.profileForm.get('id').disable();
    this.pageFlag = 'update';
    this.pageTitle = '小程序轮播编辑';
  }

  onSave() {
      this.profileForm.markAllAsTouched();
      if (null === this.currentMall) {
        this.snackBar.open('请填写商城名称', '✖');
        return;
      }
      if (null === this.profileForm.value['beginTime'] || '' === this.profileForm.value['beginTime']) {
        this.snackBar.open('请填写有效时间', '✖');
        return;
      }

      if (null === this.profileForm.value['endTime'] || '' === this.profileForm.value['endTime']) {
        this.snackBar.open('请填写有效时间', '✖');
        return;
      }

    this.carouselDataArray.forEach(item => {
      if (item['value'] === null || item['value'] === '') {
        this.snackBar.open('请填写轮播图对应的跳转链接或跳转活动', '✖');
        return;
      }
    });
    for (let i = 0; i < this.imgSrc.length; i++) {
      if (!this.imgSrc[i]) {
        this.snackBar.open('请上传轮播图', '✖');
        return;
      }
    }
    if (this.imgSrc.length !== this.carouselDataArray.length) {
      this.snackBar.open('请上传轮播图', '✖');
      return;
    }


    this.profileForm.value['mallId'] = this.currentMall['mallId'];
    this.profileForm.value['mallName'] = this.currentMall['mallName'];
    this.profileForm.value['startTime'] =  this.formatToZoneDateTime(this.profileForm.value['startTime']);
    this.profileForm.value['endTime'] =  this.formatToZoneDateTime(this.profileForm.value['endTime']);
    const loopInfoDetaileds = [];
    this.carouselDataArray.forEach((item , index) => {
      if (item['type'] === 'LINK') {
        if (null === item['id']) {
          loopInfoDetaileds.push({loopActivityId: null, loopLink: item['value'], loopPictureId: this.loopImgId[index], loopType: 'LINK', outLink: item['outLink']});
        }else {
          loopInfoDetaileds.push({loopActivityId: null, loopLink: item['value'], loopPictureId: this.loopImgId[index], loopType: 'LINK', id: item['id'], outLink: item['outLink']});
        }
      } else if (item['type'] === 'ACTIVITY') {
        if (null === item['id']) {
          loopInfoDetaileds.push({loopActivityId: this.getActivityId(item['value']), loopLink: null, loopPictureId: this.loopImgId[index], loopType: 'ACTIVITY', outLink: item['outLink']});
        }else{
          loopInfoDetaileds.push({loopActivityId: this.getActivityId(item['value']), loopLink: null, loopPictureId: this.loopImgId[index], loopType: 'ACTIVITY', id: item['id'], outLink: item['outLink']});
        }

      }

    });
    this.profileForm.value['loopInfoDetaileds'] = loopInfoDetaileds;
    if (this.pageFlag === 'create') {
      delete this.profileForm.value['id'];
      this.appletCarouselService.createAppletCarousePhoto(this.profileForm.value).pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
        this.snackBar.open('新建轮播图成功', '✖');
        this.router.navigate(['/apps/RotationPictureComponent']).then();
      });
    }else if (this.pageFlag === 'update') {
      this.profileForm.value['id'] = this.primitiveData['id'];

      this.appletCarouselService.updateAppletCarousePhoto(this.profileForm.value).pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
        this.snackBar.open('编辑轮播图成功', '✖');
        this.router.navigate(['/apps/RotationPictureComponent']).then();
      });
    }
  }

  // 将yyyy-MM-d HH:mm:ss 转为 字符串
  formatToZoneDateTime(dateStr) {
    const date = new Date(dateStr);
    return date.toISOString();
  }

  getActivityId (str) {
    const strArray = str.split(' ');
    return strArray[1];

  }

  getDetailInfo() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.appletCarouselService.getAppletCarousePhotoDetail(id).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.primitiveData = res;
      this.profileForm.patchValue(res);
      this.currentMall = {mallId: res['mallId'], mallName: res['mallName']};
      res['loopInfoDetaileds'].forEach((item, i) => {
        if (item.loopType === 'LINK') {
          this.carouselDataArray[i] = ({type: 'LINK', value: item.loopLink, id: item.id, outLink: item.outLink});
        }else if (item.loopType === 'ACTIVITY') {
          this.marketingManageService.findMarketingManageList(item.loopActivityId).pipe(takeUntil(this._unsubscribeAll)).subscribe(activityRes => {
            this.carouselDataArray[i] = ({type: 'ACTIVITY', value: ('ID ' + item.loopActivityId + ' ' +  activityRes['name']), id: item.id, outLink: item.outLink});
          });

        }
        this.loopImgId.push(item['loopPictureId']);

        this.fileTransferService.previewFile(item['loopPictureId']).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            rest => {
              const fileReader = new FileReader();
              fileReader.readAsDataURL(rest);
              fileReader.onloadend = (res1) => {
                const result = res1.target['result'];
                this.imgSrc[i] = this.sanitizer.bypassSecurityTrustUrl(result);
                // this.ImgTrueFalse.push({src: this.sanitizer.bypassSecurityTrustUrl(result) , number : i });
                this.ImgTrueFalse[i] = {src: this.sanitizer.bypassSecurityTrustUrl(result) , number : i };
              };
            },
            error1 => {

            });

      });
    });
  }


  // 图片轮播动画
  setCarouselAnimation() {
    if (this.currentIndex > 0) {
      const translateX = 'translateX(-' + 100 * this.currentIndex + '%)';
      d3.selectAll('.img-size').style('transform', translateX);
    } else {
      d3.selectAll('.img-size').style('transform', null);
    }
  }

  setCarouselInterval() {
    this.carouselInterval = setInterval(() => {
      this.currentIndex = this.currentIndex + 1 > this.imgSrc.length - 1 ? 0 : this.currentIndex + 1;
      this.setCarouselAnimation();
    }, 4000);
  }




  onUpdate() {}

  onCancel(){
    this.pageTitle = '小程序轮播详情';
    this.pageFlag = 'detail';
/*    this.profileForm.patchValue(this.primitiveData);
    this.currentMall = {mallId: this.primitiveData['mallId'], mallName: this.primitiveData['mallName']};*/
    this.carouselDataArray = [];
    this.getDetailInfo();
    this.profileForm.disable();
  }

  nextImg(flag) {
    if (flag) {
      this.currentIndex = this.currentIndex + 1 > this.imgSrc.length - 1 ? 0 : this.currentIndex + 1;
      this.setCarouselAnimation();
    } else {
      this.currentIndex = this.currentIndex - 1 < 0 ? this.imgSrc.length - 1 : this.currentIndex - 1;
      this.setCarouselAnimation();
    }
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
    this.setCarouselInterval();
  }

  onStartSourceDate(event, endTime) {
    endTime.picker.set('minDate', event);
  }

  onEndSourceDate(event, startTime) {
    startTime.picker.set('maxDate', event);
  }



  ngOnDestroy(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

}

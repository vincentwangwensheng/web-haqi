import {Component, ElementRef, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {AppletMaskServiceService} from '../appletMaskService/applet-mask-service.service';
import {Subject} from 'rxjs';
import {fuseAnimations} from '../../../../../@fuse/animations';
import {MatDialog, MatSnackBar} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';
import {LoopInfoService} from '../loopInfo/loop-info.service';
import * as d3 from 'd3';
import {takeUntil} from 'rxjs/operators';
import {FileTransferService} from '../../../../services/file-transfer.service';

@Component({
  selector: 'app-rotation-picture',
  templateUrl: './rotation-picture.component.html',
  styleUrls: ['./rotation-picture.component.scss'] ,
  animations: fuseAnimations
})
export class RotationPictureComponent implements OnInit, OnDestroy{
    private _unsubscribeAll: Subject<any> = new Subject();
    ADDOrDetail: string;
    activeTeTagSource: ActiveTeTagSource;
    options2: FormGroup;
    ImgTrueFalse = [];
    currentIndex = 0; // 当前轮播
    carouselInterval; // 当前轮播定时器
    touchStart = {x: 0, y: 0};
    touchSubject = new Subject();
    linkOrActivityStatus = [];
    imgSrc = []; // 轮播图路径
    loopImgId = []; // 轮播图片id
    activityInfo = []; //  活动信息数据

    activityFormData: any;
    activityImgName: string;
    notUploading: boolean; // 是否在上传
    progressLoad: number;  // 上传长度
    uploadStatus = false; // 还未上传完成标识
    finishStatus = true; // 上传完成标识
    currentActivityImgSaveId: string; // 图片保存id

    // 营销标签选择
    selectedTags = [];
    marketingTags = [];

    primitiveDataResponse: any; // 原始数据
    activityCount = 0;
    tlKey = '';
    constructor(
        private document: ElementRef,
        private appletMaskServiceService: AppletMaskServiceService,
        private snackBar: MatSnackBar, private fileTransferService: FileTransferService,
        private dialog: MatDialog, private sanitizer: DomSanitizer,
        private loopInfoService: LoopInfoService,
    ) {
        this.options2 = new FormBuilder().group({
            id: new FormControl({value: null, disabled: true}, [Validators.required]),
            popupId: new FormControl({value: '', disabled: true}, [Validators.required]),
            popupName: new FormControl({value: '', disabled: false}, [Validators.required]),
            popupStartTime: new FormControl({value: '', disabled: false}, [Validators.required]),
            popupEndTime: new FormControl({value: '', disabled: false}, [Validators.required]),
            popupType: new FormControl({value: '跳转链接', disabled: false}),
            popupPattern: new FormControl({value: '', disabled: false}, [Validators.required]),
            popupLink: new FormControl({value: '', disabled: false}),
            popupActivityId: new FormControl({value: '', disabled: false}, [Validators.required]),
        });
        this.tlKey =  localStorage.getItem('currentProject') ;
    }

  ngOnInit() {
    this.ADDOrDetail = 'add';
    this.activeTeTagSource = new ActiveTeTagSource();
    this.activeTeTagSource.MarkTypeSource = [
          /*{id: '跳转活动', name: '跳转活动'},
          {id: '跳转链接', name: '跳转链接'}*/
      ];
    this.activeTeTagSource.activityOrLink = 'LINK';


    this.loopInfoService.searchLoopList('?sort=id').subscribe(res => {
        if (res['body']) {
            /*this.activeTeTagSource.MarkTypeSource.push({id: '跳转链接', name: '跳转链接'});
            this.linkOrActivityStatus.push({type: 'LINK', value: null});
            this.imgSrc.push(null);*/
            this.primitiveDataResponse = res['body'];
            for (let i = 0; i < res['body']['length']; i++) {
                if (res['body'][i]['loopType'] === 'LINK'){
                    this.activeTeTagSource.MarkTypeSource.push({id: '跳转链接', name: '跳转链接', primitiveData: res['body'][i]['id']});
                    this.linkOrActivityStatus.push({type: 'LINK', value: res['body'][i]['loopLink'], primitiveData: res['body'][i]['id']});
                } else if (res['body'][i]['loopType'] === 'ACTIVITY') {
                    /*this.activeTeTagSource.MarkTypeSource.push({id: '跳转活动', name: '跳转活动', primitiveData: res['body'][i]['id']});*/
                    this.activityInfo.push({id: res['body'][i]['loopActivityId'], name: res['body'][i]['loopName']});
                    this.activeTeTagSource.MarkTypeSource.push({id: '跳转活动', name: '跳转活动', primitiveData: res['body'][i]['id']});
                    this.linkOrActivityStatus.push({type: 'ACTIVITY', value: 'ID ' + res['body'][i]['loopActivityId'] + ' ' + res['body'][i]['loopName'], primitiveData: res['body'][i]['id']});
                }

                if (res['body'][i]['loopPictureId']) {
                    this.loopImgId.push(res['body'][i]['loopPictureId']);
                    this.fileTransferService.previewFile(res['body'][i]['loopPictureId']).pipe(takeUntil(this._unsubscribeAll)).subscribe(
                        rest => {
                            const fileReader = new FileReader();
                            fileReader.readAsDataURL(rest);
                            fileReader.onloadend = (res1) => {
                                const result = res1.target['result'];
                                this.imgSrc[i] = this.sanitizer.bypassSecurityTrustUrl(result);
                               // this.ImgTrueFalse.push({src: this.sanitizer.bypassSecurityTrustUrl(result) , number : i  });
                                this.ImgTrueFalse[i] = {src: this.sanitizer.bypassSecurityTrustUrl(result) , number : i  };
                            };
                        },
                        error1 => {
                            this.snackBar.open('图片异常');
                        });
                }

            }


        }else {
            this.snackBar.open('查询数据为空', '✖');
        }
    });

      this.ImgTrueFalse = [];
      if (this.carouselInterval) {
          clearInterval(this.carouselInterval);
      }
      this.setCarouselInterval();
  }



    changePType(i, event){
        const popupType = event.value;
        /*const popupType =  this.options2.controls.popupType.value;*/
        if (popupType === '跳转活动') {
            this.linkOrActivityStatus[i]['type'] = 'ACTIVITY';
            // this.activeTeTagSource.activityOrLink = 'activity';
        } else {
            // 链接,
            this.linkOrActivityStatus[i]['type'] = 'LINK';
           // this.activeTeTagSource.activityOrLink = 'Link';
        }
    }

    // 添加轮播图
    addRotationChart() {
        this.activeTeTagSource.MarkTypeSource.push({id: '跳转链接', name: '跳转链接'});
        this.linkOrActivityStatus.push({type: 'LINK', value: null, primitiveData: null});
        this.imgSrc.push(null);
    }

    deletePhoto(i) {
        const id = this.activeTeTagSource.MarkTypeSource[i]['primitiveData'];
        if (id) {
            // 原始数据库中删除  this.ImgTrueFalse.remove 一条图片数据
            this.loopInfoService.deleteLoopData(id).subscribe(() => {
                if (this.activeTeTagSource.MarkTypeSource[i][id] === '跳转活动') {
                    for (let k = 0; i < this.activityInfo.length; k ++) {
                        if (this.linkOrActivityStatus[i]['value'] === 'ID' + ' ' + this.activityInfo[k]['id'] + ' ' + this.activityInfo[k]['name']) {
                            this.activityInfo.splice(k , 1);
                            this.activityCount -= 1;
                            break;
                        }
                    }
                }
                this.activeTeTagSource.MarkTypeSource.splice(i, 1);
                this.linkOrActivityStatus.splice(i, 1);
                this.imgSrc.splice(i, 1);
                this.delWheelP(i);
                this.primitiveDataResponse.splice(i, 1);
                this.loopImgId.splice(i, 1);
            });

        } else {
            if (this.activeTeTagSource.MarkTypeSource[i][id] === '跳转活动') {
                for (let k = 0; i < this.activityInfo.length; k ++) {
                    if (this.linkOrActivityStatus[i]['value'] === 'ID' + ' ' + this.activityInfo[k]['id'] + ' ' + this.activityInfo[k]['name']) {
                        this.activityInfo.splice(k , 1);
                        this.activityCount -= 1;
                        break;
                    }
                }
            }
            this.activeTeTagSource.MarkTypeSource.splice(i, 1);
            this.linkOrActivityStatus.splice(i, 1);
            this.imgSrc.splice(i, 1);
            this.delWheelP(i);
            this.loopImgId.splice(i, 1);
        }
    }


    // 删除轮播图的图片
    delWheelP(j){


        this.ImgTrueFalse.splice(j , 1);

        /*    const img_s = [];
        for ( let i = 0 ; i < this.ImgTrueFalse.length ; i ++ ){
            if (this.ImgTrueFalse[i].number !== j) {
                img_s.push(this.ImgTrueFalse[i]);
            }
        }
        this.ImgTrueFalse = [];
        for (let o = 0 ; o < this.activeTeTagSource.MarkTypeSource.length ; o++ ){
          this.ImgTrueFalse.push({src: img_s[o].src , number : o });
      }*/


       // this.ImgTrueFalse = img_s;
        if (this.ImgTrueFalse.length === 1) {
            this.currentIndex = 0;
            this.setCarouselAnimation();
        }
    }

    // 保存数据
    onSave() {

        for (let i = 0; i < this.linkOrActivityStatus.length; i++) {
            if (!this.linkOrActivityStatus[i].value) {
                this.snackBar.open('请输入跳转链接或跳转活动', '✖');
                return;
            }
        }

        for (let i = 0; i < this.imgSrc.length; i++) {
            if (!this.imgSrc[i]) {
                this.snackBar.open('请上传轮播图', '✖');
                return;
            }
        }

        const allData = [];
        if (this.linkOrActivityStatus.length > 0) {
           // 先处理更新数据
            for (let i = 0; i < this.primitiveDataResponse.length; i ++) {
                this.primitiveDataResponse[i]['loopPictureId'] = this.loopImgId[i];
            }
            Object.assign(allData, this.primitiveDataResponse);
            // 处理新增的数据
            for (let i = 0; i < this.linkOrActivityStatus.length; i++) {
                if (this.linkOrActivityStatus[i]['type'] === 'LINK' && ! this.activeTeTagSource.MarkTypeSource[i]['primitiveData']){
                 const createModel = {loopType: 'LINK', loopLink: this.linkOrActivityStatus[i]['value'], loopPictureId: this.loopImgId[i], loopName: '轮播图片'};
                    allData.push(createModel);
                } else if (this.linkOrActivityStatus[i]['type'] === 'ACTIVITY' && ! this.activeTeTagSource.MarkTypeSource[i]['primitiveData']) {
                  const   createModel = {loopType: 'ACTIVITY', loopActivityId: this.activityInfo[this.activityCount]['id'], loopPictureId: this.loopImgId[i], loopName: this.activityInfo[this.activityCount]['name']};
                    allData.push(createModel);
                }
            }
            this.loopInfoService.batchHandleData(allData).subscribe(() => {

                this.activeTeTagSource.MarkTypeSource = [];
                this.linkOrActivityStatus = [];
                this.activityInfo = [];
                this.activeTeTagSource.MarkTypeSource = [];
                this.linkOrActivityStatus = [];
                this.loopImgId = [];
                this.ImgTrueFalse = [];
                this.loopInfoService.searchLoopList('?sort=id').subscribe(res => {
                    if (res['body']) {
                        /*this.activeTeTagSource.MarkTypeSource.push({id: '跳转链接', name: '跳转链接'});
                        this.linkOrActivityStatus.push({type: 'LINK', value: null});
                        this.imgSrc.push(null);*/
                        this.primitiveDataResponse = res['body'];
                        for (let i = 0; i < res['body']['length']; i++) {
                            if (res['body'][i]['loopType'] === 'LINK'){
                                this.activeTeTagSource.MarkTypeSource.push({id: '跳转链接', name: '跳转链接', primitiveData: res['body'][i]['id']});
                                this.linkOrActivityStatus.push({type: 'LINK', value: res['body'][i]['loopLink'], primitiveData: res['body'][i]['id']});
                            } else if (res['body'][i]['loopType'] === 'ACTIVITY') {
                                /*this.activeTeTagSource.MarkTypeSource.push({id: '跳转活动', name: '跳转活动', primitiveData: res['body'][i]['id']});*/
                                this.activityInfo.push({id: res['body'][i]['loopActivityId'], name: res['body'][i]['loopName']});
                                this.activeTeTagSource.MarkTypeSource.push({id: '跳转活动', name: '跳转活动', primitiveData: res['body'][i]['id']});
                                this.linkOrActivityStatus.push({type: 'ACTIVITY', value: 'ID ' + res['body'][i]['loopActivityId'] + ' ' + res['body'][i]['loopName'], primitiveData: res['body'][i]['id']});
                            }

                            if (res['body'][i]['loopPictureId']) {
                                this.loopImgId.push(res['body'][i]['loopPictureId']);
                                this.fileTransferService.previewFile(res['body'][i]['loopPictureId']).pipe(takeUntil(this._unsubscribeAll)).subscribe(
                                    rest => {
                                        const fileReader = new FileReader();
                                        fileReader.readAsDataURL(rest);
                                        fileReader.onloadend = (res1) => {
                                            const result = res1.target['result'];
                                            this.imgSrc[i] = this.sanitizer.bypassSecurityTrustUrl(result);
                                          //   this.ImgTrueFalse.push({src: this.sanitizer.bypassSecurityTrustUrl(result) , number : i  });
                                            this.ImgTrueFalse[i] = {src: this.sanitizer.bypassSecurityTrustUrl(result) , number : i  };
                                        };
                                    },
                                    error1 => {
                                        this.snackBar.open('图片异常');
                                    });
                            }

                        }


                    }else {
                        // this.snackBar.open('查询数据为空', '✖');
                    }
                    this.snackBar.open('保存成功', '✖');
                });


            });

        }else {
            this.snackBar.open('请添加轮播图', '✖');
            return;
        }


       /* if (this.linkOrActivityStatus.length > 0) {
           /!* const a = this.linkOrActivityStatus[this.linkOrActivityStatus.length - 1].value;
            if (!a) {
                this.snackBar.open('请输入跳转链接或跳转活动', '✖');
                return;
            }*!/
            for (let i = 0; i < this.linkOrActivityStatus.length; i++) {
                if (!this.linkOrActivityStatus[i].value) {
                    this.snackBar.open('请输入跳转链接或跳转活动', '✖');
                    return;
                }
            }

            for (let i = 0; i < this.imgSrc.length; i++) {
                if (!this.imgSrc[i]) {
                    this.snackBar.open('请上传轮播图', '✖');
                    return;
                }
            }
            let finishesCount = 0;
            let createModel = {};
            for (let i = 0; i < this.linkOrActivityStatus.length; i++) {
                if (this.linkOrActivityStatus[i]['type'] === 'LINK' && ! this.activeTeTagSource.MarkTypeSource[i]['primitiveData']) {
                     createModel = {loopType: 'LINK', loopLink: this.linkOrActivityStatus[i]['value'], loopPictureId: this.loopImgId[i], loopName: '轮播图片'};
                    this.loopInfoService.createLoopData(createModel).subscribe(res => {
                        this.activeTeTagSource.MarkTypeSource[i]['primitiveData'] = res['body']['id'];
                        finishesCount += 1;
                        /!* if (finishesCount === this.linkOrActivityStatus.length) {
                             this.snackBar.open('保存成功', '✖');
                         }*!/
                    });
                } else if (this.linkOrActivityStatus[i]['type'] === 'ACTIVITY' && ! this.activeTeTagSource.MarkTypeSource[i]['primitiveData']) {
                    createModel = {loopType: 'ACTIVITY', loopActivityId: this.activityInfo[this.activityCount]['id'], loopPictureId: this.loopImgId[i], loopName: this.activityInfo[this.activityCount]['name']};
                    this.activityCount += 1;
                    this.loopInfoService.createLoopData(createModel).subscribe(res => {
                        finishesCount += 1;
                        this.activeTeTagSource.MarkTypeSource[i]['primitiveData'] = res['body']['id'];
                        /!* if (finishesCount === this.linkOrActivityStatus.length) {
                             this.snackBar.open('保存成功', '✖');
                         }*!/
                    });
                } else if (this.linkOrActivityStatus[i]['type'] === 'LINK' && this.activeTeTagSource.MarkTypeSource[i]['primitiveData']) {
                    this.primitiveDataResponse[i]['loopPictureId'] = this.loopImgId[i];
                    const updateModel = this.primitiveDataResponse[i];
                    this.loopInfoService.updateLoopData(updateModel).subscribe();
                } else if (this.linkOrActivityStatus[i]['type'] === 'ACTIVITY' &&  this.activeTeTagSource.MarkTypeSource[i]['primitiveData']) {
                    this.primitiveDataResponse[i]['loopPictureId'] = this.loopImgId[i];
                    const updateModel = this.primitiveDataResponse[i];
                    this.loopInfoService.updateLoopData(updateModel).subscribe();
                }


            }


            this.snackBar.open('保存成功', '✖');


        }else {
            this.snackBar.open('请添加轮播图', '✖');
            return;
        }*/
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

    // 打开上传文件选项框
    openUploadImgDialog(uploadImgDialog, i) {
       /* if (this.activeTeTagSource.MarkTypeSource[i]['primitiveData']) {
            return;
        }*/

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

    // checkbox选中营销标签
    onSelectTags(event){
        this.selectedTags = event;
    }


    addActivity(tagTemplate: TemplateRef<any> , i) {
        if (this.activeTeTagSource.MarkTypeSource[i]['primitiveData']) {
            return;
        }
        this.selectedTags = [];
        Object.assign(this.selectedTags, this.marketingTags);
        this.dialog.open(tagTemplate, {id: 'tagTemplate', width: '80%'}).afterClosed().subscribe(res => {
            if (res) {
                this.activityInfo.push({id: this.selectedTags['id'], name: this.selectedTags['name']});
                this.linkOrActivityStatus[i]['value'] = 'ID ' + this.selectedTags['id'] + ' ' + this.selectedTags['name'];
                this.marketingTags = [];
                Object.assign(this.marketingTags, this.selectedTags);
            } else {
                this.selectedTags = [];
            }
        });
    }



    ngOnDestroy(): void {
        if (this.carouselInterval) {
            clearInterval(this.carouselInterval);
        }
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }





    // 图片轮播动画
    setCarouselAnimation() {
        if (this.currentIndex > 0) {
            const translateX = 'translateX(-' + 100 * this.currentIndex + '%)';
            d3.selectAll('.img-div-p img').style('transform', translateX);
        } else {
            d3.selectAll('.img-div-p img').style('transform', null);
        }
    }

    setCarouselInterval() {
        this.carouselInterval = setInterval(() => {
            this.currentIndex = this.currentIndex + 1 > this.ImgTrueFalse.length - 1 ? 0 : this.currentIndex + 1;
            this.setCarouselAnimation();
        }, 4000);
    }


    onTouchStart(event) {
        event.preventDefault();
        this.touchStart.x = event.touches[0].pageX;
        this.touchStart.y = event.touches[0].pageY;
    }

    onTouchMove(event) {
        event.preventDefault();
        const endX = event.touches[0].pageX;
        const endY = event.touches[0].pageY;
        const position = this.getSlideDirection(this.touchStart.x, this.touchStart.y, endX, endY);
        switch (position) {
            case 'left': {
                this.touchSubject.next(false);
                break;
            }
            case 'right': {
                this.touchSubject.next(true);
                break;
            }

        }
    }

    // 根据起点和终点返回方向 未滑动、上、下、左、右
    getSlideDirection(startX, startY, endX, endY) {
        const dy = startY - endY;
        const dx = endX - startX;
        let result = 'not';
        // 如果滑动距离太短
        if (Math.abs(dx) < 2 && Math.abs(dy) < 2) {
            return result;
        }
        // 计算角度
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        if (angle >= -45 && angle < 45) {
            result = 'right';
        } else if (angle >= 45 && angle < 135) {
            result = 'top';
        } else if (angle >= -135 && angle < -45) {
            result = 'bottom';
        } else if ((angle >= 135 && angle <= 180) || (angle >= -180 && angle < -135)) {
            result = 'left';
        }
        return result;
    }


    // 上下一次轮播
    nextImg(flag) {
        if (flag) {
            this.currentIndex = this.currentIndex + 1 > this.ImgTrueFalse.length - 1 ? 0 : this.currentIndex + 1;
            this.setCarouselAnimation();
        } else {
            this.currentIndex = this.currentIndex - 1 < 0 ? this.ImgTrueFalse.length - 1 : this.currentIndex - 1;
            this.setCarouselAnimation();
        }
        if (this.carouselInterval) {
            clearInterval(this.carouselInterval);
        }
        this.setCarouselInterval();
    }


    // 手动切换
    changeImg(i) {
        this.currentIndex = i;
        if (this.carouselInterval) {
            clearInterval(this.carouselInterval);
        }
        this.setCarouselAnimation();
        this.setCarouselInterval();
    }
}


export class ActiveTeTagSource {
    MarkTypeSource: any;
    selectedTag: [];
    activitySource: any;
    activityOrImg: string; // 'activity' 是活动 , 'Img' 是图片 ,
    activitySourceShow: string;  // 'activityList' 活动选择之后显示活动信息 ，
    activityOrLink: string; // 活动还是链接 'activity' 是活动 , 'Link' 是链接,
}

import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialog, MatSnackBar} from '@angular/material';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {takeUntil} from 'rxjs/operators';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Observable, Subject} from 'rxjs';
import {AppletMaskParameter} from '../appletMaskService/AppletMaskParameter';
import {TranslateService} from '@ngx-translate/core';
import {AppletMaskServiceService, PopupInfo} from '../appletMaskService/applet-mask-service.service';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {DomSanitizer} from '@angular/platform-browser';
import {fuseAnimations} from '../../../../../@fuse/animations';
import {Utils} from '../../../../services/utils';

@Component({
    selector: 'app-applet-mask-add-detail',
    templateUrl: './applet-mask-add-detail.component.html',
    styleUrls: ['./applet-mask-add-detail.component.scss'],
    animations: fuseAnimations
})

// 详情页
export class AppletMaskAddDetailComponent implements OnInit, OnDestroy{
    private _unsubscribeAll: Subject<any> = new Subject();
    @ViewChild('StartTime', {static: true}) StartTime: ElementRef;
    @ViewChild('endTime', {static: true}) endTime: ElementRef;
    title: string;
    ADDOrDetail: string;
    detailSave = false;
    configEnd: any;
    configStart: any;
    options2: FormGroup;
    activeTeTagSource: ActiveTeTagSource; // 添加活动弹框的参数
    upImgSource: UpImg;                          // 关于上传文件的变量集合
    preImgSource: PreImgSource[] = [];             // 预览的优惠券的集合
    couPreImgLoading = false; // 优惠券加载条
    POPUPID: number;
    POPUPName: string;                            // 蒙屏名称
    frozenY = 'UpperShelf';                             /// 冻结的按钮
    imgList: any;
    imgNotShow = false;
    btuDis: boolean; // 按钮设置可用与不可用

    // 商场选择
    mallSources = [];
    filterMallById: Observable<any>;
    filterMallByName: Observable<any>;

    constructor(
        private routeInfo: ActivatedRoute,
        private router: Router,
        private snackBar: MatSnackBar,
        private loading: FuseProgressBarService,
        public dialog: MatDialog,
        private utils: Utils,
        private sanitizer: DomSanitizer,
        private translate: TranslateService,
        private dateTransform: NewDateTransformPipe,
        private appletMaskServiceService: AppletMaskServiceService,
    ) {
        this.options2 = new FormBuilder().group({
            id: new FormControl({value: null, disabled: false}, [Validators.required]),
            popupId: new FormControl({value: '', disabled: true}, [Validators.required]),
            popupName: new FormControl({value: '', disabled: false}, [Validators.required]),
            mallId: new FormControl({value: '', disabled: false}, [Validators.required]),
            mallName: new FormControl({value: '', disabled: false}, [Validators.required]),
            popupStartTime: new FormControl({value: '', disabled: false}, [Validators.required]),
            popupEndTime: new FormControl({value: '', disabled: false}, [Validators.required]),
            popupType: new FormControl({
                value: AppletMaskParameter.POPUP_COUPON,
                disabled: false
            }, [Validators.required]),
            popupPattern: new FormControl({value: '', disabled: false}),
            popupLink: new FormControl({value: '', disabled: false}),
            outLink: new FormControl({value: true, disabled: false}),
            popupActivityId: new FormControl({value: '', disabled: false}),
            popupStatus: new FormControl({
                value: this.translate.instant('AppletMask.addDetail.invalid'), // 默认为无效
                disabled: true
            }, [Validators.required]),
        });
    }

    ngOnInit() {
        // 初始化时间控件参数
        this.initTimeConfig();
        // 初始化参数
        this.initGetActiveSource();
        // 拿到传过来的ID，判断是新增还是详情页
        this.initSourceData();
    }

    initSourceData() {
        this.routeInfo.params.pipe(takeUntil(this._unsubscribeAll))
            .subscribe((param: Params) => {
                if (param['id'] === AppletMaskParameter.POPUP_ADD) {
                    // 新建蒙屏
                    this.ADDOrDetail = 'add';
                    this.frozenY = 'add';
                    this.upImgSource.btuDis = false;
                    this.options2.controls.popupStatus.patchValue(this.translate.instant('AppletMask.addDetail.invalid')); // 无效
                    this.options2.controls.popupStatus.disable();
                    this.title = this.translate.instant('AppletMask.addDetail.title');
                    if (this.options2.controls.popupId.value !== '' && this.options2.controls.popupId.value !== null) {
                        location.reload();
                    }
                    this.initMallOptions();
                } else {
                    // 查看详情
                    this.ADDOrDetail = 'detail';
                    this.title = this.translate.instant('AppletMask.addDetail.detail');
                    this.POPUPID = param['id'];
                    this.appletMaskServiceService.getPopupInfo(this.POPUPID).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                        this.options2.controls.id.patchValue(this.POPUPID);
                        this.options2.value['id'] = this.POPUPID;
                        this.options2.controls.popupId.patchValue(res['popupId']);
                        // this.options2.controls.popupId.disable();
                        this.options2.controls.popupName.patchValue(res['popupName']);
                        this.POPUPName = res['popupName'];
                        this.options2.controls.popupStartTime.patchValue(this.dateTransform.transform(res['popupStartTime']));
                        this.options2.controls.popupEndTime.patchValue(this.dateTransform.transform(res['popupEndTime']));
                        this.StartTime['picker'].set('maxDate',  new Date(this.options2.get('popupEndTime').value));
                        this.endTime['picker'].set('minDate',  new Date(this.options2.get('popupStartTime').value));
                        this.options2.controls.popupType.patchValue(res['popupType']);
                        this.options2.controls.popupPattern.patchValue(res['popupPattern']);
                        this.upImgSource.btuDis = true;
                        this.options2.controls.popupLink.patchValue(res['popupLink']);
                        this.options2.controls.outLink.patchValue(res['outLink']);
                        this.options2.controls.popupActivityId.patchValue(res['popupActivityId']);

                        this.options2.controls.popupName.disable();
                        this.options2.controls.popupStartTime.disable();
                        this.options2.controls.popupEndTime.disable();
                        this.options2.controls.popupType.disable();
                        this.options2.controls.popupPattern.disable();
                        this.options2.controls.popupLink.disable();
                        this.options2.controls.outLink.disable();
                        this.options2.controls.popupActivityId.disable();
                        this.options2.controls.popupStatus.disable();
                        this.options2.controls.mallId.patchValue(res['mallId']);
                        this.options2.controls.mallName.patchValue(res['mallName']);
                        this.options2.controls.mallId.disable();
                        this.options2.controls.mallName.disable();
                        this.initMallOptions();
                        this.appletMaskServiceService.getPopupConfigurations(this.POPUPID).pipe(takeUntil(this._unsubscribeAll)).subscribe(
                            res_s => {
                                this.options2.controls.popupStatus.patchValue(res_s);
                                // 无效  || 禁用
                                // if (this.options2.controls.popupStatus.value === this.translate.instant('AppletMask.addDetail.invalid')
                                //     || this.translate.instant('AppletMask.addDetail.prohibit')) {
                                //     this.frozenY = 'UpperShelf';
                                // } else {
                                //     this.frozenY = 'LowerShelf';
                                // }
                                if (res_s === '有效'){
                                    this.frozenY = 'LowerShelf';
                                } else {
                                    this.frozenY = 'UpperShelf';
                                }
                            }
                        );

                        if (this.options2.controls.popupType.value === AppletMaskParameter.POPUP_COUPON) {
                            this.appletMaskServiceService.searchActivityListById(this.options2.controls.popupActivityId.value).pipe(takeUntil(this._unsubscribeAll)).subscribe(res_ => {
                                if (res_.status === 200) {
                                    // this.upImgSource.ACCouPreYes = true;
                                    this.activeTeTagSource.activityOrImg = 'activity';
                                    this.activeTeTagSource.activitySourceShow = 'activityList';
                                    this.HandleCoupon(res_.body);
                                    const preheatTime = this.dateTransform.transform(res_.body['preheatTime']);
                                    const beginTime = this.dateTransform.transform(res_.body['beginTime']);
                                    const endTime = this.dateTransform.transform(res_.body['endTime']);
                                    res_.body['preheatTime'] = preheatTime;
                                    res_.body['beginTime'] = beginTime;
                                    res_.body['endTime'] = endTime;
                                    this.activeTeTagSource.activitySource = res_.body;
                                }
                            });
                        } else {
                            this.activeTeTagSource.activitySourceShow = '';
                            this.activeTeTagSource.activityOrImg = 'Img';
                            this.upImgSource.imgID = this.options2.controls.popupPattern.value;
                            this.ToPreImg(this.options2.controls.popupPattern.value);
                        }
                    });


                }
            });
    }

    initMallOptions(data?) {
        return new Promise<any>((resolve, reject) => {
            this.appletMaskServiceService.getMallList(0, 0x3f3f3f3f, 'lastModifiedDate,desc').subscribe(res => {
                if (res.content && res.content.length > 0) {
                    this.mallSources = res.content.filter(item => item.enabled);
                    this.filterMallById = this.utils.getFilterOptions(this.options2.get('mallId'), this.mallSources, 'mallId', 'mallName');
                    this.filterMallByName = this.utils.getFilterOptions(this.options2.get('mallName'), this.mallSources, 'mallName', 'mallId');
                    // if (data && data.blocId) {
                    //     const mall = res.content.find(item => item.mallId === data.mallId);
                    //     if (mall && mall.mallName) {
                    //         data.mallName = mall.mallName;
                    //     }
                    // }
                }
                // resolve(data);
            }, error1 => {
                // resolve(data);
            });
        });
    }

    // 选中name补全id或者互选
    onSelectionChange(option, controlId, field) {
        this.options2.get(controlId).setValue(option[field], {emitEvent: false});
        if (controlId === 'mallId' || controlId === 'mallName') {
            this.filterMallById = this.utils.getFilterOptions(this.options2.get('mallId'), this.mallSources, 'mallId', 'mallName');
            this.filterMallByName = this.utils.getFilterOptions(this.options2.get('mallName'), this.mallSources, 'mallName', 'mallId');
        }
    }


    popSave(p) {
        this.options2.markAllAsTouched();
        if (!this.options2.valid){
            return;
        }
        this.btuDis = true;
        const popupStartTime = new Date(this.options2.controls.popupStartTime.value).toISOString();
        const popupEndTime = new Date(this.options2.controls.popupEndTime.value).toISOString();
        this.options2.controls.popupStartTime.patchValue(popupStartTime);
        this.options2.controls.popupEndTime.patchValue(popupEndTime);
        if (this.options2.controls.popupType.value === AppletMaskParameter.POPUP_COUPON) {
            if (!this.activeTeTagSource.activitySource['id']){
                this.snackBar.open('请添加关联活动！');
                return;
            } else {
                this.options2.controls.popupActivityId.patchValue(this.activeTeTagSource.activitySource['id']);
                this.options2.controls.popupPattern.patchValue(null);
                this.options2.controls.popupLink.patchValue(null);
                this.options2.controls.outLink.patchValue(true);
            }
        } else {
            if (!this.upImgSource.imgID) {
                this.snackBar.open('请上传蒙屏图案！');
                return;
            } else  if (!this.options2.get('popupLink').value){
                this.snackBar.open('请上传蒙屏图案！');
                return;
            } else {
                this.options2.controls.popupPattern.patchValue(this.upImgSource.imgID);
                this.options2.controls.popupActivityId.patchValue(null);
            }
        }

        if (p === 'add') {
            this.options2.controls.id.patchValue(null);
            // 新增保存
            this.appletMaskServiceService.CreatPopupInfo(this.options2.value).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                // this.btuDis = false;
                this.snackBar.open(this.translate.instant('AppletMask.addDetail.tips_2'), '✖'); // 保存成功
                this.router.navigate(['/apps/AppletMaskList']).then(res1 => {
                    this.loading.hide();
                });
            }, error1 => {
                this.btuDis = false;
            });
        } else if (p === 'edit') {
            // 编辑保存
            const popupInfo: PopupInfo = new PopupInfo();
            popupInfo.id = this.POPUPID;
            popupInfo.popupId = this.options2.controls.popupId.value;
            popupInfo.popupName = this.options2.controls.popupName.value;
            popupInfo.popupStartTime = this.options2.controls.popupStartTime.value;
            popupInfo.popupEndTime = this.options2.controls.popupEndTime.value;
            popupInfo.popupType = this.options2.controls.popupType.value;
            popupInfo.popupPattern = this.options2.controls.popupPattern.value;
            popupInfo.popupLink = this.options2.controls.popupLink.value;
            popupInfo.outLink = this.options2.controls.outLink.value;
            popupInfo.popupActivityId = this.options2.controls.popupActivityId.value;
            popupInfo.mallName = this.options2.controls.mallName.value;
            popupInfo.mallId = this.options2.controls.mallId.value;
            this.appletMaskServiceService.UpdatePopupInfo(popupInfo).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                this.snackBar.open(this.translate.instant('AppletMask.addDetail.tips_2'), '✖'); // 保存成功
                // this.btuDis = false;
                this.router.navigate(['/apps/AppletMaskList']).then(res1 => {
                    this.loading.hide();
                });
            }, error1 => {
                this.btuDis = false;
            });

            this.options2.controls.popupName.disable();
            this.options2.controls.popupStartTime.disable();
            this.options2.controls.popupEndTime.disable();
            this.options2.controls.popupType.disable();
            this.options2.controls.popupPattern.disable();
            this.options2.controls.popupLink.disable();
            this.options2.controls.outLink.disable();
            this.options2.controls.popupActivityId.disable();
            this.upImgSource.btuDis = true;
            this.detailSave = false;
        } else if (p === 'UpperShelf') {
            // 上架
            this.appletMaskServiceService.setActivityPopup(this.POPUPID, this.options2.controls.mallId.value).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                this.frozenY = 'LowerShelf';
                this.btuDis = false;
                this.options2.controls.popupStatus.patchValue(this.translate.instant('AppletMask.addDetail.effective')); // 有效
                this.snackBar.open(this.translate.instant('AppletMask.addDetail.tips_3'), '✖'); // 上架成功
                this.router.navigate(['/apps/AppletMaskList']).then(res1 => {
                    // this.loading.hide();
                });
            }, error1 => {
                this.btuDis = false;
            });

        } else if (p === 'LowerShelf') {
            // 下架
            this.appletMaskServiceService.putPopupConfigurations(this.options2.controls.mallId.value).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                if (res === this.translate.instant('AppletMask.addDetail.success')) {  // 成功
                    this.frozenY = 'UpperShelf';
                    this.btuDis = false;
                    this.options2.controls.popupStatus.patchValue(this.translate.instant('AppletMask.addDetail.invalid')); // 无效
                    this.snackBar.open(this.translate.instant('AppletMask.addDetail.tips_4'), '✖');  // 下架成功
                    this.router.navigate(['/apps/AppletMaskList']).then(res1 => {
                        // this.loading.hide();
                    });
                }
            }, error1 => {
                this.btuDis = false;
            });
        }


    }


    setName() {
        this.POPUPName = this.options2.controls.popupName.value;
    }

    // 点击编辑改状态
    popChangeEdit() {
        this.options2.controls.popupName.enable();
        this.options2.controls.popupStartTime.enable();
        this.options2.controls.popupEndTime.enable();
        this.options2.controls.popupType.enable();
        this.options2.controls.popupPattern.enable();
        this.options2.controls.popupLink.enable();
        this.options2.controls.outLink.enable();
        this.options2.controls.popupActivityId.enable();
        this.options2.controls.mallId.enable();
        this.options2.controls.mallName.enable();
        this.upImgSource.btuDis = false;
        this.detailSave = true;
    }

    popEditCancel(){
        this.options2.disable();
        this.upImgSource.btuDis = true;
        this.detailSave = false;
    }

    // 打开关联活动的弹窗
    openAddActiveDialog(ADDActiveTe) {
        if (!this.dialog.getDialogById('ADDActiveTeClass')) {
            this.dialog.open(ADDActiveTe, {id: 'ADDActiveTeClass', width: '80%'}).afterClosed().subscribe(res => {
                if (res) {
                    this.activeTeTagSource.activityOrImg = 'activity';
                    this.activeTeTagSource.activitySourceShow = 'activityList';
                    this.activeTeTagSource.selectedTag['preheatTime'] = this.dateTransform.transform(this.activeTeTagSource.selectedTag['preheatTime']);
                    this.activeTeTagSource.selectedTag['beginTime'] = this.dateTransform.transform(this.activeTeTagSource.selectedTag['beginTime']);
                    this.activeTeTagSource.selectedTag['endTime'] = this.dateTransform.transform(this.activeTeTagSource.selectedTag['endTime']);
                    this.activeTeTagSource.activitySource = this.activeTeTagSource.selectedTag;
                    this.preImgSource = [];
                    this.HandleCoupon(this.activeTeTagSource.activitySource);
                }

            });
        }
    }

    ADDActiveTeTagSelect(e) {
        this.activeTeTagSource.selectedTag = e;
    }

    // 蒙屏类型选择框事件
    changeMarkType() {
        const popupType = this.options2.controls.popupType.value;
        if (popupType === AppletMaskParameter.POPUP_COUPON) {

            if (this.activeTeTagSource.activitySource.length !== 0) {
                if (this.imgNotShow) {
                    this.upImgSource.ACCouPreYes = true;
                } else {
                    this.upImgSource.ACCouPreYes = false;
                }
                this.activeTeTagSource.activityOrImg = 'activity';
                this.activeTeTagSource.activitySourceShow = 'activityList';
            } else {
                // this.upImgSource.ACCouPreYes = false;
                this.activeTeTagSource.activityOrImg = 'activity';
                this.activeTeTagSource.activitySourceShow = '';
            }
        } else {
            // 图片
            this.activeTeTagSource.activitySourceShow = '';
            this.activeTeTagSource.activityOrImg = 'Img';
            this.upImgSource.ACCouPreYes = false;
        }
    }


    /// 处理从活动拿到的优惠券
    HandleCoupon(activitySource) {
        this.couPreImgLoading = true;
        if (activitySource['activityType'] === AppletMaskParameter.AC_DEFAULT || activitySource['activityType'] === AppletMaskParameter.AC_GROUPBUY
            || activitySource['activityType'] === AppletMaskParameter.AC_POINT  || activitySource['activityType'] === AppletMaskParameter.AC_AR) {
            const cou_len = activitySource['coupons'].length;
            for (let i = 0; i < cou_len; i++) {
                if (cou_len.length !== 0) {
                    const cou_ = activitySource['coupons'][i];
                    this.upImgSource.ACCouPreYes = true;
                    this.imgNotShow = true;
                    let im = 300;
                    im = im * (i + 0.5);
                    setTimeout(() => {
                        this.ToPreImg_ac(cou_, i);
                    }, im);
                } else {
                    this.imgNotShow = false;
                    this.upImgSource.ACCouPreYes = false;
                    this.snackBar.open(this.translate.instant('AppletMask.addDetail.tips_1'), '✖');
                    //  return;
                }
                if ( i === (cou_len - 1 ) ) {
                    this.couPreImgLoading = false;
                }
            }
            if (activitySource['activityType'] === AppletMaskParameter.AC_DEFAULT) {
                activitySource['activityType'] = this.translate.instant('AppletMask.addDetail.generalActivities');  // '一般活动';
            } else if (activitySource['activityType'] === AppletMaskParameter.AC_GROUPBUY) {
                activitySource['activityType'] = this.translate.instant('AppletMask.addDetail.groupByActivities');  // '团购活动';
            } else {
                activitySource['activityType'] = this.translate.instant('AppletMask.addDetail.groupPOINT');  // '积分活动';
            }

        } else if (activitySource['activityType'] === AppletMaskParameter.AC_GROUP) {
            this.appletMaskServiceService.getCouponGroupsData(activitySource['id']).pipe(takeUntil(this._unsubscribeAll)).subscribe(
                res => {
                    if (res.status === 200) {
                        const cou_group = res.body;
                        let cou_has = false;
                        let r = 0;
                        for (let i = 0; i < cou_group['length']; i++) {
                            const cous_ = cou_group[i]['coupons'];
                            for (let u = 0; u < cous_.length; u++) {
                                const cou_ = cous_[u];
                                if (cou_.length !== 0) {
                                    cou_has = true;
                                    this.upImgSource.ACCouPreYes = true;
                                    this.imgNotShow = true;
                                    this.ToPreImg_ac(cou_, r);
                                    r++;
                                } else {
                                    if (!cou_has) {
                                        cou_has = false;
                                    }
                                    // this.imgNotShow = false;
                                    // this.upImgSource.ACCouPreYes = false;
                                    // this.snackBar.open(this.translate.instant('AppletMask.addDetail.tips_1'), '✖');
                                    //  return;

                                }
                            }
                            if ( i === (cou_group['length'] - 1 ) ) {
                                this.couPreImgLoading = false;
                            }
                        }
                        if (!cou_has) {
                            this.snackBar.open(this.translate.instant('AppletMask.addDetail.tips_1'), '✖');
                        }
                        activitySource['activityType'] = this.translate.instant('AppletMask.addDetail.groupActivities'); // '分组活动';
                    }

                });

        }


    }

    // 打开上传文件选项框
    openUploadImgDialog(uploadImgDialog) {
        this.upImgSource.uploadDesc = this.translate.instant('AppletMask.addDetail.tips_5');
        if (!this.dialog.getDialogById('uploadImgDialog_pop')) {
            this.dialog.open(uploadImgDialog, {
                id: 'uploadImgDialog_pop',
                width: '500px',
                height: '245px',
                position: {top: '200px'},
                hasBackdrop: true ,
            });
        }
    }

    // 真正的上传
    realUpload(e) {
        if (!e.CouponFormData) {
            this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.AddSecuritiesRules.Tips_changeFiles'), '✖');
            return;
        }
        this.appletMaskServiceService.CouponFileUpload(e.CouponFormData).pipe(takeUntil(this._unsubscribeAll)).subscribe((res1) => {
                this.upImgSource.notUploading = false;
                this.upImgSource.UpLoadStatus = true;
                if (res1.type === 1) {
                    this.upImgSource.ProgressLoad = (res1.loaded / res1.total) * 100;  // 上传长度
                }
                if (res1.status === 200) {
                    this.upImgSource.ProgressLoad = 100;
                    this.upImgSource.notUploading = true;
                    this.upImgSource.FinishStatus = false;
                    this.upImgSource.imgID = res1.body;
                }

            }
            , error1 => {
                this.loading.hide();
            });
    }

    // 关掉上传框
    closeDialogP(e){
        if (e === 'hasClose') {
            this.ToPreImg(this.upImgSource.imgID);
        }
    }



    // 请求预览图片
    ToPreImg(imgID) {
        this.upImgSource.preLoading = true;
        this.appletMaskServiceService.CouponShowImg(imgID).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                const fileReader = new FileReader();
                fileReader.readAsDataURL(res);
                fileReader.onloadend = (res_) => {
                    const result = res_.target['result'];
                    //   this.imgSrc = 'data:image/jpeg;base64,' + result;
                    this.upImgSource.imgSrc = this.sanitizer.bypassSecurityTrustUrl(result);
                    this.upImgSource.preLoading = false;
                };
            },
            error1 => {
            });
    }



    // 活动请求预览图片
    ToPreImg_ac(cou_, id) {
        this.appletMaskServiceService.CouponShowImg(cou_.image).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                const fileReader = new FileReader();
                fileReader.readAsDataURL(res);
                fileReader.onloadend = (res_) => {
                    const result = res_.target['result'];
                    //   this.imgSrc = 'data:image/jpeg;base64,' + result;
                    const inm_src = this.sanitizer.bypassSecurityTrustUrl(result);
                    this.preImgSource[id] = {
                        name: cou_.name, validity: '', useImgBg: inm_src, useColor: '',
                        desText1: '立', desText2: '即', desText3: '使', desText4: '用'
                    };
                    /* this.preImgSource.push({name: cou_.name , validity: '' , useImgBg: inm_src , useColor: '' ,
                         desText1: '立' , desText2: '即' , desText3: '使' , desText4: '用' });*/

                };
            },
            error1 => {
            });
    }


    popCancel() {
        this.loading.show();
        this.router.navigate(['/apps/AppletMaskList']).then(res => {
            this.loading.hide();
        });
    }


    onSourceDate(event, endTime, StartTime, p) {
        // event.setHours(23);
        // event.setMinutes(59);
        // event.setSeconds(59);
        'timeBegin' === p ? endTime.picker.set('minDate', event) : StartTime.picker.set('maxDate', event);
    }

    onSourceDate1(event, endTime, StartTime, p) {
        'timeBegin' === p ? endTime.picker.set('minDate', event) : StartTime.picker.set('maxDate', event);
    }

    initTimeConfig() {
        this.configStart = {
            enableTime: true,
            time_24hr: true,
            enableSeconds: true,
            defaultHour: '0',
            defaultMinute: '0',
            defaultSeconds: '0'
        };
        this.configEnd = {
            enableTime: true,
            time_24hr: true,
            enableSeconds: true,
            defaultHour: '23',
            defaultMinute: '59',
            defaultSeconds: '59'
        };
    }

    initGetActiveSource() {
        this.activeTeTagSource = new ActiveTeTagSource();
        this.upImgSource = new UpImg();
        this.ADDOrDetail = 'add';
        this.activeTeTagSource.activityOrImg = 'activity';
        this.activeTeTagSource.selectedTag = [];
        this.activeTeTagSource.activitySource = [];
        this.activeTeTagSource.MarkTypeSource = [
            {id: AppletMaskParameter.POPUP_COUPON, name: this.translate.instant('AppletMask.addDetail.getCoupon')},  // 领券
            {id: AppletMaskParameter.POPUP_PICTURE, name: this.translate.instant('AppletMask.addDetail.getImg')}  // 图片
        ];
    }


    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}


export class ActiveTeTagSource {
    MarkTypeSource: any;
    selectedTag: [];
    activitySource: any;
    activityOrImg: string; // 'activity' 是活动 , 'Img' 是图片 ,
    activitySourceShow: string;  // 'activityList' 活动选择之后显示活动信息 ，
}

// 上传图片
export class UpImg {
    ProgressLoad: number;  // 上传长度
    notUploading: boolean; // 是否在上传
    UpLoadStatus = false;  // 上传按钮的状态，是否可 用
    FinishStatus = true;   // 完成按钮的状态  是否可用
    limitM: number;       // 上传文件的限制大小
    limitType: string;   // 上传类型限制
    uploadDesc: string; // 上传文件限制描述
    btuDis: boolean;
    imgID: any;
    ACCouPreYes = false;
    imgSrc: any;
    preLoading = false;
}

export class PreImgSource {
    name: string; // 大标题
    validity: string; // 使用期
    useImgBg: any; // 使用的背景
    useColor: string; /// 使用的文字颜色
    desText1: string; // 描述文件
    desText2: string; // 描述文件
    desText3: string; // 描述文件
    desText4: string; // 描述文件
}

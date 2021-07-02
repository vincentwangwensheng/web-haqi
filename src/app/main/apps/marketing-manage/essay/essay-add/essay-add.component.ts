import {Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {ECouponServiceService} from '../../../../../services/EcouponService/ecoupon-service.service';
import {TranslateService} from '@ngx-translate/core';
import {FileTransferService} from '../../../../../services/file-transfer.service';
import {DomSanitizer} from '@angular/platform-browser';
import {FuseProgressBarService} from '../../../../../../@fuse/components/progress-bar/progress-bar.service';
import {Subject} from 'rxjs';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {NewDateTransformPipe} from '../../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {environment} from '../../../../../../environments/environment.hmr';
import {takeUntil} from 'rxjs/operators';
import {ArticleService} from '../article.service';
import {MarketingTagService} from '../../../../../services/marketingTagService/marketing-tag.service';
import {fuseAnimations} from '../../../../../../@fuse/animations';

@Component({
    selector: 'app-essay-add',
    templateUrl: './essay-add.component.html',
    styleUrls: ['./essay-add.component.scss'] ,
    animations: fuseAnimations
})
export class EssayAddComponent implements OnInit, OnDestroy {
    constructor(private dialog: MatDialog,
                private router: Router, private snackBar: MatSnackBar,
                private eCouponServiceService: ECouponServiceService,
                private translate: TranslateService,
                private document: ElementRef,
                private fileTransferService: FileTransferService,
                private sanitizer: DomSanitizer,
                private loading: FuseProgressBarService,
                private route: ActivatedRoute,
                private newDateTransformPipe: NewDateTransformPipe,
                private articleService: ArticleService,
                private marketingTagService: MarketingTagService
    ) {
    }

    // 富文本框内容
    editorContent = ' '; // <h3><strong>请在这里输入标题</strong></h3><br><p>请在这里输入作者</p><br><p>请在这里输入正文</p>
    private _unsubscribeAll: Subject<any> = new Subject();
    @ViewChild('beginTime', {static: true}) beginTime: ElementRef;
    @ViewChild('endTime', {static: false}) endTime: ElementRef;
    profileForm = new FormGroup({
        articleId: new FormControl('', Validators.required),   // articleId
        articleTitle: new FormControl('', Validators.required),   // 标题
        articleStartTime: new FormControl(''), // 开始时间
        articleEndTime: new FormControl('', Validators.required), // 结束时间
        mainBody: new FormControl('', Validators.required), // 活动规则
        fileAbstract: new FormControl(''), // 摘要
    });
    configStart = {
        enableTime: true,
        time_24hr: true,
        enableSeconds: true,
        defaultHour: '0',
        defaultMinute: '0',
        defaultSeconds: '0'
    };
    configEnd = {
        enableTime: true,
        time_24hr: true,
        enableSeconds: true,
        defaultHour: '23',
        defaultMinute: '59',
        defaultSeconds: '59'
    };
    quillConfigEssay: any; // 富文本框配置
    EssayEdit: any;  // 富文本框配置
    quillConfigEssayDetail: any; // 富文本框配置详情
    EssayEditDetail: any;  // 富文本框配置详情
    pageTitle = ''; //  页面标题
    essayDetailJson: any; // 详情页面数据
    // 将yyyy-MM-d HH:mm:ss 转为 字符串

    activityFormData: any;
    activityImgName: string;
    notUploading: boolean; // 是否在上传
    progressLoad: number;  // 上传长度
    uploadStatus = false; // 还未上传完成标识
    finishStatus = true; // 上传完成标识
    currentActivityImgSaveId: string;
    imgSrc = null; // 预览图片路径
    previewImgStatus = true; // 图片预览的状态
    // 营销标签选择
    selectedTags = [];
    // 页面包含的营销标签
    marketingTags = [];
    primitiveMarketingTags = [];
    saveButtonStatus = false;

    previewArticle = {};

    upFormData: any;
    coverImgLoading = false;

    static formatToZoneDateTime(dateStr) {
        const date = new Date(dateStr);
        return date.toISOString();
    }

    ngOnInit() {
        const in_title = this.translate.instant('marketingManage.essay.inputTitle');
        const in_author = this.translate.instant('marketingManage.essay.inputAuthor');
        const in_text = this.translate.instant('marketingManage.essay.inputText');
        this.editorContent = '<h3><strong>' + in_title + '</strong></h3><br><p>' + in_author + '</p><br><p>' + in_text + '</p>'; // 请在这里输入标题  请在这里输入作者  请在这里输入正文
        this.quillConfigEssay = {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                ['blockquote', 'code-block'],

                [{ 'header': 1 }, { 'header': 2 }],               // custom button values
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
                [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
                [{ 'direction': 'rtl' }],                         // text direction

                [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

                [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
                [{ 'font': [] }],
                [{ 'align': [] }],

                ['clean'],                                         // remove formatting button

                ['link', 'image']                         // link and image,
            ]
        };  // 富文本框配置详情
        this.quillConfigEssayDetail = {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                ['blockquote', 'code-block'],

                [{ 'header': 1 }, { 'header': 2 }],               // custom button values
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
                [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
                [{ 'direction': 'rtl' }],                         // text direction

                [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

                [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
                [{ 'font': [] }],
                [{ 'align': [] }],

                ['clean'],                                         // remove formatting button

                ['link', 'image']                         // link and image,
            ]
        }; // 富文本框配置详情
        const id = this.route.snapshot.paramMap.get('id');
        // 获取当前页面标题名称
        this.pageTitle = this.route.snapshot.data['operation'];
        if (this.pageTitle === 'detail') {
            this.profileForm.get('articleStartTime').disable();
            this.profileForm.get('articleEndTime').disable();
        }

        if (this.pageTitle === 'detail') {
            this.loading.show();
            this.articleService.searchArticleById(id).subscribe(
                res => {
                    if (res['body']) {
                        this.essayDetailJson = res['body'];
                        // if (this.essayDetailJson['articleTips']) {
                        //     const tagIds = this.essayDetailJson['articleTips'].split(',');
                        //     for (let i = 0; i < tagIds.length; i++) {
                        //         this.marketingTagService.getDetailById(tagIds[i]).subscribe((res1) => {
                        //             this.marketingTags.push(res1);
                        //             this.primitiveMarketingTags.push(res1);
                        //         });
                        //     }
                        // }
                        this.essayDetailJson.createDate = this.newDateTransformPipe.transform(this.essayDetailJson['createDate'], '-');
                        this.essayDetailJson.lastModifiedDate = this.newDateTransformPipe.transform(this.essayDetailJson['lastModifiedDate'], '-');
                        this.onStartSourceDate(new Date(this.newDateTransformPipe.transform(this.essayDetailJson['articleStartTime'], '-')), this.endTime);
                        this.onEndSourceDate(new Date(this.newDateTransformPipe.transform(this.essayDetailJson['articleEndTime'], '-')), this.beginTime);
                        this.profileForm.get('articleStartTime').patchValue(this.newDateTransformPipe.transform(this.essayDetailJson['articleStartTime'], '-'));
                        this.profileForm.get('articleEndTime').patchValue(this.newDateTransformPipe.transform(this.essayDetailJson['articleEndTime'], '-'));
                        this.editorContent = this.essayDetailJson['mainBody'];
                        this.profileForm.get('articleTitle').patchValue(this.essayDetailJson['articleTitle']);
                        this.profileForm.get('fileAbstract').patchValue(this.essayDetailJson['fileAbstract']);
                        this.currentActivityImgSaveId = res['body']['fileId'];
                        this.getTagsByActivity(id);
                        if (this.currentActivityImgSaveId) {
                            this.fileTransferService.previewFile(this.currentActivityImgSaveId).pipe(takeUntil(this._unsubscribeAll)).subscribe(
                                rest => {
                                    const fileReader = new FileReader();
                                    fileReader.readAsDataURL(rest);
                                    fileReader.onloadend = (res1) => {
                                        const result = res1.target['result'];
                                        //   this.imgSrc = 'data:image/jpeg;base64,' + result;
                                        this.imgSrc = this.sanitizer.bypassSecurityTrustUrl(result);
                                    };
                                },
                                error1 => {

                                });
                        }

                    } else {
                        this.snackBar.open(this.translate.instant('marketingManage.essay.tips2'), '✖'); // 查询数据为空
                    }
                }
            , () => {

                }, () => {
                    this.loading.hide();
                });
        }
    }

    // 提交表单数据
    onSave() {
        const parser = new DOMParser();
        const   htmlDoc = parser.parseFromString(this.editorContent, 'text/html');
        const abstractContent = htmlDoc.getElementsByTagName('p');
        if (!this.profileForm.get('fileAbstract').value) {
            this.profileForm.get('fileAbstract').patchValue(this.parseAbstractContent(abstractContent));

        }
        if (!this.profileForm.value['articleTitle']) {
            this.snackBar.open(this.translate.instant('marketingManage.essay.tips13'), '✖'); //  文章标题不能为空
            return;
        }
        if (!this.profileForm.value['articleStartTime']) {
            this.snackBar.open(this.translate.instant('marketingManage.essay.tips3'), '✖'); //  文章开始时间不可为空
            return;
        }
        if (!this.profileForm.value['articleEndTime']) {
            this.snackBar.open(this.translate.instant('marketingManage.essay.tips4'), '✖'); //  文章结束时间不可为空
            return;
        }
        if (!this.profileForm.value['mainBody']) {
            this.snackBar.open(this.translate.instant('marketingManage.essay.tips14'), '✖'); //  文章内容不能为空
            return;
        }
        if (!this.currentActivityImgSaveId){
            this.snackBar.open(this.translate.instant('marketingManage.essay.tips15'), '✖'); //  请上传文章封面
            return;
        }
        // if (this.marketingTags.length <= 0 ){
        //     this.snackBar.open(this.translate.instant('marketingManage.essay.tips16'), '✖'); //  还未选择文章标签
        //     return;
        // }

        this.profileForm.value['articleTitle'] = (this.profileForm.value['articleTitle'] + '').trim();
        this.profileForm.value['articleStartTime'] = EssayAddComponent.formatToZoneDateTime(this.profileForm.value['articleStartTime']);
        this.profileForm.value['articleEndTime'] = EssayAddComponent.formatToZoneDateTime(this.profileForm.value['articleEndTime']);
        if (this.currentActivityImgSaveId) {
            this.profileForm.value['fileId'] = this.currentActivityImgSaveId;
        }
        let tagIds = '';
        for (let i = 0; i < this.marketingTags.length; i++) {
            if (i < this.marketingTags.length - 1) {
                tagIds += this.marketingTags[i]['id'] + ',';
            }else {
                tagIds += this.marketingTags[i]['id'];
            }
             this.profileForm.value['articleTips'] = tagIds;
        }

        this.loading.show();
        if (this.pageTitle === 'create') {
            this.saveButtonStatus = true;
            this.articleService.createArticle(this.profileForm.value).subscribe((res) => {
                this.snackBar.open(this.translate.instant('marketingManage.essay.tips5'), '✖');  // 新建文章成功
               this.router.navigateByUrl('apps/marketingManageComponent/essay');
               // this.setActivityTags(res.body['id']);
            }, () => {
                this.saveButtonStatus = false;
            }, () => {
                this.loading.hide();
            });
        }
        if (this.pageTitle === 'edit') {
            this.profileForm.value['articleId'] = this.essayDetailJson['articleId'];
            this.profileForm.value['id'] = this.essayDetailJson['id'];
            this.saveButtonStatus = true;
            this.articleService.updateArticle(this.profileForm.value).subscribe(res => {
                this.snackBar.open(this.translate.instant('marketingManage.essay.tips6'), '✖'); // 文章编辑成功
                this.router.navigateByUrl('apps/marketingManageComponent/essay');
                // this.setActivityTags(this.essayDetailJson['id']);
            }, () => {
                this.snackBar.open(this.translate.instant('marketingManage.essay.tips7'), '✖'); // 文章编辑失败
                this.loading.hide();
                this.saveButtonStatus = false;
            }, () => {
                this.loading.hide();
            });
        }
    }

    // 编辑
    linkToEdit() {
        this.pageTitle = 'edit';
        this.profileForm.get('articleStartTime').enable();
        this.profileForm.get('articleEndTime').enable();
    }

    // 详情
    linkToDetail() {
        this.marketingTags = this.primitiveMarketingTags;
        this.pageTitle = 'detail';
        this.profileForm.get('articleTitle').patchValue(this.essayDetailJson['articleTitle']);
        this.profileForm.get('articleTitle').disable();
        this.profileForm.get('articleStartTime').disable();
        this.profileForm.get('articleEndTime').disable();
        // this.profileForm.get('fileAbstract').disable();
        this.onStartSourceDate(new Date(this.newDateTransformPipe.transform(this.essayDetailJson['articleStartTime'], '-')), this.endTime);
        this.onEndSourceDate(new Date(this.newDateTransformPipe.transform(this.essayDetailJson['articleEndTime'], '-')), this.beginTime);
        this.profileForm.get('articleStartTime').patchValue(this.newDateTransformPipe.transform(this.essayDetailJson['articleStartTime'], '-'));
        this.profileForm.get('articleEndTime').patchValue(this.newDateTransformPipe.transform(this.essayDetailJson['articleEndTime'], '-'));
        this.editorContent = this.essayDetailJson['mainBody'];
        this.profileForm.get('fileAbstract').patchValue(this.essayDetailJson['fileAbstract']);
        this.fileTransferService.previewFile(this.essayDetailJson['fileId']).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            rest => {
                const fileReader = new FileReader();
                fileReader.readAsDataURL(rest);
                fileReader.onloadend = (res1) => {
                    const result = res1.target['result'];
                    //   this.imgSrc = 'data:image/jpeg;base64,' + result;
                    this.imgSrc = this.sanitizer.bypassSecurityTrustUrl(result);
                };
            },
            error1 => {

            });



    }



    // 开始时间选择后设定结束时间最小时间
    onStartSourceDate(event, endTime) {
        event.setHours(23);
        event.setMinutes(59);
        event.setSeconds(59);
        endTime.picker.set('minDate', event);
    }

    // 反之
    onEndSourceDate(event, startTime) {
        startTime.picker.set('maxDate', event);
    }

    // 防止提交
    pseudoSubmit() {

    }

    // 预览
    /*  onPreview() {
        this.snackBar.open('开发中', '✖');
      }*/

    // 发布
    onPublish() {
        this.snackBar.open(this.translate.instant('marketingManage.essay.tips8'), '✖'); // 开发中
    }

    // 下线
    onOffline() {
        this.snackBar.open(this.translate.instant('marketingManage.essay.tips8'), '✖'); // 开发中
    }


    // 富文本编辑框 图片处理
    EditorCreatedEssay(event){
        const toolbar = event.getModule('toolbar');
        toolbar.addHandler('image', this.imageHandler.bind(this));
        this.EssayEdit = event;
    }

    imageHandler(){
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

                    if (res.status === 200 && res.body !== undefined ) {
                        const range = this.EssayEdit.getSelection(true);
                        const index = range.index + range.length;
                        this.EssayEdit.insertEmbed(range.index, 'image', sessionStorage.getItem('baseUrl') + environment.CouponShowImg + '?saveId=' + res.body + '\n');
                        this.EssayEdit.setSelection(1 + range.index);
                        this.editorContent = this.editorContent + '<img src="' + sessionStorage.getItem('baseUrl') + environment.CouponShowImg + '?saveId=' + res.body + '">';
                        this.EssayEdit.focus();
                    }
                }, error1 => { this.loading.hide();  });
            }
        });
        Imageinput.click();
    }




    // 富文本编辑框 图片处理
    EditorCreatedEssayDetail(event){
        const toolbar = event.getModule('toolbar');
        toolbar.addHandler('image', this.imageHandlerd.bind(this));
        this.EssayEditDetail = event;
    }

    imageHandlerd(){
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

                    if (res.status === 200 && res.body !== undefined ) {
                        const range = this.EssayEditDetail.getSelection(true);
                        const index = range.index + range.length;
                        this.EssayEditDetail.insertEmbed(range.index, 'image', sessionStorage.getItem('baseUrl') + environment.CouponShowImg + '?saveId=' + res.body + '\n');
                        this.EssayEditDetail.setSelection(1 + range.index);
                        if  (this.editorContent !== undefined && this.editorContent !== 'undefined' && this.editorContent !== '' && this.editorContent !== null && this.editorContent !== 'null') {
                            this.editorContent = this.editorContent + '<img src="' + sessionStorage.getItem('baseUrl') + environment.CouponShowImg + '?saveId=' + res.body + '">';
                        } else {
                            this.editorContent = '<img src="' + sessionStorage.getItem('baseUrl') + environment.CouponShowImg + '?saveId=' + res.body + '">';
                        }
                        this.EssayEditDetail.focus();
                    }
                }, error1 => { this.loading.hide();  });
            }
        });
        Imageinput.click();
    }


    // 解析摘要内容
    parseAbstractContent(param) {
        if (param.length >= 4) {
            let content = '';
            for (let i = 3; i < param.length; i++) {
                content += param[i]['innerHTML'];
                if (content.length >= 30) {
                    return content.substr(0, 30);
                }
            }
            return content;
        } else {
            return null;
        }
    }


    // 上传券文件 选择并展示路径
    CouponImgUpload(e) {
        const oneM = 1024 * 1024;
        const file = e.target.files[0];
        if (file.size > oneM) {
            this.snackBar.open(this.translate.instant('marketingManage.essay.tips9'), '✖'); // 上传文件大小不能超过1M
            return;
        }
        this.activityFormData = new FormData();
        this.activityImgName = file.name;
        this.activityFormData.append('files', file);
    }

    // 打开上传文件选项框
    openUploadImgDialog(uploadImgDloag) {
        if (this.pageTitle === 'detail') {
            return;
        }
        if (!this.dialog.getDialogById('uploadImageDialog_')) {
            this.uploadStatus = false;
            this.finishStatus = true;
            this.activityFormData = null;
            this.activityImgName = '';
            this.dialog.open(uploadImgDloag, {id: 'uploadImageDialog_', width: '500px', height: '245px', hasBackdrop: true ,  position: {top: '200px'}});
        }
    }

    // 上传文件
    onUploadImg() {
        if (!this.activityFormData) {
            this.snackBar.open(this.translate.instant('marketingManage.essay.tips10'), '✖'); // 请选择一个文件
            return;
        }
        this.notUploading = false;
        this.fileTransferService.uploadFile(this.activityFormData).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res.type === 1) {
                this.progressLoad = (res.loaded / res.total) * 100;  // 上传长度
            }
            if (res.status === 200) {
                this.previewImgStatus = false;
                this.progressLoad = 100;
                this.notUploading = true;
                this.uploadStatus = true;
                this.finishStatus = false;
                this.currentActivityImgSaveId = res['body'];

                if (this.currentActivityImgSaveId) {
                    this.fileTransferService.previewFile(this.currentActivityImgSaveId).pipe(takeUntil(this._unsubscribeAll)).subscribe(
                        rest => {
                            const fileReader = new FileReader();
                            fileReader.readAsDataURL(rest);
                            fileReader.onloadend = (res1) => {
                                const result = res1.target['result'];
                                //   this.imgSrc = 'data:image/jpeg;base64,' + result;
                                this.imgSrc = this.sanitizer.bypassSecurityTrustUrl(result);
                            };
                        },
                        error1 => {

                        });
                }


            } else {
            }
        }, error1 => {

        });
    }

    /// 新上传封面 ----------------------------

    upCoverImg(e) {

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
        this.upFormData = new FormData();
        this.upFormData.append('files', file);
        this.coverImgLoading = true;
        this.fileTransferService.uploadFileNotBar(this.upFormData).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            const saveID = res;
            if (saveID) {
                this.fileTransferService.previewFile(saveID).pipe(takeUntil(this._unsubscribeAll)).subscribe(
                    rest => {
                        const fileReader = new FileReader();
                        fileReader.readAsDataURL(rest);
                        fileReader.onloadend = (res1) => {
                            const result = res1.target['result'];
                            this.currentActivityImgSaveId = saveID;
                            this.imgSrc = this.sanitizer.bypassSecurityTrustUrl(result);
                            this.coverImgLoading = false;
                        };
                    },
                    error1 => {
                        this.coverImgLoading = false;
                    });
            }
        }, error1 => {

        });
    }





    // checkbox选中营销标签
    onSelectTags(event){
        this.selectedTags = event;
    }

    // 打开选择标签列表
    editMarketingTags(tagTemplate: TemplateRef<any>){
        this.selectedTags = [];
        Object.assign(this.selectedTags, this.marketingTags);
        this.dialog.open(tagTemplate, {id: 'tagTemplate', width: '80%'}).afterClosed().subscribe(res => {
            if (res) {
                this.marketingTags = [];
                Object.assign(this.marketingTags, this.selectedTags);
            } else {
                this.selectedTags = [];
            }
        });

    }

    // 删除标签
    deleteLabel(index){
        this.marketingTags.splice(index, 1);
    }

    // 拿到绑定的标签
    getTagsByActivity(id){
        this.articleService.getTagsByActivity(id).pipe(takeUntil(this._unsubscribeAll)).subscribe(
             r => {
                 this.marketingTags = r['articleTag'];
                 this.primitiveMarketingTags =  r['articleTag'];
             }
        );
    }

    // 绑定标签
    setActivityTags(id){
        const  acT: any = [];
        this.marketingTags.forEach( r => {
            acT.push({id: r.id});
        });
        const brand_vm = {
            articleId: id ,
            tagList: acT
        };
        this.articleService.setArticleTags(brand_vm).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            r => {
                this.snackBar.open(this.translate.instant('marketingManage.essay.tips11'), '✖'); // 标签绑定成功
                this.router.navigateByUrl('apps/marketingManageComponent/essay');
            },
            error1 => {
                this.snackBar.open(this.translate.instant('marketingManage.essay.tips12'), '✖'); // 标签绑定失败
                this.saveButtonStatus = false;
                },
            () => {}
        );
    }


    // 打开预览的文章详情图
    preArticle(essayPreTe){
        this.previewArticle =
            {articleTitle: this.profileForm.get('articleTitle').value
                , content: this.editorContent , fileSrc: this.imgSrc};

        if (!this.dialog.getDialogById('essayPreTeClass')) {
            this.dialog.open(essayPreTe, {id: 'essayPreTeClass', width: '369px', height: '703px',  hasBackdrop: true , position: { right: '300px'}}).afterOpened().subscribe(
                res => {
                    const essayTeTextContent = document.getElementById('essayTeTextContent');
                    const  v = essayTeTextContent.innerHTML.replace(/"/g, '').replace(/&lt;/g, '<').replace(/&gt;/g , '>').replace(/<br>/g , '\n'); // .replace(/<br>/g , '\n'); // h3 .replace(/<br>/g , '<br\/>')
                    essayTeTextContent.innerHTML = v ;
                    const v_node = essayTeTextContent.childNodes;
                    for (let i = 0 ; i < v_node.length ; i ++  ){
                        if (v_node[i].nodeName !== '#text') {
                            const ch = v_node[i];
                            ch['style'].margin = '0px';
                            ch['style'].wordBreak = 'break-word';
                            ch['style'].letterSpacing = '2px';
                            ch['style'].lineHeight = '2.2rem';
                            ch['style'].fontSize = '10px';

                        }
                    }

                }
            );
        }
    }


    // 文章审核
    articlesAudited(){

        this.articleService.articlesAudited(this.essayDetailJson.id).pipe().subscribe(
            res => {
                this.snackBar.open('审核成功！', '✖');
                this.router.navigateByUrl('apps/marketingManageComponent/essay');
            }
        );
    }

    // 文章驳回
    articlesRejected(){
        this.articleService.articlesRejected(this.essayDetailJson.id).pipe().subscribe(
            res => {
                this.snackBar.open('驳回成功！', '✖');
                this.router.navigateByUrl('apps/marketingManageComponent/essay');
            }
        );
    }

    openRejectReason(RejectReason){
        if (!this.dialog.getDialogById('RejectReasonClass')) {
            this.dialog.open(RejectReason, {
                id: 'RejectReasonClass',
                width: '400px',
                height: '246px',
                position: {top: '124px'},
                hasBackdrop: true
            });
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}

export class Coupon {
    number: number; // 券编码
    name: string;    // 券名称
    rule: string;    //  券类型
    canGift: boolean;    //   支持转送
    canReturn: boolean;    // 支持回收
    limitStore: boolean;    // 限制店铺
    limitCommercial: boolean; // 限制业态
    ReceivingFrequency: string; // 领取频次
    FullAmount: string; // 满额
    Reduction: string; // 减额
    lastModifiedBy: string; // 修改人
    lastModifiedDate: string; // 修改时间
    source: string; // 来源
    outId: string; // 外部券好
    description: string; // 券说明
    createdBy: string; // 创建人
    createdDate: string; // 创建时间
    timeBegin: string; // 开始时间
    timeEnd: string; // 结束时间
    constructor() {
    }

}

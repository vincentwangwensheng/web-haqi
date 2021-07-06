import {Component, OnInit, Renderer2} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {fuseAnimations} from '../../../../../../../@fuse/animations';
import {MatDialog, MatSnackBar} from '@angular/material';
import {FuseProgressBarService} from '../../../../../../../@fuse/components/progress-bar/progress-bar.service';
import {Utils} from '../../../../../../services/utils';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {forkJoin, Observable} from 'rxjs';
import {EditStoreService} from './edit-store.service';
import {BaseOptions} from 'flatpickr/dist/types/options';

@Component({
    selector: 'app-edit-merchant',
    templateUrl: './edit-store.component.html',
    styleUrls: ['./edit-store.component.scss'],
    animations: fuseAnimations
})
export class EditStoreComponent implements OnInit {
    editFlag = 0; // 新建编辑的标记
    detailId = ''; // 详情ID
    titles = ['新建商户', '商户详情', '编辑商户'];
    onSaving = false;
    storeGroup: FormGroup;

    // 品牌选择
    brandSources = [];
    filterBrands: Observable<any>;

    // 一级业态选择
    totalTypes = []; // 融合一二级的业态
    filterBusinessTypes: Observable<any>;

    // 二级业态选择
    secondSources = [];
    filterSecondTypes: Observable<any>;

    // 商场选择
    mallSources = [];
    filterMallById: Observable<any>;
    filterMallByName: Observable<any>;

    // 街区选择
    terminalSources = [];
    filterTerminalByNo: Observable<any>;
    filterTerminalByName: Observable<any>;

    // 单元号
    areaSources = [];
    filterAreaNos: Observable<any>;


    logo = {id: 'logo', loading: false};
    // 新品图
    images = [
        {id: 'image1', loading: false},
        {id: 'image2', loading: false},
        {id: 'image3', loading: false},
        {id: 'image4', loading: false},
        {id: 'image5', loading: false},
        {id: 'image6', loading: false}
    ];

    // 导航图片
    navigationImage = {id: 'mapImage', loading: false};

    selectedTags = [];
    tags = [];

    // 时间选择
    openConfig: Partial<BaseOptions> = {
        enableTime: true,
        noCalendar: true,
        dateFormat: 'H:i',
        defaultHour: 6,
        time_24hr: true
    };
    closeConfig: Partial<BaseOptions> = {
        enableTime: true,
        noCalendar: true,
        defaultHour: 21,
        dateFormat: 'H:i',
        time_24hr: true
    };
    openTimeControl = new FormControl('');
    closeTimeControl = new FormControl('');

    modules = {
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

            ['image']                         // media
        ]
    };

    constructor(
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private loading: FuseProgressBarService,
        private router: Router,
        private renderer: Renderer2,
        private editService: EditStoreService,
        private utils: Utils,
        private activatedRoute: ActivatedRoute,
    ) {
        this.storeGroup = new FormGroup({
            id: new FormControl(''),
            storeId: new FormControl(''),
            storeNo: new FormControl('', Validators.required),
            brandCN: new FormControl('', Validators.required),
            brandEN: new FormControl(''),
            logo: new FormControl(''),
            storeName: new FormControl('', Validators.required),
            showName: new FormControl(''),
            businessType: new FormControl('', Validators.required),
            businessTypeId: new FormControl(''),
            secondType: new FormControl({value: '', disabled: true}, Validators.required),
            secondTypeId: new FormControl(''),
            mallId: new FormControl('', Validators.required),
            mallName: new FormControl('', Validators.required),
            terminalId: new FormControl(''),
            terminalNo: new FormControl('', Validators.required),
            terminalName: new FormControl('', Validators.required),
            floor: new FormControl({value: '', disabled: true}),
            areaNo: new FormControl(''),
            enabled: new FormControl(true),
            score: new FormControl(''),
            customerPrice: new FormControl(''),
            openTime: new FormControl(''),
            image1: new FormControl(''),
            image2: new FormControl(''),
            image3: new FormControl(''),
            image4: new FormControl(''),
            image5: new FormControl(''),
            image6: new FormControl(''),
            desc: new FormControl(''),
            addressDesc: new FormControl(''),
            sortWeight: new FormControl(''),
            overhead: new FormControl(false),
            rentStatus: new FormControl({value: 'LONG', disabled: true}),
            validityDate: new FormControl({value: '', disabled: true}),
            mapImage: new FormControl('')
        });
        this.storeGroup.get('score').valueChanges.subscribe(res => {
            if (res) {
                this.utils.transformToNumberWithControl(res, this.storeGroup.get('score'), 0, 5);
            }
        });
        this.storeGroup.get('customerPrice').valueChanges.subscribe(res => {
            if (res) {
                this.utils.transformToCNYByControl(res, this.storeGroup.get('customerPrice'));
            }
        });
        this.storeGroup.get('sortWeight').valueChanges.subscribe(res => {
            if (res) {
                this.utils.transformToNumberWithControl(res, this.storeGroup.get('sortWeight'), 0, 999999999);
            }
        });

        this.detailId = this.activatedRoute.snapshot.paramMap.get('id');
        this.utils.editFlag = 0;
        if (this.detailId) {
            this.initOrReset();

        }
    }

    initOrReset() {
        this.editFlag = 1;
        this.utils.editFlag = 1;
        this.loading.show();
        this.getDetailById().then(res => {
            // 初始化时获取选择
            this.getStoreTags(res.id);
            Promise.all([this.initSelectList(res), this.getTerminalSelect(res.mallId, res)]).then(data => {
                this.storeGroup.patchValue(data[0], {emitEvent: false});
                this.setImage('logo');
                this.images.forEach(image => this.setImage(image.id));
                this.setImage(this.navigationImage.id);
                this.disableAll();
            });
            this.initTypes(res.mallId).then(types => {
                // 初始化时设置二级标签选项
                const selectedBusinessType = types.find(item => item.id === res.businessTypeId);
                if (selectedBusinessType && selectedBusinessType.children && selectedBusinessType.children.length > 0) {
                    this.filterSecondTypes = this.utils.getFilterOptions(this.storeGroup.get('secondType'), selectedBusinessType.children, 'name', 'id');
                }
                this.loading.hide();
            }, reason => this.disableAll());
            this.getAreaNos(res.terminalNo);
        });
    }

    disableAll() {
        this.storeGroup.disable({emitEvent: false});
        this.openTimeControl.disable({emitEvent: false});
        this.closeTimeControl.disable({emitEvent: false});
    }

    enableAll() {
        this.storeGroup.enable({emitEvent: false});
        // this.storeGroup.get('mallId').disable({emitEvent: false});
        // this.storeGroup.get('mallName').disable({emitEvent: false});
        this.storeGroup.get('storeNo').disable({emitEvent: false});
        this.storeGroup.get('rentStatus').disable({emitEvent: false});
        this.storeGroup.get('validityDate').disable({emitEvent: false});
        this.openTimeControl.enable({emitEvent: false});
        this.closeTimeControl.enable({emitEvent: false});
    }

    showEdit() {
        this.editFlag = 2;
        this.utils.editFlag = 2;
        this.enableAll();
    }

    // 营业时间选择 选择了时间就必须
    openTimeSelect(event, flag) {
        if (flag === 'open') {
            this.openTimeControl.setValue(event, {emitEvent: false});
            if (!this.closeTimeControl.value) {
                this.closeTimeControl = new FormControl('', Validators.required);
            }
        } else if (flag === 'close') {
            this.closeTimeControl.setValue(event, {emitEvent: false});
            if (!this.openTimeControl.value) {
                this.openTimeControl = new FormControl('', Validators.required);
            }
        }
    }

    /**标签选择*/
    // checkbox选中商户标签
    onSelectTags(event) {
        this.selectedTags = event;
    }

    // 打开标签选择
    openTagSelect(template) {
        this.selectedTags = [];
        Object.assign(this.selectedTags, this.tags);
        this.dialog.open(template, {id: 'tagTemplate', width: '80%'}).afterClosed().subscribe(res => {
            if (res) {
                this.tags = [];
                Object.assign(this.tags, this.selectedTags);
            } else {
                this.selectedTags = [];
            }
        });
    }

    // 格式化输入权重比例小数
    onInput(event) {

    }

    // 删除标签
    deleteTag(i) {
        this.tags.splice(i, 1);
    }

    ngOnInit() {
        if (!this.detailId) {
            this.initSelectList();
        }
    }

    // 获取商户详情
    getDetailById() {
        return new Promise<any>((resolve, reject) => {
            this.editService.getStoreById(Number(this.detailId)).subscribe(res => {
                if (res) {
                    if (res.customerPrice) {
                        res.customerPrice = this.utils.formatToCNY(res.customerPrice);
                    }
                    if (res.openTime && res.openTime.includes('-')) {
                        const times = res.openTime.split('-');
                        if (times.length === 2) {
                            this.openTimeControl.setValue(times[0]);
                            this.closeTimeControl.setValue(times[1]);
                        }
                    }
                    resolve(res);
                }
            }, error1 => reject(error1));
        });
    }

    // 获取商户标签
    getStoreTags(id) {
        this.editService.getStoreTagsById(id).subscribe(res => {
            if (res && res.storeTag) {
                this.tags = res.storeTag;
            }
        });
    }


    // 设置图片
    setImage(id) {
        this.utils.setImage(id, this.storeGroup.get(id).value);
    }

    deleteImage(id) {
        this.utils.deleteImage(id, this.storeGroup.get(id));
    }

    // 初始化业态
    initTypes(mallId) {
        return new Promise<any>((resolve, reject) => {
            this.editService.getMallByMallId(mallId).subscribe(res => {
                const types = res.businessTypes;
                const secondTypes = res.secondTypes;
                this.totalTypes = [];
                Object.assign(this.totalTypes, types);
                this.totalTypes.forEach(type => {
                    const children = secondTypes.filter(item => item.businessTypeId === type.id);
                    type.children = children;
                });
                this.filterBusinessTypes = this.utils.getFilterOptions(this.storeGroup.get('businessType'), this.totalTypes, 'name', 'id');
                if (this.storeGroup.get('businessType').value && !this.totalTypes.find(item => item.name === this.storeGroup.get('businessType').value)) {
                    this.storeGroup.get('businessType').reset('', {emitEvent: false});
                    this.storeGroup.get('businessTypeId').reset('', {emitEvent: false});
                    this.storeGroup.get('secondType').reset('', {emitEvent: false});
                    this.storeGroup.get('secondTypeId').reset('', {emitEvent: false});
                    this.filterSecondTypes = null;
                }
                resolve(this.totalTypes);
            }, error1 => reject(error1));
        });
    }

    // 初始化所有选择框
    initSelectList(data?) {
        return new Promise(resolve => {
            this.editService.getBrandList(0, 0x3f3f3f3f, 'lastModifiedDate,desc').subscribe(res => {
                if (res.content && res.content.length > 0) {
                    // const brands = res.content.filter(item => item.enabled);
                    this.brandSources = res.content;
                    this.filterBrands = this.utils.getFilterOptions(this.storeGroup.get('brandCN'), this.brandSources, 'name', 'english');
                }
            });
            this.editService.getMallList(0, 0x3f3f3f3f, 'lastModifiedDate,desc').subscribe(res => {
                if (res.content && res.content.length > 0) {
                    this.mallSources = res.content.filter(item => item.enabled);
                    this.filterMallById = this.utils.getFilterOptions(this.storeGroup.get('mallId'), this.mallSources, 'mallId', 'mallName');
                    this.filterMallByName = this.utils.getFilterOptions(this.storeGroup.get('mallName'), this.mallSources, 'mallName', 'mallId');
                    if (data && data.mallId) {
                        const mall = res.content.find(item => item.mallId === data.mallId);
                        if (mall && mall.mallName) {
                            data.mallName = mall.mallName;
                        }
                    }
                }
                resolve(data);
            }, error1 => resolve(data));
        });
    }

    // 获取街区选择
    getTerminalSelect(filterValue, data?) {
        return new Promise(resolve => {
            const filter = [{name: 'mallId', value: filterValue}];
            this.editService.getTerminalList(0, 0x3f3f3f3f, 'lastModifiedDate,desc', null, filter).subscribe(res => {
                if (res.content) {
                    this.terminalSources = res.content.filter(item => item.enabled);
                    this.filterTerminalByNo = this.utils.getFilterOptions(this.storeGroup.get('terminalNo'), this.terminalSources, 'terminalNo', 'terminalName');
                    this.filterTerminalByName = this.utils.getFilterOptions(this.storeGroup.get('terminalName'), this.terminalSources, 'terminalName', 'terminalNo');
                    if (data && data.terminalNo) {
                        const terminal = res.content.find(item => item.terminalNo === data.terminalNo);
                        if (terminal && terminal.terminalName) {
                            data.terminalName = terminal.terminalName;
                        }
                    }
                }
                resolve(data);
            }, error1 => resolve(data));
        });
    }

    // 获取单元号选择
    getAreaNos(terminalNo) {
        const filter = [{name: 'terminalNo', value: terminalNo}];
        this.editService.getAreaList(0, 0x3f3f3f3f, 'lastModifiedDate,desc', null, filter).subscribe(res => {
            if (res.content && res.content.length > 0) {
                this.areaSources = res.content.filter(item => !item.storeId || item.storeId === this.storeGroup.get('id').value); // 未绑定的
                this.filterAreaNos = this.utils.getFilterOptions(this.storeGroup.get('areaNo'), this.areaSources, 'areaNo', 'floor');
            } else {
                this.storeGroup.get('floor').enable();
            }
        });
    }

    // 选中name补全id或者互选
    onSelectionChange(option, controlId, field) {
        this.storeGroup.get(controlId).setValue(option[field], {emitEvent: false});
        if (controlId === 'mallId' || controlId === 'mallName') {
            this.initTypes(option.mallId);
            this.getTerminalSelect(option.mallId);
            this.filterMallById = this.utils.getFilterOptions(this.storeGroup.get('mallId'), this.mallSources, 'mallId', 'mallName');
            this.filterMallByName = this.utils.getFilterOptions(this.storeGroup.get('mallName'), this.mallSources, 'mallName', 'mallId');

        } else if (controlId === 'businessTypeId' && option.children && option.children.length > 0) {
            this.storeGroup.get('secondType').reset('', {emitEvent: false});
            this.storeGroup.get('secondType').enable({emitEvent: false});
            this.secondSources = option.children;
            this.filterSecondTypes = this.utils.getFilterOptions(this.storeGroup.get('secondType'), this.secondSources, 'name', 'id');
            this.filterBusinessTypes = this.utils.getFilterOptions(this.storeGroup.get('businessType'), this.totalTypes, 'name', 'id');
        } else if (controlId === 'secondTypeId') {
            this.filterSecondTypes = this.utils.getFilterOptions(this.storeGroup.get('secondType'), this.secondSources, 'name', 'id');
        } else if (controlId === 'brandEN') { // 品牌选择时 部分属性直接继承
            if (option.desc) {
                this.storeGroup.get('desc').patchValue(option.desc);
            }
            this.getTagsFromBrand(option.id);
            if (option.logo) {
                this.storeGroup.get('logo').patchValue(option.logo, {emitEvent: false});
                this.setImage('logo');
            }
            if (option.images) {
                const images = option.images.split(',');
                for (let i = 0; i < 6; i++) {
                    if (images[i]) {
                        const id = 'image' + (i + 1);
                        this.storeGroup.get(id).patchValue(images[i], {emitEvent: false});
                        this.setImage(id);
                    } else {
                        const id = 'image' + (i + 1);
                        this.deleteImage(id);
                    }
                }
            }
            this.filterBrands = this.utils.getFilterOptions(this.storeGroup.get('brandCN'), this.brandSources, 'name', 'english');
        } else if (controlId === 'terminalNo' || controlId === 'terminalName') {
            this.getAreaNos(option.terminalNo);
            this.storeGroup.get('terminalId').setValue(option.terminalId, {emitEvent: false});
            this.filterTerminalByNo = this.utils.getFilterOptions(this.storeGroup.get('terminalNo'), this.terminalSources, 'terminalNo', 'terminalName');
            this.filterTerminalByName = this.utils.getFilterOptions(this.storeGroup.get('terminalName'), this.terminalSources, 'terminalName', 'terminalNo');
            if (this.storeGroup.get('terminalNo') !== option.terminalNo) {
                this.storeGroup.get('floor').reset('', {emitEvent: false});
                this.storeGroup.get('areaNo').reset('', {emitEvent: false});
            }
        } else if (controlId === 'floor') {
            this.filterAreaNos = this.utils.getFilterOptions(this.storeGroup.get('areaNo'), this.areaSources, 'areaNo', 'floor');

        }
    }

    // 继承品牌的标签
    getTagsFromBrand(id) {
        this.editService.getBrandTagsById(id).subscribe(res => {
            if (res && res.brandTag) {
                this.tags = res.brandTag;
            }
        });
    }

    // 富文本初始化
    onEditorCreated(editor) {
        this.utils.onEditorCreated(editor, this.storeGroup.get('desc'));
    }


    // 保存操作
    onSaveClick() {
        if (this.editFlag === 0) {
            this.saveData().then(data => {
                this.editService.createStore(data).subscribe((res) => {
                    if (this.setStoreTags(data.id)) {
                        this.setStoreTags(data.id).subscribe(r => {
                            this.loading.hide();
                            this.onSaving = false;
                            this.goBack();
                            this.snackBar.open('新增商户成功！', '✓');
                        }, error1 => {
                            this.onSaving = false;
                            this.snackBar.open('新增商户基础数据成功，新增商户标签失败！');
                        });
                    } else {
                        this.loading.hide();
                        this.onSaving = false;
                        this.goBack();
                        this.snackBar.open('新增商户成功！', '✓');
                    }
                }, error1 => {
                    this.onSaving = false;
                });
            });
        } else {
            this.saveData().then(data => {
                this.editService.updateStore(data).subscribe(res => {
                    if (this.setStoreTags(data.id)) {
                        this.setStoreTags(data.id).subscribe(r => {
                            this.loading.hide();
                            this.onSaving = false;
                            this.goBack();
                            this.snackBar.open('更新商户成功！', '✓');
                        }, error1 => {
                            this.onSaving = false;
                            this.snackBar.open('更新商户基础数据成功，更新商户标签失败！');
                        });
                    } else {
                        this.loading.hide();
                        this.onSaving = false;
                        this.goBack();
                        this.snackBar.open('更新商户成功！', '✓');
                    }
                }, error1 => this.onSaving = false);
            });
        }
    }

    // 设置商户标签
    setStoreTags(storeId) {
        if (this.tags.length > 0) {
            const newTags = [];
            this.tags.forEach(tag => {
                const newTag = {
                    id: tag.id,
                };
                newTags.push(newTag);
            });
            const storeTag = {storeId: storeId, tagList: newTags};
            return this.editService.setStoreTags(storeTag);
        } else {
            return null;
        }
    }


    // 保存方法
    saveData() {
        return new Promise<any>(resolve => {
            if (!this.storeGroup.get('mapImage').value){
              this.snackBar.open('请上传导航图片！');
              return;
            }
            if (this.storeGroup.valid && this.openTimeControl.valid && this.closeTimeControl.valid) {
                this.onSaving = true;
                this.loading.show();
                if (this.openTimeControl.value && this.closeTimeControl.value) {
                    this.storeGroup.get('openTime').setValue(this.openTimeControl.value + '-' + this.closeTimeControl.value);
                }
                const data = this.storeGroup.getRawValue();
                if (data.customerPrice) {
                    data.customerPrice = this.utils.toNumber(data.customerPrice);
                }
                // 租赁结束日期
                if (data.validityDate) {
                    data.validityDate = new Date(data.validityDate).toISOString();
                }
                resolve(data);
            } else {
                document.getElementById('infoForm').scrollTop = 0;
                this.storeGroup.markAllAsTouched();
                this.openTimeControl.markAsTouched();
                this.closeTimeControl.markAsTouched();
            }
        });
    }


    // 上传新品图
    uploadImage(image) {
        if (this.editFlag === 2 || this.editFlag === 0) {
            const subscription = this.utils.onUpload.subscribe(res => {
                image.loading = true;
            });
            this.utils.uploadImage().then(res => {
                image.loading = false;
                this.storeGroup.get(image.id).setValue(res);
                this.setImage(image.id);
                subscription.unsubscribe();
            }, reason => {
                image.loading = false;
                subscription.unsubscribe();
                this.snackBar.open(reason);
            });
        }
    }

    // 业态选择
    onTypeChange(option) {
        this.storeGroup.get('businessTypeId').setValue(option.id);
    }

    // 二级业态选择
    onSecondChange(option) {
        this.storeGroup.get('secondTypeId').setValue(option.id);
    }

    goBack() {
        if (this.editFlag === 2) {
            this.disableAll();
            this.initOrReset();
        } else {
            this.router.navigate(['apps/storeManage']).then();
        }
    }

    /***************** 导航图片 ****************/
    // 上传导航图片
    uploadNavigationImage() {
        if (this.editFlag === 2 || this.editFlag === 0) {
            const subscription = this.utils.onUpload.subscribe(res => {
                this.navigationImage.loading = true;
            });
            this.utils.uploadImage().then(res => {
                this.navigationImage.loading = false;
                this.storeGroup.get('mapImage').setValue(res);
                this.setImage(this.navigationImage.id);
                subscription.unsubscribe();
            }, reason => {
                this.navigationImage.loading = false;
                subscription.unsubscribe();
                this.snackBar.open(reason);
            });
        }
    }

    deleteNavigationImage() {
        this.utils.deleteImage(this.navigationImage.id, this.storeGroup.get('mapImage'));
    }
}

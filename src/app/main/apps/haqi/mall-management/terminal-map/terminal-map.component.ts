import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {SidebarService} from '../../../../../../@fuse/components/sidebar/sidebar.service';
import * as d3 from 'd3';
import {fuseAnimations} from '../../../../../../@fuse/animations';
import {TranslateService} from '@ngx-translate/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {forkJoin, Observable, Subject} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';
import * as JSZip from 'jszip/dist/jszip.js';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {HistorySearchComponent} from '../../../../../components/history-search/history-search.component';
import {TerminalService} from '../../../../../services/terminalService/terminal.service';
import {FuseProgressBarService} from '../../../../../../@fuse/components/progress-bar/progress-bar.service';
import {FileDownloadService} from '../../../../../services/file-download.service';
import {DomSanitizer} from '@angular/platform-browser';
import {DateTransformPipe} from '../../../../../pipes/date-transform/date-transform.pipe';
import {TerminalMapService} from './terminal-map.service';
import {Utils} from '../../../../../services/utils';


@Component({
    selector: 'app-terminal-map',
    templateUrl: './terminal-map.component.html',
    styleUrls: ['./terminal-map.component.scss'],
    animations: fuseAnimations
})
export class TerminalMapComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject();
    selectedTerminal = 0; // 选中
    mallTransition = false; // 加载svg图后开启transition过渡动画
    transitionScale = false;
    mapSelected = false; // 是否选中地图
    svgSelection; // 当前选中地图层
    selectIndex = 0; // 当前地图索引
    mallSelection; // 商场div节点
    totalSvgNodes = []; // 所有svg节点

    // timeStamps
    changeTimestamp;
    slideTimeStamp;
    floorTimestamp;
    changeFloorStamp;
    dialogStamp; // 商户对应弹框时间戳
    clearTimeStamp; // 返回清空操作时候的时间戳

    chosenClass = 'svg-content-select';
    container; // 总容器
    animationOn = false; // 动画样式添加
    animationOff = false; // 是否关闭动画
    slideOnOff = true; // 控制面板隐藏
    shortcutKeys: any = {all: [], map: [], share: []}; // 快捷鍵

    // upload svg
    terminalOn = false; // 是否加载了地图
    username = ''; // 登录用户名
    animationKey = ''; // 动画开关缓存key
    editShow = false; // 是否编辑模式
    expandPanel = 0; // 展开的折叠面板
    onSaving = false; // 是否在保存
    filterRows: SvgHistory[] = []; // 搜索后的svg历史列表
    rows: SvgHistory[] = []; // 接口返回的总svg列表
    columns = [   // 历史列表表头
        {name: 'fileName'},
        {name: 'uploadPerson'},
        {name: 'uploadTime'}
    ];
    historyLoaded = false; // 历史列表已加载
    selectedSvg = []; // 选中的历史列表数据

    // 地图商户编辑
    mapEditShow = false; // 是否是编辑模式
    effectiveAreas = []; // 有效单元号
    pathList: Path[] = []; // 总单元数据list
    bTypePathList: any[] = []; // 总业态列表
    filterBTypePathList = []; // 显示的列表
    searchBTypePathList = []; // 查询的筛选列表
    historyKey = '';  // 搜索历史列表缓存key
    historySearch = []; // 搜索历史
    inputValue = ''; // 搜索框值绑定
    noTypePathList: any = {name: 'airport.bType.noType', pathList: [], color: '#aaaaaa', folded: false}; // 无业态总列表
    filterNoTypeList: any = {name: 'airport.bType.noType', pathList: [], color: '#aaaaaa', folded: false}; // 显示的列表
    searchNoTypeList: any = {name: 'airport.bType.noType', pathList: [], color: '#aaaaaa', folded: false}; // 筛选的总列表
    enterTimestamp; // 搜索列表时间戳
    pathClicked = false; // 点击单元时立即取消商场编辑
    tags = []; // 标签
    selectedTags = []; // 选中标签

    // 商户对应列表
    page = {page: 0, size: 5, count: 0}; // 分页
    storeColumns = [{name: 'storeNo'}, {name: 'storeName'}, {name: 'areaNo'}, {name: 'terminalNo'}, {name: 'terminalName'}, {name: 'source'}]; // 行头
    stores: Store[] = [];
    businessTypes: BusinessType[] = []; // 一级业态
    secondTypes = []; // 二级业态
    filterSecondTypes: Observable<any>;
    bTypeColors = [];
    addBusinessType = false; // 是否添加业态
    editBusinessType = false; // 修改业态
    editBType: BusinessType = new BusinessType('', '', '#000000');
    selectType: BusinessType;

    selectStore: Store = null; // 选择对应的店铺
    selectStores = [];
    isCurrent = false; // 是否是当前的商户编号
    currentPath: Path = null; // 当前选中的单元
    changeFloor = false;

    storeForm: FormGroup;
    logo = {id: 'logo', loading: false}; // 控制logo


    // transform变换
    target = {
        position: {x: 0, y: 0},
        zoom: 0.7,
        mallZoom: null
    };
    zoomMax = 4; // 地图最大缩放比例
    // 编辑情况下的地图缩放比例
    editTarget = {
        zoom: 0.4
    };
    @ViewChild('corresponding', {static: true})
    corresponding: TemplateRef<any>;
    @ViewChild('historySearch', {static: true})
    searchComponent: HistorySearchComponent;
    @ViewChild('update', {static: true})
    update: TemplateRef<any>;
    @ViewChild('tips', {static: true})
    tipsDialog;
    @ViewChild('init', {static: true})
    initDialog;
    @ViewChild('cDialog', {static: true})
    cDialog;
    @ViewChild('changeStore', {static: true})
    changeStore;
    @ViewChild('clearArea', {static: true})
    clearArea;
    @ViewChild('deleteType', {static: true})
    deleteType;

    /** 街区地图*/
        // 选择前置 商场商场和街区
    blocControl = new FormControl('');
    totalBlocs = [];
    blocSources = [];
    filterBlocs: Observable<any>;
    mallControl = new FormControl('');
    mallSources = [];
    filterMall: Observable<any>;
    terminalControl = new FormControl('');
    terminalSources = [];
    filterTerminal: Observable<any>;

    // 品牌
    filterBrands: Observable<any>;
    brandSources = [];

    /** 街区信息相关*/
    terminalForm: FormGroup;
    floors = []; // 楼层对象

    /** 地图操作*/
    mapLoading = false; // loading状态

    /** 地图上传相关*/
    private svgUploadEnd: Subject<any> = new Subject(); // 异步读取选择上传的文件时的可观察对象
    private mapUploadEnd: Subject<any> = new Subject(); // 异步读取选择上传的文件时的可观察对象

    uploadFiles = []; // 上传文件 blob
    uploadSVGs = []; // 上传预览 base64图片
    uploadMaps = []; // 上传内容 text svg内容
    mapChanges = []; // 单元号更新
    terminalNo = ''; // 上传地图后读取的terminalNo
    onSvgLoading = false; // 读取文件添加到数组中
    onMapLoading = false; // 读取地图内容添加到数组中

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
    };  // quill模块配置


    constructor(
        private sidebarService: SidebarService,
        private translate: TranslateService,
        public dialog: MatDialog,
        private snackBar: MatSnackBar,
        private sanitizer: DomSanitizer,
        private mapService: TerminalMapService,
        private utils: Utils,
        private terminal: TerminalService,
        private loading: FuseProgressBarService,
        private fileDownload: FileDownloadService,
        private dateTransform: DateTransformPipe
    ) {
        this.terminalForm = new FormGroup({
            id: new FormControl({value: '', disabled: true}),
            terminalId: new FormControl({value: '', disabled: true}),
            terminalNo: new FormControl({value: '', disabled: true}),
            terminalName: new FormControl({value: '', disabled: true}),
            mallId: new FormControl({value: '', disabled: true}),
            mallName: new FormControl({value: '', disabled: true}),
            blocId: new FormControl({value: '', disabled: true}),
            floors: new FormControl({value: '', disabled: true}),
            blocName: new FormControl({value: '', disabled: true}),
            address: new FormControl({value: '', disabled: true}),
            enabled: new FormControl({value: true, disabled: true}),
            desc: new FormControl({value: '', disabled: true})
        });
        // 地图编辑
        this.storeForm = new FormBuilder().group({
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
            mallId: new FormControl(''),
            mallName: new FormControl(''),
            terminalId: new FormControl(''),
            terminalNo: new FormControl(''),
            terminalName: new FormControl(''),
            floor: new FormControl({value: '', disabled: true}),
            areaNo: new FormControl({value: '', disabled: true}),
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
            createdBy: new FormControl({value: '', disabled: true}, []),
            createdDate: new FormControl({value: '', disabled: true}, []),
            lastModifiedBy: new FormControl({value: '', disabled: true}, []),
            lastModifiedDate: new FormControl({value: '', disabled: true}, []),
        });
    }

    ngOnInit() {
        // 异步监听器、可观测方法
        this.onLanguageChange();  // 语言切换
        this.addD3ZoomListener(); // 放大缩小监听
        this.onUploadEnd(); // new 上传或下载文件流订阅
        this.getBlocs();

        // 初始化方法
        // this.searchTerminalList();
        this.getUsernameAndStorageKeys();  // 获取缓存key
        this.initShortcutKeys(); // 初始化快捷键说明
        this.cancelExplorerProgram(); // 取消默认浏览器事件
        this.resetTargetZoom(); // 根据窗口大小初始化放大比例
        // 根据缓存直接加载上次选择街区
        if (localStorage.getItem(this.username + 'TerminalNo')) {
            this.initTerminalMapByNo(localStorage.getItem(this.username + 'TerminalNo'), true);
        }
    }

    /**地图上传相关*/

    // 加载svg完毕
    onUploadEnd() {
        this.svgUploadEnd.pipe(debounceTime(1000)).subscribe(res => {
            if (this.uploadSVGs.length > 0) {
                if (res.update) { // 非初始化时
                    const first = this.uploadSVGs[0];
                    const terminal = first.name.substring(0, first.name.indexOf('-'));
                    if (terminal) {
                        this.terminalNo = terminal;
                        this.terminalForm.get('terminalNo').setValue(terminal);
                    }
                    this.terminalForm.get('floors').setValue(this.uploadSVGs.length);
                    this.uploadSVGs.forEach((item, index) => {
                        item.order = index;
                    });
                } else {
                    this.uploadSVGs.sort((a, b) => a.order - b.order);
                }
                this.onSvgLoading = false;
            }
        });
        this.mapUploadEnd.pipe(debounceTime(1000)).subscribe(data => {
            if (this.uploadMaps.length > 0) {
                if (!data.init) {
                    this.uploadMaps.forEach((item, index) => {
                        item.order = index;
                    });
                } else {
                    this.uploadMaps.sort((a, b) => a.order - b.order);

                }
                this.onMapLoading = false;
                this.loadMaps(data.init);
            }
        });
    }

    // 设置svg容器的初始位置
    setSvgContentPosition(returnFlag?) {
        this.uploadMaps.forEach((item, index, arr) => {
            const container = d3.select('#' + item.id);
            const max = arr.length - 1;
            const mid = max / 3;
            const node = container.node();
            const limit = 3;
            if (index < mid) {
                // if (max - (mid - index) > 3) { // 如果地图上下超过固定数，延迟为固定数
                //     node.style.transitionDelay = limit * 0.2 + 's';
                // } else {
                //     node.style.transitionDelay = (max - (mid - index)) * 0.2 + 's';
                // }
                node.style.top = 250 * (mid - index) + 'px';
            } else if (index > mid) {
                // if (max - (index - mid) > limit) {
                //     node.style.transitionDelay = limit * 0.2 + 's';
                // } else {
                //     node.style.transitionDelay = (max - (index - mid)) * 0.2 + 's';
                // }
                node.style.top = 250 * (mid - index) + 'px';
            }
            if (returnFlag) { // 恢复
                node.style.opacity = 1;
                node.style.display = 'block';
                node.style.transform = null;
                node.children[0].style = null;
            } else {
                node.style.opacity = 0;
            }
            node.style.left = -25 * index + 'px';
        });
    }

    // 地图绘制
    loadMaps(init?) {
        return new Promise<any>(resolve => {
            this.uploadMaps.forEach((item, index, arr) => {
                this.writeMapToHtml(arr.length, index, item);
            });
            this.setSvgContentPosition();
            this.mallTransition = true;
            setTimeout(() => {
                this.uploadMaps.forEach(svg => {
                    const container = d3.select('#' + svg.id);
                    this.addClickEvent();
                    if (container.node()) {
                        container.node().style.opacity = 1;
                        container.select('svg').style('opacity', 1);
                    }
                });
                this.mapLoading = false;
                this.terminalOn = true;
                // 从地图map中解析出单元号
                this.getAreasFromMaps();
                this.animationOn = true;
                this.initConfig(); // 初始化配置
                this.getCorrespondingStores().then(() => {
                    this.getSelectionsAndAddPoints();
                });
            }, 2000);
            resolve();
        });
    }


    // 获取航站楼对应单元号的商户
    getCorrespondingStores(reset?, originPath?) {
        return new Promise(resolve => {
            const filter = [{name: 'terminalNo', value: this.terminalForm.getRawValue().terminalNo}];
            this.mapService.searchStoreLists(0, 0x3f3f3f3f, 'lastModifiedDate,desc', null, filter).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                if (res) {
                    this.pathList.forEach(path => {
                        const store = res.content.find(item => item.areaNo === path.areaNo);
                        if (store) {
                            path.storeName = store.storeName;
                            path.storeNo = store.storeNo;
                            path.corresponding = true;
                            path.businessType.name = store.businessType;
                        } else {
                            path.storeName = '';
                            path.storeNo = '';
                            path.businessType = new BusinessType();
                            path.corresponding = false;
                        }
                    });
                    if (originPath) { // 如果传入了path 为商户对应时候
                        const path = this.pathList.find(item => item.areaNo === originPath.areaNo);
                        this.enterMapDetail(path);
                    }
                    this.setBTypeColor(reset);
                    resolve();
                }
            }, error => {
                resolve();
            });
        });
    }

    // 解析单元号
    getAreasFromMaps() {
        this.pathList = [];
        this.effectiveAreas = [];
        this.uploadMaps.forEach(item => {
            const firstIds = item.map.split('id="');
            firstIds.forEach((id, index) => {
                if (index !== 0) {
                    const areaNo = id.substring(0, id.indexOf('"'));
                    const reg = /^[0-9A-Z]+-[0-9A-Z]+-S[0-9]+$/;
                    if (reg.test(areaNo)) {
                        // 上传文件或者接口获取的单元号
                        const newPath = new Path();
                        newPath.areaNo = areaNo;
                        newPath.selected = false;
                        newPath.corresponding = false;
                        this.pathList.push(newPath);
                        this.effectiveAreas.push(areaNo);
                    }
                }
            });
        });
    }

    /** 街区地图*/
    // 获取集团筛选
    // 初始化时注意详情时得先赋值否则容易出现查不到的错误
    getBlocs() {
        this.mapService.getBlocList(0, 0x3f3f3f3f, 'lastModifiedDate,desc').subscribe(res => {
            if (res.content && res.content.length > 0) {
                this.totalBlocs = res.content;
                this.blocSources = res.content.filter(item => item.enabled);
                this.filterBlocs = this.utils.getFilterOptions(this.blocControl, this.blocSources, 'blocName', 'blocId');
            }
        });
    }

    // 获取商场筛选
    getMallOptions(blocId, data?) {
        return new Promise<any>((resolve, reject) => {
            const filter = [{name: 'blocId', value: blocId}];
            this.mapService.getMallList(0, 0x3f3f3f3f, 'lastModifiedDate,desc', null, filter).subscribe(res => {
                if (res.content && res.content.length > 0) {
                    this.mallSources = res.content.filter(item => item.enabled);
                    this.filterMall = this.utils.getFilterOptions(this.mallControl, this.mallSources, 'mallId', 'mallName');
                    if (data && data.mallId) {
                        const mall = res.content.find(item => item.mallId === data.mallId);
                        if (mall && mall.mallName) {
                            data.mallName = mall.mallName;
                        }
                    }
                } else {
                    this.filterMall = null;
                    this.snackBar.open('当前集团下下未查询到商场！', '✖');
                }
                resolve(data);
            }, error1 => resolve(data));
        });
    }

    // 获取街区选择
    getTerminalOptions(mallId) {
        return new Promise<any>((resolve, reject) => {
            const filter = [{name: 'mallId', value: mallId}];
            this.mapService.getTerminalList(0, 0x3f3f3f3f, 'lastModifiedDate,desc', null, filter).subscribe(res => {
                if (res.content && res.content.length > 0) {
                    this.terminalSources = res.content.filter(item => item.enabled);
                    this.filterTerminal = this.utils.getFilterOptions(this.terminalControl, this.terminalSources, 'terminalNo', 'terminalName');
                    resolve();
                } else {
                    this.filterTerminal = null;
                    reject();
                    this.snackBar.open('当前商场下未查询到街区！', '✖');
                }
            }, error1 => reject());
        });
    }

    // 获取品牌选择
    getBrandList() {
        this.mapService.getBrandList(0, 0x3f3f3f3f, 'lastModifiedDate,desc').subscribe(res => {
            if (res.content && res.content.length > 0) {
                // const brands = res.content.filter(item => item.enabled);
                this.brandSources = res.content;
                this.filterBrands = this.utils.getFilterOptions(this.storeForm.get('brandCN'), this.brandSources, 'name', 'english');
            }
        });
    }

    // 获取二级业态
    getSecondTypes() {
        return new Promise<any>(resolve => {
            this.mapService.getSecondTypeList().subscribe(res => {
                this.secondTypes = res;
                resolve();
            });
        });
    }

    // 富文本初始化
    onEditorCreated(editor) {
        this.utils.onEditorCreated(editor, this.storeForm.get('desc'));
    }

    // 选择了业态
    onTypeSelect(type, controlId, field) {
        this.storeForm.get(controlId).setValue(type[field], {emitEvent: false});
        if (controlId === 'businessTypeId') {
            const filterTypes = this.secondTypes.filter(item => item.businessTypeId === type.id);
            this.storeForm.get('secondType').reset();
            this.storeForm.get('secondType').enable();
            this.filterSecondTypes = this.utils.getFilterOptions(this.storeForm.get('secondType'), filterTypes, 'name', 'id');
        } else if (controlId === 'secondTypeId') {
            const filterTypes = this.secondTypes.filter(item => item.businessTypeId === type.businessTypeId);
            this.filterSecondTypes = this.utils.getFilterOptions(this.storeForm.get('secondType'), filterTypes, 'name', 'id');
        }
    }

    // 商户表单自动补全选择
    onFormSelection(option, controlId, field) {
        this.storeForm.get(controlId).setValue(option[field], {emitEvent: false});
        if (controlId === 'brandEN') { // 品牌选择时 部分属性直接继承
            if (option.desc && !this.storeForm.get('desc').value) {
                this.storeForm.get('desc').patchValue(option.desc);
            }
            this.getTagsFromBrand(option.id);
            if (option.logo) {
                this.storeForm.get('logo').setValue(option.logo, {emitEvent: false});
                this.setImage('logo');
            }
            this.filterBrands = this.utils.getFilterOptions(this.storeForm.get('brandCN'), this.brandSources, 'name', 'english');
        }
    }

    // 继承品牌的标签
    getTagsFromBrand(id) {
        this.mapService.getBrandTagsById(id).subscribe(res => {
            if (res && res.brandTag) {
                this.tags = res.brandTag;
            }
        });
    }

    // 商场街区选择
    onSelectionChange(option, type) {
        const currentForm = this.terminalForm.getRawValue(); // 当前集团商场街区数据
        if (type === 'blocId') {
            this.getMallOptions(option.blocId);
            // 重置选择
            this.filterBlocs = this.utils.getFilterOptions(this.blocControl, this.blocSources, 'blocName', 'blocId');
            if (option.blocid !== currentForm.blocId) { // 如果改变了集团
                this.mallControl.reset();
            }
        } else if (type === 'mallId') {
            this.getTerminalOptions(option.mallId);
            // 选择自动补全后重置
            this.filterMall = this.utils.getFilterOptions(this.mallControl, this.mallSources, 'mallId', 'mallName');

            if (option.mallId !== currentForm.mallId) {
                this.terminalForm.reset();
            }
        } else if (type === 'terminalNo') {
            if (option.terminalNo !== currentForm.terminalNo) { // 如果街区改变
                if (this.uploadMaps.length > 0) { // 切换街区
                    this.clearPathList(); // 清空右侧单元数据
                    if (this.mapEditShow) { // 如果正处于商户编辑
                        this.closeMapEdit();
                    }
                    if (this.editShow) { // 如果正处于街区编辑
                        this.closeEditPanel();
                    }
                    this.returnAll();
                    this.uploadMaps = []; // 清空地图信息
                    this.uploadSVGs = [];
                    this.uploadFiles = [];
                }
                if (option.terminalNo) {
                    this.initTerminalMapByNo(option.terminalNo);
                }
            }
            this.filterTerminal = this.utils.getFilterOptions(this.terminalControl, this.terminalSources, 'terminalNo', 'terminalName');

        }
    }

    // 从街区编号初始化街区数据和地图
    initTerminalMapByNo(no, cache?) {
        this.mapLoading = true;
        this.getTerminalsByNo(no).then(res => {
            if (cache) { // 如果从缓存读取
                this.getMallOptions(res.blocId, res).then(data => {
                    // 根据id替换相关name
                    this.mallControl.setValue(data.mallName, {emitEvent: false});
                    if (Array.isArray(this.totalBlocs) && this.totalBlocs.length > 0) {
                        const bloc = this.totalBlocs.find(item => item.blocId === res.blocId);
                        if (bloc && bloc.blocName) {
                            data.blocName = bloc.blocName;
                        }
                    }
                    this.blocControl.setValue(data.blocName, {emitEvent: false});
                    this.mallControl.setValue(data.mallName, {emitEvent: false});
                    this.terminalControl.setValue(data.terminalName, {emitEvent: false});
                });
                this.getTerminalOptions(res.mallId);
            } else {
                localStorage.setItem(this.username + 'TerminalNo', res.terminalNo);
            }
            if (Array.isArray(this.floors) && this.floors.length > 0) { // 有上传街区地图知晓楼层
                this.initSvg(res.mallId, res.terminalNo);
            } else {
                this.terminalOn = false;
                this.mapLoading = false;
                // this.snackBar.open('当前街区无楼层信息和楼层地图！', '✖');
            }
        });
    }


    // 初始化街区地图
    initSvg(mallId, terminalNo) {
        console.log(terminalNo);
        if (mallId && terminalNo) {
            this.mapService.svgInit(mallId, terminalNo).subscribe(res => {
                if (res && res.size > 0) {
                    const file = new File([res], 'terminal.zip', {type: res.type});
                    const jsZip = new JSZip();
                    jsZip.loadAsync(file).then(zip => {
                        const zipFiles = zip.files;
                        const files: any[] = Object.values(zipFiles);
                        files.forEach((item, index, arr) => {
                            item.async('text').then(result => {
                                const map: any = {};
                                map.id = item.name.toLowerCase().split('.')[0];
                                map.map = result;
                                map.name = item.name;
                                map.floor = map.name.substring(map.name.indexOf('-') + 1, map.name.indexOf('.'));
                                const floor = this.floors.find(f => f.name === map.floor);
                                if (floor) {
                                    map.order = floor.order;
                                }
                                this.uploadMaps.push(map);
                                if (index === arr.length - 1) {
                                    this.uploadMaps.sort((a, b) => a.order - b.order);
                                    this.mapUploadEnd.next({init: this.uploadMaps});
                                }
                            });
                            item.async('base64').then(result => {
                                const svg: any = {};
                                svg.imgUrl = this.sanitizer.bypassSecurityTrustUrl('data:image/svg+xml;base64,' + result);
                                svg.name = item.name;
                                svg.floor = svg.name.substring(svg.name.indexOf('-') + 1, svg.name.indexOf('.'));
                                const floor = this.floors.find(f => f.name === svg.floor);
                                if (floor) {
                                    svg.order = floor.order;
                                }
                                this.uploadSVGs.push(svg);
                                this.svgUploadEnd.next({init: this.uploadSVGs});
                            });
                            item.async('blob').then(result => {
                                const newFile = new File([result], item.name, {type: 'image/svg+xml'});
                                const svg: any = {};
                                svg.file = newFile;
                                svg.name = item.name;
                                this.uploadFiles.push(svg);
                            });
                        });
                    });
                } else {
                    this.mapLoading = false;
                }
            }, error1 => {
                this.mapLoading = false;
                this.terminalOn = false;
                this.loading.hide();
                this.snackBar.open('获取街区地图失败，街区地图丢失或服务器故障，请联系系统管理员或于街区管理中重新上传地图！', '✖');
            });
        } else {
            this.terminalOn = false;
            this.mapLoading = false;
            this.terminalOn = false;
            this.loading.hide();
        }
    }


    // 根据街区代号获取街区及楼层信息
    getTerminalsByNo(terminalNo) {
        return new Promise<any>(resolve => {
            this.mapService.getTerminalWithFloorsByNo(terminalNo).subscribe(res => {
                this.terminalForm.patchValue(res.terminalDTO);
                this.floors = res.floorDTOS;
                this.floors.sort((a, b) => a.order - b.order);
                resolve(res.terminalDTO);
            }, error1 => this.mapLoading = false);
        });
    }


    /** 标签操作*/
    editTag(tag) {
        this.selectedTags = [];
        Object.assign(this.selectedTags, this.tags);
        this.dialog.open(tag, {id: 'tag', width: '80%'}).afterClosed().subscribe(res => {
            if (res) {
                this.tags = [];
                Object.assign(this.tags, this.selectedTags);
            } else {
                this.selectedTags = [];
            }
        });
    }

    // 标签选中事件
    tagSelect(event) {
        this.selectedTags = event;
    }

    /** 初始化方法*/

    // 初始化一些用户设置 比如动画开关等
    initConfig() {
        if (localStorage.getItem(this.animationKey)) {
            this.animationOn = JSON.parse(localStorage.getItem(this.animationKey)).animationOn;
            this.animationOff = JSON.parse(localStorage.getItem(this.animationKey)).animationOff;
        }
    }

    // 获取业态
    getBusinessTypes() {
        return new Promise<any>(resolve => {
            this.terminal.getTypeList().pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                this.businessTypes = [];
                if (res) {
                    res.forEach(item => {
                        const type = {id: item.id, name: item.name, color: item.color};
                        this.businessTypes.push(type);
                    });
                }
                this.bTypeColors = [
                    '#d42121',
                    '#eb8500',
                    '#c921d4',
                    '#419ef6',
                    '#046686',
                    '#b4c900'
                ];
                this.getSecondTypes().then(() => {
                    resolve();
                });
            });
        });
    }

    /** 弹框、提示等通用方法*/
    // 空白提示信息
    showEmptyTips() {
        if (!this.terminalOn) {
            this.dialog.open(this.tipsDialog, {maxWidth: '800px'});
        }
        this.mapLoading = false;
    }

    // 显示初始化对话框
    showInitDialog() {
        this.dialog.open(this.initDialog, {maxWidth: '800px'});

    }

    /** 组件调用及触发的方法*/

    // 历史搜索选择选项
    optionSelect(event) {
        const input = event.option.value.toLowerCase();
        this.searchBTypePathList.forEach(item => {
            this.filterBTypePathList.find(type => type.id === item.id).pathList =
                item.pathList.filter(path => {
                    return path.areaNo && path.areaNo.toLowerCase().indexOf(input) !== -1 ||
                        path.storeName && path.storeName.toLowerCase().indexOf(input) !== -1 ||
                        path.businessType && path.businessType.name.toLowerCase().indexOf(input) !== -1 ||
                        path.storeNo && path.storeNo.toLowerCase().indexOf(input) !== -1; // 对象中的id
                });
        });
        this.filterNoTypeList.pathList = this.searchNoTypeList.pathList.filter(path => {
            return path.areaNo && path.areaNo.toLowerCase().indexOf(input) !== -1 ||
                path.storeName && path.storeName.toLowerCase().indexOf(input) !== -1 ||
                path.storeNo && path.storeNo.toLowerCase().indexOf(input) !== -1;
        });
    }

    // 历史搜索搜索过滤path 提供多字段搜索 path的字段
    onSearchPath(event) {
        const value = event.target.value;
        const input = value.trim().toLowerCase();
        let hasResult = false;
        this.searchBTypePathList.forEach(item => {
            const bType = this.filterBTypePathList.find(type => type.id === item.id);
            bType.pathList = item.pathList.filter(path => {
                return path.areaNo && path.areaNo.toLowerCase().indexOf(input) !== -1 ||
                    path.storeName && path.storeName.toLowerCase().indexOf(input) !== -1 ||
                    path.businessType && path.businessType.name.toLowerCase().indexOf(input) !== -1 ||
                    path.storeNo && path.storeNo.toLowerCase().indexOf(input) !== -1; // 对象中的id
            });
            if (bType.pathList.length > 0) {
                hasResult = true;
            }
        });
        this.filterNoTypeList.pathList = this.searchNoTypeList.pathList.filter(path => {
            return path.areaNo && path.areaNo.toLowerCase().indexOf(input) !== -1 ||
                path.storeName && path.storeName.toLowerCase().indexOf(input) !== -1 ||
                path.storeNo && path.storeNo.toLowerCase().indexOf(input) !== -1;
        });
        if (this.filterNoTypeList.pathList.length > 0) {
            hasResult = true;
        }
        // this.filterPathList = this.searchList.filter(path => {
        //     return path.areaNo && path.areaNo.toLowerCase().indexOf(input) !== -1 ||
        //         path.storeName && path.storeName.toLowerCase().indexOf(input) !== -1 ||
        //         path.storeNo && path.storeNo.toLowerCase().indexOf(input) !== -1; // 对象中的id
        // });
        // 如果历史列表为空 且有缓存 则取出
        if (this.historySearch.length === 0 && localStorage.getItem(this.historyKey)) {
            this.historySearch = JSON.parse(localStorage.getItem(this.historyKey));
        }
        if (value.trim() && hasResult && !this.historySearch.find(item => item.value === value)) {
            this.historySearch.unshift({value: value, delete: false});
            localStorage.setItem(this.historyKey, JSON.stringify(this.historySearch));
        }
    }

    // input清空时重置总列表
    resetPath() {
        this.bTypePathList.forEach(item => {
            this.searchBTypePathList.find(type => type.id === item.id).pathList =
                this.filterBTypePathList.find(type => type.id === item.id).pathList = item.pathList;
        });
        this.filterNoTypeList.pathList = this.searchNoTypeList.pathList = this.noTypePathList.pathList;
    }

    // 重置搜索列表
    resetSearchPath() {
        this.filterBTypePathList.forEach(item => {
            item.pathList = this.searchBTypePathList.find(type => type.id === item.id).pathList;
        });
        this.filterNoTypeList.pathList = this.searchNoTypeList.pathList;
    }

    // mat-chips删除标签
    remove(index) {
        this.tags.splice(index, 1);
    }

    /** 地图操作相关方法*/
    /**    地图区域标注 整合数据等*/
    // 保存地图|商户数据修改
    saveMapChange() {
        if (this.storeForm.valid) {
            // sessionStorage.setItem(this.pathListKey, JSON.stringify(this.pathList));
            this.onSaving = true;
            this.loading.show();
            const storeData = this.storeForm.getRawValue();
            const terminalData = this.terminalForm.getRawValue();
            storeData.terminalName = terminalData.terminalName;
            storeData.terminalNo = terminalData.terminalNo;
            storeData.terminalId = terminalData.terminalId;
            storeData.mallId = terminalData.mallId;
            storeData.mallName = terminalData.mallName;
            storeData.floor = this.floors[this.selectIndex].name;
            storeData.businessType = storeData.businessType ? storeData.businessType.name : '';
            storeData.createdDate = new Date(storeData.createdDate).toISOString();
            storeData.lastModifiedDate = new Date(storeData.lastModifiedDate).toISOString();
            const relation = {areaNo: storeData.areaNo, storeDTO: storeData};
            this.mapService.deleteRelation(storeData.areaNo, storeData.storeNo).subscribe(res => {
                if (res && res.status === 200) {
                    this.mapService.relationStore(relation).pipe(takeUntil(this._unsubscribeAll)).subscribe(r => {
                        if (this.setStoreTags(storeData.id)) {
                            this.setStoreTags(storeData.id).subscribe(() => {
                                this.getCorrespondingStores(true);
                                this.closeMapEdit();
                                this.onSaving = false;
                                this.loading.hide();
                            });
                        } else {
                            this.getCorrespondingStores(true);
                            this.closeMapEdit();
                            this.onSaving = false;
                            this.loading.hide();
                        }
                    }, error => {
                        this.onSaving = false;
                        this.loading.hide();
                    });
                }
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
            return this.mapService.setStoreTags(storeTag);
        } else {
            return null;
        }
    }

    // 更改商户pos编号
    openStore() {
        this.terminal.searchStoreLists('', this.page.page, this.page.size, 'id,desc').pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                this.stores = res.content;
                this.page.count = res.totalElements;
                if (!this.dialog.getDialogById('changeCorresponding')) {
                    this.dialog.open(this.corresponding, {id: 'changeCorresponding'}).afterClosed().subscribe(r => {
                        if (r) {
                            // 如果所选不是当前商户则弹窗
                            if (this.selectStore.areaNo !== this.storeForm.get('areaNo').value) {
                                if (this.selectStore.areaNo) {
                                    this.dialog.open(this.changeStore, {
                                        id: 'changeStore',
                                        width: '500px'
                                    }).afterClosed().pipe(takeUntil(this._unsubscribeAll)).subscribe(choice => {
                                        if (choice) {
                                            this.getAreaDetail(this.selectStore.storeNo, true);
                                        } else {
                                            this.openStore();
                                        }
                                    });
                                } else {
                                    this.getAreaDetail(this.selectStore.storeNo, true);
                                }
                            }
                        } else {
                            this.selectStores = [];
                            this.selectStore = null;
                        }
                    });
                }
            }
        }, error => {

        });
    }

    // 根据业态设置颜色
    setBTypeColor(selectFloor?) {
        this.terminal.getTypeList().pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.noTypePathList.pathList = [];
            this.filterNoTypeList.pathList = [];
            this.searchNoTypeList.pathList = [];
            this.pathList.forEach(path => {
                if (res && res.find(item => item.name === path.businessType.name)) {
                    path.businessType = res.find(item => item.name === path.businessType.name);
                }
                if (path.businessType.color) {
                    const selectPoint = d3.selectAll('#' + path.areaNo.replace('S', 'P'));
                    selectPoint.style('fill', path.businessType.color).style('stroke', path.businessType.color);
                }
                if (!path.businessType.id) {
                    this.noTypePathList.pathList.push(path);
                }
            });
            this.searchNoTypeList.pathList = this.filterNoTypeList.pathList = this.noTypePathList.pathList;
            this.bTypePathList = res;
            this.filterBTypePathList = JSON.parse(JSON.stringify(res));
            this.searchBTypePathList = JSON.parse(JSON.stringify(res));
            this.bTypePathList.forEach(item => {
                item.folded = false;
                item.pathList = [];
                this.pathList.forEach(path => {
                    if (path.businessType.id === item.id) {
                        item.pathList.push(path);
                    }
                });
            });
            this.filterBTypePathList.forEach(item => {
                item.folded = false;
                item.pathList = [];
                this.pathList.forEach(path => {
                    if (path.businessType.id === item.id) {
                        item.pathList.push(path);
                    }
                });
            });
            this.searchBTypePathList.forEach(item => {
                item.folded = false;
                item.pathList = [];
                this.pathList.forEach(path => {
                    if (path.businessType.id === item.id) {
                        item.pathList.push(path);
                    }
                });
            });
            if (selectFloor) {
                this.floorSelected();
            }
        }, error => {

        });
    }

    // 输入时填入新业态
    saveNewType(event) {
        this.editBType.name = event.target.value;
    }

    // 新建业态
    addType() {
        this.addBusinessType = true;
        setTimeout(() => {
            d3.select('.mat-select-panel').node().scrollTop = 5000;
        }, 100);
    }

    // 编辑颜色
    editColor(type) {
        this.editBusinessType = true;
        this.editBType.id = type.id;
        this.editBType.name = type.name;
        this.editBType.color = type.color;
        setTimeout(() => {
            d3.select('.mat-select-panel').node().scrollTop = 5000;
        }, 100);
    }

    // 取消
    clearBType() {
        this.editBType = new BusinessType('', '', '#000000');
        this.addBusinessType = false;
        this.editBusinessType = false;
    }

    // 删除业态
    deleteBType(type) {
        this.selectType = type;
        this.dialog.open(this.deleteType, {id: 'deleteType'}).afterClosed().subscribe(res => {
            if (res) {
                this.terminal.deleteType(type.id).pipe(takeUntil(this._unsubscribeAll)).subscribe(r => {
                    if (r.status === 200) {
                        this.businessTypes = this.businessTypes.filter(item => item.id !== type.id);
                    }
                }, error => {

                });
            }
        });
    }

    // 保存新增业态
    saveBType() {
        if (this.editBType.name && this.editBType.color) {
            if (this.addBusinessType) {
                this.terminal.createType(this.editBType).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                    if (res && res.status === 200) {
                        this.getBusinessTypes();
                        this.setBTypeColor(true);
                        this.clearBType();
                    }
                }, error => {

                });
            } else if (this.editBusinessType) {
                this.terminal.updateType(this.editBType).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                    if (res && res.status === 200) {
                        this.getBusinessTypes();
                        this.setBTypeColor(true);
                        this.clearBType();
                    }
                }, error => {

                });
            }
            // this.businessTypes.push(this.editBType);
        } else if (!this.editBType.name) {
            this.snackBar.open(this.translate.instant('airport.message.typeEmpty'), '✖');
        } else if (!this.editBType.color) {
            this.snackBar.open(this.translate.instant('airport.message.colorEmpty'), '✖');
        }
    }


    // 设置图片
    setImage(id) {
        this.utils.setImage(id, this.storeForm.get(id).value);
    }

    deleteImage(id) {
        this.utils.deleteImage(id, this.storeForm.get(id));
    }

    // 上传logo
    uploadImage(image) {
        const subscription = this.utils.onUpload.subscribe(res => {
            image.loading = true;
        });
        this.utils.uploadImage().then(res => {
            image.loading = false;
            this.storeForm.get(image.id).setValue(res, {emitEvent: false});
            this.setImage(image.id);
            subscription.unsubscribe();
        }, reason => {
            image.loading = false;
            subscription.unsubscribe();
        });

    }


    // 关闭
    closeMapEdit() {
        this.cancelMapEdit();
    }

    // 取消地图编辑模式
    cancelMapEdit() {
        this.mapEditShow = false;
        this.resetMap();
        this.clearTimeStamp = setTimeout(() => { // 动画效果结束后再清空
            this.storeForm.reset();
            this.deleteImage('logo');
            this.tags = [];
        }, 1000);
    }

    // 清空数据
    clearData() {
        this.dialog.open(this.clearArea, {
            id: 'clearArea',
            width: '500px'
        }).afterClosed().pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                this.mapService.deleteRelation(this.storeForm.get('areaNo').value, this.storeForm.get('storeNo').value).pipe(takeUntil(this._unsubscribeAll)).subscribe(r => {
                    if (r && r.status === 200) {
                        this.getCorrespondingStores(true);
                        this.closeMapEdit();
                    }
                }, error => {

                });
            }
        });

    }


    // 获取带selection 还有添加path坐标点
    getSelectionsAndAddPoints() {
        this.mallSelection = d3.select('#mall');
        if (localStorage.getItem(this.username + 'AnalysisZoom')) { // 如果存在缩放缓存
            this.target.mallZoom = JSON.parse(localStorage.getItem(this.username + 'AnalysisZoom'));
            this.target.zoom = this.target.mallZoom;
            this.mallSelection.style('transform', 'rotateX(65deg) skewX(-5deg) scale(' + this.target.zoom + ')');
        }
        this.effectiveAreas.forEach(areaNo => {
            const pathElement = document.getElementById(areaNo);
            this.addPointToPath(pathElement);
        });
    }

    // 在path上添加点
    addPointToPath(path) {
        if (path) {
            const rec = path.getBBox();
            let x = path.getBBox().x + rec.width / 2;
            let y = path.getBBox().y + rec.height / 2;
            const use = d3.select(path.viewportElement).append('use').attr('xlink:href', '#place');
            const useRec = use.node().getBBox();
            x = Math.round(x - useRec.width / 2);
            y = Math.round(y - useRec.height);
            use.attr('x', x).attr('y', y);
            use.attr('id', path.id.replace('S', 'P'));
        }
    }

    // 清空path数组
    resetSelectedSvgElements() {
        this.pathList = [];
        this.filterNoTypeList.pathList = [];
        this.noTypePathList.pathList = [];
        this.searchNoTypeList.pathList = [];
        this.filterBTypePathList = [];
        this.bTypePathList = [];
        this.searchBTypePathList = [];
    }

    // 取消选中状态
    cancelPathSelected() {
        this.pathList.forEach(item => { // 全部取消选中
            item.selected = false;
            d3.select('#' + (item.areaNo)).classed('path-selected', false);
            d3.select('#' + (item.areaNo.replace('S', 'P'))).classed('point-selected', false);
        });
    }


    // 选中楼层为path添加样式 path列表过滤楼层
    floorSelected() {
        this.effectiveAreas.forEach(item => d3.select('#' + item).classed('path-hover', true));
        this.bTypePathList.forEach(item => {
            this.searchBTypePathList.find(type => type.id === item.id).pathList = this.filterBTypePathList.find(type => type.id === item.id).pathList
                = item.pathList.filter(path => path.areaNo && path.areaNo.toLowerCase().indexOf(this.uploadMaps[this.selectIndex].id) !== -1);
        });
        this.searchNoTypeList.pathList = this.filterNoTypeList.pathList =
            this.noTypePathList.pathList.filter(path => path.areaNo && path.areaNo.toLowerCase().indexOf(this.uploadMaps[this.selectIndex].id) !== -1);

    }

    // 通过右侧点击进入地图
    enterMapByPath(path: Path) {
        // 如果当前已经是点击的path则return
        if (this.currentPath && this.currentPath.areaNo === path.areaNo && this.mapEditShow) {
            return;
        }
        if (this.enterTimestamp) {
            clearTimeout(this.enterTimestamp);
        }
        if (this.clearTimeStamp) { // 返回时又点击了新的单元号
            clearTimeout(this.clearTimeStamp);
        }
        this.pathClicked = true;
        let flag = false;
        if (this.editShow) {
            flag = true;
            this.cancelTransform();
            this.clearUpload();
        }
        this.enterTimestamp = setTimeout(() => {
            this.getPathSelected(path);
            this.currentPath = path;
            if (path.corresponding) {
                this.enterMapDetail(path);
            } else {
                // if (this.filterStores.length === 0) {
                //     this.snackBar.open(this.translate.instant('airport.message.noCorresponding'), '✖');
                // } else {
                // }
                this.terminal.searchStoreLists('', this.page.page, this.page.size, 'id,desc').pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                    if (res) {
                        this.stores = res.content;
                        this.page.count = res.totalElements;
                        this.openCorresponding(path);
                    }
                }, error => {

                });
            }
        }, flag ? 1300 : 300);
    }

    // 重新获取stores时获取其中对象以保持选中状态
    getSelectedStore() {
        this.selectStore = this.stores.find(item => this.selectStores.find(store => store.id === item.id));
        if (this.selectStore) {
            this.selectStores = [];
            this.selectStores.push(this.selectStore);
        }
    }

    // 重置列表
    resetStores(event) {
        if (event.target.value === '') {
            this.page.page = 0;
            this.terminal.searchStoreLists('', this.page.page, this.page.size, 'id,desc').pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                if (res) {
                    this.stores = res.content;
                    this.page.count = res.totalElements;
                }
            }, error => {

            });
        }
    }

    // 商户搜索
    onStoreSearch() {
        if (this.inputValue) {
            const s1 = this.getSearchObservable('storeNo');
            const s2 = this.getSearchObservable('storeName');
            const s3 = this.getSearchObservable('areaNo');
            const s4 = this.getSearchObservable('terminalNo');
            const s5 = this.getSearchObservable('terminalName');
            const s6 = this.getSearchObservable('source');
            forkJoin([s1, s2, s3, s4, s5, s6]).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                if (res && res.length > 0) {
                    this.stores = [];
                    res.forEach(r => {
                        if (r && r.content) {
                            r.content.forEach(store => {
                                if (!this.stores.find(item => item.id === store.id)) {
                                    this.stores.push(store);
                                }
                            });
                        }
                    });
                    this.page.count = this.stores.length;
                }
            }, error => {

            });
        }
    }

    // 获取搜索字段可观测对象
    getSearchObservable(field): Observable<any> {
        return this.terminal.searchStoreLists('', 0, 0x3f3f3f3f, field + ',desc', field, this.inputValue);
    }

    // 选择时拿到选中商户
    onSelect(event) {
        if (this.selectStores.length > 0) {
            this.selectStore = this.selectStores[0];
        }
        if (this.selectStore && this.selectStore.areaNo && this.selectStore.areaNo === this.storeForm.get('areaNo').value) {
            this.isCurrent = true;
        } else {
            this.isCurrent = false;
        }
    }

    // 排序
    onSort(event) {
        const sorts = event.sorts[0];
        const sort = sorts.prop + ',' + sorts.dir;
        this.terminal.searchStoreLists('', event.offset, event.pageSize, sort).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                this.stores = res.content;
            }
        }, error => {

        });
    }

    // 翻页
    onPage(event) {
        this.page.page = event.offset;
        if (!this.inputValue) {
            this.terminal.searchStoreLists('', event.offset, event.pageSize, 'id,desc').pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                if (res) {
                    this.stores = res.content;
                }
            }, error => {

            });
        }
    }

    // 获取单元号绑定商户的数据
    getAreaDetail(storeNo, select?) {
        this.terminal.getStoreByNo(storeNo).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                res['createdDate'] = new Date(res['createdDate']).toLocaleString([], {hour12: false}).replace(/\//g, '-');
                res['lastModifiedDate'] = new Date(res['lastModifiedDate']).toLocaleString([], {hour12: false}).replace(/\//g, '-');
                this.getStoreTags(res.id);
                // this.getBlocs();  // 获取集团选择
                this.getBrandList(); // 获取品牌选择
                if (select) { // 如果是切换商户选择对应
                    delete res['areaNo'];
                }
                this.getBusinessTypes().then(() => {
                    const businessTypeId = res['businessTypeId'];
                    const selected = this.businessTypes.find(item => item.id === businessTypeId);
                    if (selected) { // 如果已有业态则选中
                        this.storeForm.patchValue(res, {emitEvent: false});
                        this.storeForm.get('businessType').patchValue(selected, {emitEvent: false});
                        this.storeForm.get('secondType').enable({emitEvent: false});
                        const filterTypes = this.secondTypes.filter(item => item.businessTypeId === businessTypeId);
                        this.filterSecondTypes = this.utils.getFilterOptions(this.storeForm.get('secondType'), filterTypes, 'name', 'id');
                    } else {
                        this.storeForm.patchValue(res, {emitEvent: false});
                    }
                    this.setImage('logo');
                });

            }
        }, error => {

        });
    }

    // 获取商户标签
    getStoreTags(id) {
        this.mapService.getStoreTagsById(id).subscribe(res => {
            if (res && res.storeTag) {
                this.tags = res.storeTag;
            }
        });
    }

    // 进入地图编辑详情
    enterMapDetail(path: Path) {
        // if (!this.mapEditShow) {
        //     this.resetMapWhenEnterEdit();
        // }
        this.mapEditShow = true;
        const storeNo = path.storeNo;
        this.getAreaDetail(storeNo);

        // if (path.store) {
        //     path.store = this.stores.find(item => item.storeNo === path.store.storeNo);
        //     this.filterStores = this.filterStores.filter(store => store.storeNo !== path.store.storeNo);
        // }
        // if (path.businessType) {
        //     path.businessType = this.businessTypes.find(item => item.type === path.businessType.type);
        // }
    }

    // 地图选中和颜色加深效果
    getPathSelected(path: Path) {
        this.floors.forEach((item, index) => {
            if (!this.mapSelected && path.areaNo.toUpperCase().indexOf(item.name) !== -1) {
                this.selectFloor(index);
            }
        });
        this.pathList.forEach(item => {
            if (item.areaNo === path.areaNo) {
                item.selected = true;
                if (this.mapSelected) {
                    d3.select('#' + (item.areaNo)).classed('path-selected', true);
                    d3.select('#' + (item.areaNo.replace('S', 'P'))).classed('point-selected', true);
                } else {
                    setTimeout(() => {
                        d3.select('#' + (item.areaNo)).classed('path-selected', true);
                        d3.select('#' + (item.areaNo.replace('S', 'P'))).classed('point-selected', true);
                    }, 1000);
                }
            } else {
                item.selected = false;
                d3.select('#' + (item.areaNo)).classed('path-selected', false);
                d3.select('#' + (item.areaNo.replace('S', 'P'))).classed('point-selected', false);
            }
        });
    }

    /** 航站楼数据操作*/

    // 新建和更新
    createOrEditTerminal(form, type) {
        // if (form.valid) {
        //     const data = form.getRawValue();
        //     this.onSaving = true;
        //     this.loading.show();
        //     let observable = null;
        //     if (type === 'create') {
        //         observable = this.terminal.createTerminal(data);
        //     } else if (type === 'edit') {
        //         observable = this.terminal.updateTerminal(data);
        //     }
        //     observable.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        //         if (res.status === 200) {
        //             this.unInitTerminals = this.unInitTerminals.filter(item => item.terminalNo !== data.terminalNo);
        //             this.terminals.push({index: 0, terminalNo: data.terminalNo, floors: Number(data.floors)});
        //             this.terminals.sort((a, b) => a.terminalNo.charCodeAt(1) - b.terminalNo.charCodeAt(1));
        //             this.terminals.forEach((item, index) => {
        //                 item.index = index;
        //             });
        //             if (type === 'create') {
        //                 if (this.unInitTerminals.length > 0) {
        //                     this.createForm.reset();
        //                     this.createForm.get('terminalNo').patchValue(this.unInitTerminals[0].terminalNo);
        //                 }
        //                 this.snackBar.open(this.translate.instant('airport.message.createTerminal'), '✔');
        //             } else if (type === 'edit') {
        //                 this.snackBar.open(this.translate.instant('airport.message.updateTerminal'), '✔');
        //             }
        //         }
        //         this.onSaving = false;
        //         this.loading.hide();
        //         if (this.unInitTerminals.length === 0) {
        //             this.closeEditPanel();
        //         }
        //     }, error => {
        //         this.onSaving = false;
        //         this.loading.hide();
        //
        //     });
        // } else if (form.get('terminalName').hasError('required')) {
        //     this.snackBar.open(this.translate.instant('airport.form.terminalName'), '✖');
        // }
    }

    // 保存航站楼数据
    saveTerminalChange() {
        switch (this.expandPanel) {
            // 基础信息
            case 0: {
                break;
            }
            // 上传地图
            case 1: {
                if (this.checkCorrect()) {
                    this.snackBar.open(this.translate.instant('airport.message.notCorrectError'), '✖');
                } else if (this.uploadSVGs.length > 0) {
                    // switch (this.selectedTerminal) {
                    //     case 0: {
                    //         this.getMapChanges(this.t1Key, this.t1Ids);
                    //         break;
                    //     }
                    //     case 1: {
                    //         this.getMapChanges(this.t2Key, this.t2Ids);
                    //         break;
                    //     }
                    //     case 2: {
                    //         this.getMapChanges(this.t3Key, this.t3Ids);
                    //         break;
                    //     }
                    // }
                    this.mapChanges.forEach(item => {
                        if (item.newMap) {
                            const oldIds = this.getSvgIds(item.oldMap);
                            const newIds = this.getSvgIds(item.newMap);
                            const changes: Change[] = [];
                            newIds.forEach(id => {
                                if (!oldIds.includes(id)) {
                                    const change = new Change();
                                    change.id = id;
                                    change.add = true;
                                    changes.push(change);
                                }
                            });
                            oldIds.forEach(id => {
                                if (!newIds.includes(id)) {
                                    const change = new Change();
                                    change.id = id;
                                    change.delete = true;
                                    changes.push(change);
                                }
                            });
                            item.changes = changes;
                        }
                    });
                    this.dialog.open(this.update, {
                        maxWidth: '800px',
                        minWidth: '500px',
                        id: 'update'
                    }).afterClosed().pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                        if (res) {
                            this.loading.show();
                            this.onSaving = true;
                            // this.uploadTerminalData();
                        }
                    });
                } else {
                    this.closeEditPanel();
                }
                break;
            }
            // 下载地图
            case 2: {
                if (this.selectedSvg.length > 0) {
                    this.onSaving = true;
                    this.loading.show();
                    const fileName = [];
                    this.selectedSvg.forEach(item => {
                        fileName.push(item.sourceName);
                    });
                    const zipName = this.terminalControl.value + '_' + this.selectedSvg[0].uploadPerson + '_' + this.selectedSvg[0].uploadTime;
                    const data = {
                        fileName,
                        mallId: this.terminalForm.getRawValue().mallId,
                        terminalNo: this.terminalForm.getRawValue().terminalNo
                    };
                    this.terminal.downloadHistorySvgZip(data).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                        if (res && res.size > 0) {
                            this.fileDownload.blobDownload(res, zipName + '.zip');
                        }
                    }, error1 => {
                        this.loading.hide();
                        this.onSaving = false;
                    }, () => {
                        this.loading.hide();
                        this.onSaving = false;
                    });
                } else {
                    this.snackBar.open(this.translate.instant('airport.message.historySelectedError'), '✖');
                }
                break;
            }
        }
    }

    // checkbox change事件时候拿到选中项
    rowSelect(row, event) {
        row.selected = event.checked;
        this.selectedSvg = this.filterRows.filter(item => item.selected);
    }


    // 能够选中的行
    displayCheck(row) {
        return row;
    }

    // table事件
    onActivate(event) {
        if (event.type === 'click' && event.cellIndex !== 0) {
            event.row.selected = !event.row.selected;
            this.selectedSvg = this.filterRows.filter(row => row.selected);
        }
    }

    selectAllOrNot(event) {
        this.filterRows.forEach(row => row.selected = event.checked);
        this.selectedSvg = this.filterRows.filter(row => row.selected);
    }

    // 历史列表搜索
    historyListFilter(event) {
        const val = event.target.value.toLowerCase();
        this.filterRows = this.rows.filter(item =>
            item.fileName.toLowerCase().indexOf(val) !== -1 ||
            this.dateTransform.transform(item.uploadTime, ['/']).toLowerCase().indexOf(val) !== -1 ||
            item.uploadPerson.toLowerCase().indexOf(val) !== -1
        );
        // Whenever the filter changes, always go back to the first page
        // this.table.offset = 0;
    }

    // 获取航站楼历史上传列表
    getHistorySvg() {
        this.historyLoaded = false;
        this.loading.show();
        this.terminal.historySvgList(this.terminalForm.getRawValue().mallId, this.terminalForm.getRawValue().terminalNo).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                this.rows = [];
                res.forEach(item => {
                    const items: any[] = item.split('_');
                    const history: SvgHistory = {
                        fileName: items.length === 3 ? items[items.length - 1] : '',
                        uploadPerson: items.length >= 1 ? items[0] : '',
                        uploadTime: items.length >= 2 ? items[1] : '',
                        sourceName: item,
                        selected: false
                    };
                    this.rows.push(history);
                });
                this.rows.reverse();
                this.filterRows = this.rows;
                this.loading.hide();
                this.historyLoaded = true;
            }
        }, error1 => {
            this.loading.hide();
            this.historyLoaded = true;
        });
    }


    // 传入svg字符串 返回区域单元id数组
    getSvgIds(map) {
        const div = document.createElement('div');
        div.hidden = true;
        d3.select(div).html(map);
        const paths = d3.select(div).selectAll('svg g path[id]');
        const ids = [];
        paths._groups[0].forEach(node => {
            ids.push(node.id);
        });
        return ids;
    }

    // 检查svg内容是否与单元号对应
    checkCorrect() {
        if (this.uploadSVGs.length > 0) {
            let flag = false;
            this.uploadSVGs.forEach(svg => {
                if (svg.map.toLowerCase().split(svg.id).length <= 1) {
                    flag = true;
                }
            });
            return flag;
        } else {
            return false;
        }
    }

    // 关闭时标记拨为false 且取消mall 的transform
    cancelTransform() {
        this.editShow = false;
        // this.mallSelection.style('transform', null);
    }

    // 清空航站楼操作数据
    clearUpload() {
        setTimeout(() => {
            this.filterRows = [];
            this.selectedSvg = [];
        }, 1000);
    }

    // 关闭面板
    closeEditPanel() {
        this.cancelTransform();
    }

    // 清除pathList
    clearPathList() {
        this.resetSelectedSvgElements();
    }

    // 进入航站楼编辑
    editPanelShow() {
        if (!this.editShow) {
            this.expandPanel = 0;
        }
        this.editShow = true;
        this.resetMap();
    }


    /** 上传文件 多文件上传 拖拽 zip*/
    // 取消默认拖动事件 浏览器会自动打开
    cancelExplorerProgram() {
        document.addEventListener('drop', event => {
            event.stopPropagation();
            event.preventDefault();
        }, false);
        document.addEventListener('dragover', event => {
            event.stopPropagation();
            event.preventDefault();
        }, false);
    }

    // 获取用户名和缓存key
    getUsernameAndStorageKeys() {
        this.username = sessionStorage.getItem('username');
        this.animationKey = 'animation' + this.username;
        this.historyKey = 'search' + this.username;
    }

    // 启用动画 同排范围内左右
    sortAnimation(leftIndex, rightIndex, leftClass, rightClass) {
        const left = d3.select('.svg-preview:nth-child(' + leftIndex + ')');
        const right = d3.select('.svg-preview:nth-child(' + rightIndex + ')');
        if (left.node().offsetTop === right.node().offsetTop) {
            left.classed(leftClass, true);
            right.classed(rightClass, true);
            setTimeout(() => {
                left.classed(leftClass, false);
                right.classed(rightClass, false);
                this.uploadSVGs.sort((a, b) => a.order - b.order);
            }, 600);
        } else {
            this.uploadSVGs.sort((a, b) => a.order - b.order);

        }
    }

    // 像html中写入svg
    writeMapToHtml(length, index, svg) {
        if (document.getElementById(svg.id)) {
            const container = d3.select('#' + svg.id);
            container.html(svg.map);
            // this.mapOverwrite = true;
            container.select('svg').style('opacity', 0);
            this.mapLoading = true;
        }
    }

    // 观察语言切换事件
    onLanguageChange() {
        this.translate.onLangChange.pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
            this.initShortcutKeys();
        });
    }

    // 展示快捷键弹框
    showShortcutKeys(keyboard) {
        this.dialog.open(keyboard, {width: '500px'});
    }

    // 获取快捷键数据
    initShortcutKeys() {
        this.translate.get('airport.shortcutKeys').subscribe(res => {
            this.shortcutKeys.all = [
                {shortcut: res['enterMap'], keyboard: 'Enter'},
                {shortcut: res['goBack'], keyboard: 'Home'},
                {shortcut: res['changeRotating'], keyboard: 'End'},
            ];
            this.shortcutKeys.map = [
                {shortcut: res['nav'], keyboard: '↑ ↓ ← →'},
                {shortcut: res['resetMap'], keyboard: 'Backspace'},
                {shortcut: res['zoomIn'], keyboard: '+'},
                {shortcut: res['drag'], keyboard: this.translate.instant('airport.keyboards.drag')},
                {shortcut: res['zoomOut'], keyboard: '-'},
                {shortcut: res['upFloor'], keyboard: 'PageUp'},
                {shortcut: res['downFloor'], keyboard: 'PageDown'},
            ];
            this.shortcutKeys.share = [
                {shortcut: res['zoomIn'], keyboard: this.translate.instant('airport.keyboards.zoomIn')},
                {shortcut: res['zoomOut'], keyboard: this.translate.instant('airport.keyboards.zoomOut')},

            ];
        });

    }

    // 响应式缩放改变初始比例
    onResize() {
        this.resetTargetZoom();
    }

    // 开关动画
    rotatingChange() {
        this.animationOff = !this.animationOff;
        this.animationOn = !this.animationOn;
        localStorage.setItem(this.animationKey, JSON.stringify({
            animationOn: this.animationOn,
            animationOff: this.animationOff
        }));
    }

    /**拖放平移操作 快捷键 zoom and drag*/

    // 总览界面快速开始按钮
    addQuickStartToDom() {
        d3.select('#mallContainer').on('keydown', () => {
            switch (d3.event.code) {
                case 'Enter': {
                    d3.event.preventDefault();
                    switch (this.selectedTerminal) {
                        case 0: {
                            if (this.selectIndex > 2) {
                                this.selectIndex = 2;
                            }
                            break;
                        }
                        case 1: {
                            if (this.selectIndex > 3) {
                                this.selectIndex = 3;
                            }
                            break;
                        }
                    }
                    this.selectFloor(this.selectIndex);
                    break;
                }
                case 'End': {
                    d3.event.preventDefault();
                    this.animationOff = !this.animationOff;
                    this.animationOn = !this.animationOn;
                    break;
                }
                case 'Home': {
                    d3.event.preventDefault();
                    this.closeEditPanel();
                    break;
                }
            }
        });
    }

    // 组件销毁取消全局dom监听 以及观察者
    ngOnDestroy(): void {
        d3.select(document).on('#mallContainer', null); // 取消对全局document的监听
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // toggleFix() {
    //     this.fixSlide = !this.fixSlide;
    // }

    // 地图遥控器进入离开隐藏显示
    onMouseEnterLeave(event) {
        switch (event.type) {
            case 'mouseenter': {
                if (this.slideTimeStamp) {
                    clearTimeout(this.slideTimeStamp);
                }
                // if (!this.fixSlide) {
                this.slideOnOff = false;
                // }
                break;
            }
            case 'mouseleave': {
                this.slideTimeStamp = setTimeout(() => {
                    // if (!this.fixSlide) {
                    this.slideOnOff = true;
                    // }
                }, 1000);
                break;
            }

        }
    }


    // 根据选择航站楼和楼层 的translateY的距离来修改拖动初始点
    initOrResetTargetPosition() {
        this.target.position = {x: 0, y: 0};
    }

    resetTargetZoom() {
        if (window.innerWidth >= 1280) { // 根据分辨率决定基础缩放比例
            this.target.zoom = 0.7;
            this.editTarget.zoom = 0.4;
        } else if (window.innerWidth >= 960) {
            this.target.zoom = 0.6;
            this.editTarget.zoom = 0.4;
        } else if (window.innerWidth >= 600) {
            this.target.zoom = 0.5;
            this.editTarget.zoom = 0.4;
        } else {
            this.editTarget.zoom = 0.3;
            this.target.zoom = 0.3;
        }
    }

    // 添加drag可拖动
    addD3DragListener() {
        this.mallSelection.selectAll('svg').call(d3.drag().on('drag', () => {
            // this.clearTransition();
            this.svgSelection.style('cursor', 'grab');
            this.resetSvgSelectionTransition();
            this.target.position.x += Math.round(d3.event.dx / this.target.zoom);
            this.target.position.y += Math.round(d3.event.dy / this.target.zoom);
            // window.webkitRequestAnimationFrame(() => {
            this.svgSelection.style('transform', 'translate(' + this.target.position.x + 'px,' + this.target.position.y + 'px)');
            if (d3.event.dx > 0) {
                this.letButtonsClicked('rightNav');
            } else if (d3.event.dx < 0) {
                this.letButtonsClicked('leftNav');
            }
            if (d3.event.dy > 0) {
                this.letButtonsClicked('downNav');
            } else if (d3.event.dy < 0) {
                this.letButtonsClicked('upNav');
            }
            // });
        }));

    }

    // 触发按钮点击效果
    letButtonsClicked(navigate) {
        const selection = d3.select('#' + (navigate));
        selection.classed('button-clicked', true);
        setTimeout(() => {
            selection.classed('button-clicked', false);
        }, 200);
    }

    // 恢复选中svg transition
    resetSvgSelectionTransition() {
        this.svgSelection.style('transition', 'transform 0.6s');
    }

    // 清除选中svg transition
    clearSvgSelectionTransition() {
        this.svgSelection.style('transition', 'transform 0s');
    }

    // 地图方向按键
    mapNavigate(navigate) {
        this.clearSvgSelectionTransition();
        this.svgSelection.style('cursor', 'grab');
        switch (navigate) {
            case 'up': {
                this.target.position.y += -Math.round(20 / this.target.zoom);
                break;
            }
            case 'down': {
                this.target.position.y += Math.round(20 / this.target.zoom);
                break;
            }
            case 'left': {
                this.target.position.x += -Math.round(20 / this.target.zoom);
                break;
            }
            case 'right': {
                this.target.position.x += Math.round(20 / this.target.zoom);
                break;
            }

        }
        this.svgSelection.style('transform', 'translate(' + this.target.position.x + 'px,' + this.target.position.y + 'px)');
    }

    // 地图缩放按键
    mapZoom(zoom) {
        switch (zoom) {
            case 'in': {
                this.target.zoom += 0.1;
                break;
            }
            case 'out': {
                this.target.zoom += -0.1;
                break;
            }
        }
        // this.clearTransition();
        if (this.svgSelection) {
            this.svgSelection.style('cursor', 'all-scroll');
        }
        if (this.target.zoom < 0.3) {
            this.target.zoom = 0.3;
        } else if (this.target.zoom > this.zoomMax) {
            this.target.zoom = this.zoomMax;
        }
        this.mallSelection.style('transition', 'unset');
        if (this.mapSelected) {
            // webkitRequestAnimationFrame(() => {
            this.mallSelection.style('transform', ' scale(' + this.target.zoom + ')');
            // });
        } else { // 如果整体图时修改了缩放，则缓存
            this.target.mallZoom = this.target.zoom;
            localStorage.setItem(this.username + 'MallZoom', JSON.stringify(this.target.mallZoom));
            this.mallSelection.style('transform', 'rotateX(65deg) skewX(-5deg) scale(' + this.target.zoom + ')');
        }
    }

    // 重置地图
    resetMap() {
        if (this.mapSelected) { // 操作地图时
            this.resetTargetZoom();
            this.initOrResetTargetPosition();
            this.svgSelection.style('cursor', 'pointer');
            this.mallSelection.style('transform', ' scale(' + this.target.zoom + ')');
            this.svgSelection.style('transform', 'translate(' + this.target.position.x + 'px,' + this.target.position.y + 'px)');
        } else { // 总览图下
            // this.resetTargetZoom();
            // this.initOrResetTargetPosition();
            this.changeToMallTransition();
            // this.mallSelection.style('transform', null);
            // this.mallSelection.style('transform', 'rotateX(65deg) translateX(-120px)  skewX(-5deg)  scale(' + this.editTarget.zoom + ')');
        }
    }

    // 方法触发按钮点击效果
    letButtonChange(elementId, navigate?) {
        const selection = d3.select('#' + (elementId));
        selection.classed('button-clicked', true);
        if (elementId === 'resetMap') {
            this.resetMap();
        } else if (navigate === 'in' || navigate === 'out') {
            this.mapZoom(navigate);
        } else {
            this.mapNavigate(navigate);
        }
        setTimeout(() => {
            selection.classed('button-clicked', false);
        }, 200);
    }

    // 添加地图操作快捷键
    addD3ShortcutKeysListener() {
        this.container = d3.select('#mallContainer');
        this.container.on('keydown', () => {
            this.clearSvgSelectionTransition();
            switch (d3.event.code) {
                case 'ArrowUp': {
                    d3.event.preventDefault();
                    this.letButtonChange('upNav', 'up');
                    break;
                }
                case 'ArrowDown': {
                    d3.event.preventDefault();
                    this.letButtonChange('downNav', 'down');
                    break;
                }
                case 'ArrowLeft': {
                    d3.event.preventDefault();
                    this.letButtonChange('leftNav', 'left');
                    break;
                }
                case 'ArrowRight': {
                    d3.event.preventDefault();
                    this.letButtonChange('rightNav', 'right');
                    break;
                }
                case 'Backspace': {
                    d3.event.preventDefault();
                    this.letButtonChange('resetMap');
                    break;
                }
                case 'Equal':
                case 'NumpadAdd': {
                    d3.event.preventDefault();
                    this.letButtonChange('zoomIn', 'in');
                    break;
                }
                case 'Minus':
                case 'NumpadSubtract': {
                    d3.event.preventDefault();
                    this.letButtonChange('zoomOut', 'out');
                    break;
                }
                case 'PageUp': {
                    d3.event.preventDefault();
                    this.changeSelectedFloor('up');
                    this.letButtonsClicked('upFloor');
                    break;
                }
                case 'PageDown': {
                    d3.event.preventDefault();
                    this.changeSelectedFloor('down');
                    this.letButtonsClicked('downFloor');
                    break;
                }
                case 'Home': {
                    d3.event.preventDefault();
                    this.returnAll();
                    this.letButtonsClicked('returnAll');
                    break;
                }
            }
        });
    }

    // 添加缩放监听
    addD3ZoomListener() {
        const container = d3.select('#mallContainer');
        this.mallSelection = d3.select('#mall');
        container.call(d3.zoom().on('zoom', () => {
            if (this.editShow) {
                return;
            }
            this.changeToScaleTransition();
            if (this.svgSelection) {
                this.svgSelection.style('cursor', 'all-scroll');
            }
            let selection;
            if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'wheel') {
                this.target.zoom += d3.event.sourceEvent.deltaY > 0 ? -0.1 : 0.1;
                if (this.target.zoom < 0.3) {
                    this.target.zoom = 0.3;
                } else if (this.target.zoom > this.zoomMax) {
                    this.target.zoom = this.zoomMax;
                }
                if (this.mapSelected) {
                    // webkitRequestAnimationFrame(() => {
                    this.mallSelection.style('transform', ' scale(' + this.target.zoom + ')');
                    // });
                } else {
                    this.target.mallZoom = this.target.zoom;
                    localStorage.setItem(this.username + 'MallZoom', JSON.stringify(this.target.mallZoom));
                    this.mallSelection.style('transform', 'rotateX(65deg) skewX(-5deg) scale(' + this.target.zoom + ')');
                }
                if (d3.event.sourceEvent.wheelDelta > 0) {
                    selection = d3.select('#zoomIn');
                    selection.classed('button-clicked', true);
                } else {
                    selection = d3.select('#zoomOut');
                    selection.classed('button-clicked', true);
                }
                setTimeout(() => {
                    selection.classed('button-clicked', false);
                }, 200);

            }
        }));
    }

    // 楼层显示按钮控制楼层
    selectFloor(i) {
        if (this.dialogStamp) {
            clearTimeout(this.dialogStamp);
        }
        if (!this.terminalOn) {
            return;
        }
        if (this.floorTimestamp) {
            clearTimeout(this.floorTimestamp);
        }
        this.floorTimestamp = setTimeout(() => {
            const mall = document.getElementById('mall');
            if (this.mapSelected) {
                this.selectIndex = i;
                this.changeSelected();
            } else {
                this.mallSelection = d3.select(mall);
                this.totalSvgNodes = this.mallSelection.selectAll('svg')._groups[0];
                this.selectSvg(mall, this.totalSvgNodes[i]);
            }
        }, 300);

    }


    // 切换选中楼层
    changeSelectedFloor(upDown?) {
        if (this.dialogStamp) {
            clearTimeout(this.dialogStamp);
        }
        if (this.changeFloorStamp) {
            clearTimeout(this.changeFloorStamp);
        }
        this.changeFloorStamp = setTimeout(() => {
            if (upDown === 'up') {
                this.selectIndex + 1 < this.totalSvgNodes.length ? this.selectIndex = this.selectIndex + 1 : this.selectIndex = 0;
            } else if (upDown === 'down') {
                this.selectIndex - 1 >= 0 ? this.selectIndex = this.selectIndex - 1 : this.selectIndex = this.totalSvgNodes.length - 1;
            }
            this.changeSelected();

        }, 300);

    }

    // 改变已选楼层
    changeSelected() {
        this.changeFloor = true;
        this.getFloorSelected();
        this.initOrResetTargetPosition();
        this.svgSelection.style('cursor', 'pointer');
        // d3.select(this.svgSelection.node().parentNode).classed(this.chosenClass, false);
        this.totalSvgNodes.forEach((item, index) => {
            const limit = 3;
            if (index < this.selectIndex) { // 下方按距离增加下移延迟 切换时需要少延时 否则地图会重叠
                if (this.totalSvgNodes.length - (this.selectIndex - index) > limit) {
                    item.parentNode.style.transitionDelay = limit * 0.2 + 's';

                } else {
                    item.parentNode.style.transitionDelay = (this.totalSvgNodes.length - (this.selectIndex - index)) * 0.1 + 's';
                }
                item.parentNode.style.opacity = 0;
                item.parentNode.style.transform = 'translateZ(-1000px) translateY(2000px)';
            } else if (index > this.selectIndex) { // 上方
                if (this.totalSvgNodes.length - (index - this.selectIndex) > limit) {
                    item.parentNode.style.transitionDelay = limit * 0.2 + 's';
                } else {
                    item.parentNode.style.transitionDelay = (this.totalSvgNodes.length - (index - this.selectIndex)) * 0.1 + 's';
                }
                item.parentNode.style.opacity = 0;
                item.parentNode.style.transform = 'translateZ(1000px) translateY(-2000px)';
            } else {
                item.parentNode.style = null;
                this.svgSelection = d3.select(item);
                // this.chosenClass = this.svgSelectClasses[this.selectIndex];
                d3.select(item.parentNode).classed(this.chosenClass, true);
                // d3.select(item.parentNode).classed('after-hide', false);
            }
            // if (index !== this.selectIndex) {
            //     d3.select(item.parentNode).classed('after-hide', true);
            // }
        });
        this.addD3DragListener();
        this.cancelPathSelected();
        this.floorSelected();
        setTimeout(() => { // 切换楼层地标图标动画
            this.changeFloor = false;
        }, 300);
    }

    // 清除楼层显示
    clearFloorSelected() {
        this.floors.forEach(item => item.selected = false);
    }

    // 楼层显示按钮状态
    getFloorSelected() {
        this.floors.forEach((item, index) => {
            item.selected = index === this.selectIndex;
        });
    }


    // 处理选中和非选中效果
    selectSvg(mall, target) {
        this.mallSelection.node().style = null;
        this.changeToMallTransition();
        this.mallSelection = d3.select(mall);
        this.totalSvgNodes = this.mallSelection.selectAll('svg')._groups[0];
        this.totalSvgNodes.forEach((item, index) => {
            if (item === target) {
                this.selectIndex = index;
                this.svgSelection = d3.select(item);
                d3.select(item.parentNode).classed(this.chosenClass, true);
                // this.chosenClass = this.svgSelectClasses[index];
            }
            const limit = 3; // 最大间隔
            if (index < this.selectIndex) { // 下方按距离增加下移延迟
                if (this.totalSvgNodes.length - (this.selectIndex - index) > limit) {
                    item.parentNode.style.transitionDelay = limit * 0.1 + 's';
                } else {
                    item.parentNode.style.transitionDelay = (this.totalSvgNodes.length - (this.selectIndex - index)) * 0.1 + 's';
                }
            } else if (index > this.selectIndex) { // 上方
                if (this.totalSvgNodes.length - (index - this.selectIndex) > limit) {
                    item.parentNode.style.transitionDelay = limit * 0.1 + 's';
                } else {
                    item.parentNode.style.transitionDelay = (this.totalSvgNodes.length - (index - this.selectIndex)) * 0.1 + 's';
                }
            }
        });
        this.initOrResetTargetPosition();
        this.resetTargetZoom();
        this.getFloorSelected();
        this.addD3DragListener();
        this.addD3ShortcutKeysListener();
        // if (this.svgSelection) {
        //     this.svgSelection.classed(this.chosenClass, true); // 添加选中的对应class 处理摆放位置
        // }
        this.floorSelected();
        setTimeout(() => {
            this.totalSvgNodes.forEach((item, index) => {
                if (index < this.selectIndex) { // 下方按距离增加下移延迟
                    item.parentNode.style.opacity = 0;
                    item.parentNode.style.transform = 'translateZ(-1000px) translateY(2000px)';
                } else if (index > this.selectIndex) { // 上方
                    item.parentNode.style.opacity = 0;
                    item.parentNode.style.transform = 'translateZ(1000px) translateY(-2000px';
                }
                // if (index !== this.selectIndex) {
                //     setTimeout(() => {
                //         item.parentNode.style.display = 'none';
                //     }, 500);
                // }
            });
            this.mapSelected = true; // 选中地图进入编辑
        }, 300);
        this.animationOn = false;
    }

    // svg元素添加点击事件
    addClickEvent() {
        const mall = document.getElementById('mall');
        this.mallSelection = d3.select(mall);
        this.mallSelection.selectAll('svg').on('click', () => {
            if (this.editShow) {
                return;
            }
            if (!this.mapSelected) {
                if (d3.event.target.viewportElement) {
                    this.selectSvg(mall, d3.event.target.viewportElement);
                } else {
                    this.selectSvg(mall, d3.event.target);
                }
            } else { // 已经选择了地图
                this.svgSelection.style('cursor', 'pointer');
                if (d3.event.target.id) {
                    const id = d3.event.target.id.replace('P', 'S');
                    const path = this.pathList.find(item => item.areaNo === id);
                    if (path) {
                        this.enterMapByPath(path);
                    }
                    // } else if (d3.event.target.parentNode.id) {
                    //     console.log(d3.event.target);
                    //     const id = d3.event.target.parentNode.id.replace('P', 'S');
                    //     const path = this.filterPathList.find(item => item.areaNo === id);
                    //     if (path) {
                    //         this.enterMapByPath(path);
                    //     }
                }
            }
        });
    }

    // 单元号、商户对应
    relationStore(area: Path) {
        const path = this.pathList.find(i => i.areaNo === area.areaNo);
        const relationVm = {areaNo: path.areaNo, storeDTO: this.selectStore};
        if (this.selectStore.areaNo) { // 如果选择的为已对应商户
            this.mapService.deleteRelation(this.selectStore.areaNo, this.selectStore.storeNo).subscribe(res => {
                if (res && res.status) {
                    this.mapService.relationStore(relationVm).pipe(takeUntil(this._unsubscribeAll)).subscribe(r => {
                        if (r && r.status === 200) {
                            this.getCorrespondingStores(true, path);
                        }
                    });
                }
            });
        } else {
            this.mapService.relationStore(relationVm).pipe(takeUntil(this._unsubscribeAll)).subscribe(r => {
                if (r && r.status === 200) {
                    this.getCorrespondingStores(true, path);
                }
            });
        }
    }

    // 商户信息对应
    openCorresponding(path: Path) {
        if (this.dialogStamp) {
            clearTimeout(this.dialogStamp);
        }
        this.dialogStamp = setTimeout(() => {
            // this.closeMapEdit();
            if (!this.dialog.getDialogById('onlyDialog')) {
                this.dialog.open(this.corresponding, {id: 'onlyDialog'}).afterClosed().subscribe(res => {
                    if (res) {
                        if (!this.selectStore.areaNo) {
                            this.relationStore(path);
                        } else {
                            this.dialog.open(this.cDialog, {
                                id: 'cDialog',
                                width: '500px'
                            }).afterClosed().pipe(takeUntil(this._unsubscribeAll)).subscribe(choice => {
                                if (choice) {
                                    this.relationStore(path);
                                } else {
                                    this.openCorresponding(path);
                                }
                            });
                        }
                    } else {
                        this.clearStoreInput();
                    }
                });
            }
        }, this.mapSelected ? 0 : 1500);
    }

    // 清除列表顺序
    clearStoreInput() {
        this.inputValue = '';
        this.selectStore = null;
        this.selectStores = [];
    }

    // 切换为总览的延时 比较多
    changeToMallTransition() {
        this.mallTransition = true;
        this.transitionScale = false;
    }

    // 切换为缩放的延时 比较少
    changeToScaleTransition() {
        // this.mallSelection.style('transition', 'transform 0.8s, opacity 0.8s');
        this.transitionScale = true;
        this.mallTransition = false;
    }

    // 回到全地图模式
    returnAll() {
        if (this.dialogStamp) {
            clearTimeout(this.dialogStamp);
        }

        if (this.changeTimestamp) {
            clearTimeout(this.changeTimestamp);
        }
        this.changeTimestamp = setTimeout(() => {
            this.changeToMallTransition();
            this.clearFloorSelected();
            this.initOrResetTargetPosition();
            this.target.zoom = 0.7;
            if (!this.animationOff) {
                this.animationOn = true;
            }
            this.addQuickStartToDom(); // 移除选中情况下的监听并添加全景图下的快捷键
            this.mapSelected = false;
            this.pathClicked = false;

            this.totalSvgNodes.forEach(item => {
                d3.select(item.parentNode).classed(this.chosenClass, false);
            });
            if (this.mallSelection) {
                this.mallSelection.node().style = null;
                this.mallSelection.selectAll('svg').on('.drag', null);
                if (this.target.mallZoom) { // 如果有商场缩放缓存
                    this.target.zoom = this.target.mallZoom;
                    this.mallSelection.style('transform', 'rotateX(65deg) skewX(-5deg) scale(' + this.target.zoom + ')');
                }
            }
            this.svgSelection = null;
            if (this.effectiveAreas.length > 0) {
                this.effectiveAreas.forEach(item => d3.select('#' + item).classed('path-hover', false));
            }
            this.cancelPathSelected();
            this.resetPath();
            this.searchComponent.clearInput();
            this.setSvgContentPosition(true);
        }, 300);
    }

    // 侧边栏控制
    foldSidebar() {
        this.sidebarService.getSidebar('carded-right-sidebar-2').toggleFold();
    }

    openSidebar() {
        this.sidebarService.getSidebar('carded-right-sidebar-2').toggleOpen();
    }
}


// 地图单元类
export class Path {
    areaNo: string;
    storeNo: string;
    businessType: BusinessType = new BusinessType();
    storeName: string;
    selected: boolean;
    corresponding: boolean;
}

// 上传svg预览类
export class SvgPreview {
    name: string;
    id?: string;
    imgUrl: any;
    order: number;
    file?: any;
    map?: string;
}

// 地图更新内容
export class MapChange {
    id: string;
    oldMap?: any;
    newMap?: any;
    changes?: Change[];
}

export class Change {
    id: string;
    add?: boolean;
    delete?: boolean;
}

// 业态
export class BusinessType {
    id?: string;
    name: string;
    color?: string;

    constructor(id?: string, name?: string, color?: string) {
        this.id = id;
        this.name = name;
        this.color = color;
    }
}

// 历史数据类
export class SvgHistory {
    fileName: string;
    uploadPerson: string;
    uploadTime: string;
    sourceName: string;
    selected: boolean;
}

export class Store {
    id: string;
    areaNo: string;   // 单元号
    brandCN: string; // 品牌中文名
    brandEN: string; // 品牌英文名
    businessType: string; // 业态
    businessTypeId: any;
    secondType: string;
    secondTypeId: string;
    floor: string; // 楼层
    lastModifiedBy: string; // 修改人
    lastModifiedDate: string; // 修改时间
    showName: string;  // 显示名称
    storeName: string; // pos商户名称
    storeNo: string;  // pos商户编号
    terminalName: string; // 街区名称
    terminalNo: string; // 街区代号
    terminalId: string; // 街区编号
    mallId: string;
    mallName: string;
    createdBy: string;  // 创建人
    createdDate: string; // 创建时间
    enabled: boolean;  // 是否有效
    logo: string;       // logo
    source: string;  // 来源
    desc: string; // 描述
}

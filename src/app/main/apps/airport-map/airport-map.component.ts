import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {SidebarService} from '../../../../@fuse/components/sidebar/sidebar.service';
import * as d3 from 'd3';
import {fuseAnimations} from '../../../../@fuse/animations';
import {TranslateService} from '@ngx-translate/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {concat, forkJoin, Observable, Subject, Subscription} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';
import * as JSZip from 'jszip/dist/jszip.js';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {HistorySearchComponent} from '../../../components/history-search/history-search.component';
import {moveItemInArray} from '@angular/cdk/drag-drop';
import {TerminalService} from '../../../services/terminalService/terminal.service';
import {FuseProgressBarService} from '../../../../@fuse/components/progress-bar/progress-bar.service';
import {FileDownloadService} from '../../../services/file-download.service';
import {DomSanitizer} from '@angular/platform-browser';
import {DateTransformPipe} from '../../../pipes/date-transform/date-transform.pipe';


@Component({
    selector: 'app-airport-map',
    templateUrl: './airport-map.component.html',
    styleUrls: ['./airport-map.component.scss'],
    animations: fuseAnimations
})
export class AirportMapComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject();
    private uploadEnd: Subject<any> = new Subject(); // 异步读取选择上传的文件时的可观察对象
    private initEnd: Subject<any> = new Subject(); // 异步初始化地图数据
    private loadEndSubscription: Subscription;
    selectedTerminal = 0;
    terminals = [];
    unInitTerminals = [
        {terminalNo: 'T1', floors: 3},
        {terminalNo: 'T2', floors: 4},
        {terminalNo: 'T3', floors: 6}
    ];
    floors = [3, 4, 6]; // 航站楼楼层数
    floorButtons1 = []; // t1楼层按钮
    floorButtons2 = []; // t2
    floorButtons3 = []; // t3
    mallTransition = false; // 加载svg图后开启transition过渡动画
    transitionScale = false;
    mapSelected = false; // 是否选中地图
    svgSelection; // 当前选中地图层
    selectIndex = 0; // 当前地图索引
    mallSelection; // 商场div节点
    totalSvgNodes; // 所有svg节点
    svgSelectClasses = [];

    // timeStamps
    changeTimestamp;
    slideTimeStamp;
    terminalStamp;
    floorTimestamp;
    changeFloorStamp;
    dialogStamp; // 商户对应弹框时间戳
    clearTimeStamp; // 返回清空操作时候的时间戳

    chosenClass = '';
    container; // 总容器
    animationOn = true; // 动画样式添加
    animationOff = false; // 是否关闭动画
    slideOnOff = true;
    shortcutKeys: any = {all: [], map: [], share: []}; // 快捷鍵

    // upload svg
    // div containers
    t1Ids: string[] = ['t1-f1', 't1-f2', 't1-f3'];
    t2Ids: string[] = ['t2-b1', 't2-f1', 't2-f2', 't2-f3'];
    t3Ids: string[] = ['t3-b1', 't3-f1', 't3-f2', 't3-f3', 't3-f4', 't3-f5'];
    buttons = [ // 所有楼层按钮
        {title: 'B1', selected: false},
        {title: 'F1', selected: false},
        {title: 'F2', selected: false},
        {title: 'F3', selected: false},
        {title: 'F4', selected: false},
        {title: 'F5', selected: false}
    ];
    uploadFiles: SvgPreview[] = []; // 上传的内容
    uploadMaps: SvgPreview[] = []; // 上传的svg内容
    uploadSVGs: SvgPreview[] = []; // 上传的svg文件 重新写入的
    initMaps: SvgPreview[] = []; // 获取航站楼数据
    filesLength: number[] = [3, 4, 6];
    terminalOn = false; // 是否加载了地图
    leftOrRight = ''; // t2切换时左右转场动画
    mapLoading = true;
    username = ''; // 登录用户名
    tKey = '';
    t1Key = '';
    t2Key = '';
    t3Key = '';
    animationKey = '';
    historyKey = '';
    // pathListKey = ''; // 地图绑定数据key
    cacheOn = true; // 是否缓存地图
    createShow = false; // 是否创建模式
    createForm: FormGroup;
    editShow = false; // 是否编辑模式
    editForm: FormGroup;
    expandPanel = 0; // 展开的折叠面板
    obeyRule = 0; // 文件上传时遵守了编号规则
    mapOverwrite = false; // 是否重新写入了地图
    onUploading = false; // 是否在上传
    onSaving = false; // 是否在保存
    onlyEnoughMessage;  // snackBar 唯一实例
    mapChanges: MapChange[] = []; // 地图更新内容
    filterRows: SvgHistory[] = [];
    rows: SvgHistory[] = [];
    columns = [
        {name: 'fileName'},
        {name: 'uploadPerson'},
        {name: 'uploadTime'}
    ];
    historyLoaded = false;
    selectedSvg = [];

    // 地图商户编辑
    mapEditShow = false; // 是否是编辑模式
    pathSelection;  // path商户区域选中 带id的
    pathList: Path[] = []; // 总单元数据list
    bTypePathList: any[] = []; // 总业态列表
    filterBTypePathList = []; // 显示的列表
    searchBTypePathList = []; // 查询的筛选列表
    noTypePathList: any = {name: 'airport.bType.noType', pathList: [], color: '#aaaaaa', folded: false}; // 无业态总列表
    filterNoTypeList: any = {name: 'airport.bType.noType', pathList: [], color: '#aaaaaa', folded: false}; // 显示的列表
    searchNoTypeList: any = {name: 'airport.bType.noType', pathList: [], color: '#aaaaaa', folded: false}; // 筛选的总列表
    enterTimestamp; // 搜索列表时间戳
    pathClicked = false; // 点击单元时立即取消商场编辑
    imgSrc: any = '';
    logoFile: File;
    visible = true;
    tags = [];
    selectedTags = [];

    // 商户对应列表
    page = {page: 0, size: 5, count: 0}; // 分页
    storeColumns = [{name: 'storeNo'}, {name: 'storeName'}, {name: 'areaNo'}, {name: 'terminalNo'}, {name: 'terminalName'}, {name: 'source'}]; // 行头
    stores: Store[] = [];
    correspondingStores: Store[] = [];
    businessTypes: BusinessType[] = [];
    bTypeColors = [];
    storeNameControl = new FormControl({value: '', disabled: true});
    addBusinessType = false; // 是否添加业态
    editBusinessType = false; // 修改业态
    editBType: BusinessType = new BusinessType('', '', '#000000');
    selectType: BusinessType;

    historySearch = []; // 搜索历史
    inputValue = ''; // 搜索框值绑定
    selectStore: Store = null; // 选择对应的店铺
    selectStores = [];
    isCurrent = false; // 是否是当前的商户编号
    currentPath: Path = null; // 当前选中的单元
    changeFloor = false;

    storeForm: FormGroup;


    // transform变换
    target = {
        position: {x: 0, y: 0},
        zoom: 0.7
    };
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


    constructor(
        private sidebarService: SidebarService,
        private translate: TranslateService,
        public dialog: MatDialog,
        private snackBar: MatSnackBar,
        private sanitizer: DomSanitizer,
        private terminal: TerminalService,
        private loading: FuseProgressBarService,
        private fileDownload: FileDownloadService,
        private dateTransform: DateTransformPipe
    ) {
        // 创建航站楼
        this.createForm = new FormBuilder().group({
            terminalNo: new FormControl('', []),
            floors: new FormControl({value: '', disabled: true}, []),
            terminalName: new FormControl('', [Validators.required]),
            address: new FormControl('', []),
            desc: new FormControl('', [])
        });
        // 航站楼编辑
        this.editForm = new FormBuilder().group({
            id: new FormControl('', []),
            terminalNo: new FormControl({value: '', disabled: true}, []),
            floors: new FormControl({value: '', disabled: true}, []),
            terminalName: new FormControl('', [Validators.required]),
            address: new FormControl('', []),
            desc: new FormControl('', [])
        });
        // 地图编辑
        this.storeForm = new FormBuilder().group({
            id: new FormControl('', []),
            areaNo: new FormControl({value: '', disabled: true}, []),
            storeNo: new FormControl('', []),
            storeName: new FormControl('', []),
            brandCN: new FormControl('', []),
            brandEN: new FormControl('', []),
            showName: new FormControl('', []),
            searchName: new FormControl({value: '', disabled: true}, []), // 搜索别名
            businessType: new FormControl({value: ''}, []), // 业态
            desc: new FormControl('', []),
            createdBy: new FormControl({value: '', disabled: true}, []),
            createdDate: new FormControl({value: '', disabled: true}, []),
            lastModifiedBy: new FormControl({value: '', disabled: true}, []),
            lastModifiedDate: new FormControl({value: '', disabled: true}, []),
        });
    }

    ngOnInit() {
        // 异步监听器、可观测方法
        this.onInitEnd();
        this.onLanguageChange();
        this.addD3ZoomListener();
        this.onTerminalNoChange();
        // 初始化方法
        this.searchTerminalList();
        this.initShortcutKeys();
        this.cancelExplorerProgram();
        this.getUsernameAndStorageKeys();
        this.initConfig();
        this.resetTargetZoom();
        this.getSvgSelectClasses();
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

    // 选择新建航站楼 获取其楼层
    onTerminalNoChange() {
        this.createForm.get('terminalNo').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            const terminal = this.unInitTerminals.find(item => item.terminalNo === res);
            if (terminal) {
                this.createForm.get('floors').patchValue(terminal.floors);
            }
        });
    }

    /** 初始化方法*/

    // 初始化下载svg地图包
    onInitEnd() {
        this.initEnd.pipe(takeUntil(this._unsubscribeAll), debounceTime(1000)).subscribe(res => {
            const t1 = [];
            const t2 = [];
            const t3 = [];
            this.initMaps.forEach(svg => {
                if (this.t1Ids.includes(svg.id)) {
                    t1.push(svg);
                } else if (this.t2Ids.includes(svg.id)) {
                    t2.push(svg);
                } else if (this.t3Ids.includes(svg.id)) {
                    t3.push(svg);
                }
            });
            if (t1.length > 0) {
                sessionStorage.setItem(this.t1Key, JSON.stringify(t1));
            }
            if (t2.length > 0) {
                sessionStorage.setItem(this.t2Key, JSON.stringify(t2));
            }
            if (t3.length > 0) {
                sessionStorage.setItem(this.t3Key, JSON.stringify(t3));
            }
            this.initTerminal();
            this.showEmptyTips();
            this.getButtons();

            this.addQuickStartToDom();
        });
    }

    // 获取航站楼对应单元号的商户
    getCorrespondingStores(reset?, originPath?) {
        if (reset) {
            this.pathList.forEach(item => {
                item.storeName = '';
                item.storeNo = '';
                item.businessType = new BusinessType();
                item.corresponding = false;
            });
        }
        const terminalNo = this.getTerminalNo();
        this.terminal.searchStoreLists(terminalNo, 0, 0x3f3f3f3f, 'lastModifiedDate,desc').pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                this.correspondingStores = res.content;
                this.correspondingStores.forEach(store => {
                    const path = this.pathList.find(item => item.areaNo === store.areaNo);
                    if (path) {
                        path.storeName = store.storeName;
                        path.storeNo = store.storeNo;
                        path.corresponding = true;
                        path.businessType.name = store.businessType;
                    }
                });
                if (originPath) { // 如果传入了path 为商户对应时候
                    const path = this.pathList.find(item => item.areaNo === originPath.areaNo);
                    this.enterMapDetail(path);
                }
                this.setBTypeColor(reset);
            }
        }, error => {

        });
    }

    // 初始化一些用户设置 比如动画开关等
    initConfig() {
        if (localStorage.getItem(this.animationKey)) {
            this.animationOn = JSON.parse(localStorage.getItem(this.animationKey)).animationOn;
            this.animationOff = JSON.parse(localStorage.getItem(this.animationKey)).animationOff;
        }
    }

    // 获取业态
    getBusinessTypes(businessType?) {
        this.terminal.getTypeList().pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.businessTypes = [];
            if (res) {
                res.forEach(item => {
                    const type = {id: item.id, name: item.name, color: item.color};
                    this.businessTypes.push(type);
                });
            }
            const selected = this.businessTypes.find(item => item.name === businessType);
            if (selected) { // 如果已有业态则选中
                this.storeForm.get('businessType').patchValue(selected);
            }
        }, error => {
        });
        this.bTypeColors = [
            '#d42121',
            '#eb8500',
            '#c921d4',
            '#419ef6',
            '#046686',
            '#b4c900'
        ];
    }

    // 获取航站楼列表
    searchTerminalList() {
        this.terminal.searchTerminalList(0, 0x3f3f3f3f, 'id,desc').pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.terminals = [];
            const content = res.content;
            if (content.length > 0) {
                content.forEach((item) => {
                    const terminal = {
                        index: parseInt(item.terminalNo.charAt(1), 10) - 1,
                        terminalNo: item.terminalNo,
                        floors: Number(item.floors)
                    };
                    this.terminals.push(terminal);
                });
                this.terminals.sort((a, b) => a.terminalNo.charCodeAt(1) - b.terminalNo.charCodeAt(1));
                // this.terminals.forEach((item, index) => {
                //     item.index = index;
                // });
                this.selectedTerminal = this.terminals[0].index;
                this.getTerminalData();
            } else {
                this.mapLoading = false;
                this.showInitDialog();
                // this.snackBar.open(this.translate.instant('airport.message.terminalNull'), '✖');
            }
            this.unInitTerminals = this.unInitTerminals.filter(item => !this.terminals.find(terminal => terminal.terminalNo.toUpperCase() === item.terminalNo.toUpperCase()));
        }, error => {
            this.mapLoading = false;

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
    remove(tag) {
        const index = this.tags.indexOf(tag);
        if (index >= 0) {
            this.tags.splice(index, 1);
        }
    }

    // select 选择id显示名称
    storeSelect(event) {
        if (event.storeName) {
            this.storeNameControl.setValue(event.storeName);
        }
    }

    /** 地图操作相关方法*/
    // 当选择文件加载完成后订阅可观测对象
    subscriptWhenLoadEnd() {
        if (!this.loadEndSubscription) {
            this.loadEndSubscription = this.uploadEnd.pipe(takeUntil(this._unsubscribeAll), debounceTime(1000)).subscribe(val => {
                this.loadMapWithPreview(true);
            });
        }
    }


    /**    地图区域标注 整合数据等*/

    // 保存地图|商户数据修改
    saveMapChange() {
        if (this.storeForm.valid) {
            // sessionStorage.setItem(this.pathListKey, JSON.stringify(this.pathList));
            this.onSaving = true;
            this.loading.show();
            const storeData = this.storeForm.getRawValue();
            const store = new Store();
            store.id = storeData.id;
            store.storeNo = storeData.storeNo;
            store.storeName = storeData.storeName;
            store.showName = storeData.showName;
            store.brandCN = storeData.brandCN;
            store.brandEN = storeData.brandEN;
            store.desc = storeData.desc;
            store.businessType = storeData.businessType ? storeData.businessType.name : '';

            this.tags.forEach(tag => delete tag.selected);
            store.labels = this.tags;
            const relation = {areaNo: storeData.areaNo, relation: true, storeDTO: store};
            const storeObservable = this.terminal.relationStore(relation);
            let combine = null;
            let flag = false;
            if (this.uploadLogo(store.storeNo)) {
                flag = true;
                combine = concat(storeObservable, this.uploadLogo(store.storeNo));
            } else {
                flag = false;
                combine = storeObservable;
            }
            let i = 0;
            combine.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                i++;
                if (i === 2 && flag || !flag) { // 两次接口调用完毕或没有上传图片
                    this.getCorrespondingStores(true);
                    this.closeMapEdit();
                }
            }, error => {
                this.onSaving = false;
                this.loading.hide();
            }, () => {
                this.onSaving = false;
                this.loading.hide();
            });
        }
    }

    // 获取上传文件可观测对象
    uploadLogo(storeNo) {
        if (this.logoFile) {
            const formData = new FormData();
            const name = this.logoFile.name;
            const file = new File([this.logoFile], storeNo + name.substring(name.lastIndexOf('.'), name.length)
                , {type: this.logoFile.type});
            formData.append('file', file);
            formData.append('storeNo', storeNo);
            return this.terminal.uploadStoreLogo(formData);
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

    // 获取上传logo并预览
    getLogo(event) {
        const fileReader = new FileReader();
        this.logoFile = event.target.files[0];
        fileReader.readAsDataURL(this.logoFile);
        fileReader.onloadend = (res) => {
            const result = res.currentTarget['result'];
            this.imgSrc = this.sanitizer.bypassSecurityTrustUrl(result);
            event.target.value = '';
        };
    }

    // 获取当前航站楼编号
    getTerminalNo() {
        return this.terminals.find(item =>
            item.index === this.selectedTerminal) ? this.terminals.find(item => item.index === this.selectedTerminal).terminalNo : '';
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
            this.logoFile = null;
            this.storeForm.reset();
            this.imgSrc = '';
            this.tags = [];
        }, 1000);
    }

    // 获取表单数据
    getStoreFormData() {
        const storeData = this.storeForm.getRawValue();
        const store = new Store();
        store.id = storeData.id;
        store.storeNo = storeData.storeNo;
        store.storeName = storeData.storeName;
        store.showName = storeData.showName;
        store.brandCN = storeData.brandCN;
        store.brandEN = storeData.brandEN;
        store.desc = storeData.desc;
        store.businessType = storeData.businessType;
        return store;
    }

    // 清空数据
    clearData() {
        this.dialog.open(this.clearArea, {
            id: 'clearArea',
            width: '500px'
        }).afterClosed().pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                const relation = {
                    areaNo: this.storeForm.get('areaNo').value, relation: false
                };
                this.terminal.relationStore(relation).pipe(takeUntil(this._unsubscribeAll)).subscribe(r => {
                    if (r && r.status === 200) {
                        this.getCorrespondingStores(true);
                        this.closeMapEdit();
                    }
                }, error => {

                });
            }
        });

    }


    // 获取带有id的path对象数组
    getSelectedSvgElements() {
        // if (cached && sessionStorage.getItem(this.pathListKey)) {
        //     this.pathList = JSON.parse(sessionStorage.getItem(this.pathListKey));
        //     this.searchList = this.pathList;
        //     this.filterPathList = this.pathList;
        //     this.mallSelection = d3.select('#mall');
        //     this.pathSelection = this.mallSelection.selectAll('svg g path[id]');
        // } else {
        this.mallSelection = d3.select('#mall');
        this.pathSelection = this.mallSelection.selectAll('svg g path[id]');
        this.pathList = [];
        this.pathSelection._groups.forEach((item) => {
            item.forEach((path) => {
                this.addPointToPath(path);
                if (path.id) {
                    const newPath = new Path();
                    newPath.areaNo = path.id;
                    newPath.selected = false;
                    newPath.corresponding = false;
                    this.pathList.push(newPath);
                }
            });
        });
        // }
        this.getCorrespondingStores();
    }

    // 在path上添加点
    addPointToPath(path) {
        const rec = path.getBBox();
        let x = path.getBBox().x + rec.width / 2;
        let y = path.getBBox().y + rec.height / 2;
        const use = d3.select(path.parentNode).append('use').attr('xlink:href', '#place');
        const useRec = use.node().getBBox();
        x = Math.round(x - useRec.width / 2);
        y = Math.round(y - useRec.height);
        use.attr('x', x).attr('y', y);
        use.attr('id', path.id.replace('S', 'P'));
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
        this.pathSelection.classed('path-hover', true);
        switch (this.selectedTerminal) {
            case 0: {
                this.bTypePathList.forEach(item => {
                    this.searchBTypePathList.find(type => type.id === item.id).pathList = this.filterBTypePathList.find(type => type.id === item.id).pathList
                        = item.pathList.filter(path => path.areaNo && path.areaNo.toLowerCase().indexOf(this.t1Ids[this.selectIndex]) !== -1);
                });
                this.searchNoTypeList.pathList = this.filterNoTypeList.pathList =
                    this.noTypePathList.pathList.filter(path => path.areaNo && path.areaNo.toLowerCase().indexOf(this.t1Ids[this.selectIndex]) !== -1);
                break;
            }
            case 1 : {
                this.bTypePathList.forEach(item => {
                    this.searchBTypePathList.find(type => type.id === item.id).pathList = this.filterBTypePathList.find(type => type.id === item.id).pathList
                        = item.pathList.filter(path => path.areaNo && path.areaNo.toLowerCase().indexOf(this.t2Ids[this.selectIndex]) !== -1);
                });
                this.searchNoTypeList.pathList = this.filterNoTypeList.pathList =
                    this.noTypePathList.pathList.filter(path => path.areaNo && path.areaNo.toLowerCase().indexOf(this.t3Ids[this.selectIndex]) !== -1);
                break;
            }
            case 2: {
                this.bTypePathList.forEach(item => {
                    this.searchBTypePathList.find(type => type.id === item.id).pathList = this.filterBTypePathList.find(type => type.id === item.id).pathList
                        = item.pathList.filter(path => path.areaNo && path.areaNo.toLowerCase().indexOf(this.t3Ids[this.selectIndex]) !== -1);
                });
                this.searchNoTypeList.pathList = this.filterNoTypeList.pathList =
                    this.noTypePathList.pathList.filter(path => path.areaNo && path.areaNo.toLowerCase().indexOf(this.t3Ids[this.selectIndex]) !== -1);
                break;
            }

        }
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
                if (select) { // 如果是切换商户选择对应
                    delete res['areaNo'];
                } else {
                    this.getBusinessTypes(res['businessType']);
                }
                this.tags = res['labels'];
                if (res.logo) {
                    this.imgSrc = sessionStorage.getItem('baseUrl') + 'terminal' + res.logo;
                } else {
                    this.imgSrc = '';
                }
                this.storeForm.patchValue(res);
            }
        }, error => {

        });
    }

    // 进入地图编辑详情
    enterMapDetail(path: Path) {
        if (!this.mapEditShow) {
            this.resetMapWhenEnterEdit();
        }
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
        switch (this.selectedTerminal) {
            case 0 : {
                this.t1Ids.forEach((item, index) => {
                    if (!this.mapSelected && path.areaNo.toLowerCase().indexOf(item) !== -1) {
                        this.selectFloor(index);
                    }
                });
                break;
            }
            case 1: {
                this.t2Ids.forEach((item, index) => {
                    if (!this.mapSelected && path.areaNo.toLowerCase().indexOf(item) !== -1) {
                        this.selectFloor(index);
                    }
                });
                break;
            }
            case 2: {
                this.t3Ids.forEach((item, index) => {
                    if (!this.mapSelected && path.areaNo.toLowerCase().indexOf(item) !== -1) {
                        this.selectFloor(index);
                    }
                });
                break;
            }
        }
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
        if (form.valid) {
            const data = form.getRawValue();
            this.onSaving = true;
            this.loading.show();
            let observable = null;
            if (type === 'create') {
                observable = this.terminal.createTerminal(data);
            } else if (type === 'edit') {
                observable = this.terminal.updateTerminal(data);
            }
            observable.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                if (res.status === 200) {
                    this.unInitTerminals = this.unInitTerminals.filter(item => item.terminalNo !== data.terminalNo);
                    this.terminals.push({index: 0, terminalNo: data.terminalNo, floors: Number(data.floors)});
                    this.terminals.sort((a, b) => a.terminalNo.charCodeAt(1) - b.terminalNo.charCodeAt(1));
                    this.terminals.forEach((item, index) => {
                        item.index = index;
                    });
                    if (type === 'create') {
                        if (this.unInitTerminals.length > 0) {
                            this.createForm.reset();
                            this.createForm.get('terminalNo').patchValue(this.unInitTerminals[0].terminalNo);
                        }
                        this.snackBar.open(this.translate.instant('airport.message.createTerminal'), '✔');
                    } else if (type === 'edit') {
                        this.snackBar.open(this.translate.instant('airport.message.updateTerminal'), '✔');
                    }
                }
                this.onSaving = false;
                this.loading.hide();
                if (this.unInitTerminals.length === 0) {
                    this.closeEditPanel();
                }
            }, error => {
                this.onSaving = false;
                this.loading.hide();

            });
        } else if (form.get('terminalName').hasError('required')) {
            this.snackBar.open(this.translate.instant('airport.form.terminalName'), '✖');
        }
    }

    // 保存航站楼数据
    saveTerminalChange() {
        switch (this.expandPanel) {
            // 基础信息
            case 0: {
                if (!this.createShow) {
                    this.createOrEditTerminal(this.editForm, 'edit');
                } else {
                    this.createOrEditTerminal(this.createForm, 'create');
                }
                break;
            }
            // 上传地图
            case 1: {
                if (this.checkCorrect()) {
                    this.snackBar.open(this.translate.instant('airport.message.notCorrectError'), '✖');
                } else if (this.uploadSVGs.length > 0) {
                    switch (this.selectedTerminal) {
                        case 0: {
                            this.getMapChanges(this.t1Key, this.t1Ids);
                            break;
                        }
                        case 1: {
                            this.getMapChanges(this.t2Key, this.t2Ids);
                            break;
                        }
                        case 2: {
                            this.getMapChanges(this.t3Key, this.t3Ids);
                            break;
                        }
                    }
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
                            this.uploadTerminalData();
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
                    const terminalNo = this.getTerminalNo();
                    const date = new Date().toLocaleString([], {hour12: false}).replace(/\//g, '-').replace(/:/g, '.');
                    this.selectedSvg.forEach(item => {
                        fileName.push(item.sourceName);
                    });
                    const zipName = terminalNo + '_' + date;
                    const data = {
                        fileName,
                        terminalNo: terminalNo
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
        this.expandPanel = 2;
        this.historyLoaded = false;
        if (this.filterRows.length === 0) {
            const terminalNo = this.getTerminalNo();
            this.loading.show();
            this.filterRows = [];
            this.terminal.historySvgList('', terminalNo).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                if (res) {
                    res.forEach(item => {
                        const items: any[] = item.split('_');
                        const history: SvgHistory = {
                            fileName: items.length === 3 ? items[items.length - 1] : '',
                            uploadPerson: items.length >= 1 ? items[0] : '',
                            uploadTime: items.length >= 2 ? items[1] : '',
                            sourceName: item,
                            selected: false
                        };
                        this.filterRows.push(history);
                    });
                    this.filterRows.reverse();
                    this.rows = this.filterRows;
                }
            }, error1 => {
                this.loading.hide();
                this.historyLoaded = true;
            }, () => {
                this.loading.hide();
                this.historyLoaded = true;
            });
        } else {
            this.historyLoaded = true;
        }
    }

    // 上传航站楼地图formData
    uploadTerminalData() {
        // 上传文件
        const formData = new FormData();
        this.uploadSVGs.forEach(item => {
            const file = new File([item.file], item.id + '.svg', {type: item.file.type});
            formData.append('file', file as any);
        });
        const terminalNo = this.getTerminalNo();
        formData.append('terminalNo', terminalNo);
        // 单元号
        const areaNos = [];
        this.pathList.forEach(path => {
            areaNos.push(path.areaNo);
        });
        const importArea = this.terminal.importArea(areaNos);
        const uploadSvg = this.terminal.uploadSVGs(formData);
        forkJoin([importArea, uploadSvg]).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.terminalOn = true;
            this.storageUploadSVGs();
            this.cancelTransform();
            // sessionStorage.removeItem(this.pathListKey);
            this.clearUpload();
            this.uploadFiles = [];
        }, error1 => {
            this.loading.hide();
            this.onSaving = false;
        }, () => {
            this.loading.hide();
            this.onSaving = false;
        });
        // this.terminal.uploadSVGs(formData).subscribe(res => {
        //     this.terminalOn = true;
        //     this.storageUploadSVGs();
        //     this.cancelTransform();
        //     sessionStorage.removeItem(this.pathListKey);
        //     this.clearUpload();
        //     this.uploadFiles = [];
        //     this.loading.hide();
        //     this.onSaving = false;
        // }, error1 => {
        //     this.loading.hide();
        //     this.onSaving = false;
        //     if (error1.error && error1.error.detail) {
        //
        //     } else {
        //         this.snackBar.open(this.translate.instant('airport.message.updateFailure'), '✖');
        //     }
        // });
    }

    // 根据航站楼获取地图更新内容
    getMapChanges(storageKey, ids) {
        this.mapChanges = [];
        if (this.uploadFiles.length === 0 && sessionStorage.getItem(storageKey)) {
            this.uploadFiles = JSON.parse(sessionStorage.getItem(storageKey));
        }
        ids.forEach(item => {
            const oldSvg = this.uploadFiles.find(file => file.id === item);
            const newSvg = this.uploadSVGs.find(svg => svg.id === item);
            const floor = new MapChange();
            if (oldSvg) {
                floor.id = oldSvg.id.substr(oldSvg.id.length - 2, 2).toUpperCase();
                floor.oldMap = oldSvg.map;
            }
            if (newSvg) {
                floor.id = newSvg.id.substr(newSvg.id.length - 2, 2).toUpperCase();
                floor.newMap = newSvg.map;
            }
            this.mapChanges.push(floor);
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
        this.createShow = false;
        this.mallSelection.style('transform', null);
    }

    // 清空航站楼操作数据
    clearUpload() {
        this.uploadSVGs = [];
        this.uploadMaps = [];
        this.obeyRule = 0;
        this.onlyEnoughMessage = null;
        this.mapOverwrite = false;
        setTimeout(() => {
            this.filterRows = [];
            this.selectedSvg = [];
            this.editForm.reset();
            this.createForm.reset();
        }, 1000);
    }

    clearContainer() {
        switch (this.selectedTerminal) {
            case 0: {
                this.t1Ids.forEach(id => {
                    d3.select('#' + id).html(null);
                });
                break;
            }
            case 1: {
                this.t2Ids.forEach(id => {
                    d3.select('#' + id).html(null);
                });
                break;
            }
            case 2: {
                this.t3Ids.forEach(id => {
                    d3.select('#' + id).html(null);
                });
                break;
            }

        }

    }

    // 关闭面板
    closeEditPanel() {
        if (this.mapOverwrite) {
            switch (this.selectedTerminal) {
                case 0: {
                    if (sessionStorage.getItem(this.t1Key)) {
                        this.clearAndReloadCache();
                    } else {
                        this.clearAll();
                    }
                    break;
                }
                case 1: {
                    if (sessionStorage.getItem(this.t2Key)) {
                        this.clearAndReloadCache();
                    } else {
                        this.clearAll();
                    }
                    break;
                }
                case 2: {
                    if (sessionStorage.getItem(this.t3Key)) {
                        this.clearAndReloadCache();
                    } else {
                        this.clearAll();
                    }
                    break;
                }

            }
        } else {
            this.cancelTransform();
            this.clearUpload();
        }
    }

    // 清除操作并读取缓存地图
    clearAndReloadCache() {
        this.initTerminal();
        setTimeout(() => {
            this.cancelTransform();
            setTimeout(() => {
                this.clearUpload();
            }, 1000);
        }, 1000);
    }

    // 无内容且无内存更改直接关闭所有
    clearAll() {
        this.terminalOn = false;
        this.clearContainer();
        this.cancelTransform();
        this.clearUpload();
        this.clearPathList();

    }

    // 清除pathList
    clearPathList() {
        this.resetSelectedSvgElements();
    }

    // 新建航站楼
    createPanelShow() {
        if (this.unInitTerminals.length > 0) {
            this.expandPanel = 0;
            this.createShow = true;
            this.editShow = true;
            this.createForm.get('terminalNo').patchValue(this.unInitTerminals[0].terminalNo);
        }
    }

    // 进入航站楼编辑
    editPanelShow() {
        if (!this.terminalOn && !this.editShow) {
            this.expandPanel = 1;
        } else if (!this.editShow) {
            this.expandPanel = 0;
        }
        this.editShow = true;
        this.getEditForm();
        this.subscriptWhenLoadEnd();
        this.resetMap();
    }

    // 获取航站楼响应式表单数据
    getEditForm() {
        const terminalNo = this.getTerminalNo();
        if (terminalNo) {
            this.terminal.getTerminalByNo(terminalNo).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                if (res) {
                    this.editForm.patchValue(res);
                } else {
                    this.snackBar.open(this.translate.instant('airport.message.getTerminalEmpty'), '✖');
                }
            }, error => {

            });
        }
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
        this.tKey = 'terminal' + this.username;
        this.t1Key = 't1' + this.username;
        this.t2Key = 't2' + this.username;
        this.t3Key = 't3' + this.username;
        this.animationKey = 'animation' + this.username;
        this.historyKey = 'search' + this.username;
        // this.pathListKey = 'pathList' + this.username;
    }

    onFileDrop(event) {
        const files = event.dataTransfer.files;
        this.expandPanel = 1;
        this.uploadFilePreviewTrigger(null, false, true, files);
        // this.getFiles(files);
    }

    // 获取上传文件并进行校验
    getFile(event) {
        const files = event.target.files;
        // this.getFiles(files, event);
    }

    // 点击上传
    uploadFilePreviewTrigger(uploadFilePreview?, delay?, drag?, files?) {
        if (this.checkUploadSVGLength() && this.checkUploadMapsLength()) {
            this.snackBar.open(this.translate.instant('airport.message.enoughError'), '✖');
            return;
        } else {
            // 拖拽上传
            if (drag) {
                this.editPanelShow();
                this.getUploadFiles(files);
            } else { // 点击上传
                if (delay) {
                    this.editPanelShow();
                    setTimeout(() => {
                        uploadFilePreview.click();
                    }, 1300);
                } else {
                    uploadFilePreview.click();
                }
            }
        }
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

    // 预览左移右移
    sortUploadSVGs(sort, index) {
        switch (sort) {
            case 'left': {
                if (index - 1 >= 0) {
                    this.uploadSVGs[index].order = index - 1;
                    this.uploadSVGs[index - 1].order = index;
                    this.sortAnimation(index + 1, index, 'left-transform', 'right-transform');
                } else {
                    this.uploadSVGs[this.uploadSVGs.length - 1].order = index;
                    this.uploadSVGs[index].order = this.uploadSVGs.length - 1;
                    this.uploadSVGs.sort((a, b) => a.order - b.order);
                }

                break;
            }
            case 'right': {
                if (index + 1 <= this.uploadSVGs.length - 1) {
                    this.uploadSVGs[index].order = index + 1;
                    this.uploadSVGs[index + 1].order = index;
                    this.sortAnimation(index + 1, index + 2, 'right-transform', 'left-transform');
                } else {
                    this.uploadSVGs[index].order = 0;
                    this.uploadSVGs[0].order = index;
                    this.uploadSVGs.sort((a, b) => a.order - b.order);
                }
                break;
            }
        }
        this.uploadSVGs.forEach((item, i) => {
            item.order = i;
        });
    }

    // 预览排序
    sortList(event) {
        moveItemInArray(this.uploadSVGs, event.previousIndex, event.currentIndex);
        this.uploadSVGs.forEach((item, index) => {
            item.order = index;
        });
        if (event.previousIndex !== event.currentIndex && this.obeyRule !== 1) {
            this.loadMapWithPreview(true);
        }
    }

    // 预览删除
    deleteUploadSVG(item) {
        this.uploadSVGs = this.uploadSVGs.filter(svg => svg.id !== item.id);
        this.uploadMaps = this.uploadMaps.filter(svg => svg.id !== item.id);
        this.uploadSVGs.forEach((svg, index) => {
            svg.order = index;
        });
        const container = d3.select('#' + item.id);
        container.style('transition-delay', '0.3s');
        container.style('opacity', '0'); // 隐藏地图效果
        this.onlyEnoughMessage = null; // 删除后打开大小限制通知
        // this.loadMapWithPreview(true);
    }

    // 上传svg并预览
    getFilePreview(event) {
        const files = event.target.files;
        this.getUploadFiles(files, event);
    }

    // 获取上传文件列表并预览
    getUploadFiles(files, event?) {
        // 本次选择文件设置一个随机数作为subject发射的值 本次操作中所有异步操作值相同 即可过滤所有相同值知道最后一个异步加载执行完毕
        const currentLoad = 1;
        // this.mapLoading = true;
        const floors = this.terminals.find(item => item.index === this.selectedTerminal).floors;
        if (files.length > floors) {
            this.snackBar.open(this.translate.instant('airport.message.lengthError'), '✖');
            if (event) {
                event.target.value = '';
            }
            return;
        }
        this.onUploading = true;
        for (let i = 0; i < files.length; i++) { // 循环拿到上传文件
            const file = files[i];
            if (file.type === 'image/svg+xml') {
                const imageReader = new FileReader();
                imageReader.readAsDataURL(file);
                imageReader.onloadend = (res) => {
                    const result = res.currentTarget['result'];
                    this.getUploadSvg(file, result, currentLoad);
                };
                const svgReader = new FileReader();
                svgReader.readAsText(file);
                svgReader.onloadend = (res) => {
                    const result = res.currentTarget['result'];
                    this.getUploadMaps(file, result, currentLoad);
                };
            } else if (file.type === 'application/x-zip-compressed') {
                this.unzipFile(file, event, currentLoad);
            } else {
                this.onUploading = false;
                this.snackBar.open(this.translate.instant('airport.message.typeError'), '✖');
            }
        }
        // 清空上传input中value
        if (event) {
            event.target.value = '';
        }
    }

    // 检查上传数量与当前航站楼是否匹配
    checkUploadSVGLength() {
        const floors = this.terminals.find(item => item.index === this.selectedTerminal).floors;
        return this.uploadSVGs.length >= floors;
    }

    checkUploadMapsLength() {
        const floors = this.terminals.find(item => item.index === this.selectedTerminal).floors;
        return this.uploadMaps.length >= floors;
    }


    // 解压zip
    unzipFile(file, event, currentLoad) {
        const jsZip = new JSZip();
        jsZip.loadAsync(file).then(zip => {
            const zipFiles = zip.files;
            // 过滤文件夹 只留文件
            const onLyFiles: any[] = Object.values(zipFiles).filter(item => !item['dir']);
            onLyFiles.sort();
            // zip中文件名是否和航站楼相符
            onLyFiles.forEach(item => {
                if (this.checkZipMapType(item)) {
                    // this.snackBar.open(this.translate.instant('airport.message.zipTypeError'), '✖');
                    return;
                }
                if (this.checkUploadSVGLength() && this.checkUploadMapsLength()) {
                    if (!this.onlyEnoughMessage) {
                        this.onlyEnoughMessage = this.snackBar.open(this.translate.instant('airport.message.enoughError'), '✖');
                    }
                    return;
                }
                // 如果仍然包含zip 则递归调用解压方法
                if (item.name.toLowerCase().lastIndexOf('.zip') === item.name.length - 4) {
                    item.async('blob').then(result => {
                        this.uploadEnd.next(currentLoad);
                        this.unzipFile(result, event, currentLoad);
                    });
                } else {
                    item.async('base64').then(result => {
                        this.getUploadSvg(item, 'data:image/svg+xml;base64,' + result, currentLoad);
                    });
                    item.async('text').then(result => {
                        this.getUploadMaps(item, result, currentLoad);
                    });
                }
                this.uploadEnd.next(currentLoad);
            });
        });
    }

    // 获取上传预览svg
    getUploadSvg(file, result, currentLoad) {
        if (this.checkUploadSVGLength()) {
            if (!this.onlyEnoughMessage) {
                this.onlyEnoughMessage = this.snackBar.open(this.translate.instant('airport.message.enoughError'), '✖');
            }
            return;
        }
        const url = this.sanitizer.bypassSecurityTrustUrl(result);
        const svg = new SvgPreview();
        svg.name = file.name;
        svg.imgUrl = url;
        svg.order = 0;
        svg.file = file;
        this.uploadSVGs.push(svg);
        this.uploadSVGs.forEach((item, index) => {
            item.order = index;
        });
        this.uploadEnd.next(currentLoad);
        // this.setLoadingTimestamp();
    }

    // 获取上传
    getUploadMaps(file, result, currentLoad) {
        if (this.checkUploadMapsLength()) {
            if (!this.onlyEnoughMessage) {
                this.onlyEnoughMessage = this.snackBar.open(this.translate.instant('airport.message.enoughError'), '✖');
            }
            return;
        }
        const map = result.substring(result.indexOf('<svg'), result.lastIndexOf('</svg>') + 6);
        const svg = new SvgPreview();
        svg.name = file.name;
        svg.map = map;
        this.uploadMaps.push(svg);
        this.uploadEnd.next(currentLoad);
        // this.setLoadingTimestamp();
    }


    // 根据排列顺序来拿地图和容器id
    getIdByOrder() {
        this.uploadSVGs.forEach(item => {
            const map = this.uploadMaps.find(svg => svg.name === item.name);
            item.map = map.map;
            switch (this.selectedTerminal) {
                case 0: {
                    item.id = this.t1Ids[item.order];
                    map.id = this.t1Ids[item.order];
                    break;
                }
                case 1: {
                    item.id = this.t2Ids[item.order];
                    map.id = this.t2Ids[item.order];
                    break;
                }
                case 2: {
                    item.id = this.t3Ids[item.order];
                    map.id = this.t3Ids[item.order];
                    break;
                }
            }
            this.obeyRule = 2;
        });
    }

    // 根据合法的名称来获取id
    getIdByName() {
        const set = new Set();
        this.uploadSVGs.forEach(item => {
            const map = this.uploadMaps.find(svg => svg.name === item.name);
            item.map = map.map;
            switch (this.selectedTerminal) {
                case 0: {
                    this.t1Ids.forEach(id => {
                        if (item.name.toLowerCase().indexOf(id) > -1) {
                            item.id = id;
                            map.id = id;
                        }
                    });
                    break;
                }
                case 1: {
                    this.t2Ids.forEach(id => {
                        if (item.name.toLowerCase().indexOf(id) > -1) {
                            item.id = id;
                            map.id = id;
                        }
                    });
                    break;
                }
                case 2: {
                    this.t3Ids.forEach(id => {
                        if (item.name.toLowerCase().indexOf(id) > -1) {
                            item.id = id;
                            map.id = id;
                        }
                    });
                    break;
                }
            }
            set.add(item.id);
        });
        this.obeyRule = 1;
        // 如果有同名文件则不合法 改为按顺序
        if (set.size !== this.uploadSVGs.length) {
            this.getIdByOrder();
        }
    }


    // 预览svg的加载方法
    loadMapWithPreview(preview?) {
        // 按照order顺序写入id顺序
        // let flag = false;
        let nameFlag = false; // 名称是否合法 如果有一个不合法则按照顺序来排
        this.uploadSVGs.forEach(item => {
            if (this.checkNames(item)) {
                nameFlag = true;
                // console.log('not format');
            }
        });
        // 如果名称不合法
        if (nameFlag) {
            this.getIdByOrder();
        } else { // 如果名称合法
            this.getIdByName();
        }
        // 此时缓存的file如果是zipObject则是zipObject
        this.uploadSVGs.forEach((svg, index) => {
            // 如果没有type则为ZipObject
            if (svg.file && !svg.file.type) {
                const zipObject = svg.file;
                zipObject.async('blob').then(res => {
                    const newFile = new File([res], svg.name, {type: 'image/svg+xml'});
                    svg.file = newFile;
                });
            }
            this.writeMapToHtml(this.uploadSVGs.length, index, svg);
        });
        this.mallTransition = true;
        setTimeout(() => {
            this.uploadSVGs.forEach(svg => {
                const container = d3.select('#' + svg.id);
                this.addClickEvent();
                if (container.node()) {
                    container.node().style = null;
                    container.select('svg').style('opacity', 1);
                }
            });
            this.mapLoading = false;
            this.onUploading = false;
            if (!preview) {
                this.clearUpload();
            }
            this.getSelectedSvgElements();
        }, 2000);
    }

    // 缓存上传的文件
    storageUploadSVGs() {
        const floors = this.terminals.find(item => item.index === this.selectedTerminal).floors;
        switch (this.selectedTerminal) {
            case 0: {
                this.terminalOn = true;
                if (this.cacheOn && this.uploadSVGs.length === floors) {
                    sessionStorage.setItem(this.t1Key, JSON.stringify(this.uploadSVGs));
                } else {
                    const cachedSVGs = JSON.parse(sessionStorage.getItem(this.t1Key));
                    if (cachedSVGs) {
                        cachedSVGs.forEach(item => {
                            if (!this.uploadSVGs.find(svg => svg.id === item.id)) {
                                this.uploadSVGs.push(item);
                            }
                        });
                    }
                    sessionStorage.setItem(this.t1Key, JSON.stringify(this.uploadSVGs));
                }
                break;
            }
            case 1: {
                this.terminalOn = true;
                if (this.cacheOn && this.uploadSVGs.length === floors) {
                    sessionStorage.setItem(this.t2Key, JSON.stringify(this.uploadSVGs));
                } else {
                    const cachedSVGs = JSON.parse(sessionStorage.getItem(this.t2Key));
                    if (cachedSVGs) {
                        cachedSVGs.forEach(item => {
                            if (!this.uploadSVGs.find(svg => svg.id === item.id)) {
                                this.uploadSVGs.push(item);
                            }
                        });
                    }
                    sessionStorage.setItem(this.t2Key, JSON.stringify(this.uploadSVGs));
                }
                break;
            }
            case 2: {
                this.terminalOn = true;
                if (this.cacheOn && this.uploadSVGs.length === floors) {
                    sessionStorage.setItem(this.t3Key, JSON.stringify(this.uploadSVGs));
                } else {
                    const cachedSVGs = JSON.parse(sessionStorage.getItem(this.t3Key));
                    if (cachedSVGs) {
                        cachedSVGs.forEach(item => {
                            if (!this.uploadSVGs.find(svg => svg.id === item.id)) {
                                this.uploadSVGs.push(item);
                            }
                        });
                    }
                    sessionStorage.setItem(this.t3Key, JSON.stringify(this.uploadSVGs));
                }
                break;
            }
        }
        this.getButtons();
    }

    // 像html中写入svg
    writeMapToHtml(length, index, svg) {
        const max = length - 1;
        const mid = max / 2;
        if (document.getElementById(svg.id)) {
            const container = d3.select('#' + svg.id);
            if (index < mid) {
                container.node().style.transitionDelay = (max - (mid - index)) * 0.2 + 's';
                container.node().style.opacity = 0;
            } else if (index > mid) {
                container.node().style.transitionDelay = (max - (index - mid)) * 0.2 + 's';
                container.node().style.opacity = 0;
            } else {
                container.node().style.opacity = 0;
            }
            container.html(svg.map);
            this.mapOverwrite = true;
            container.select('svg').style('opacity', 0);
            this.mapLoading = true;
        }
    }


    // 从上传文件中或者拖拽中获取上传文件
    // getFiles(files, event?) {
    //     if (files.length === 0) {
    //         return;
    //     }
    //     for (let i = 0; i < files.length; i++) {
    //         // 非单个压缩文件上传 return
    //         if (files.length === 1 && files[i].type !== 'application/x-zip-compressed') {
    //             this.snackBar.open(this.translate.instant('airport.message.noSingleZip'), '✖');
    //             if (event) {
    //                 event.target.value = '';
    //             }
    //             return;
    //         }
    //         // 多个文件类型只能是svg
    //         if (files.length > 1 && this.checkType(files[i])) {
    //             this.snackBar.open(this.translate.instant('airport.message.typeError'), '✖');
    //             if (event) {
    //                 event.target.value = '';
    //             }
    //             return;
    //         }
    //         // 不是单个文件 但是数量对不上航站楼层 return
    //         if (files.length > 1 && this.checkLength(files)) { // 如果上传的不是单个文件
    //             this.snackBar.open(this.translate.instant('airport.message.lengthError'), '✖');
    //             if (event) {
    //                 event.target.value = '';
    //             }
    //             return;
    //         }
    //         // 文件名字中不合法
    //         if (files.length > 1 && this.checkNames(files[i])) {
    //             this.snackBar.open(this.translate.instant('airport.message.nameError'), '✖');
    //             if (event) {
    //                 event.target.value = '';
    //             }
    //             return;
    //         }
    //     }
    //     this.uploadFiles = [];
    //     for (const file of files) { // 上传的是一个文件数组 经过校验后只存在全svg 和单zip的情况
    //         if (file.type === 'image/svg+xml') { // 如果上传是svg
    //             this.mapLoading = true;
    //             // const imgReader = new FileReader();
    //             // imgReader.readAsDataURL(file);
    //             // imgReader.onloadend = (res => {
    //             //     const result = res.currentTarget['result'];
    //             //     this.uploadSVGs.push({name: file.name, imgUrl: this.sanitizer.bypassSecurityTrustUrl(result), order: 0});
    //             // });
    //             const fileReader = new FileReader();
    //             fileReader.readAsText(file as any);
    //             fileReader.onloadend = (res) => {
    //                 const result: string = res.currentTarget['result'];
    //                 this.getUploadFilesAndLoad(file, result, files.length, event, true);
    //             };
    //         } else if (file.type === 'application/x-zip-compressed') {
    //             const jsZip = new JSZip();
    //             jsZip.loadAsync(file).then(zip => {
    //                 const zipFiles = zip.files;
    //                 // 过滤文件夹 只留文件
    //                 const onLyFiles: any[] = Object.values(zipFiles).filter(item => !item['dir']);
    //                 // zip中文件数量
    //                 if (this.checkZipMapCount(onLyFiles)) {
    //                     this.snackBar.open(this.translate.instant('airport.message.lengthError'), '✖');
    //                     if (event) {
    //                         event.target.value = '';
    //                     }
    //                     this.mapLoading = false;
    //                     return;
    //                 }
    //                 // zip中文件名是否和航站楼相符
    //                 onLyFiles.forEach(item => {
    //                     if (this.checkNames(item)) {
    //                         this.snackBar.open(this.translate.instant('airport.message.nameError'), '✖');
    //                         if (event) {
    //                             event.target.value = '';
    //                         }
    //                         this.mapLoading = false;
    //                         return;
    //                         // zip里的文件是否为SVG文件
    //                     } else if (this.checkZipMapType(item)) {
    //                         this.snackBar.open(this.translate.instant('airport.message.typeError'), '✖');
    //                         if (event) {
    //                             event.target.value = '';
    //                         }
    //                         this.mapLoading = false;
    //                         return;
    //                     } else {
    //                         const totalLength = onLyFiles.length;
    //                         item.async('text').then(result => {
    //                             this.getUploadFilesAndLoad(item, result, totalLength, event, false);
    //                         });
    //                     }
    //                 });
    //             });
    //         }
    //     }
    // }

    // 从多渠道获取上传文件 并加载
    // getUploadFilesAndLoad(item, result, totalLength, event, svg?) {
    //     const map = result.substring(result.indexOf('<svg'), result.lastIndexOf('</svg>') + 6);
    //     switch (this.selectedTerminal) {
    //         case 0: {
    //             this.t1Ids.forEach(id => {
    //                 if (item.name.toLowerCase().indexOf(id) > -1) {
    //                     this.uploadFiles.push({id: id, map: map});
    //                 }
    //             });
    //             break;
    //         }
    //         case 1: {
    //             this.t2Ids.forEach(id => {
    //                 if (item.name.toLowerCase().indexOf(id) > -1) {
    //                     this.uploadFiles.push({id: id, map: map});
    //                 }
    //             });
    //             break;
    //         }
    //         case 2: {
    //             this.t3Ids.forEach(id => {
    //                 if (item.name.toLowerCase().indexOf(id) > -1) {
    //                     this.uploadFiles.push({id: id, map: map});
    //                 }
    //             });
    //             break;
    //         }
    //     }
    //     if (this.uploadFiles.length === totalLength) {
    //         const ids = [];
    //         this.uploadFiles.forEach(f => {
    //             ids.push(f.id);
    //         });
    //         ids.sort((a, b) => {
    //             return a.charCodeAt(4) - b.charCodeAt(4);
    //         });
    //         if (event) {
    //             event.target.value = '';
    //         }
    //         // 对ids文件名进行排序
    //         switch (this.selectedTerminal) {
    //             case 0: {
    //                 if (JSON.stringify(ids) === JSON.stringify(this.t1Ids)) {
    //                     this.mapLoading = true;
    //                     this.loadSvgMap();
    //                 } else {
    //                     this.mapLoading = false;
    //                     this.snackBar.open(this.translate.instant('airport.message.nameError'), '✖');
    //                 }
    //                 break;
    //             }
    //             case 1: {
    //                 if (JSON.stringify(ids) === JSON.stringify(this.t2Ids)) {
    //                     this.mapLoading = true;
    //                     this.loadSvgMap();
    //                 } else {
    //                     this.mapLoading = false;
    //                     this.snackBar.open(this.translate.instant('airport.message.nameError'), '✖');
    //                 }
    //                 break;
    //             }
    //             case 2: {
    //                 let t3Ids;
    //                 if (!svg) {
    //                     ids.sort((a, b) => {
    //                         return b.charCodeAt(4) - a.charCodeAt(4);
    //                     });
    //                     t3Ids = JSON.parse(JSON.stringify(this.t3Ids)).reverse();
    //                 } else {
    //                     t3Ids = this.t3Ids;
    //                 }
    //                 if (JSON.stringify(ids) === JSON.stringify(t3Ids)) {
    //                     this.mapLoading = true;
    //                     this.loadSvgMap();
    //                 } else {
    //                     this.mapLoading = false;
    //                     this.snackBar.open(this.translate.instant('airport.message.nameError'), '✖');
    //                 }
    //                 break;
    //             }
    //
    //         }
    //     }
    // }

    // 检查zip文件里文件数量
    checkZipMapCount(onlyFiles) {
        switch (this.selectedTerminal) {
            case 0: {
                return onlyFiles.length !== this.filesLength[0];
            }
            case 1: {
                return onlyFiles.length !== this.filesLength[1];
            }
            case 2: {
                return onlyFiles.length !== this.filesLength[2];
            }
        }
    }

    // 检查zip中文件是否为svg或zip
    checkZipMapType(files) {
        // .xxx为后缀的文件名则为xxx文件 lastIndexOf位置为最后一个的.xxx开始位置
        return files.name.toLowerCase().lastIndexOf('.svg') !== files.name.length - 4 &&
            files.name.toLowerCase().lastIndexOf('.zip') !== files.name.length - 4;
    }

    // 初始化时加载svg 内容写入地图容器中
    loadSvgMap() {
        const max = this.uploadFiles.length - 1;
        const mid = max / 2;
        const containers = [];
        const emptyIds = this.t1Ids.filter(id => !this.uploadFiles.find(item => item.id === id));
        if (emptyIds.length > 0) {
            emptyIds.forEach(id => {
                const container = d3.select('#' + id);
                container.html(null);
            });
        }
        this.uploadFiles.forEach((file, index) => {
            const container = d3.select('#' + (file.id));
            if (index < mid) {
                container.node().style.transitionDelay = (max - (mid - index)) * 0.2 + 's';
                container.node().style.opacity = 0;
                // container.node().style.transform = 'translateZ(-1000px) translateY(2000px)';
            } else if (index > mid) {
                container.node().style.transitionDelay = (max - (index - mid)) * 0.2 + 's';
                container.node().style.opacity = 0;
                // container.node().style.transform = 'translateZ(-1000px) translateY(2000px)';
            } else {
                container.node().style.opacity = 0;
            }
            container.html(file.map);
            container.select('svg').style('opacity', 0);
            containers.push(container);
        });
        this.mallTransition = true;
        // switch (this.selectedTerminal) {
        //     case 0: {
        //         this.terminalOn = true;
        //         if (this.cacheOn) {
        //             sessionStorage.setItem(this.t1Key, JSON.stringify(this.uploadFiles));
        //         }
        //         break;
        //     }
        //     case 1: {
        //         this.terminalOn = true;
        //         if (this.cacheOn) {
        //             sessionStorage.setItem(this.t2Key, JSON.stringify(this.uploadFiles));
        //         }
        //         break;
        //     }
        //     case 2: {
        //         this.terminalOn = true;
        //         if (this.cacheOn) {
        //             sessionStorage.setItem(this.t3Key, JSON.stringify(this.uploadFiles));
        //         }
        //         break;
        //     }
        // }
        setTimeout(() => {
            this.uploadFiles.forEach(file => {
                const container = d3.select('#' + (file.id));
                this.addClickEvent();
                if (container.node()) {
                    container.node().style = null;
                }
                container.select('svg').style('opacity', 1);
            });
            this.mapLoading = false;
            this.getSelectedSvgElements();
        }, 1000);

    }

    // 如果多个上传文件中有不是svg的文件
    checkType(file) {
        return file.type !== 'image/svg+xml';
    }

    // 检查上传文件数量
    checkLength(files) {
        switch (this.selectedTerminal) {
            case 0: {
                return files.length !== this.filesLength[0];
            }
            case 1: {
                return files.length !== this.filesLength[1];

            }
            case 2: {
                return files.length !== this.filesLength[2];
            }
        }

    }

    // 检查命名是否规范
    checkNames(file) {
        switch (this.selectedTerminal) {
            case 0: {
                let flag = true;
                this.t1Ids.forEach(id => {
                    if (file.name.toLowerCase().indexOf(id) > -1) {
                        flag = false;
                    }
                });
                return flag;
            }
            case 1: {
                let flag = true;
                this.t2Ids.forEach(id => {
                    if (file.name.toLowerCase().indexOf(id) > -1) {
                        flag = false;
                    }
                });
                return flag;
            }
            case 2: {
                let flag = true;
                this.t3Ids.forEach(id => {
                    if (file.name.toLowerCase().indexOf(id) > -1) {
                        flag = false;
                    }
                });
                return flag;
            }
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
                {shortcut: res['create'], keyboard: 'C'},
                {shortcut: res['edit'], keyboard: 'E'},
                {shortcut: res['goBack'], keyboard: 'Home'},
                {shortcut: res['terminalLeft'], keyboard: '← ↑ PageUP'},
                {shortcut: res['terminalRight'], keyboard: '→ ↓ PageDown'},
                {shortcut: res['changeRotating'], keyboard: 'End'},
            ];
            this.shortcutKeys.map = [
                {shortcut: res['nav'], keyboard: '↑ ↓ ← →'},
                {shortcut: res['resetMap'], keyboard: 'Backspace'},
                {shortcut: res['zoomIn'], keyboard: 'PageUp'},
                {shortcut: res['drag'], keyboard: this.translate.instant('airport.keyboards.drag')},
                {shortcut: res['zoomOut'], keyboard: 'PageDown'},
                {shortcut: res['upFloor'], keyboard: 'PageUp'},
                {shortcut: res['downFloor'], keyboard: 'PageDown'},
                {shortcut: res['returnAll'], keyboard: 'Home'},
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
                case 'ArrowUp':
                case 'ArrowLeft':
                case 'PageUp': {
                    d3.event.preventDefault();
                    this.changeTerminal('left');
                    this.letButtonsClicked('left-terminal');
                    break;
                }
                case 'ArrowRight':
                case 'ArrowDown':
                case 'PageDown': {
                    d3.event.preventDefault();
                    this.changeTerminal('right');
                    this.letButtonsClicked('right-terminal');
                    break;
                }
                case 'End': {
                    d3.event.preventDefault();
                    this.animationOff = !this.animationOff;
                    this.animationOn = !this.animationOn;
                    break;
                }
                case 'KeyE': {
                    d3.event.preventDefault();
                    this.editPanelShow();
                    break;
                }
                case 'KeyC': {
                    d3.event.preventDefault();
                    this.createPanelShow();
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
        switch (this.selectedTerminal) {
            case 0: {
                switch (this.selectIndex) {
                    case 0: {
                        this.target.position = {x: 0, y: -180};
                        break;
                    }
                    case 1: {
                        this.target.position = {x: 0, y: 50};
                        break;
                    }
                    case 2: {
                        this.target.position = {x: 0, y: 320};
                        break;
                    }
                }

                break;
            }
            case 1: {
                switch (this.selectIndex) {
                    case 0: {
                        this.target.position = {x: 0, y: -300};
                        break;
                    }
                    case 1: {
                        this.target.position = {x: 0, y: -50};
                        break;
                    }
                    case 2: {
                        this.target.position = {x: 0, y: 200};
                        break;
                    }
                    case 3: {
                        this.target.position = {x: 0, y: 450};
                        break;
                    }
                }
                break;
            }
            case 2: {
                switch (this.selectIndex) {
                    case 0: {
                        this.target.position = {x: 0, y: -300};
                        break;
                    }
                    case 1: {
                        this.target.position = {x: 0, y: -100};
                        break;
                    }
                    case 2: {
                        this.target.position = {x: 0, y: 100};
                        break;
                    }
                    case 3: {
                        this.target.position = {x: 0, y: 300};
                        break;
                    }
                    case 4: {
                        this.target.position = {x: 0, y: 500};
                        break;
                    }
                    case 5: {
                        this.target.position = {x: 0, y: 650};
                        break;
                    }
                }
                break;
            }

        }
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
        } else if (this.target.zoom > 3) {
            this.target.zoom = 3;
        }
        this.mallSelection.style('transition', 'unset');
        if (this.mapSelected) {
            // webkitRequestAnimationFrame(() => {
            this.mallSelection.style('transform', ' scale(' + this.target.zoom + ')');
            // });
        } else {
            this.mallSelection.style('transform', 'rotateX(65deg) rotateZ(4deg) scale(' + this.target.zoom + ')');
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
            this.resetTargetZoom();
            this.initOrResetTargetPosition();
            this.changeToMallTransition();
            this.mallSelection.style('transform', null);
            // this.mallSelection.style('transform', 'rotateX(65deg) translateX(-120px)  skewX(-5deg)  scale(' + this.editTarget.zoom + ')');
        }
    }

    // 进入地图商户编辑模式
    resetMapWhenEnterEdit() {
        this.resetTargetZoom();
        this.initOrResetTargetPosition();
        this.changeToMallTransition();
        this.mallSelection.style('transform', null);
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
                } else if (this.target.zoom > 3) {
                    this.target.zoom = 3;
                }
                if (this.mapSelected) {
                    // webkitRequestAnimationFrame(() => {
                    this.mallSelection.style('transform', ' scale(' + this.target.zoom + ')');
                    // });
                } else {
                    this.mallSelection.style('transform', 'rotateX(65deg) rotateZ(4deg) scale(' + this.target.zoom + ')');
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


    /** 航站楼切换选择操作*/


    // 初始化调用接口
    getTerminalData() {
        this.terminal.initTerminal().pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res && res.size > 0) {
                this.initMaps = [];
                const file = new File([res], 'terminal.zip', {type: res.type});
                const jsZip = new JSZip();
                jsZip.loadAsync(file).then(zip => {
                    const zipFiles = zip.files;
                    const files: any[] = Object.values(zipFiles);
                    files.forEach(item => {
                        item.async('text').then(result => {
                            const svg = new SvgPreview();
                            svg.id = item.name.toLowerCase().split('.')[0];
                            svg.map = result;
                            this.initMaps.push(svg);
                            this.initEnd.next(1);
                        });
                    });
                });
            } else {
                // 接口返回为空 清除缓存
                sessionStorage.removeItem(this.t1Key);
                sessionStorage.removeItem(this.t2Key);
                sessionStorage.removeItem(this.t3Key);
                this.showEmptyTips();
                this.addQuickStartToDom();
            }
        }, error1 => {
            this.addQuickStartToDom();
            this.mapLoading = false;
        });
    }

    // 初始化航站楼数据
    initTerminal() {
        this.uploadFiles = [];
        switch (this.selectedTerminal) {
            case 0: {
                if (sessionStorage.getItem(this.t1Key)) {
                    this.mapLoading = true;
                    this.uploadFiles = JSON.parse(sessionStorage.getItem(this.t1Key));
                    this.loadSvgMap();
                    this.terminalOn = true;
                } else {
                    this.resetSelectedSvgElements();
                    this.terminalOn = false;
                }
                break;
            }
            case 1: {
                if (sessionStorage.getItem(this.t2Key)) {
                    this.mapLoading = true;
                    this.uploadFiles = JSON.parse(sessionStorage.getItem(this.t2Key));
                    this.loadSvgMap();
                    this.terminalOn = true;
                } else {
                    this.resetSelectedSvgElements();
                    this.terminalOn = false;

                }
                break;
            }
            case 2: {
                if (sessionStorage.getItem(this.t3Key)) {
                    this.mapLoading = true;
                    this.uploadFiles = JSON.parse(sessionStorage.getItem(this.t3Key));
                    this.loadSvgMap();
                    this.terminalOn = true;
                } else {
                    this.resetSelectedSvgElements();
                    this.terminalOn = false;
                }
                break;
            }
        }
    }

    // 切换选中航站楼
    changeTerminal(leftRight?) {
        if (leftRight === 'left') { // 按钮过渡动画
            this.leftOrRight = 'right';
        } else {
            this.leftOrRight = 'left';
        }
        if (this.mapLoading) { // 如果正在加载地图 组织切换
            return;
        }
        if (this.terminalStamp) {
            clearTimeout(this.terminalStamp);
        }
        this.terminalStamp = setTimeout(() => {
            if (leftRight === 'left') {
                this.selectedTerminal - 1 >= 0 ? this.selectedTerminal = this.selectedTerminal - 1 : this.selectedTerminal = this.terminals.length - 1;
            } else if (leftRight === 'right') {
                this.selectedTerminal + 1 < this.terminals.length ? this.selectedTerminal = this.selectedTerminal + 1 : this.selectedTerminal = 0;
            }
            setTimeout(() => {
                this.initTerminal();
                this.addClickEvent();
            }, 100);
        }, 200);
    }


    // 选择航站楼
    selectTerminal() {
        if (this.mapSelected) {
            this.returnAll();
        }
        this.changeTerminal();
    }

    // 楼层显示按钮控制楼层
    selectFloor(i) {
        if (this.dialogStamp) {
            clearTimeout(this.dialogStamp);
        }
        switch (this.selectedTerminal) { // 地图未就绪时候点击无效
            case 0: {
                if (!this.terminalOn) {
                    return;
                }
                break;
            }
            case 1: {
                if (!this.terminalOn) {
                    return;
                }
                break;
            }
            case 2: {
                if (!this.terminalOn) {
                    return;
                }
                break;
            }
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

    // 获取t1、t2、t3不同情况下的classes
    getSvgSelectClasses() {
        this.svgSelectClasses = [
            'svg-1-select',
            'svg-2-select',
            'svg-3-select',
            'svg-4-select',
            'svg-5-select',
            'svg-6-select'
        ];
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
        this.svgSelection.classed(this.chosenClass, false);
        this.totalSvgNodes.forEach((item, index) => {
            if (index < this.selectIndex) { // 下方按距离增加下移延迟 切换时需要少延时 否则地图会重叠
                item.parentNode.style.transitionDelay = (this.totalSvgNodes.length - (this.selectIndex - index)) * 0.1 + 's';
                item.parentNode.style.opacity = 0;
                item.parentNode.style.transform = 'translateZ(-1000px) translateY(2000px)';
            } else if (index > this.selectIndex) { // 上方
                item.parentNode.style.transitionDelay = (this.totalSvgNodes.length - (index - this.selectIndex)) * 0.1 + 's';
                item.parentNode.style.opacity = 0;
                item.parentNode.style.transform = 'translateZ(1000px) translateY(-2000px)';
            } else {
                item.parentNode.style = null;
                this.svgSelection = d3.select(item);
                this.chosenClass = this.svgSelectClasses[this.selectIndex];
                this.svgSelection.classed(this.chosenClass, true);
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

    // 初始化楼层控制显示按钮
    getButtons() {
        if (sessionStorage.getItem(this.t1Key)) {
            const t1 = JSON.parse(sessionStorage.getItem(this.t1Key));
            this.floorButtons1 = this.buttons.filter(button => t1.find(item => item.id.includes(button.title.toLowerCase())));
        }
        if (sessionStorage.getItem(this.t2Key)) {
            const t2 = JSON.parse(sessionStorage.getItem(this.t2Key));
            this.floorButtons2 = this.buttons.filter(button => t2.find(item => item.id.includes(button.title.toLowerCase())));
        }
        if (sessionStorage.getItem(this.t3Key)) {
            const t3 = JSON.parse(sessionStorage.getItem(this.t3Key));
            this.floorButtons3 = this.buttons.filter(button => t3.find(item => item.id.includes(button.title.toLowerCase())));
        }
    }

    // 清除楼层显示
    clearFloorSelected() {
        switch (this.selectedTerminal) {
            case 0: {
                this.floorButtons1.forEach(item => item.selected = false);
                break;
            }
            case 1: {
                this.floorButtons2.forEach(item => item.selected = false);
                break;
            }
            case 2: {
                this.floorButtons3.forEach(item => item.selected = false);
                break;
            }
        }
    }

    // 楼层显示按钮状态
    getFloorSelected() {
        switch (this.selectedTerminal) {
            case 0: {
                this.floorButtons1.forEach((item, index) => {
                    item.selected = index === this.selectIndex;
                });
                break;
            }
            case 1: {
                this.floorButtons2.forEach((item, index) => {
                    item.selected = index === this.selectIndex;
                });
                break;
            }
            case 2: {
                this.floorButtons3.forEach((item, index) => {
                    item.selected = index === this.selectIndex;
                });
                break;
            }
        }
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
                this.chosenClass = this.svgSelectClasses[index];
            }
        });
        this.initOrResetTargetPosition();
        this.resetTargetZoom();
        this.getFloorSelected();
        this.totalSvgNodes.forEach((item, index) => {
            if (index < this.selectIndex) { // 下方按距离增加下移延迟
                if (this.selectedTerminal === 2) {
                    item.parentNode.style.transitionDelay = (this.totalSvgNodes.length - (this.selectIndex - index)) * 0.1 + 's';
                } else {
                    item.parentNode.style.transitionDelay = (this.totalSvgNodes.length - (this.selectIndex - index)) * 0.2 + 's';
                }
                item.parentNode.style.opacity = 0;
                item.parentNode.style.transform = 'translateZ(-1000px) translateY(2000px)';
            } else if (index > this.selectIndex) { // 上方
                if (this.selectedTerminal === 2) {
                    item.parentNode.style.transitionDelay = (this.totalSvgNodes.length - (index - this.selectIndex)) * 0.1 + 's';
                } else {
                    item.parentNode.style.transitionDelay = (this.totalSvgNodes.length - (index - this.selectIndex)) * 0.2 + 's';
                }
                item.parentNode.style.opacity = 0;
                item.parentNode.style.transform = 'translateZ(1000px) translateY(-2000px';
            }
            // if (index !== this.selectIndex) {
            //     d3.select(item.parentNode).classed('after-hide', true);
            // }
        });
        this.addD3DragListener();
        this.addD3ShortcutKeysListener();
        if (this.svgSelection) {
            this.svgSelection.classed(this.chosenClass, true); // 添加选中的对应class 处理摆放位置
        }
        this.floorSelected();
        this.mapSelected = true; // 选中地图进入编辑
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
        const relationVm = {areaNo: path.areaNo, relation: true, storeDTO: this.selectStore};
        this.terminal.relationStore(relationVm).pipe(takeUntil(this._unsubscribeAll)).subscribe(r => {
            if (r && r.status === 200) {
                // path.storeNo = this.selectStore.storeNo;
                // path.storeName = this.selectStore.storeName;
                // path.corresponding = true;
                // const originPath = this.pathList.find(item => item.areaNo === path.areaNo);
                // originPath.storeNo = path.storeNo;
                // originPath.corresponding = path.corresponding;
                // originPath.storeName = path.storeName;
                // this.searchList = this.filterPathList;
                this.getCorrespondingStores(true, path);
            }
        }, error => {

        });
    }

    // 商户信息对应
    openCorresponding(path: Path) {
        if (this.dialogStamp) {
            clearTimeout(this.dialogStamp);
        }
        this.dialogStamp = setTimeout(() => {
            this.closeMapEdit();
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
                        // const pathFind = this.filterPathList.find(item => item.areaNo === this.areaNoControl.value);
                        // if (pathFind) {
                        //     const corresponding = this.storeNoControl.value;
                        //     pathFind.storeNo = corresponding; // 是一个对象
                        //     pathFind.corresponding = true;
                        //     pathFind.storeName = corresponding.storeName;
                        //     this.filterStores = this.filterStores.filter(item => item.storeNo !== corresponding.storeNo);
                        //     this.enterMapDetail(pathFind);
                        // }
                        // const originPath = this.pathList.find(item => item.areaNo === pathFind.areaNo);
                        // originPath.storeNo = pathFind.storeNo;
                        // originPath.corresponding = pathFind.corresponding;
                        // originPath.storeName = pathFind.storeName;
                        // this.searchList = this.filterPathList;
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

    // 清除总容器mall 的transition延时
    clearTransition() {
        this.mallTransition = false;
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
            this.mallSelection.node().style = null;
            if (this.svgSelection) {
                this.svgSelection.classed(this.chosenClass, false);
            }
            this.mallSelection.selectAll('svg').on('.drag', null);
            this.svgSelection = null;
            this.pathSelection.classed('path-hover', false);
            this.cancelPathSelected();
            this.resetPath();
            this.searchComponent.clearInput();
            this.totalSvgNodes.forEach(item => {
                item.parentNode.style = null;
                item.style = null;
                // d3.select(item.parentNode).classed('after-hide', false);
            });
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
    floor: string; // 楼层
    lastModifiedBy: string; // 修改人
    lastModifiedDate: string; // 修改时间
    showName: string;  // 显示名称
    storeName: string; // pos商户名称
    storeNo: string;  // pos商户编号
    terminalName: string; // 航站楼
    labels: any[]; // 当前对应的标签
    terminalNo: string; // 航站楼编号
    createdBy: string;  // 创建人
    createdDate: string; // 创建时间
    enabled: boolean;  // 是否有效
    logo: string;       // logo
    source: string;  // 来源
    desc: string; // 描述
}

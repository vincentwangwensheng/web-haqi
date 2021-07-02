import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {FormControl, FormGroup} from '@angular/forms';
import {HistorySearchComponent} from '../../../components/history-search/history-search.component';
import {SidebarService} from '../../../../@fuse/components/sidebar/sidebar.service';
import {TranslateService} from '@ngx-translate/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';
import {Utils} from '../../../services/utils';
import {FuseProgressBarService} from '../../../../@fuse/components/progress-bar/progress-bar.service';
import {FileDownloadService} from '../../../services/file-download.service';
import {DateTransformPipe} from '../../../pipes/date-transform/date-transform.pipe';
import {debounceTime, takeUntil} from 'rxjs/operators';
import * as d3 from 'd3';
import * as JSZip from 'jszip/dist/jszip.js';
import {fuseAnimations} from '../../../../@fuse/animations';
import * as heatMap from 'heatmap.js/build/heatmap.js';
import {TerminalService} from '../../../services/terminalService/terminal.service';
import {MapAnalysisService} from './map-analysis.service';


@Component({
    selector: 'app-map-analysis',
    templateUrl: './map-analysis.component.html',
    styleUrls: ['./map-analysis.component.scss'],
    animations: fuseAnimations
})
export class MapAnalysisComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject();
    selectedTerminal = 0;
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
    slideOnOff = true;
    shortcutKeys: any = {all: [], map: [], share: []}; // 快捷鍵

    // upload svg
    filesLength: number[] = [3, 4, 6];
    terminalOn = false; // 是否加载了地图
    username = ''; // 登录用户名
    animationKey = '';
    historyKey = '';
    onSaving = false; // 是否在保存
    rows: SvgHistory[] = [];
    columns = [
        {name: 'fileName'},
        {name: 'uploadPerson'},
        {name: 'uploadTime'}
    ];

    // 地图商户编辑
    pathList: any[] = []; // 总单元数据list
    bTypePathList: any[] = []; // 总业态列表
    filterBTypePathList = []; // 显示的列表
    searchBTypePathList = []; // 查询的筛选列表
    noTypePathList: any = {name: 'airport.bType.noType', pathList: [], color: '#aaaaaa', folded: false}; // 无业态总列表
    filterNoTypeList: any = {name: 'airport.bType.noType', pathList: [], color: '#aaaaaa', folded: false}; // 显示的列表
    searchNoTypeList: any = {name: 'airport.bType.noType', pathList: [], color: '#aaaaaa', folded: false}; // 筛选的总列表
    enterTimestamp; // 搜索列表时间戳
    pathClicked = false; // 点击单元时立即取消商场编辑
    visible = true;
    tags = [];
    selectedTags = [];

    historySearch = []; // 搜索历史
    inputValue = ''; // 搜索框值绑定
    selectStore: Store = null; // 选择对应的店铺
    selectStores = [];
    currentPath: any = null; // 当前选中的单元
    showInfo = false; // 展示单元号信息
    changeFloor = false;
    logo = {id: 'logo', loading: false};


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
    @ViewChild('historySearch', {static: true})
    searchComponent: HistorySearchComponent;

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
    terminalNo = ''; // 上传地图后读取的terminalNo
    onSvgLoading = false; // 读取文件添加到数组中
    onMapLoading = false; // 读取地图内容添加到数组中

    /** 地图热力图层*/

    showHeat = false; // 显示热力图层
    showHeatToggle = false; // 显示热力图层开关
    heatMapInstance: any; // heatMap实例
    showTrend = false; // 显示热力动向
    trendInterval: any; // 动向定时器
    intervalTime = 1000; // 定时间隔
    importCs = []; // 摄像头等其他的id

    /** 地图数据分析*/


    constructor(
        private sidebarService: SidebarService,
        private translate: TranslateService,
        public dialog: MatDialog,
        private snackBar: MatSnackBar,
        private sanitizer: DomSanitizer,
        private mapService: MapAnalysisService,
        private utils: Utils,
        private terminal: TerminalService,
        private loading: FuseProgressBarService,
    ) {
        this.terminalForm = new FormGroup({
            id: new FormControl({value: true, disabled: true}),
            terminalId: new FormControl({value: true, disabled: true}),
            terminalNo: new FormControl({value: true, disabled: true}),
            terminalName: new FormControl({value: true, disabled: true}),
            mallId: new FormControl({value: true, disabled: true}),
            mallName: new FormControl({value: true, disabled: true}),
            blocId: new FormControl({value: true, disabled: true}),
            blocName: new FormControl({value: true, disabled: true}),
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
        if (localStorage.getItem(this.username + 'MapAnalysis')) {
            this.initTerminalMapByNo(localStorage.getItem(this.username + 'MapAnalysis'), true);
        }
    }

    // saiku返回数据
    getStoreSales() {
        return new Promise<any[]>(resolve => {
            this.mapService.getSaikuData('allstoresalebymap_bcia').subscribe(res => {
                resolve(res.cellset);
            }, error1 => resolve([]));
        });
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
            if (node) {
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
            }
        });
    }

    // 地图绘制
    loadMaps(init?) {
        return new Promise<any>(resolve => {
            this.uploadMaps.forEach((item, index, arr) => {
                this.writeMapToHtml(arr.length, index, item);
            });
            this.mallTransition = true;
            setTimeout(() => {
                this.setSvgContentPosition();
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
                this.getCorrespondingStores().then(() => {
                    // 匹配saiku销售数据
                    this.getStoreSales().then(res => {
                        res.forEach(item => {
                            const path = this.pathList.find(p => p.storeNo === item[0].value);
                            if (path) {
                                console.log('已匹配storeNo', path.storeNo);
                                path.weekSale = item[1] ? '￥' + item[1].value : '';
                                path.weekPrice = item[2] ? '￥' + item[2].value : '';
                                path.weekRatio = item[3] ? item[3].value : '';
                                path.weekFlow = item[4] ? item[4].value : '';
                                path.weekAverageSale = item[5] ? '￥' + item[5].value : '';
                                path.weekAveragePrice = item[6] ? '￥' + item[6].value : '';
                                path.weekAverageRatio = item[7] ? item[7].value : '';
                                path.weekAverageFlow = item[8] ? item[8].value : '';
                                path.monthSale = item[9] ? '￥' + item[9].value : '';
                                path.monthPrice = item[10] ? '￥' + item[10].value : '';
                                path.monthRatio = item[11] ? item[11].value : '';
                                path.monthFlow = item[12] ? item[12].value : '';
                                path.monthAverageSale = item[13] ? '￥' + item[13].value : '';
                                path.monthAveragePrice = item[14] ? '￥' + item[14].value : '';
                                path.monthAverageRatio = item[15] ? item[15].value : '';
                                path.monthAverageFlow = item[16] ? item[16].value : '';
                                path.yearSale = item[17] ? '￥' + item[17].value : '';
                                path.yearPrice = item[18] ? '￥' + item[18].value : '';
                                path.yearRatio = item[19] ? item[19].value : '';
                                path.yearFlow = item[20] ? item[20].value : '';
                                path.yearAverageSale = item[21] ? '￥' + item[21].value : '';
                                path.yearAveragePrice = item[22] ? '￥' + item[22].value : '';
                                path.yearAverageRatio = item[23] ? item[23].value : '';
                                path.yearAverageFlow = item[24] ? item[24].value : '';
                                path.current = 'week';
                                this.getPathCompare(path, 'week');
                                this.getPathCompare(path, 'month');
                                this.getPathCompare(path, 'year');
                            }
                        });
                    });
                    this.getSelectionsAndAddPoints();
                    this.animationOn = true;
                    this.initConfig(); // 初始化配置
                    this.getCameraNos(this.terminalNo).then(data => {
                        this.importCs = data;
                        this.importCs.forEach(item => {
                            item.hots = item.hots.split(',');
                            item.trendHots = item.hots;
                        });
                    });
                    // 获取模拟数据
                    // this.getAreaNos(this.terminalNo).then(areaNos => {
                    //     let flag = false;
                    //     this.pathList.forEach(item => {
                    //         const areaNo = areaNos.find(area => item.areaNo === area.areaNo);
                    //         if (areaNo) {
                    //             item.hot = areaNo.hot;
                    //             item.hots = areaNo.hots.split(',');
                    //             item.hots.shift();
                    //             item.trendHots = item.hots;
                    //             flag = areaNo.hot && areaNo.hots;
                    //         }
                    //     });
                    //     // 没有热力数据
                    //     if (!flag) {
                    //         this.showHeatToggle = false;
                    //     }
                    // });
                });
            }, 2000);
            resolve();
        });
    }

    // 获取相关数据和同层对比情况
    getPathCompare(path, prefix: 'week' | 'month' | 'year') {
        const keys = [{base: 'Sale', average: 'AverageSale'},
            {base: 'Price', average: 'AveragePrice'},
            {base: 'Ratio', average: 'AverageRatio'},
            {base: 'Flow', average: 'AverageFlow'}];
        keys.forEach(item => {
            item.base = prefix + item.base;
            item.average = prefix + item.average;
            const base = Number(path[item.base].replace(/,/g, '').replace(/￥/g, '').replace(/%/g, ''));
            const average = Number(path[item.average].replace(/,/g, '').replace(/￥/g, '').replace(/%/g, ''));
            if (base > average) {
                path[item.base + 'Compare'] = 'up';
            } else if (base === average) {
                path[item.base + 'Compare'] = 'same';
            } else {
                path[item.base + 'Compare'] = 'down';
            }
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
                            path.logo = this.utils.getImgUrlBySaveId(store.logo);
                            path.score = store.score;
                            path.businessType.name = store.businessType ? store.businessType : '';
                        } else {
                            path.storeName = '';
                            path.storeNo = '';
                            path.businessType = new BusinessType();
                            path.corresponding = false;
                            path.logo = '';
                            path.score = '';
                        }
                    });
                    // 过滤已对应的单元号
                    this.pathList = this.pathList.filter(path => path.corresponding);
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
        this.uploadMaps.forEach(item => {
            const firstIds = item.map.split('id="');
            firstIds.forEach((id, index) => {
                if (index !== 0) {
                    const no = id.substring(0, id.indexOf('"'));
                    const reg = /^[0-9A-Z]+-[0-9A-Z]+-S[0-9]+$/;
                    if (reg.test(no)) {
                        // 上传文件或者接口获取的单元号
                        const newPath: any = {};
                        newPath.areaNo = no;
                        newPath.selected = false;
                        newPath.corresponding = false;
                        newPath.businessType = new BusinessType();
                        this.pathList.push(newPath);
                    }
                    // const reg1 = /^[0-9A-Z]+-[0-9A-Z]+-C[0-9A-Z]+$/;
                    // if (reg1.test(no)) {
                    //     const cameraNo = {cameraNo: no, hot: Math.floor(Math.random() * 100)};
                    //     this.importCs.push(cameraNo);
                    // }
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
                    this.returnAll();
                    this.uploadMaps = []; // 清空地图信息
                    this.uploadSVGs = [];
                    this.uploadFiles = [];
                }
                this.initTerminalMapByNo(option.terminalNo);
            }
            this.filterTerminal = this.utils.getFilterOptions(this.terminalControl, this.terminalSources, 'terminalNo', 'terminalName');

        }
    }

    // 从街区编号初始化街区数据和地图
    initTerminalMapByNo(no, cache?) {
        this.mapLoading = true;
        this.terminalNo = no;
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
                localStorage.setItem(this.username + 'MapAnalysis', res.terminalNo);
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

    // 获取单元号和热力数据
    getAreaNos(terminalNo) {
        return new Promise<any>(resolve => {
            this.mapService.getAreaHot(terminalNo).subscribe(res => {
                this.showHeatToggle = true;
                resolve(res);
            });
        });
    }

    // 获取摄像头号和热力数据
    getCameraNos(terminalNo) {
        return new Promise<any>(resolve => {
            this.mapService.getCameraHot('2020-04-30', terminalNo).subscribe(res => {
                this.showHeatToggle = true;
                resolve(res);
            });
        });
    }


    // 初始化街区地图
    initSvg(mallId, terminalNo) {
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
                                const floorName = map.name.substring(map.name.indexOf('-') + 1, map.name.indexOf('.'));
                                map.floor = floorName;
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
                                const floorName = svg.name.substring(svg.name.indexOf('-') + 1, svg.name.indexOf('.'));
                                svg.floor = floorName;
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
            this.searchBTypePathList.forEach((item) => {
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

    // 获取带selection 还有添加path坐标点
    getSelectionsAndAddPoints() {
        this.mallSelection = d3.select('#mall');
        if (localStorage.getItem(this.username + 'AnalysisZoom')) { // 如果存在缩放缓存
            this.target.mallZoom = JSON.parse(localStorage.getItem(this.username + 'AnalysisZoom'));
            this.target.zoom = this.target.mallZoom;
            this.mallSelection.style('transform', 'rotateX(65deg) skewX(-5deg) scale(' + this.target.zoom + ')');
        }
        this.pathList.forEach(path => {
            if (path.corresponding) {
                const pathElement = document.getElementById(path.areaNo);
                this.addPointToPath(pathElement);
            }
        });
    }

    // 在path上添加点
    addPointToPath(path) {
        const rec = path.getBBox();
        let x = rec.x + rec.width / 2;
        let y = rec.y + rec.height / 2;
        const use = d3.select(path.viewportElement).append('use').attr('xlink:href', '#place');
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
        this.pathList.forEach(item => d3.select('#' + item.areaNo).classed('path-hover', true));
        this.bTypePathList.forEach(item => {
            this.searchBTypePathList.find(type => type.id === item.id).pathList = this.filterBTypePathList.find(type => type.id === item.id).pathList
                = item.pathList.filter(path => path.areaNo && path.areaNo.toLowerCase().indexOf(this.uploadMaps[this.selectIndex].id) !== -1);
        });
        this.searchNoTypeList.pathList = this.filterNoTypeList.pathList =
            this.noTypePathList.pathList.filter(path => path.areaNo && path.areaNo.toLowerCase().indexOf(this.uploadMaps[this.selectIndex].id) !== -1);

    }

    // 通过右侧点击进入地图
    enterMapByPath(path) {
        // 如果当前已经是点击的path则return
        if (this.currentPath && this.currentPath.areaNo === path.areaNo) {
            this.getAreaInfoPosition(this.currentPath.areaNo);
            this.showInfo = true;
            return;
        }
        if (this.enterTimestamp) {
            clearTimeout(this.enterTimestamp);
        }
        if (this.clearTimeStamp) { // 返回时又点击了新的单元号
            clearTimeout(this.clearTimeStamp);
        }
        this.pathClicked = true;
        this.animationOn = false;
        this.enterTimestamp = setTimeout(() => {
            this.getPathSelected(path);
            this.currentPath = path;
            if (path.corresponding) {
                this.enterMapDetail(path);
            }
        }, 300);
    }


    // 进入地图点击
    enterMapDetail(path) {
        this.getAreaInfoPosition(path.areaNo);
        if (this.mapSelected) {
            this.showInfo = true;
        } else {
            setTimeout(() => {
                this.showInfo = true;
            }, 1200);
        }
    }

    // 打开热力动向
    openOrCloseHeatTrend(event) {
        if (event.checked) {
            this.openHeatTrend();
        } else {
            this.closeHeatTrend();
        }
    }

    openHeatTrend() {
        this.trendInterval = setInterval(() => {
            const points = [];
            let max = 0;
            this.importCs.forEach(item => {
                if (item.cameraNo.toUpperCase().includes(this.uploadMaps[this.selectIndex].id.toUpperCase())) {
                    const path = document.getElementById(item.cameraNo) as any;
                    if (path) {
                        const rec = path.getBoundingClientRect();
                        const viewRec = path.viewportElement.getBoundingClientRect();
                        const x = Math.round((rec.x - viewRec.x + rec.width / 2) / this.target.zoom);
                        const y = Math.round((rec.y - viewRec.y + rec.height / 2) / this.target.zoom);
                        const point = {
                            x: x,
                            y: y,
                            value: item.trendHots[0],
                            radius: Math.round(Math.min(rec.width, rec.height) / this.target.zoom) * 2.5
                        };
                        max = Math.max(max, point.value);
                        points.push(point);
                    }
                }
                const first = item.trendHots.shift();
                item.trendHots.push(first);
            });
            const data = {min: 0, max: max, data: points};
            this.heatMapInstance.setData(data);
        }, this.intervalTime);

    }

    closeHeatTrend() {
        clearInterval(this.trendInterval);
        const points = [];
        let max = 0;
        this.importCs.forEach(item => {
            item.trendHots = item.hots;
            if (item.cameraNo.toUpperCase().includes(this.uploadMaps[this.selectIndex].id.toUpperCase())) {
                const path = document.getElementById(item.cameraNo) as any;
                const rec = path.getBoundingClientRect();
                const viewRec = path.viewportElement.getBoundingClientRect();
                const x = Math.round((rec.x - viewRec.x + rec.width / 2) / this.target.zoom);
                const y = Math.round((rec.y - viewRec.y + rec.height / 2) / this.target.zoom);
                const point = {
                    x: x,
                    y: y,
                    value: item.hot,
                    radius: Math.round(Math.min(rec.width, rec.height) / this.target.zoom) * 2.5
                };
                max = Math.max(max, point.value);
                points.push(point);
            }
        });
        const data = {min: 0, max: max, data: points};
        this.heatMapInstance.setData(data);
    }


    // 显示隐藏热力图曾
    showOrHideHeatMap(event) {
        if (event.checked) {
            this.getHeatMap();
            this.showInfo = false;
        } else {
            this.hideHeatMap();
        }
    }

    hideHeatMap() {
        d3.selectAll('.heatmap-canvas').remove();
        this.showHeat = false;
        if (this.trendInterval) {
            clearInterval(this.trendInterval);
            this.showTrend = false;
        }
    }

    // 获取热力图层
    getHeatMap() {
        // create configuration object
        const config = {
            container: document.getElementById(this.uploadMaps[this.selectIndex].id),
        };
        this.heatMapInstance = heatMap.create(config);
        const points = [];
        let max = 0;
        this.importCs.forEach(item => {
            if (item.cameraNo.toUpperCase().includes(this.uploadMaps[this.selectIndex].id.toUpperCase())) {
                const path = document.getElementById(item.cameraNo) as any;
                if (path) {
                    const rec = path.getBoundingClientRect();
                    const viewRec = path.viewportElement.getBoundingClientRect();
                    const x = Math.round((rec.x - viewRec.x + rec.width / 2) / this.target.zoom);
                    const y = Math.round((rec.y - viewRec.y + rec.height / 2) / this.target.zoom);
                    const point = {
                        x: x,
                        y: y,
                        value: item.hot,
                        radius: Math.round(Math.min(rec.width, rec.height) / this.target.zoom) * 2.5
                    };
                    max = Math.max(max, point.value);
                    points.push(point);
                }
            }

        });

        const data = {min: 0, max: max, data: points};
        this.heatMapInstance.setData(data);
        const canvasSelection = d3.select('.heatmap-canvas');
        canvasSelection.style('transform', 'translate(' + this.target.position.x + 'px,' + this.target.position.y + 'px)');
        this.addD3DragTOCanvas();
    }

    // 像canvas上添加拖动事件
    addD3DragTOCanvas() {
        const canvasSelection = d3.select('.heatmap-canvas');
        canvasSelection.call(d3.drag().on('drag', () => {
            // this.clearTransition();
            this.svgSelection.style('cursor', 'grab');
            this.svgSelection.style('transition', 'transform 0.6s');
            canvasSelection.style('transition', 'transform 0.6s');
            this.target.position.x += Math.round(d3.event.dx / this.target.zoom);
            this.target.position.y += Math.round(d3.event.dy / this.target.zoom);
            // window.webkitRequestAnimationFrame(() => {
            this.svgSelection.style('transform', 'translate(' + this.target.position.x + 'px,' + this.target.position.y + 'px)');
            canvasSelection.style('transform', 'translate(' + this.target.position.x + 'px,' + this.target.position.y + 'px)');
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
            this.showInfo = false;
            if (this.trendInterval) {
                clearInterval(this.trendInterval);
            }
            if (this.showTrend) {
                this.openHeatTrend();
            }
            // });
        }));
    }

    // 获取单元详情浮框位置
    getAreaInfoPosition(areaNo) {
        const pathElement = document.getElementById(areaNo.replace('S', 'P')) as any;
        const rect = pathElement.getBoundingClientRect();
        this.currentPath.x = Math.round(rect.x - 180) + 'px';
        // this.currentPath.y = Math.round(rect.y - 180) + 'px';
    }

    // 地图选中和颜色加深效果
    getPathSelected(path) {
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

    // 清除pathList
    clearPathList() {
        this.resetSelectedSvgElements();
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
            }
        });
    }

    // 组件销毁取消全局dom监听 以及观察者
    ngOnDestroy(): void {
        d3.select(document).on('#mallContainer', null); // 取消对全局document的监听
        if (this.trendInterval) {
            clearInterval(this.trendInterval);
        }
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
            const canvasSelection = d3.select('.heatmap-canvas');
            if (canvasSelection.node()) {
                canvasSelection.style('transition', 'transform 0.6s');
                canvasSelection.style('transform', 'translate(' + this.target.position.x + 'px,' + this.target.position.y + 'px)');
            }
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
            this.showInfo = false;
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
            localStorage.setItem(this.username + 'AnalysisZoom', JSON.stringify(this.target.mallZoom));
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
            this.changeToScaleTransition();
            if (this.svgSelection) {
                this.svgSelection.style('cursor', 'all-scroll');
            }
            let selection;
            this.showInfo = false;
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
                    localStorage.setItem(this.username + 'AnalysisZoom', JSON.stringify(this.target.mallZoom));
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
                if (this.trendInterval) {
                    clearInterval(this.trendInterval);
                }
                if (this.showTrend) {
                    this.openHeatTrend();
                }

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
        this.hideHeatMap();
        this.showInfo = false;
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
            this.showInfo = false;
            this.hideHeatMap();
            this.pathClicked = false;
            this.currentPath = null;

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
            if (this.pathList.length > 0) {
                this.pathList.forEach(item => d3.select('#' + item.areaNo).classed('path-hover', false));
            }
            this.cancelPathSelected();
            this.resetPath();
            this.searchComponent.clearInput();
            this.setSvgContentPosition(true);
        }, 300);
    }


    openSidebar() {
        this.sidebarService.getSidebar('carded-right-sidebar-2').toggleOpen();
    }
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
    score: string;
    source: string;  // 来源
    desc: string; // 描述
}

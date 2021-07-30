import {
    AfterViewInit,
    Component,
    ElementRef,
    HostListener,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild
} from '@angular/core';
import * as d3 from 'd3';
import * as JSZip from 'jszip/dist/jszip.js';
import {v4 as uuidv4} from 'uuid';
import {MatDialog, MatSnackBar} from '@angular/material';
import {fuseAnimations} from '../../../../../../@fuse/animations';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {FileDownloadService} from '../../../../../services/file-download.service';
import {ActivatedRoute, Router} from '@angular/router';
import {LayoutControlService} from '../../../../../services/layout-control.service';
import {Subject, forkJoin} from 'rxjs';
import {StrategyService} from '../strategy.service';
import {TranslateService} from '@ngx-translate/core';
import {parse, stringify} from 'flatted/esm';
import {BaseOptions} from 'flatpickr/dist/types/options';
import {FuseProgressBarService} from '../../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../../../services/notify-asyn.service';
import {HttpClient} from '@angular/common/http';
import {map, takeUntil} from 'rxjs/operators';
import {SidebarService} from '../../../../../../@fuse/components/sidebar/sidebar.service';
import {Utils} from '../../../../../services/utils';
import {DatePipe} from '@angular/common';
import {DateTransformPipe} from '../../../../../pipes/date-transform/date-transform.pipe';
import {memberStrategy, orderStrategy} from './strategyType';

@Component({
    selector: 'app-edit-strategy',
    templateUrl: './edit-strategy.component.html',
    styleUrls: ['./edit-strategy.component.scss'],
    animations: fuseAnimations
})
export class EditStrategyComponent implements OnInit, AfterViewInit, OnDestroy {
    private unsubscribeAll = new Subject();
    process: Process = new Process(); // 营销策略
    processId = ''; // 流程的随机uuid
    // 操作面板
    triggers: Control[] = []; // 触发器
    controls: Control[] = []; // 过程控制
    actuators: Control[] = []; // 执行器
    operations: Control[] = []; // 其他

    // 流程绘制
    svgCanvas: HTMLElement;
    dragControl;
    offset = {x: 0, y: 0};
    // 流程元素
    nodes: Node[] = [];
    // 是否是DAG（有向无环图）
    isDAG = false;
    edges: Line[] = []; // 连接线元素
    svgScale = 1; // svg缩放比例
    // svg d3Selection
    svgSelection;
    canvasListener = false;

    // 连线相关
    position: Point = null; // 点击的节点位置
    drawFlag = false; // 是否开启绘制
    drawLine: any = null; // 连接线
    targetNode: Node = new Node(); // 目标节点
    sourceNode: Node = new Node(); // 起源节点

    // 属性相关
    selectElement: Line | Node | any; // 选中节点
    editControlsPosition: any = {left: 0, top: 0}; // 浮动操作面板位置
    editPosition: any = {left: 0, top: 0}; // 编辑面板
    changeTypePosition: any = {left: 0, top: 0}; // 更改类型面板位置
    label = '';
    inputPosition: any = {left: 0, top: 0}; // 文本框位置
    showEditControls = false; // 是否显示浮动面板
    showEditPanel = false; // 是否显示编辑面板
    showInput = false; // 是否显示input输入框
    showChangeType = false; // 是否显示更改类型面板
    editControls: Control[] = []; // 连接的类型
    changedTypes: Control[] = []; // 更改类型
    cachedTypes: Control[] = [];
    errorMsg: ''; // 连线操作时的错误信息
    /**编辑节点详情相关 */
    selectedCouponRules = []; // 发券
    selectedMsgTemplate = {}; // 消息

    /**标签分流*/
    selectedTags = [];
    /**消费店铺*/
    selectedStores = [];
    selectedMalls = [];
    noShortcut = false; // 快捷键例外
    // 选择营销活动
    selectedActivity = null;
    currentActivity = null;
    editTimestamp; // timestamps
    shortcutKeys = []; // shortcutKeys
    propertyOpenFold = false; // 默认展开
    isFullScreen = false; // 是否处于全屏状态
    finished = false; // 是否保存完成
    startConfig: Partial<BaseOptions>;
    endConfig: Partial<BaseOptions>;
    // 弹框
    @ViewChild('clearCanvas', {static: true})
    clearCanvas: TemplateRef<any>;
    @ViewChild('changeClear', {static: true})
    changeClear: TemplateRef<any>;
    // 离开提醒
    @ViewChild('canLeave', {static: true})
    canLeave: TemplateRef<any>;
    // 流程文本输入框
    @ViewChild('textInput', {static: false})
    textInput: ElementRef<any>;
    strategy: FormGroup; // 策略属性表单
    /** 从已有数据中读取策略图形再次编辑*/
    isReload = false; // 是否带参编辑
    isCopy = false; // 是否复刻
    detailId = '';
    currentProject = '';
    links = [{name: '权益策略'}, {name: '活动策略'}];
    activeLink = 0;
    /** 节点属性*/
    dateConfig: Partial<BaseOptions> = {
        dateFormat: 'Y-m-d'
    };
    birthGroup: FormGroup;
    storeGroup: FormGroup;
    levelGroup: FormGroup;
    memberLevelInfo = ''; // 等级调整信息
    memberLevelList = [];
    memberLevelFilter = ''; // 等级过滤
    levels: any[] = [];
    selectPercentOptions = [20, 40, 50, 60, 80, 100];
    residueSelected = 0;
    givePointGroup: FormGroup;

    consumeAmountGroup: FormGroup; // 金额过滤
    storeFilterGroup: FormGroup; // 店铺过滤
    mallFilterGroup: FormGroup; // 商场过滤
    dateFilterGroup: FormGroup; // 日期过滤
    orderPointFilterControl = new FormControl('', Validators.required); // 金额过滤
    weekList = [];
    dayList = [];

    constructor(
        private fileDownload: FileDownloadService,
        public dialog: MatDialog,
        private http: HttpClient,
        private notify: NotifyAsynService,
        private layout: LayoutControlService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private loading: FuseProgressBarService,
        private translate: TranslateService,
        private snackBar: MatSnackBar,
        private sidebarService: SidebarService,
        private strategyService: StrategyService,
        private util: Utils,
        private datePipe: DatePipe,
        private dateTransformPipe: DateTransformPipe
    ) {
        this.detailId = this.activatedRoute.snapshot.queryParamMap.get('id');
        this.isCopy = Boolean(this.activatedRoute.snapshot.queryParamMap.get('enabled'));
        this.activeLink = this.activatedRoute.snapshot.queryParamMap.get('type') === 'Member' ? 1 : 0;
        if (this.detailId) {
            this.isReload = true;
            this.startConfig = {
                enableTime: true,
                time_24hr: true,
                defaultHour: 0,
                enableSeconds: true
            };
            this.endConfig = {
                enableTime: true,
                time_24hr: true,
                defaultHour: 23,
                defaultMinute: 59,
                defaultSeconds: 59,
                enableSeconds: true
            };
        } else {
            this.startConfig = {
                enableTime: true,
                time_24hr: true,
                defaultHour: 0,
                minDate: new Date(new Date(new Date().toLocaleDateString()).getTime()),
                enableSeconds: true
            };
            this.endConfig = {
                enableTime: true,
                time_24hr: true,
                defaultHour: 23,
                defaultMinute: 59,
                defaultSeconds: 59,
                enableSeconds: true
            };
        }
        if (localStorage.getItem('currentProject')) {
            this.currentProject = localStorage.getItem('currentProject');
        }
        this.strategy = new FormBuilder().group({
            id: new FormControl(''),
            name: new FormControl('', Validators.required),
            type: new FormControl(),
            enabled: new FormControl(false),
            description: new FormControl(''),
            beginDate: new FormControl('', Validators.required),
            endDate: new FormControl('', Validators.required)
        });
        this.birthGroup = new FormGroup({
            magnification: new FormControl(1, Validators.required),
            range: new FormControl('DAY', Validators.required),
            validPeriod: new FormControl('', Validators.required),
            periodType: new FormControl('CUSTOM', Validators.required)
        });
        this.birthGroup.get('magnification').valueChanges.subscribe(res => {
            this.util.transformToNumberWithControl(res, this.birthGroup.get('magnification'), 1, 9999);
        });
        this.givePointGroup = new FormGroup({
            point: new FormControl(1, Validators.required),
            expireDate: new FormControl('', Validators.required)
        });
        this.givePointGroup.get('point').valueChanges.subscribe(res => {
            this.util.transformToNumberWithControl(res, this.givePointGroup.get('point'), 1, 9999);
        });
        /** 订阅店铺表单设置属性*/
        this.storeGroup = new FormGroup({
            magnification: new FormControl(1, Validators.required),
            store: new FormControl([]),
            validPeriod: new FormControl('', Validators.required),
            periodType: new FormControl('CUSTOM', Validators.required)
        });
        this.storeGroup.get('magnification').valueChanges.subscribe(res => {
            this.util.transformToNumberWithControl(res, this.storeGroup.get('magnification'), 1, 9999);
        });
        /** 金额过滤表单设置属性*/
        this.consumeAmountGroup = new FormGroup({
            operator: new FormControl('GREATEREQUALEQUAL', Validators.required),
            value: new FormControl(1, Validators.required)
        });
        this.consumeAmountGroup.get('value').valueChanges.subscribe(res => {
            this.util.transformToNumberWithControl(res, this.consumeAmountGroup.get('value'), 1, 9999999);
        });
        /** 店铺过滤表单设置属性*/
        this.storeFilterGroup = new FormGroup({
            store: new FormControl([])
        });
        /** 商场过滤表单设置属性*/
        this.mallFilterGroup = new FormGroup({
            mall: new FormControl([])
        });
        /** 日期过滤表单属性 **/
        this.dateFilterGroup = new FormGroup({
            type: new FormControl('WEEK'),
            dayOrWeek: new FormControl('', Validators.required)
        });
        const list = ['一', '二', '三', '四', '五', '六', '日'];
        for (let i = 0; i < 7; i++){
            this.weekList.push({index: i, value: i + 1 + '', checked: false, desc: '周' + list[i]});
        }
        for (let i = 0; i < 31; i++){
            this.dayList.push({index: i, value: i + 1 + '', checked: false, desc: i + 1 + '号'});
        }
        /** 订阅等级表单变更设置属性*/
        this.levelGroup = new FormGroup({
            validPeriod: new FormControl('', Validators.required),
            periodType: new FormControl('CUSTOM', Validators.required)
        });

        this.orderPointFilterControl.valueChanges.subscribe(res => {
            this.util.transformToNumberWithControl(res, this.orderPointFilterControl, 1, 9999);
        });
        this.initMemberLevels();
    }

    ngOnInit() {
        this.initControlPanel(this.activeLink);
        this.initShortcutKeys();
        this.notify.foldChange.subscribe(res => {
            setTimeout(() => {
                this.changePanelPosition();
            }, 100);
        });
        this.notify.openChange.subscribe(res => {
            setTimeout(() => {
                this.changePanelPosition();
            }, 100);
        });
        this.svgCanvas = document.getElementById('canvas'); // 获取画布元素
        this.svgSelection = d3.select(this.svgCanvas);
    }

    // 根据策略类型初始化节点
    initControlPanel(index?) {
        switch (index) {
            default:
            case 0: {
                this.strategy.get('type').setValue(EngineType.Order);
                this.strategyService.getOrderNode().subscribe(res => {
                    if (res && Array.isArray(res)) {
                        this.triggers = orderStrategy.triggers.filter(trigger => res.find(node => node.nodeTypeName === trigger.type));
                        this.controls = orderStrategy.controls.filter(control => res.find(node => node.nodeTypeName === control.type));
                        this.actuators = orderStrategy.actuators.filter(actuator => res.find(node => node.nodeTypeName === actuator.type));
                    }
                }, error => {
                    this.triggers = orderStrategy.triggers;
                    this.controls = orderStrategy.controls;
                    this.actuators = orderStrategy.actuators;
                });
                break;
            }
            case 1: {
                this.strategy.get('type').setValue(EngineType.Member);
                this.strategyService.getMemberNode().subscribe(res => {
                    if (res && Array.isArray(res)) {
                        this.triggers = memberStrategy.triggers.filter(trigger => res.find(node => node.nodeTypeName === trigger.type));
                        this.controls = memberStrategy.controls.filter(control => res.find(node => node.nodeTypeName === control.type));
                        this.actuators = memberStrategy.actuators.filter(actuator => res.find(node => node.nodeTypeName === actuator.type));
                    }
                }, error => {
                    this.triggers = memberStrategy.triggers;
                    this.controls = memberStrategy.controls;
                    this.actuators = memberStrategy.actuators;
                });
                break;
            }
        }
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.setImagesToCircle(this.triggers);
            this.setImagesToCircle(this.controls);
            this.setImagesToCircle(this.actuators);
            if (this.detailId) {
                this.reloadStrategy();
            }
        }, 300);
    }

    // 点击标签
    tabClick(index) {
        if (index !== this.activeLink) {
            if (this.nodes.length > 0) {
                this.clearAll(true).then(() => {
                    this.activeLink = index;
                    this.changeControlPanel(index);
                    if (this.activeLink !== 1) {
                        this.currentActivity = null;
                    }
                });
            } else {
                this.activeLink = index;
                this.changeControlPanel(index);
                if (this.activeLink !== 1) {
                    this.currentActivity = null;
                }
            }
        }
    }

    // 改变操作面板
    changeControlPanel(index) {
        this.initControlPanel(index);
        setTimeout(() => {
            this.setImagesToCircle(this.triggers);
            this.setImagesToCircle(this.controls);
            this.setImagesToCircle(this.actuators);
        }, 300);
    }

    // 检查节点是否匹配类型
    checkNodeCorrect(sourceNodes) {
        let flag = false;
        const nodeTypes = [];
        this.triggers.forEach(trigger => nodeTypes.push(trigger.type));
        this.controls.forEach(control => nodeTypes.push(control.type));
        this.actuators.forEach(actuator => nodeTypes.push(actuator.type));
        sourceNodes.forEach(node => {
            if (!nodeTypes.includes(node.name)) {
                flag = true;
            }
        });
        return flag;
    }

    // 恢复删除掉的节点属性
    recoverNodesAndEdges() {
        this.nodes.forEach(node => {
            node.center.parentNode = node;
        });
        this.edges.forEach(line => {
            line.sourceNode = this.nodes.find(node => node.id === line.sourceNode.id);
            line.targetNode = this.nodes.find(node => node.id === line.targetNode.id);
        });
        this.drawNodesAndEdges();
    }

    // 重绘流程节点连线
    drawNodesAndEdges() {
        this.nodes.forEach(node => {
            this.drawNodeFromExit(node);
        });
        this.edges.forEach(line => {
            this.drawLineFromExit(line);
        });
        this.svgSelection.select('g').attr('transform', 'scale(' + this.svgScale + ')');
        this.addTransformToCanvas();
        this.addListeners();
        this.recoverParamsAndDraw();
    }

    /**重绘的相关方法*/
    // 添加相关事件
    addListeners() {
        // 添加事件
        this.nodes.forEach(node => {
            this.addDragToG(node);
            this.addListenerToNode(node);
        });
        this.edges.forEach(edge => {
            this.addListenerToLine(edge);
        });
    }

    // 重绘节点
    drawNodeFromExit(node: Node) {
        const html = d3.select('#' + node.name).html(); // 拿到左边面板的节点元素
        const g = d3.select(this.svgCanvas).select('#nodes').append('g');
        g.html(html);
        g.attr('id', node.id);
        this.gTransform(g, node.x, node.y);
        node.g = g;
    }

    // 重绘连线
    drawLineFromExit(exitLine: Line) {
        const from = exitLine.sourceNode.center;
        const to = exitLine.targetNode.center;
        const path = d3.path();
        path.moveTo(from.x, from.y);
        path.lineTo(to.x, to.y);
        const d = path.toString();
        const connectLineId = exitLine.id;
        this.drawLine = d3.select(this.svgCanvas).select('#lines').append('g').attr('id', connectLineId).style('cursor', 'pointer');
        const rect = this.getRectAttrs(from, to, exitLine); // 获取直线的左上角坐标
        this.drawLine.append('path').attr('d', d).attr('marker-end', 'url(#markerArrow)');
        this.drawLine.append('path').attr('d', d).style('stroke-width', 10).style('opacity', 0);
        if (exitLine.sourceNode.name === 'DiversionFilter') {
            this.drawLine.append('rect').attr('x', rect.centerX - 30).attr('y', rect.centerY - 12)
                .attr('width', 60).attr('height', 22).attr('rx', 10).style('fill', 'white').style('stroke', '#00000080');
            this.drawLine.append('text').style('font-size', '14px').style('font-family', 'Muli')
                .attr('id', connectLineId + '_text').attr('text-anchor', 'middle').attr('x', rect.centerX).attr('y', rect.centerY + 4);
        }
        exitLine.g = this.drawLine;
    }

    // 变化时候重新计算位置
    changePanelPosition() {
        if (this.showEditControls) {
            this.getPanelPosition();
        }
    }

    // 转化节点参数 一般是选择了多个对象数组，转化为id数组或特定字段数组方便传输
    getNodeParams(node: Node) {
        const newNode = parse(stringify(node));
        switch (newNode.name) {
            case 'TagFilter': {
                const tags = newNode.params['selectedTag'];
                const transformTags: any = {};
                tags.forEach(tag => {
                    if (transformTags[tag.tagType]) {
                        transformTags[tag.tagType] += (',' + tag.tagName);
                    } else {
                        transformTags[tag.tagType] = '';
                        transformTags[tag.tagType] = tag.tagName;
                    }
                });
                return transformTags;
            }
            case 'SendCouponActuator': { // 会员发券
                newNode.params['couponRules'] = newNode.params['couponRules'].map(item => item.number).join(',');
                return newNode.params;
            }
            case 'OrderSendCouponActuator': { // 订单发券
                newNode.params['couponRules'] = newNode.params['couponRules'].map(item => item.number).join(',');
                return newNode.params;
            }
            case 'SMSActuator': {
                newNode.params['smsTemplates'] = newNode.params['smsTemplates'].map(item => item.id).join(',');
                return newNode.params;
            }
            case 'MessageActuator': {
                newNode.params['template'] = newNode.params['template'].id;
                return newNode.params;
            }
            default : {
                return newNode.params;
            }
        }
    }

    // 监听全屏变化
    @HostListener('window:resize')
    onResize() {
        if (document.fullscreenElement) {
            this.isFullScreen = true;
            this.layout.hideLayout();
        } else {
            this.isFullScreen = false;
            this.layout.showLayout();
        }
    }

    @HostListener('window:keydown', ['$event'])
    onKeyPress(event) {
        if (event.code === 'F11') {
            event.preventDefault();
            event.stopPropagation();
            this.setFullScreen();
        } else if (this.selectElement && this.showEditControls && !this.noShortcut) {
            switch (event.code) {
                case 'KeyE': {
                    if (this.selectElement.type !== 'trigger' && this.selectElement.name !== 'DiversionFilter' && this.selectElement.name !== 'EndActuator' && this.selectElement.name !== 'linkLine') {
                        this.showEdit();
                    }
                    break;
                }
                case 'Space': {
                    if (this.selectElement.name !== 'EndActuator') {
                        this.lineNode();
                    }
                    break;
                }
                case 'Delete':
                case 'Backspace': {
                    this.deleteNode();
                    break;
                }
            }
        }
    }



    // 清除节点和连线
    clearNodesAndEdges() {
        if (this.nodes.length > 0) {
            this.nodes.forEach(node => {
                node.g.remove();
            });
            this.edges.forEach(node => {
                node.g.remove();
            });
            this.hideEditFlags();
            this.errorMsg = '';
            this.nodes = [];
            this.edges = [];
        }
    }

    // 获取图片生成图片引用 并填充到circle当中
    setImagesToCircle(controls: Control[], type?, radius?) {
        const patterns = d3.select('#patterns');
        const r = radius ? radius * 2 : 40;
        controls.forEach(item => {
            if (type === 'line') { // 连接节点
                if (!patterns.select('#l-' + item.type).node()) {
                    patterns.append('pattern').attr('id', 'l-' + item.type).attr('patternUnits', 'objectBoundingBox').attr('height', 1).attr('width', 1)
                        .append('image').attr('height', r).attr('width', r)
                        .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink').attr('xlink:href', item.imgSrc);
                }
                d3.select('#line-' + item.type + ' circle').attr('fill', 'url(#l-' + item.type + ')');
            } else if (type === 'change') { // 更改节点
                if (!patterns.select('#c-' + item.type).node()) {
                    patterns.append('pattern').attr('id', 'c-' + item.type).attr('patternUnits', 'objectBoundingBox').attr('height', 1).attr('width', 1)
                        .append('image').attr('height', r).attr('width', r)
                        .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink').attr('xlink:href', item.imgSrc);
                }
                d3.select('#change-' + item.type + ' circle').attr('fill', 'url(#c-' + item.type + ')');
            } else { // div展示面板
                patterns.append('pattern').attr('id', 'p-' + item.type).attr('patternUnits', 'objectBoundingBox').attr('height', 1).attr('width', 1)
                    .append('image').attr('height', r).attr('width', r)
                    .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink').attr('xlink:href', item.imgSrc);
                d3.select('#' + item.type + ' .center').attr('fill', 'url(#p-' + item.type + ')');
            }
        });
    }

    // 拖拽元素触发
    onDragStart(event) {
        const rect = event.target.getBoundingClientRect(); // 外层div坐标和svg相同的，所以取div坐标即可，否则要考虑不同
        this.offset.x = event.pageX - rect.left;
        this.offset.y = event.pageY - rect.top;
        event.dataTransfer.setData('text/plain', event.target.id);
        this.dragControl = event.target;
        event.dataTransfer.effectAllowed = 'move';
    }

    onDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }

    onControlDrop(event) {
        event.preventDefault();
        if (event.target.id === 'canvas') {
            const type = this.dragControl.getAttribute('data-type');
            this.drawNode(event, type);
        }
    }

    // （touchstart、touchmove和touchend）- 移动Safari浏览器就提供了一些与触摸(touch)操作相关的新事件，Android上的浏览器也实现了相同的事件
    onTouchStart(event) {
        let svg: HTMLElement;
        if (event.target.parentNode) {
            this.dragControl = event.target.parentNode.parentNode;
            svg = event.target.parentNode;
        } else {
            svg = event.target;
            this.dragControl = event.target.parentNode;
        }
        const domRect = svg.getBoundingClientRect();
        const touch = event.touches[0];
        this.offset.x = touch.pageX - domRect.left; // 计算触摸的坐标相较于元素坐标的偏移
        this.offset.y = touch.pageY - domRect.top;
        if (!d3.select('#dragSvg').node()) {
            const newSvgSelection = d3.select(svg.cloneNode(true)).style('z-index', '1').style('position', 'absolute').style('left', domRect.left).style('top', domRect.top).attr('id', 'dragSvg');
            document.body.appendChild(newSvgSelection.node());
        }
    }

    onTouchMove(event) {
        if (d3.select('#dragSvg').node()) {
            const touch = event.touches[0];
            d3.select('#dragSvg').style('left', touch.pageX - this.offset.x).style('top', touch.pageY - this.offset.y);
        }
    }

    onTouchEnd(event) {
        if (d3.select('#dragSvg').node()) {
            d3.select('#dragSvg').remove();
        }
    }

    // 往svg添加g包装的节点
    drawNode(event, type) {
        // 画布中添加节点
        const g = d3.select(this.svgCanvas).select('#nodes').append('g');
        g.html(this.dragControl.innerHTML);
        // g转换
        const x = Math.round((event.offsetX - this.offset.x) / this.svgScale);
        const y = Math.round((event.offsetY - this.offset.y) / this.svgScale);
        this.gTransform(g, x, y);

        // 节点数据数组添加节点 会给g添加随机生成的id
        const node = this.addNode(type, g, x, y);
        if (this.checkTriggerExit(node)) { // 如果同种触发器已存在
            g.remove();
            this.snackBar.open('同类触发器只能存在一个，请勿重复添加！', '✖');
            return;
        }
        this.nodes.push(node);
        this.addDragToG(node);
        this.getNodePoints(node); // 获取四点坐标
        this.addTransformToCanvas();
        // 添加 点击选中到节点
        this.addListenerToNode(node);
        this.gSelected(node);
    }

    // 检查触发器同种类是否唯一
    checkTriggerExit(node) {
        const checkTriggerSingle = this.nodes.map(item => {
            if (item.type === 'trigger') {
                return item.name;
            } else {
                return null;
            }
        });
        return checkTriggerSingle.includes(node.name);
    }

    // 控制连接点并提示错误信息
    checkNodeCanLinkTo() {
        this.isDAG = true;
        this.checkDAG();
        // 连线已存在
        if (this.sourceNode.id === this.targetNode.id) {
            this.errorMsg = this.translate.instant('strategy.message.noSelf');
        } else if (!!this.edges.find(line => line.sourceNode.id === this.sourceNode.id && line.targetNode.id === this.targetNode.id)) {
            this.errorMsg = this.translate.instant('strategy.message.lineExist');
        } else if (this.targetNode.type === 'trigger') { // 不可链接到触发器
            this.errorMsg = this.translate.instant('strategy.message.triggerTarget');
        } else if (!this.isDAG) { // 是有向无环图
            this.errorMsg = this.translate.instant('strategy.message.notDAG');
        } else {
            this.errorMsg = '';
        }
        return !!this.errorMsg;
    }

    // 图的深度遍历函数
    DFS(visited, graph, nodes, i) {
        // 结点i变为访问过的状态
        visited[nodes[i].id] = 1;
        for (let j = 0; j < nodes.length; j++) {
            // 如果当前结点有指向的结点
            if (graph[nodes[i].id][nodes[j].id] !== 0) {
                // 并且已经被访问过
                if (visited[nodes[j].id] === 1) {
                    this.isDAG = false; // 有环
                    break;

                } else if (visited[nodes[j].id] === -1) {
                    // 当前结点后边的结点都被访问过，直接跳至下一个结点
                } else {
                    this.DFS(visited, graph, nodes, j); // 否则递归访问
                }
            }
        }
        //  遍历过所有相连的结点后，把本节点标记为-1
        visited[nodes[i].id] = -1;
    }

    // 创建图,以邻接矩阵表示
    checkDAG() {
        const graph = {};
        const visited = {};
        const edges = [];
        const nodes = [];
        Object.assign(edges, this.edges);
        Object.assign(nodes, this.nodes);
        const line = new Line();
        line.sourceNode = this.sourceNode;
        line.targetNode = this.targetNode;
        edges.push(line);
        for (let i = 0; i < nodes.length; i++) {
            const pre = nodes[i];
            graph[pre.id] = {};
            for (let j = 0; j < nodes.length; j++) {
                const next = nodes[j];
                graph[pre.id][next.id] = 0;
            }
        }
        for (let k = 0; k < edges.length; k++) {
            const edge = edges[k];
            graph[edge.sourceNode.id][edge.targetNode.id] = 1;
        }
        // 初始化visited数组为0，表示一开始所有顶点都未被访问过
        for (let i = 0; i < nodes.length; i++) {
            visited[nodes[i].id] = 0;
        }
        for (let i = 0; i < nodes.length; i++) {
            // 该结点后边的结点都被访问过了，跳过它
            if (visited[nodes[i].id] === -1) {
                continue;
            }
            this.DFS(visited, graph, nodes, i);
        }
    }

    // 显示编辑
    showEditControl(node) {
        this.showEditControls = true;
        this.showEditPanel = false;
        this.showInput = false;
        this.showChangeType = false;
        this.selectElement = node;
        this.getPanelPosition();
        this.getEditControls();
    }

    // 向节点添加选中样式
    addListenerToNode(node) {
        node.g.on('click', () => {
            if (!this.drawFlag) {
                if (node.g.classed('node-selected')) {
                    this.showEditControl(node);
                } else {
                    this.gSelected(node);
                    this.showEditControl(node);
                }
            }
        });
        const mainCircle = node.g.select('.center');
        mainCircle.on('mouseenter', () => {
            if (this.drawFlag) {
                const nodeId = d3.event.target.parentNode.parentNode.id;
                this.targetNode = this.nodes.find(item => item.id === nodeId);
                if (this.drawFlag && !this.checkNodeCanLinkTo()) { // 进入到某个节点
                    mainCircle.style('cursor', 'pointer');
                    mainCircle.style('stroke', '#DCFECC');
                } else {
                    mainCircle.style('stroke', '#f9dee5');
                    mainCircle.style('cursor', 'not-allowed');
                }
            } else {
                mainCircle.style('cursor', 'pointer');
            }
        });
        mainCircle.on('mouseleave', () => {
            if (this.drawFlag) {
                this.errorMsg = '';
                const nodeId = d3.event.target.parentNode.parentNode.id;
                this.targetNode = this.nodes.find(item => item.id === nodeId);
                mainCircle.style('cursor', 'pointer');
                mainCircle.style('stroke', null);
                node.g.classed('node-selected', false);
            }
        });

        // 点击节点中心 连接节点
        mainCircle.on('mousedown', () => {
            const nodeId = d3.event.target.parentNode.parentNode.id;
            this.targetNode = this.nodes.find(item => item.id === nodeId);
            if (this.drawFlag && !this.checkNodeCanLinkTo()) { // 连接节点
                this.drawLine.remove();
                this.drawFlag = false;
                this.drawNewLinePointToPoint(this.sourceNode.center, this.targetNode.center);
            }
            this.errorMsg = '';
            mainCircle.style('stroke', null);
        });
    }

    // 点到点连接 创建新连线
    drawNewLinePointToPoint(from: Point, to: Point) {
        const path = d3.path();
        path.moveTo(from.x, from.y);
        path.lineTo(to.x, to.y);
        const d = path.toString();
        const line = new Line();
        const connectLineId = from.parentNode.id + '_' + to.parentNode.id;
        this.drawLine = d3.select(this.svgCanvas).select('#lines').append('g').attr('id', connectLineId).style('cursor', 'pointer');
        const rect = this.getRectAttrs(from, to, line); // 获取直线的左上角坐标
        this.drawLine.append('path').attr('d', d).attr('marker-end', 'url(#markerArrow)');
        this.drawLine.append('path').attr('d', d).style('stroke-width', 10).style('opacity', 0);
        line.g = this.drawLine;
        line.sourceNode = from.parentNode;
        line.targetNode = to.parentNode;
        line.id = connectLineId;
        line.type = 'line';
        if (line.sourceNode.name === 'DiversionFilter') {
            line.name = line.sourceNode.name + 'Line';
            this.drawLine.append('rect').attr('x', rect.centerX - 30).attr('y', rect.centerY - 12)
                .attr('width', 60).attr('height', 22).attr('rx', 10).style('fill', 'white').style('stroke', '#00000080');
            this.drawLine.append('text').style('font-size', '14px').style('font-family', 'Muli')
                .attr('id', connectLineId + '_text').attr('text-anchor', 'middle').attr('x', rect.centerX).attr('y', rect.centerY + 4);
        } else {
            line.name = 'linkLine';
        }
        this.addListenerToLine(line);
        this.edges.push(line);
    }

    // 向连接线上添加事件
    addListenerToLine(line: Line) {
        line.g.on('click', () => {
            d3.event.preventDefault();
            this.hideEditFlags();
            this.lineSelected(line);
        });
    }

    // 获取rect属性 画一个rect方便点击
    getRectAttrs(from: Point, to: Point, line: Line) {
        const rect = {x: 0, y: 0, width: 0, height: 0, centerX: 0, centerY: 0};
        if (from.x <= to.x) {
            if (from.y <= to.y) {
                rect.x = from.x;
                rect.y = from.y;
                rect.width = to.x - from.x;
                rect.height = to.y - from.y;
            } else {
                rect.x = from.x;
                rect.y = to.y;
                rect.width = to.x - from.x;
                rect.height = from.y - to.y;
            }
        } else {
            if (from.y <= to.y) {
                rect.x = to.x;
                rect.y = from.y;
                rect.width = from.x - to.x;
                rect.height = to.y - from.y;
            } else {
                rect.x = to.x;
                rect.y = to.y;
                rect.width = from.x - to.x;
                rect.height = from.y - to.y;
            }
        }
        rect.centerX = rect.x + rect.width / 2;
        rect.centerY = rect.y + rect.height / 2;
        line.x = rect.x;
        line.y = rect.y;
        return rect;
    }

    // 已有连线重新绘制
    drawExistLine(line: Line) {
        const path = d3.path();
        path.moveTo(line.sourceNode.center.x, line.sourceNode.center.y);
        path.lineTo(line.targetNode.center.x, line.targetNode.center.y);
        const d = path.toString();
        const rect = this.getRectAttrs(line.sourceNode.center, line.targetNode.center, line);
        line.g.selectAll('path').attr('d', d);
        line.g.select('rect').attr('x', rect.centerX - 30).attr('y', rect.centerY - 12);
        line.g.select('text').attr('x', rect.centerX).attr('y', rect.centerY + 4);
    }

    // 连接线选中
    lineSelected(line: Line) {
        line.g.classed('line-selected', true);
        this.selectElement = line;
        this.getPanelPosition();
        this.getEditControls();
        this.showEditControls = true;
        this.edges.forEach(item => {
            if (item.id !== line.id) {
                item.g.classed('line-selected', false);
            }
        });
        this.nodes.forEach(item => {
            item.g.classed('node-selected', false);
        });
    }

    // 选中节点
    gSelected(node) {
        if (node.g.style('cursor') !== 'not-allowed') {
            node.g.style('cursor', 'pointer');
            node.g.classed('node-selected', true);
            // 取消其他选中
            this.nodes.forEach(item => {
                if (item.id !== node.id) {
                    item.g.classed('node-selected', false);
                }
            });
            this.edges.forEach(item => {
                item.g.classed('line-selected', false);
            });
            this.showEditControl(node);
        }
    }

    // 获取浮动框连接列表
    getEditControls() {
        switch (this.selectElement.type) {
            case 'trigger': { // 触发器后点击生成过程控制器
                this.editControls = this.controls;
                break;
            }
            case 'control': { // 过程控制后可点击生成执行器
                this.editControls = this.actuators.concat(this.controls);
                break;
            }
            case 'actuator': { // 执行器后接一个停止控制
                this.editControls = this.controls.concat(this.actuators);
                break;
            }
            case 'line': {
                this.editControls = [];
                break;
            }
        }
        setTimeout(() => {
            this.setImagesToCircle(this.editControls, 'line', 12);
        });
    }

    // 关闭浮动详情面板
    closeEdit() {
        this.showEditPanel = false;
        this.showEditControls = true;
        this.getEditControls();
    }

    // 隐藏编辑标记
    hideEditFlags() {
        this.showEditControls = false;
        this.showInput = false;
        this.showChangeType = false;
        this.showEditPanel = false;
    }

    // 显示更改类型
    showChangeTypes() {
        this.showChangeType = !this.showChangeType;
        this.changedTypes = [];
        this.cachedTypes = [];
        switch (this.selectElement.type) {
            case 'trigger': {
                this.cachedTypes = this.triggers;
                this.changedTypes = this.triggers.filter(item => item.type !== this.selectElement.name);
                break;
            }
            case 'control': {
                this.cachedTypes = this.controls;
                this.changedTypes = this.controls.filter(item => item.type !== this.selectElement.name);
                break;
            }
            case 'actuator': {
                this.cachedTypes = this.actuators;
                this.changedTypes = this.actuators.filter(item => item.type !== this.selectElement.name);
                break;
            }
        }
        if (this.showChangeType) {
            setTimeout(() => {
                this.setImagesToCircle(this.changedTypes, 'change', 12);
            });
        }
    }

    // 更改类型
    changeTypes(change: Control) {
        const innerHtml = d3.select('#' + change.type).html();
        this.selectElement.g.html(innerHtml);
        this.selectElement.name = change.type;
        if (this.selectElement.type === 'control') {
            this.edges.filter(line => line.sourceNode.id === this.selectElement.id).forEach(edge => {
                if (edge.sourceNode.name === 'DiversionFilter') {
                    edge.name = edge.sourceNode.name + 'Line';
                    if (!edge.g.select('rect').node()) {
                        const rect = this.getRectAttrs(edge.sourceNode.center, edge.targetNode.center, edge); // 获取直线的左上角坐标
                        edge.g.append('rect').attr('x', rect.centerX - 30).attr('y', rect.centerY - 12)
                            .attr('width', 60).attr('height', 24).attr('rx', 10).style('fill', 'white').style('stroke', '#00000080');
                        edge.g.append('text').style('font-size', '14px').style('font-family', 'Muli')
                            .attr('id', edge.id + '_text').attr('text-anchor', 'middle').attr('x', rect.centerX).attr('y', rect.centerY + 4);
                    }
                } else {
                    edge.name = 'linkLine';
                    if (edge.g.select('rect').node()) {
                        edge.g.select('rect').remove();
                        edge.g.select('text').remove();
                    }
                }
                edge.params = {}; // 清空携带参数
            });
        }
        this.selectElement.translate = 'strategy.' + this.selectElement.name;
        this.changedTypes = this.cachedTypes.filter(item => item.type !== change.type);
        setTimeout(() => {
            this.addListenerToNode(this.selectElement); // 重新添加监听 节点中的circle
            this.setImagesToCircle(this.changedTypes, 'change', 12);
            this.setImagesToCircle(this.editControls, 'line', 12);
        });
    }

    // 判断生成的节点的落位
    getExistNewY(x, y) {
        // 检查从选中节点生成节点是否存在，如果已存在，则判断同x下的y轴
        const connects = this.nodes.filter(node => node.x === x);
        let flag = false;
        connects.forEach(item => {
            if (Math.sqrt((Math.pow(item.x - x, 2) + Math.pow(item.y - y, 2))) < 100) {
                flag = true;
            }
        });
        if (this.edges.filter(line => line.id.includes(this.selectElement.id)).map(value => value.targetNode).find(node => node.x === x) || flag) {
            return this.checkExist(x, y);
        } else {
            return y;
        }
    }

    // 避免在同X下的y轴重复生成
    checkExist(x, y) {
        // 排除生成方向同x坐标的位置上的节点
        const connects = this.nodes.filter(node => node.x === x).map(value => value.y);
        connects.sort((a, b) => a - b);
        const firstY = connects[0];
        const lastY = connects[connects.length - 1];
        let newY = 0;
        // let index = 0;
        if (Math.round((firstY - 100) / this.svgScale) > 0) {
            newY = Math.round((firstY - 100) / this.svgScale);
        } else {
            newY = Math.round((lastY + 100) / this.svgScale);
        }
        return isNaN(newY) ? y : newY;
    }

    // 点击节点 直接连接
    appendNode(control: Control) {
        const g = d3.select(this.svgCanvas).select('#nodes').append('g');
        const innerHtml = d3.select('#' + control.type).html();
        const type = d3.select('#' + control.type).attr('data-type');
        // // g转换
        g.html(innerHtml);
        const x = Math.round(this.selectElement.x + 150 / this.svgScale);
        let y = this.selectElement.y;
        y = this.getExistNewY(x, y);
        this.gTransform(g, x, y);

        // 节点数据数组添加节点 会给g添加随机生成的id
        const node = this.addNode(type, g, x, y);
        this.nodes.push(node);
        this.addDragToG(node);
        this.getNodePoints(node); // 获取四点坐标
        // 添加 点击选中到节点
        this.addListenerToNode(node);
        this.drawNewLinePointToPoint(this.selectElement.center, node.center);
        this.gSelected(node);
    }


    // 删除节点、连线以及对应关系
    deleteNode() {
        if (this.selectElement.type !== 'line') { // 删除节点
            this.nodes = this.nodes.filter(node => node.id !== this.selectElement.id);
            this.edges.forEach(line => {
                if (line.id.includes(this.selectElement.id)) {
                    line.g.remove();
                }
            });
            this.edges = this.edges.filter(line => !line.id.includes(this.selectElement.id));
        } else {
            this.edges = this.edges.filter(line => line.id !== this.selectElement.id);
        }
        this.selectElement.g.remove();
        this.selectElement = null;
        this.hideEditFlags();
    }

    // 点击展示连接路径 开始连接
    lineNode() {
        this.hideEditFlags();
        this.sourceNode = this.selectElement;
        this.nodes.forEach(item => {
            item.g.classed('node-selected', false);
        });
        this.drawFlag = true;
    }

    // 获取操作面板出现位置
    getPanelPosition() {
        if (this.selectElement && this.selectElement.type !== 'line') {
            const leftX = document.getElementById('control-panel').offsetWidth; // 获取左侧控制面板的宽度
            const rect = this.selectElement.g.node().getBBox(); // 获取该元素
            // content-card外层容器不包含margin，左侧添加面板为20%，当前节点x,y为该元素左上角起始坐标，加上该元素宽度则为y轴相等的右侧位置，top为上面距离加上元素于svg视图的坐标
            this.editControlsPosition = {
                left: Math.round((this.selectElement.x + rect.width) * this.svgScale + leftX + 60),
                top: (this.selectElement.y) * this.svgScale + 80
            };
            this.changeTypePosition.left = this.editControlsPosition.left + 80;
            this.changeTypePosition.top = this.editControlsPosition.top;
            this.editPosition = this.editControlsPosition;
        } else if (this.selectElement && this.selectElement.type === 'line') {
            const leftX = document.getElementById('control-panel').offsetWidth; // 获取左侧控制面板的宽度
            const rect = this.selectElement.g.node().getBBox();
            if (this.selectElement.name !== 'linkLine') { // 不是linkLine则为特殊线
                this.editControlsPosition = {
                    left: Math.round((this.selectElement.x + rect.width / 2) * this.svgScale + leftX + 25),
                    top: Math.round((this.selectElement.y + rect.height / 2)) * this.svgScale + 20
                };
                this.editPosition.left = this.editControlsPosition.left + 50;
                this.editPosition.top = this.editControlsPosition.top + 20;
            } else {
                this.editControlsPosition = {
                    left: Math.round((this.selectElement.x + rect.width / 2) * this.svgScale + leftX + 25),
                    top: Math.round((this.selectElement.y + rect.height / 2)) * this.svgScale + 50
                };
                this.editPosition = this.editControlsPosition;
            }
            this.inputPosition.left = this.editControlsPosition.left - 20;
            this.inputPosition.top = this.editControlsPosition.top - 20;
        } else {
            this.hideEditFlags();
        }
    }

    // g标签转换 移动位置等
    gTransform(g, x, y) {
        g.attr('transform', 'translate(' + x + ',' + y + ')');
    }

    // 获取随机生成的类型id
    getRandomId(id) {
        return id + '_' + Math.round((Math.random() * 10000)).toString(10);
    }

    // 添加节点
    addNode(type, g, x, y) {
        const node = new Node();
        const id = g.select('tspan').text(); // 第一个循环放了节点类型
        const translate = g.select('tspan:nth-child(2)').text(); // 第二个翻译的key
        node.id = this.getRandomId(id);
        node.type = type;
        node.name = id;
        node.title = this.translate.instant(translate);
        node.x = x;
        node.y = y;
        g.attr('id', node.id);
        node.g = g;
        return node;
    }

    // 获取节点图形的四角坐标
    getNodePoints(node) {
        const x = node.x + 7.5;
        const y = node.y + 7.5;
        const rect = node.g.select('circle').node().getBBox();
        const width = rect.width;
        const height = rect.height;
        node.center.x = x + width / 2;
        node.center.y = y + height / 2;
        node.center.parentNode = node;
    }

    // 编辑面板鼠标滚动
    onWheel(event) {
        if (event.ctrlKey) {
            event.preventDefault();
            const delta = event.deltaY;
            this.svgScale += delta > 0 ? -0.1 : 0.1;
            this.svgScale = Number(this.svgScale.toFixed(1));
            if (this.svgScale > 3) {
                this.svgScale = 3;
            } else if (this.svgScale < 0.5) {
                this.svgScale = 0.5;
            }
            this.getPanelPosition();
            this.svgSelection.select('g').attr('transform', 'scale(' + this.svgScale + ')');
        }
    }

    // 添加相关事件到画布
    addTransformToCanvas() {
        if (!this.canvasListener) { // 添加一次监听
            this.canvasListener = true;
            this.svgSelection.call(d3.drag().on('drag', () => {
                this.svgSelection.style('cursor', 'grab');
                // 内部元素整体右移 保持画布不动 模拟画布拖动效果
                this.nodes.forEach(node => {
                    node.x += Math.round(d3.event.dx / this.svgScale);
                    node.y += Math.round(d3.event.dy / this.svgScale);
                    this.gTransform(node.g, node.x, node.y);
                    this.getNodePoints(node);
                });
                this.edges.forEach(line => {
                    this.drawExistLine(line);
                });
                this.getPanelPosition();
            }));
            this.svgSelection.call(d3.zoom().on('zoom', () => {
                if (d3.event.sourceEvent && d3.event.sourceEvent.ctrlKey) {
                    this.svgSelection.style('cursor', 'all-scroll');
                    const delta = d3.event.sourceEvent.deltaY;
                    this.svgScale += delta > 0 ? -0.1 : +0.1;
                    this.svgScale = Number(this.svgScale.toFixed(1));
                    if (this.svgScale > 3) {
                        this.svgScale = 3;
                    } else if (this.svgScale < 0.5) {
                        this.svgScale = 0.5;
                    }
                    this.svgSelection.select('g').attr('transform', 'scale(' + this.svgScale + ')');
                } else if (d3.event.sourceEvent) {
                    this.svgSelection.style('cursor', 's-resize');
                    const delta = d3.event.sourceEvent.deltaY;
                    this.nodes.forEach(node => {
                        node.y += delta > 0 ? -Math.round(50 / this.svgScale) : Math.round(50 / this.svgScale);
                        this.gTransform(node.g, node.x, node.y);
                        this.getNodePoints(node);
                    });
                    this.edges.forEach(line => {
                        this.drawExistLine(line);
                    });
                }
                this.getPanelPosition();
            }));
            this.svgSelection.on('mouseenter', () => {
                d3.event.preventDefault();
                this.drawDashLine();
            });
            this.svgSelection.on('mousemove', () => {
                d3.event.preventDefault();
                this.drawDashLine();
            });
            this.svgSelection.on('click', () => {
                d3.event.preventDefault();
                if (this.drawFlag && d3.event.target.tagName !== 'path') {
                    this.svgSelection.style('cursor', 'default');
                    d3.select(d3.event.target).style('cursor', 'pointer');
                    this.drawFlag = false;
                    this.drawLine.remove();
                    this.selectElement.g.classed('node-selected', true);
                    this.showEditControls = true;
                    setTimeout(() => {
                        this.setImagesToCircle(this.editControls, 'line', 12);
                    });
                } else {
                    if (d3.event.target && d3.event.target.tagName === 'svg') {
                        this.svgSelection.style('cursor', 'pointer');
                        this.nodes.forEach(item => {
                            item.g.classed('node-selected', false);
                        });
                        this.edges.forEach(item => {
                            item.g.classed('line-selected', false);
                        });
                        this.selectElement = null;
                        this.hideEditFlags();
                    }
                }
            });
        }
    }

    // 连接指示线
    drawDashLine() {
        if (this.drawFlag) {
            this.svgSelection.style('cursor', 'not-allowed');
            const path = d3.path();
            path.moveTo(this.sourceNode.center.x, this.sourceNode.center.y);
            path.lineTo(d3.event.offsetX > this.sourceNode.center.x ?
                Math.round((d3.event.offsetX - 5) / this.svgScale) : Math.round((d3.event.offsetX + 5) / this.svgScale), Math.round((d3.event.offsetY) / this.svgScale));
            const d = path.toString();
            const connectLineId = this.sourceNode.id + '_' + this.sourceNode.id + '_linkLine';
            if (d3.select('#' + connectLineId).node()) {
                this.drawLine = d3.select('#' + connectLineId);
                this.drawLine.attr('d', d);
                this.drawLine.style('stroke-dashArray', '3,3');
            } else {
                this.drawLine = d3.select(this.svgCanvas).select('#lines').append('path');
                this.drawLine.attr('id', connectLineId).attr('d', d);
                this.drawLine.style('stroke-dashArray', '3,3');
            }
        } else {
            this.svgSelection.style('cursor', 'default');
        }
    }

    // 节点添加drag事件 可拖动
    addDragToG(node: Node) {
        node.g.call(d3.drag().on('drag', () => {
            node.g.style('cursor', 'grab');
            node.x += d3.event.dx;
            node.y += d3.event.dy;
            this.gSelected(node);
            this.gTransform(node.g, node.x, node.y);
            this.getNodePoints(node);
            this.edges.forEach(line => {
                if (this.selectElement && this.selectElement.id === line.id) {
                    this.selectElement = null;
                    line.g.classed('line-selected', false);
                }
                this.drawExistLine(line);
            });
            this.getPanelPosition();
        }));
    }

    /****************************** 表单数据处理（展示/重置/重绘） *****************************/
    // 显示编辑
    showEdit() {
        if (this.selectElement && this.selectElement.type !== 'line') {
            if (this.editTimestamp) {
                clearTimeout(this.editTimestamp);
            }
            this.editTimestamp = setTimeout(() => {
                this.showEditControls = false;
                this.showEditPanel = true;
                this.showChangeType = false;
                switch (this.selectElement.name) {
                    case 'BirthdayMagnificationActuator': {
                        if (JSON.stringify(this.selectElement.params) === '{}') {
                            this.resetBirthGroup();
                        } else {
                            this.getBirthFromNodeParams(this.selectElement.params);
                        }
                        break;
                    }
                    case 'GivePointActuator': {
                        if (JSON.stringify(this.selectElement.params) === '{}') {
                            this.resetGivePointGroup();
                        } else {
                            this.getGivePointFromNodeParams(this.selectElement.params);
                        }
                        break;
                    }
                    case 'StoreMagnificationActuator': {
                        if (JSON.stringify(this.selectElement.params) === '{}') {
                            this.resetStoreGroup();
                        } else {
                            this.getStoreFromNodeParams(this.selectElement.params);
                        }
                        break;
                    }
                    case 'LevelMagnificationActuator': {
                        if (JSON.stringify(this.selectElement.params) === '{}') {
                            this.resetLevelGroup();
                        } else {
                            this.getLevelFromNodeParams(this.selectElement.params);
                        }
                        break;
                    }
                    case 'OrderSetLevelActuator': {
                        if (JSON.stringify(this.selectElement.params) === '{}') {
                            this.memberLevelInfo = '';
                            this.getMemberLevelList();
                        } else {
                            this.getMemberLevelList();
                            const params = JSON.parse(JSON.stringify(this.selectElement.params));
                            this.memberLevelInfo = '' + params['id'] + ',' + params['level']; // id+level
                        }
                        break;
                    }
                    case 'MemberLevelFilter': {
                        if (JSON.stringify(this.selectElement.params) === '{}') {
                            this.memberLevelFilter = '';
                            this.getMemberLevelList();
                        } else {
                            this.getMemberLevelList();
                            const params = JSON.parse(JSON.stringify(this.selectElement.params));
                            this.memberLevelFilter = '' + params['id'] + ',' + params['level']; // id+level
                        }
                        break;
                    }
                    case 'StoreFilter': {
                        if (JSON.stringify(this.selectElement.params) === '{}') {
                            this.resetStoreFilter();
                        } else {
                            this.getStoreFilterFromNodeParams(this.selectElement.params);
                        }
                        break;
                    }
                    case 'MemberMallFilter': {
                        if (JSON.stringify(this.selectElement.params) === '{}') {
                            this.resetMallFilter();
                        } else {
                            this.getMallFilterFromNodeParams(this.selectElement.params);
                        }
                        break;
                    }
                    case 'OrderPointFilter': {
                        if (JSON.stringify(this.selectElement.params) === '{}') {
                            this.resetPointFilter();
                        } else {
                            this.getPointFilterFromNodeParams(this.selectElement.params);
                        }
                        break;
                    }
                }
                console.log(this.selectElement);
                setTimeout(() => {
                    if (this.selectElement.type === 'line') {
                        d3.select('#nodeView' + ' .center').attr('fill', 'url(#p-' + this.selectElement.sourceNode.name + ')');
                    } else {
                        d3.select('#nodeView' + ' .center').attr('fill', 'url(#p-' + this.selectElement.name + ')');
                    }
                });
            }, 300);
        } else {
            this.showInput = true;
            this.showEditControls = false;
            if (this.selectElement.sourceNode.name === 'DiversionFilter') {
                this.label = 'strategy.oneHundredLabel';
            }
            setTimeout(() => {
                this.textInput.nativeElement.focus();
            });
            this.getResidueSelected(); // 获取剩余百分比
        }
    }

    // 显示属性重新描绘
    recoverParamsAndDraw() { // sourceNodes里处理过，只存了ids
        this.nodes.forEach(node => {
            if (node.name === 'TagFilter' && node.params['selectedTag']) {
                const ids = node.params['selectedTag'];
                this.strategyService.getTags(0, 0x3f3f3f3f, 'lastModifiedDate,desc', ids).subscribe(res => {
                    if (res.length > 0) {
                        node.params['selectedTag'] = res;
                    }
                });
            } else if ((node.name === 'SendCouponActuator' || node.name === 'OrderSendCouponActuator') && node.params['couponRules']) {
                const ids = node.params['couponRules'];
                const observables = [];
                node.params['couponRules'].forEach(item => {
                    observables.push(this.strategyService.getCouponRuleById(item).pipe(takeUntil(this.unsubscribeAll))
                    );
                });
                forkJoin(observables).subscribe(res => {
                    node.params['couponRules'] = res;
                });
            } else if (node.name === 'SMSActuator' && node.params['smsTemplates']) {
            } else if (node.name === 'MessageActuator' && node.params['template']) {
                const id = node.params['template'];
                this.strategyService.getTemplateById(id).subscribe(res => {
                    if (res) {
                        node.params['template'] = res;
                    }
                });
            } else if (node.name === 'BirthdayMagnificationActuator') {
                this.getBirthFromNodeParams(node.params);
            } else if (node.name === 'GivePointActuator') {
                this.getGivePointFromNodeParams(node.params);
            } else if (node.name === 'StoreMagnificationActuator') {
                this.getStoreFromNodeParams(node.params);
            } else if (node.name === 'LevelMagnificationActuator') {
                this.getLevelFromNodeParams(node.params);
            } else if (node.name === 'OrderSetLevelActuator') {
                this.getMemberLevelList();
                this.memberLevelInfo = '' + node.params['id'] + ',' + node.params['level'];
            } else if (node.name === 'MemberLevelFilter') {
                this.getMemberLevelList();
                this.memberLevelFilter = '' + node.params['id'] + ',' + node.params['level'];
            } else if (node.name === 'StoreFilter') {
                this.getStoreFilterFromNodeParams(node.params);
            } else if (node.name === 'MemberMallFilter') {
                this.getMallFilterFromNodeParams(node.params);
            } else if (node.name === 'OrderPointFilter') {
                this.getPointFilterFromNodeParams(node.params);
            } else if (node.name === 'OrderAmountFilter') {
                const params = JSON.parse(JSON.stringify(node.params));
                this.consumeAmountGroup.patchValue(params, {emitEvent: false});
            } else if (node.name === 'OrderDateFilter' || node.name === 'MemberDateFilter'){ // 订单日期过滤/会员日期过滤
                this.dateFilterGroup.get('type').setValue(node.params['type']);
                const list = node.params['dayOrWeek'].split(',');
                if (node.params['type'] === 'WEEK') {
                    list.forEach(item => {
                        const index = Number(item) - 1;
                        this.weekList[index]['checked'] = true;
                    });
                } else {
                    list.forEach(item => {
                        const index = Number(item) - 1;
                        this.dayList[index]['checked'] = true;
                    });
                }
            }
            console.log(node);
        });
        this.edges.forEach(edge => {
            if (edge.sourceNode.name === 'DiversionFilter' && edge.params['chance']) {
                d3.select('#' + edge.id + '_text').text(edge.params['chance'] + '%');
            }
        });
        this.loading.hide();
    }

    // 获取会员等级列表
    getMemberLevelList() {
        this.strategyService.getMemberLevels().pipe().subscribe(res => {
            this.memberLevelList = res;
        });
    }

    /** 从参数中恢复会员多倍积分表单*/
    getLevelFromNodeParams(nodeParams) {
        const params = JSON.parse(JSON.stringify(nodeParams));
        params.validPeriod = this.dateTransformPipe.transform(params.validPeriod, '-');
        this.levelGroup.patchValue(params, {emitEvent: false});
    }

    /** 从重置会员多倍积分表单（节点从面板上移除时清空其上表单数据）*/
    resetLevelGroup() {
        const data = {
            validPeriod: '',
            periodType: 'CUSTOM'
        };
        this.levels.forEach(level => {
            data[level.level] = 1;
        });
        this.levelGroup.reset(data, {emitEvent: false});
    }

    /** 从参数中恢复店铺多倍积分表单*/
    getStoreFromNodeParams(nodeParams) {
        const params = JSON.parse(JSON.stringify(nodeParams));
        params.validPeriod = this.dateTransformPipe.transform(params.validPeriod, '-');
        const filter = [{name: 'storeId', value: params.store, reg: 'in'}];
        this.strategyService.searchStore(0, 0x3f3f3f3f, 'lastModifiedDate', null, filter).subscribe(res => {
            params.store = res.content;
            this.storeGroup.patchValue(params, {emitEvent: false});
        });
    }

    /**重置店铺多倍积分表单（节点从面板上移除时清空其上表单数据）*/
    resetStoreGroup() {
        this.storeGroup.reset({
            magnification: 1, store: [], validPeriod: '',
            periodType: 'CUSTOM'
        }, {emitEvent: false});
    }

    /** 从参数中恢复店铺过滤表单*/
    getStoreFilterFromNodeParams(nodeParams) {
        const params = JSON.parse(JSON.stringify(nodeParams));
        const filter = [{name: 'storeId', value: params.store, reg: 'in'}];
        this.strategyService.searchStore(0, 0x3f3f3f3f, 'lastModifiedDate', null, filter).subscribe(res => {
            params.store = res.content;
            this.storeFilterGroup.patchValue(params, {emitEvent: false});
        });
    }

    /** 重置店铺过滤表单（节点从面板上移除时清空其上表单数据）*/
    resetStoreFilter() {
        this.storeFilterGroup.reset({
            store: []
        }, {emitEvent: false});
    }

    /** 从参数中恢复商场过滤表单*/
    getMallFilterFromNodeParams(nodeParams) {
        const params = JSON.parse(JSON.stringify(nodeParams));
        const filter = [{name: 'mallId', value: params.mall, reg: 'in'}];
        this.strategyService.getMallList(0, 0x3f3f3f3f, 'lastModifiedDate', null, filter).subscribe(res => {
            params.mall = res.content;
            this.mallFilterGroup.patchValue(params, {emitEvent: false});
        });
    }

    /** 重置商场过滤表单（节点从面板上移除时清空其上表单数据）*/
    resetMallFilter() {
        this.mallFilterGroup.reset({
            mall: []
        }, {emitEvent: false});
    }

    /** 从参数中恢复生日多倍积分表单*/
    getBirthFromNodeParams(nodeParams) {
        const params = JSON.parse(JSON.stringify(nodeParams));
        params.validPeriod = this.dateTransformPipe.transform(params.validPeriod, '-');
        this.birthGroup.patchValue(params, {emitEvent: false});
    }

    /** 重置积分过滤表单（节点从面板上移除时清空其上表单数据）*/
    resetPointFilter() {
        this.orderPointFilterControl.setValue('');
    }

    /** 从参数中恢复积分表单*/
    getPointFilterFromNodeParams(nodeParams) {
        const params = JSON.parse(JSON.stringify(nodeParams));
        this.orderPointFilterControl.setValue(params['value']);
    }

    /**重置生日多倍积分表单（节点从面板上移除时清空其上表单数据）*/
    resetBirthGroup() {
        this.birthGroup.reset({
            magnification: 1, range: 'DAY', validPeriod: '',
            periodType: 'CUSTOM'
        });
    }

    /** 从参数中送积分表单*/
    getGivePointFromNodeParams(nodeParams) {
        const params = JSON.parse(JSON.stringify(nodeParams));
        params.expireDate = this.dateTransformPipe.transform(params.expireDate, '-');
        this.givePointGroup.patchValue(params, {emitEvent: false});
    }

    /**重置送积分表单（节点从面板上移除时清空其上表单数据）*/
    resetGivePointGroup() {
        this.givePointGroup.reset({
            point: 1,
            expireDate: ''
        });
    }

    /****************************** 页面中部画板顶部按钮组和错误提示 *****************************/
    // 打开-快捷键和帮助
    showTips(keyboard) {
        this.dialog.open(keyboard, {id: 'strategyTips'});
    }

    initShortcutKeys() {
        this.shortcutKeys = [
            {shortcut: 'strategy.tips.edit', keyboard: 'strategy.tips.editKey'},
            {shortcut: 'strategy.tips.line', keyboard: 'strategy.tips.lineKey'},
            {shortcut: 'strategy.tips.delete', keyboard: 'strategy.tips.deleteKey'},
            {shortcut: 'strategy.tips.moveUp', keyboard: 'strategy.tips.moveUpKey'},
            {shortcut: 'strategy.tips.moveDown', keyboard: 'strategy.tips.moveDownKey'},
            {shortcut: 'strategy.tips.zoomIn', keyboard: 'strategy.tips.zoomInKey'},
            {shortcut: 'strategy.tips.zoomOut', keyboard: 'strategy.tips.zoomOutKey'},
            {shortcut: 'strategy.tips.drawBegin', keyboard: 'strategy.tips.drawBeginKey'},
            {shortcut: 'strategy.tips.append', keyboard: 'strategy.tips.appendKey'},
            {shortcut: 'strategy.tips.totalDrag', keyboard: 'strategy.tips.totalDragKey'},
            {shortcut: 'strategy.tips.operate', keyboard: 'strategy.tips.operateKey'},
            {shortcut: 'strategy.tips.nodeDrag', keyboard: 'strategy.tips.nodeDragKey'},
        ];
    }

    // 从本地JSON文件导入
    loadFromJson(event) {
        if (event.target.value.lastIndexOf('.json') === event.target.value.length - 5) {
            const file = event.target.files[0];
            const fileReader = new FileReader();
            fileReader.readAsText(file);
            fileReader.onloadend = (ev => {
                try {
                    const read = JSON.parse(ev.target['result']);
                    const json = JSON.parse(read.json);
                    if (read.json && json.sourceNodes && json.sourceEdges && json.scale) {
                        console.log(read);
                        this.clearNodesAndEdges();
                        this.loading.show();
                        this.loadFromExit(read);
                        event.target.value = '';
                    } else {
                        this.snackBar.open('JSON文件解析失败，请保证数据准确性！', '✖');
                        event.target.value = '';
                    }

                } catch (e) {
                    this.snackBar.open('JSON文件解析失败，请保证数据准确性！', '✖');
                    console.log(e);
                    event.target.value = '';
                }
            });
        } else {
            event.target.value = '';
            this.snackBar.open('不支持的文件类型，请选择后缀为.json的JSON文件！', '✖');
        }
    }

    // 保存为svg
    saveSvg() {
        this.toSvg('流程.svg');
    }

    // 下载为svg
    toSvg(fileName) {
        const outerHTML = d3.select('#canvas').node().outerHTML;
        const jsZip = new JSZip();
        jsZip.file(fileName, outerHTML).forEach((path, file) => {
            file.async('blob').then(result => {
                this.fileDownload.blobDownload(result, path);
            });
        });
    }

    // 保存为json
    saveJson() {
        const sourceNodes = parse(stringify(this.nodes));
        const sourceEdges = parse(stringify(this.edges)); // 深克隆
        this.formatStrategy(sourceNodes, sourceEdges);
        const json = {sourceNodes: sourceNodes, sourceEdges: sourceEdges, scale: this.svgScale};
        const data = {json: JSON.stringify(json)};
        const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
        this.fileDownload.blobDownload(blob, this.translate.instant('strategy.downloadJson'));
    }

    // 源数据处理
    formatStrategy(sourceNodes: Node[], sourceEdges: Line[]) {
        sourceNodes.forEach(node => { // 删除无用d3对象和循环引用
            delete node.center.parentNode; // 删除循环引用
            delete node.g; // d3选中的节点selection
            if (node.name !== 'BirthdayMagnificationActuator' && node.name !== 'StoreMagnificationActuator' && node.name !== 'LevelMagnificationActuator' && node.name !== 'StoreFilter' && node.name !== 'MemberMallFilter'
                && node.name !== 'OrderAmountFilter' && node.name !== 'OrderDateFilter' && node.name !== 'MemberDateFilter' && node.name !== 'OrderSetLevelActuator' && node.name !== 'OrderPointFilter'
                && node.name !== 'GivePointActuator' && node.name !== 'MemberLevelFilter') {
                Object.keys(node.params).forEach(key => { // 只取id
                    if (Array.isArray(node.params[key])) { // 数组取id
                        node.params[key] = node.params[key].map(value => {
                            if (value.id) {
                                return value.id;
                            } else {
                                return value;
                            }
                        });
                    } else if (node.params[key]) { // 对象取id
                        node.params[key] = node.params[key].id;
                    }
                });
            }
        });
        sourceEdges.forEach(line => { // 删除无用d3对象和循环引用
            delete line.g;
            delete line.sourceNode.center.parentNode;
            delete line.sourceNode.g;
            delete line.sourceNode.params;
            delete line.targetNode.params;
            delete line.targetNode.g;
            delete line.targetNode.center.parentNode;
        });
    }

    // 画布全屏
    setFullScreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen().then(() => {
            });
        } else {
            document.documentElement.requestFullscreen().then(() => {
            });
        }
    }

    /** 从已有数据中读取营销策略*/
    reloadStrategy() {
        this.clearNodesAndEdges();
        this.loading.show();
        this.strategyService.getProcess(this.detailId).pipe(takeUntil(this.unsubscribeAll)).subscribe(res => {
            if (res) {
                sessionStorage.setItem('resetStrategy', JSON.stringify(res));
                this.loadFromExit(res as any);
            } else {
                this.loading.hide();
            }
        }, error1 => {
            this.loading.hide();
        });
    }

    // 根据策略重绘流程
    loadFromExit(data: Process) {
        const jsonData = JSON.parse(data.json);
        if (this.checkNodeCorrect(jsonData.sourceNodes)) {
            this.loading.hide();
            this.snackBar.open('当前导入的流程与类型不符合，请切换类型后重新导入！', '✖');
        } else {
            if (jsonData.activityId) {
                this.strategyService.searchActivityListById(jsonData.activityId).pipe(takeUntil(this.unsubscribeAll)).subscribe(res => {
                    if (res.status === 200) {
                        this.currentActivity = res.body;
                    }
                });
            }
            this.strategy.patchValue(data);
            this.processId = jsonData.id;
            this.nodes = jsonData.sourceNodes;
            this.edges = jsonData.sourceEdges;
            this.svgScale = jsonData.scale;
            this.recoverNodesAndEdges();
        }
    }

    // 清空全部内容
    clearAll(flag?) {
        return new Promise<any>(resolve => {
            this.noShortcut = true;
            this.dialog.open(flag ? this.changeClear : this.clearCanvas, {id: 'clearCanvas'}).afterClosed().subscribe(res => {
                if (res) {
                    this.clearNodesAndEdges();
                    this.strategy.markAsUntouched();
                    resolve();
                }
                this.noShortcut = false;
            });
        });
    }

    // 折叠面板
    propertyOpenOrFold() {
        if (window.innerWidth >= 960) {
            this.propertyOpenFold = !this.propertyOpenFold;
        } else {
            this.propertyOpenFold = false;
            this.sidebarService.getSidebar('property-panel').toggleOpen();
        }
    }

    /********************************** 获取执行器数据 *****************************************/
    /************ 活动策略执行器 ************/
    // 百分比分流--执行器数据
    // 修改分流器文本框
    setText(event) {
        const reg = /(^[0-9]\d*$)/;
        if (this.label === 'strategy.oneHundredLabel') { // 百分比分流
            if (reg.test(event.target.value)) {
                if (event.target.value > 100) {
                    event.target.value = 100;
                }
            } else {
                event.target.value = event.target.value.replace(/\D/g, '');
            }
            const connectLines = this.edges.filter(line => line.sourceNode.id === this.selectElement.sourceNode.id && line.id !== this.selectElement.id);
            let employ = 0;
            connectLines.forEach(line => {
                if (line.params['chance']) {
                    employ += Number(line.params['chance']);
                }
            });
            if (event.target.value !== '') {
                if (employ + Number(event.target.value) > 100) {
                    event.target.value = 100 - employ;
                }
                d3.select('#' + this.selectElement.id + '_text').text(event.target.value.trim() + '%');
                this.selectElement.params['chance'] = event.target.value;
            }
        }
    }

    // 获取选择的数据
    getSelectedData(event){
        const reg = /(^[0-9]\d*$)/;
        if (this.label === 'strategy.oneHundredLabel') { // 百分比分流
            if (reg.test(event.option.value)) {
                if (event.option.value > 100) {
                    event.option.value = 100;
                }
            } else {
                event.option.value = event.option.value.replace(/\D/g, '');
            }
            const connectLines = this.edges.filter(line => line.sourceNode.id === this.selectElement.sourceNode.id && line.id !== this.selectElement.id);
            let employ = 0;
            connectLines.forEach(line => {
                if (line.params['chance']) {
                    employ += Number(line.params['chance']);
                }
            });
            if (event.option.value !== '') {
                if (employ + Number(event.option.value) > 100) {
                    event.option.value = 100 - employ;
                }
                d3.select('#' + this.selectElement.id + '_text').text(event.option.value + '%');
                this.selectElement.params['chance'] = event.option.value;
            }
        }
    }

    // 点击剩余获取百分比
    getResidueSelected(){
        this.residueSelected = null;
        const connectLines = this.edges.filter(line => line.sourceNode.id === this.selectElement.sourceNode.id && line.id !== this.selectElement.id);
        let employ = 0;
        connectLines.forEach(line => {
            if (line.params['chance']) {
                employ += Number(line.params['chance']);
            }
        });
        if (employ <= 100){
            this.residueSelected = 100 - employ;
        }
    }

    // 标签过滤--执行器数据
    // 打开标签选择
    openTagSelect(passengersTag: TemplateRef<any>) {
        this.selectedTags = [];
        Object.assign(this.selectedTags, this.selectElement.params['selectedTag']);
        this.dialog.open(passengersTag, {id: 'tagSelect', width: '80%'}).afterClosed().subscribe(res => {
            if (res) {
                this.selectElement.params['selectedTag'] = [];
                Object.assign(this.selectElement.params['selectedTag'], this.selectedTags);
            } else {
                this.selectedTags = [];
            }
        });
    }

    // 选择标签回调
    onTagSelect(event) {
        this.selectedTags = event;
    }

    // 移除标签
    removeTag(i) {
        this.selectElement.params['selectedTag'].splice(i, 1);
    }

    // 选择发券规则-执行器数据
    openCouponRuleSelect(couponTemplate: TemplateRef<any>) {
        this.selectedCouponRules = [];
        Object.assign(this.selectedCouponRules, this.selectElement.params['couponRules']);
        this.dialog.open(couponTemplate, {id: 'couponRule', width: '80%'}).afterClosed().subscribe(res => {
            if (res) {
                this.selectElement.params['couponRules'] = [];
                Object.assign(this.selectElement.params['couponRules'], this.selectedCouponRules);
            } else {
                this.selectedCouponRules = [];
            }
        });
    }

    onCouponSelect(event) {
        this.selectedCouponRules = event;
    }

    removeCoupon(i) {
        this.selectElement.params['couponRules'].splice(i, 1);
    }

    // 选择短信/消息模板-执行器数据
    openMessageSelect(messageTemplate: TemplateRef<any>) {
        this.selectedMsgTemplate = {};
        Object.assign(this.selectedMsgTemplate, this.selectElement.params['template']);
        this.dialog.open(messageTemplate, {id: 'messageTemplate', width: '80%'}).afterClosed().subscribe(res => {
            if (res && this.selectedMsgTemplate) {
                this.selectElement.params['template'] = {};
                Object.assign(this.selectElement.params['template'], this.selectedMsgTemplate);
            } else {
                this.selectedMsgTemplate = null;
            }
        });
    }

    onMessageSelect(event) {
        this.selectedMsgTemplate = event;
    }

    removeMessage() {
        this.selectElement.params['template'] = null;
    }

    /************ 权益策略执行器 ************/
    // 保存店铺多倍积分-执行器数据
    saveStoreParams() {
        const res = this.storeGroup.getRawValue();
        const keys = Object.keys(res);
        res.validPeriod = this.datePipe.transform(res.validPeriod, 'yyyyMMdd');
        keys.forEach(key => {
            if (key === 'store') {
                this.selectElement.params[key] = res[key].map(store => store.storeId).join(',');
            } else if (key === 'magnification') {
                this.selectElement.params[key] = Number(res[key]);
            } else {
                this.selectElement.params[key] = res[key];
            }
        });
        this.showEditPanel = false;
    }

    // 保存店铺过滤-执行器数据
    saveStoreFilterParams() {
        if (this.storeFilterGroup.get('store').value.length === 0){
            this.snackBar.open('请添加店铺范围！');
        } else {
            const res = this.storeFilterGroup.getRawValue();
            const keys = Object.keys(res);
            keys.forEach(key => {
                if (key === 'store') {
                    this.selectElement.params[key] = res[key].map(store => store.storeId).join(',');
                }
            });
            this.showEditPanel = false;
        }
    }

    // 保存商场过滤-执行器数据
    saveMallFilterParams() {
        if (this.mallFilterGroup.get('mall').value.length === 0){
            this.snackBar.open('请添加商场范围！');
        } else {
            const res = this.mallFilterGroup.getRawValue();
            const keys = Object.keys(res);
            keys.forEach(key => {
                if (key === 'mall') {
                    this.selectElement.params[key] = res[key].map(mall => mall.mallId).join(',');
                }
            });
            this.showEditPanel = false;
        }
    }

    /**********筛选店铺*********/
    // 打开标签选择
    openStoreSelect(merchant: TemplateRef<any>, flag) {
        if (flag === 'storeGroup'){
            this.selectedStores = [];
            Object.assign(this.selectedStores, this.storeGroup.get('store').value);
            this.dialog.open(merchant, {id: 'storeSelect', width: '80%'}).afterClosed().subscribe(res => {
                if (res) {
                    this.storeGroup.get('store').setValue(this.selectedStores, {emitEvent: false});
                } else {
                    this.selectedStores = [];
                }
            });
        } else if (flag === 'storeFilterGroup'){
            this.selectedStores = [];
            Object.assign(this.selectedStores, this.storeFilterGroup.get('store').value);
            this.dialog.open(merchant, {id: 'storeSelect', width: '80%'}).afterClosed().subscribe(res => {
                if (res) {
                    this.storeFilterGroup.get('store').setValue(this.selectedStores, {emitEvent: false});
                } else {
                    this.selectedStores = [];
                }
            });
        }
    }

    // 移除商户
    removeStore(i, flag) {
        if (flag === 'storeGroup'){
            this.storeGroup.get('store').value.splice(i, 1);
        } else if (flag === 'storeFilterGroup'){
            this.storeFilterGroup.get('store').value.splice(i, 1);
        }
    }

    // 选择店铺回调
    onStoreSelect(event) {
        this.selectedStores = event;
    }

    /**********筛选商场*********/
    // 打开标签选择
    openMallSelect(mallTemplate: TemplateRef<any>, flag) {
        if (flag === 'mallFilterGroup'){
            this.selectedMalls = [];
            Object.assign(this.selectedMalls, this.mallFilterGroup.get('mall').value);
            this.dialog.open(mallTemplate, {id: 'mallSelect', width: '80%'}).afterClosed().subscribe(res => {
                if (res) {
                    this.mallFilterGroup.get('mall').setValue(this.selectedMalls, {emitEvent: false});
                } else {
                    this.selectedMalls = [];
                }
            });
        }
    }

    // 移除商户
    removeMall(i, flag) {
        if (flag === 'mallFilterGroup'){
            this.mallFilterGroup.get('mall').value.splice(i, 1);
        }
    }

    // 选择店铺回调
    onMallSelect(event) {
        this.selectedMalls = event;
    }

    // 保存生日多倍积分-执行器数据
    saveBirthParams() {
        const value = this.birthGroup.getRawValue();
        value.validPeriod = this.datePipe.transform(value.validPeriod, 'yyyyMMdd');
        this.selectElement.params = value;
        value.magnification = Number(value.magnification);
        this.showEditPanel = false;
    }

    // 保存送积分-执行器数据
    saveGivePointParams() {
        const value = this.givePointGroup.getRawValue();
        value.expireDate = this.datePipe.transform(value.expireDate, 'yyyyMMdd');
        this.selectElement.params = value;
        value.point = Number(value.point);
        this.showEditPanel = false;
    }

    // 保存等级多倍积分-执行器数据
    saveLevelParams() {
        const value = this.levelGroup.getRawValue();
        this.levels.forEach(level => {
            value[level.level] = Number(value[level.level]);
        });
        value.validPeriod = this.datePipe.transform(value.validPeriod, 'yyyyMMdd');
        this.selectElement.params = value;
        this.showEditPanel = false;
    }

    // 保存等级调整-执行器数据
    saveMemberLevelId() {
        const data = this.memberLevelInfo.split(',');
        this.selectElement.params = {id: Number(data[0]), level: data[1]};
        this.showEditPanel = false;
    }

    // 保存等级过滤-控制器数据
    saveMemberLevelFilter() {
        const data = this.memberLevelFilter.split(',');
        this.selectElement.params = {id: Number(data[0]), level: data[1]};
        this.showEditPanel = false;
    }

    // 获取可用的会员等级
    initMemberLevels() {
        this.strategyService.getMemberLevels().pipe(map(value => {
            return value.filter(level => level.enable);
        })).subscribe(res => {
            this.levels = res;
            if (res) {
                this.addLevelControls();
            }
        });
    }

    // 添加等级control
    addLevelControls() {
        this.levels.forEach(level => {
            const formControl = new FormControl(1, Validators.required);
            this.levelGroup.addControl(level.level, formControl);
            formControl.valueChanges.subscribe(res => {
                this.util.transformToNumberWithControl(res, formControl, 0, 9999);
            });
        });
    }

    // 消费金额
    toConsumeAmountFilter(){
        const res = this.consumeAmountGroup.getRawValue();
        const keys = Object.keys(res);
        keys.forEach(key => {
            if (key === 'value') {
                this.selectElement.params[key] = Number(res[key]);
            } else {
                this.selectElement.params[key] = res[key];
            }
        });
        this.showEditPanel = false;
    }

    // 积分过滤
    toOrderPointFilter(){
        const res = {value: this.orderPointFilterControl.value};
        const keys = Object.keys(res);
        keys.forEach(key => {
            if (key === 'value') {
                this.selectElement.params[key] = Number(res[key]);
            }
        });
        this.showEditPanel = false;
    }

    // 日期过滤
    toDateFilter(){
        const itemList = [];
        if (this.dateFilterGroup.value['type'] === 'WEEK'){
            this.weekList.forEach(item => {
                if (item['checked']) {
                    itemList.push(item['value']);
                }
            });
        } else {
            this.dayList.forEach(item => {
                if (item['checked']){
                    itemList.push(item['value']);
                }
            });
        }
        if (itemList.length === 0){
            this.snackBar.open('请选择日期范围');
        } else {
            this.selectElement.params['type'] = this.dateFilterGroup.value['type'];
            this.selectElement.params['dayOrWeek'] = itemList.join(',');
            this.showEditPanel = false;
        }
    }

    /**************************右侧侧边栏表单-策略相关信息 **********************************/
    // 点击属性面板
    onPanelClick() {
        if (this.selectElement) {
            this.selectElement.g.classed('node-selected', false);
            this.hideEditFlags();
        }
    }

    // 开始时间选择后设定结束时间最小时间
    onStartSourceDate(event, endTime) {
        endTime.picker.set('minDate', event);
        if (!this.detailId) {
            endTime.picker.setDate(new Date(new Date(new Date(new Date(event).setHours(23)).setMinutes(59)).setSeconds(59)));
        }
    }

    // 反之
    onEndSourceDate(event, startTime) {
        startTime.picker.set('maxDate', event);
    }

    /** 选择营销活动，可选*/
    openActivity(activities: TemplateRef<any>) {
        this.selectedActivity = this.currentActivity;
        this.dialog.open(activities, {id: 'activity', width: '80%'}).afterClosed().subscribe(res => {
            if (res) {
                this.currentActivity = this.selectedActivity;
            } else {
                this.selectedActivity = null;
            }
        });
    }

    onActivitySelect(event) {
        this.selectedActivity = event;
    }

    /********************************** 保存策略 *****************************************/
    // 保存策略
    save() {
        const singleNode = this.checkStrategy();
        const noTrigger = this.checkNoTrigger();
        const hundredShunt = this.checkHundredShunt();
        const noTarget = this.checkControlNoTarget();
        // const noActivity = this.checkNoActivity();
        if (this.strategy.valid && !singleNode && !noTrigger && !hundredShunt && !noTarget) {
            this.loading.show();
            const strategy = this.strategy.getRawValue();
            this.process = strategy;
            this.process.beginDate = new Date(this.process.beginDate).toISOString();
            this.process.endDate = new Date(this.process.endDate).toISOString();
            let process: any;
            process = {
                id: this.processId ? this.processId : 'process_' + uuidv4(),
                name: strategy.name,
                node: [],
                edge: [],
                sourceNodes: [],
                sourceEdges: [],
                scale: this.svgScale
            };
            let message = '';
            this.nodes.forEach((node) => {
                const newNode = new NewNode();
                newNode.id = node.id;
                newNode.type = node.name;
                newNode.name = node.title;
                if (Object.entries(node.params).length > 0) { // 有属性字段
                    if ((!Array.isArray(Object.values(node.params)[0]) && Object.values(node.params)[0] !== null) || (Array.isArray(Object.values(node.params)[0]) && Object.values(node.params)[0].length > 0)) { // 字段中有选中参数
                        newNode.params = this.getNodeParams(node);
                    } else { // 无选中参数
                        message += '"' + node.title + '" ';
                    }
                    // 非无参节点的节点无选中参数
                } else if (node.type !== 'trigger' && node.name !== 'DiversionFilter' && node.name !== 'EndActuator' && node.name !== 'OneMagnificationActuator' && Object.entries(node.params).length === 0) {
                    message += '"' + node.title + '" ';
                }
                process.node.push(newNode);
            });
            this.edges.forEach(line => {
                const newLine = new NewLine();
                newLine.source = line.sourceNode.id;
                newLine.target = line.targetNode.id;
                if (Object.entries(line.params).length > 0) {
                    newLine.params = line.params;
                } else if (line.sourceNode.name === 'DiversionFilter') {
                    message += '"' + line.sourceNode.title + '" ';
                }
                process.edge.push(newLine);
            });
            // 如果有节点没有属性
            if (message) {
                message += '没有选定属性，请选定属性后再进行保存！';
                this.snackBar.open(message, '✖');
                this.loading.hide();
                return;
            }
            process.sourceEdges = parse(stringify(this.edges));
            process.sourceNodes = parse(stringify(this.nodes));
            // 对sourceNodes 和sourceEdges进行处理  用意是整条数据只保存id或者有用字段
            this.formatStrategy(process.sourceNodes, process.sourceEdges);
            if (this.currentActivity) {
                process.activityId = this.currentActivity.id;
            }
            this.process.json = JSON.stringify(process);
            console.log(JSON.stringify(process));
            if (this.isReload) {
                this.strategyService.updateProcess(this.process).subscribe(res => {
                    this.finished = true;
                    this.processId = '';
                    this.cancel();
                    this.loading.hide();
                }, error1 => {
                    this.loading.hide();
                });
            } else {
                this.strategyService.createProcess(this.process).subscribe(res => {
                    this.finished = true;
                    this.cancel();
                    this.processId = '';
                    this.loading.hide();
                }, error1 => {
                    this.loading.hide();
                });
            }
        } else {
            this.strategy.markAllAsTouched();
            if (singleNode) {
                this.snackBar.open('当前流程中存在未连接的节点，请重新编辑后再进行保存！', '✖');
            // } else if (noActivity) {
            //     this.snackBar.open('当前流程中存在发券执行器，请选择一个营销活动！', '✖');
            } else if (noTrigger) {
                this.snackBar.open('当前流程中不存在触发器，请添加一个触发器并连接后再进行保存！', '✖');
            } else if (hundredShunt) {
                this.snackBar.open('当前流程中存在分流器总和不为100%，请确保每个分流器后的线路总和为100%后再进行保存！', '✖');
            } else if (noTarget) {
                this.snackBar.open('当前流程中存在过程控制后没有执行器的线路，请为其添加一个执行器！', '✖');
            } else {
                this.propertyOpenFold = false;
                this.snackBar.open('策略表单属性不能为空，请补全后再进行保存！', '✖');
            }
        }
    }

    // 检查策略是否完整连接
    checkStrategy() {
        let singleNode = false;
        this.nodes.forEach(node => {
            if (!!!this.edges.find(line => line.id.includes(node.id))) {
                singleNode = true;
            }
        });
        return singleNode;
    }

    // 检查存在发券时是否选择了活动
    checkNoActivity() {
        let noActivity = false;
        if (this.nodes.find(node => (node.name === 'SendCouponActuator' || node.name === 'OrderSendCouponActuator')) && !this.currentActivity) {
            noActivity = true;
        }
        return noActivity;
    }

    // 检查流程控制器是否有出口
    checkControlNoTarget() {
        let noTarget = false;
        this.nodes.forEach(node => {
            if (node.type === 'control' && node.name !== 'EndActuator' && !this.edges.find(line => line.sourceNode.id === node.id)) {
                noTarget = true;
            }
        });
        return noTarget;
    }

    // 检查是否有触发器
    checkNoTrigger() {
        let noTrigger = false;
        if (!this.nodes.find(node => node.type === 'trigger')) {
            noTrigger = true;
        }
        return noTrigger;
    }

    // 检查百分比分流是否合法
    checkHundredShunt() {
        let hundredShunt = false;
        const temp = {};
        this.edges.forEach(line => {
            if (line.sourceNode.name === 'DiversionFilter' && line.params['chance']) {
                if (!temp[line.sourceNode.id]) {
                    temp[line.sourceNode.id] = 0;
                }
                temp[line.sourceNode.id] += Number(line.params['chance']);
            }
        });
        // 缓存求和小于100则不合法
        Object.values(temp).forEach(item => {
            if (item < 100) {
                hundredShunt = true;
            }
        });
        return hundredShunt;
    }

    cancel() {
        this.router.navigate(['apps/strategy']).then();
    }

    ngOnDestroy(): void {
        this.unsubscribeAll.next();
        this.unsubscribeAll.complete();
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    }
}

// 策略
export class Process {
    name: string; // 策略名称
    beginDate: string;
    createdBy: string;
    createdDate: string;
    description: string;
    enabled: boolean;
    endDate: string;
    json: string;
    lastModifiedBy: string;
    lastModifiedDate: string;
}

// 控制版
export class Control {
    imgSrc: string;
    name: string;
    type: string;
    belongType: string;
}

// 线
export class Line {
    id: string;
    type: string;
    name: string;
    source: string;
    target: string;
    sourceNode: Node;
    targetNode: Node;
    params: { [key: string]: any } = {};
    g: any; // d3 selection实例
    x: number; // 坐标x
    y: number; // 坐标y
}

// 新节点 转化后用作传输
export class NewNode {
    id: string;
    name: string;
    type: string;
    params: any;
}

// 处理后的线节点，传输到中台用
export class NewLine {
    id: string;
    source: string;
    target: string;
    params: any;
}

// 节点
export class Node {
    id: string; // 节点ID
    type: string; // 节点类型
    title: string; // 节点文字名称
    name: string; // 节点名称
    params: { [key: string]: any } = {};
    g: any; // d3 selection实例
    x: number; // 坐标x
    y: number; // 坐标y
    center: Point = new Point();
}

// 节点中的点
export class Point {
    x: number;
    y: number;
    parentNode: Node;
}

// 策略类型
export enum EngineType {
    Order = 'Order',
    Member = 'Member'
}


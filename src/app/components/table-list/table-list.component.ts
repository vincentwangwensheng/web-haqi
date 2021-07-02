import {
    AfterViewInit,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import * as d3 from 'd3';
import {NotifyAsynService} from '../../services/notify-asyn.service';
import {Subscription} from 'rxjs';
import {fuseAnimations} from '../../../@fuse/animations';
import {Overlay} from '@angular/cdk/overlay';
import {TemplatePortal} from '@angular/cdk/portal';
import {BaseOptions} from 'flatpickr/dist/types/options';
import flatpickr from 'flatpickr';
import {Mandarin} from 'flatpickr/dist/l10n/zh';
import {MandarinTraditional} from 'flatpickr/dist/l10n/zh-tw';
import {english} from 'flatpickr/dist/l10n/default';
import {TranslateService} from '@ngx-translate/core';


@Component({
    selector: 'app-table-list',
    templateUrl: './table-list.component.html',
    styleUrls: ['./table-list.component.scss'],
    animations: fuseAnimations
})
export class TableListComponent implements OnInit, OnDestroy, AfterViewInit {
    @Input()
    overPanel = false;
    @Input()
    stick = false;
    @Input()
    checkbox = false;
    @Input()
    singleSelect = false;
    @Input()
    resetSelect = true;
    @Input()
    noScrollPaging = false; // 去除鼠标滚动翻页
    // 列表名
    @Input() title = '';
    // 列表字段
    @Input() // 数据
    rows: any[] = [];
    @Input() // 选中的数据
    selectedRows: any[] = []; // checkbox mode
    @Input() //
    selectedRow: any; // singleSelect mode
    selected = []; // dataTable 绑定选中
    @Input() // 输入的比较变量
    selectedField = 'id';
    totalSelected = false; // 全部选中
    totalDisabled = false; // 全部禁用

    @Input() // 表头
    columns: Column[] = [];
    totalColumns = [];
    allSelect = true;
    selectShow = false; // 是否显示
    selectLeft = '';
    noFilter = false; // 没有筛选

    @Input()
    hasHeader = true; // 是否有头部搜索框

    @Input()
    page: any = {page: 0, size: 20, count: 0};
    initSort = ''; // 初始化时的排序
    // 上次操作的分页
    lastPage = 0;

    // 自定义按钮
    @Input()
    customButton = false;
    // 自定义按钮文本
    @Input()
    customButtonText = '';
    // 自定义按钮颜色
    @Input()
    customButtonColor = '';

    // 按钮显示与否
    @Input()
    createRuleButton = false; // 新增电子券按钮
    @Input()
    downloadButton = false; // 下载模版按钮
    @Input()
    importButton = false; // 导入按钮
    @Input()
    createButton = false; // 新建按钮
    @Input()
    exportButton = false; // 导出按钮
    @Input()
    exportFilterDisabled = false; // 导出筛选禁用状态
    @Input()
    exportAllDisabled = false; // 导出全部禁用状态
    @Input()
    hasDetail = true; // 详情
    @Input()
    detailMenu = []; // 详情菜单
    @Input()
    hasEnabled = false; // 冻结解冻操作行按钮
    @Input()
    detailText = ''; // 自定详情文本 比如编辑、查看等
    @Input()
    hasCopy = false;
    @Input()
    hasStatistics = false; // 统计
    @Input()
    initOpacity = false; // 透明渐变

    @Output()
    customButtonClick: EventEmitter<any> = new EventEmitter<any>();
    @Output()
    tableSort: EventEmitter<any> = new EventEmitter();
    @Output()
    tablePaging: EventEmitter<any> = new EventEmitter();
    @Output()
    navigateDetail: EventEmitter<any> = new EventEmitter();
    @Output()
    navigateStatistics: EventEmitter<any> = new EventEmitter();
    @Output()
    create: EventEmitter<any> = new EventEmitter<any>();
    @Output()
    createRule: EventEmitter<any> = new EventEmitter();
    @Output()
    download: EventEmitter<any> = new EventEmitter();
    @Output()
    search: EventEmitter<any> = new EventEmitter<any>();
    @Output()
    searchClear: EventEmitter<any> = new EventEmitter();
    @Output()
    clear: EventEmitter<any> = new EventEmitter();
    @Output()
    dataSelect: EventEmitter<any> = new EventEmitter();
    @Output()
    exportFilter: EventEmitter<any> = new EventEmitter();
    @Output()
    exportAll: EventEmitter<any> = new EventEmitter();
    pageAnimation = true; // 翻页动画是否开启


    @Input()
    hasAutomaticReview = false; // 是否有自动审核按钮
    @Input()
    automaticReviewChecked = false; // 自动审核
    @Output()
    toAutomaticReview: EventEmitter<any> = new EventEmitter();

    sortColumn = '';
    sortAsc = false;
    scrollBarH = false; // 滚动条显示标记
    pageAnimationStamp: any;
    subscriptions: Subscription[] = [];

    pagers: any = {
        maxPage: 0, pages: [], count: 0
    };
    inputPage = '1';

    @ViewChild('datatable', {static: true})
    dataTable;
    @ViewChild('selectTemplate', {static: false})
    selectTemplate;

    @Input()
    customButtons: CustomButton[] = [];

    // 开始结束日期
    startPickers: any;
    endPickers: any;
    startConfig: Partial<BaseOptions> = {
        enableTime: true,
        time_24hr: true,
        enableSeconds: true,
        defaultHour: 0,
        defaultMinute: 0,
        defaultSeconds: 0
    };
    endConfig: Partial<BaseOptions> = {
        enableTime: true,
        time_24hr: true,
        enableSeconds: true,
        defaultHour: 23,
        defaultMinute: 59,
        defaultSeconds: 59
    };
    currentProject = '';

    constructor(
        private viewContainerRef: ViewContainerRef,
        private notify: NotifyAsynService,
        private overlay: Overlay,
        private translate: TranslateService
    ) {
    }

    ngOnInit() {
        if (localStorage.getItem('currentProject')) {
            this.currentProject = localStorage.getItem('currentProject');
        }
        this.noFilter = !!!this.columns.find(column => column.type);
        this.totalColumns = this.columns;
        this.totalColumns.forEach(column => column.selected = true);
        this.initSort = this.page.sort; // 保存初始化的sort
        if (localStorage.getItem(sessionStorage.getItem('username') + 'pageAnimation')) {
            this.pageAnimation = JSON.parse(localStorage.getItem(sessionStorage.getItem('username') + 'pageAnimation'));
        }
        setTimeout(() => {
            this.getColumnWidth();
        });
        this.onSidebarChange();
        this.onResponseReturn();
        this.setLanguageAndChange();
    }

    ngAfterViewInit(): void {
        document.getElementById('tableList').focus();
        this.initDatePickers();
    }


    // 初始化日期选择器
    initDatePickers() {
        this.startPickers = flatpickr('.calendar-start', this.startConfig);
        this.endPickers = flatpickr('.calendar-end', this.endConfig);
    }

    // 销毁日期示例后重新初始化
    reInitDatePickers() {
        if (this.startPickers && this.endPickers) {
            this.startPickers.destroy();
            this.endPickers.destroy();
            this.initDatePickers();
        }
    }

    // 改变日期配置
    setDateLocale(lang) {
        switch (lang) {
            case 'zh-CN': {
                this.startConfig.locale = Mandarin;
                this.endConfig.locale = Mandarin;
                this.reInitDatePickers();
                break;
            }
            case 'zh-TW': {
                this.startConfig.locale = MandarinTraditional;
                this.endConfig.locale = MandarinTraditional;
                this.reInitDatePickers();
                break;
            }
            default: {
                this.startConfig.locale = english;
                this.endConfig.locale = english;
                this.reInitDatePickers();
                break;
            }
        }
    }

    // 初始化设置日期语言以及语言变化改变
    setLanguageAndChange() {
        const currentLang = this.translate.getBrowserCultureLang();
        if (sessionStorage.getItem('selectedLang')) {
            this.setDateLocale(sessionStorage.getItem('selectedLang'));
        } else {
            this.setDateLocale(currentLang);
        }
        this.translate.onLangChange.subscribe(res => {
            this.setDateLocale(res.lang);
        });
    }

    /** 选择*/

    // 清空选择
    resetSelected() {
        this.selectedRow = null;
        this.dataSelect.emit(this.selectedRow);
    }

    // 是否有自动审核按钮
    automaticReview() {
        console.log('this.automaticReviewChecked:', this.automaticReviewChecked);
        this.toAutomaticReview.emit(this.automaticReviewChecked);
    }

    // 单个选中
    onSingleSelect(event) {
        this.selectedRow = event.selected[0];
        this.dataSelect.emit(this.selectedRow);
    }

    // checkbox change事件时候拿到选中项
    rowSelect(row, event) {
        row.selected = event.checked;
        if (row.selected) {
            if (!this.selectedRows.find(item => item[this.selectedField] === row[this.selectedField])) {
                this.selectedRows.push(row);
            }
        } else {
            this.selectedRows = this.selectedRows.filter(item => item[this.selectedField] !== row[this.selectedField]);
        }
        this.totalSelected = this.rows.filter(item => item.selected).length === this.rows.length && this.rows.length !== 0;
        this.dataSelect.emit(this.selectedRows);
    }

    // table事件
    onActivate(event) {
        if (event.type === 'click' && event.cellIndex !== 0 && this.checkbox && !event.row.disabled) {
            event.row.selected = !event.row.selected;
            if (event.row.selected) {
                if (!this.selectedRows.find(item => item[this.selectedField] === event.row[this.selectedField])) {
                    this.selectedRows.push(event.row);
                }
            } else {
                this.selectedRows = this.selectedRows.filter(item => item[this.selectedField] !== event.row[this.selectedField]);
            }
            this.totalSelected = this.rows.filter(row => row.selected).length === this.rows.length && this.rows.length !== 0;
            this.dataSelect.emit(this.selectedRows);
        }
    }

    // 全选/反选
    selectAllOrNot(event) {
        this.rows.forEach(row => {
            if (event.checked) {
                if (!row.disabled) {
                    row.selected = event.checked;
                    if (!this.selectedRows.find(item => item[this.selectedField] === row[this.selectedField])) {
                        this.selectedRows.push(row);
                    }
                }

            } else {
                this.selectedRows = this.selectedRows.filter(item => {
                    if (!row.disabled) {
                        row.selected = row.disabled;
                    }
                    if (item[this.selectedField] !== row[this.selectedField] || row.disabled) { // 反选 不包含禁用状态
                        return item;
                    }
                });
            }
        });
        this.totalSelected = !this.totalSelected;
        this.dataSelect.emit(this.selectedRows);
    }

    // 接口返回完成 拿到相关page数据
    onResponseReturn() {
        const onResponse = this.notify.onResponse.subscribe(() => {
            this.pagingAnimationEnd();
            this.getPagersFromResponse();
            this.initOpacity = true;
            setTimeout(() => { // 设置一个延迟 拿到数据到传递到列表组件的时间
                // 多选checkbox模式
                if (this.checkbox && this.selectedRows && this.selectedRows.length > 0) {
                    this.rows.forEach(row => {
                        const selectedRow = this.selectedRows.find(item => item[this.selectedField] === row[this.selectedField]);
                        if (selectedRow) {
                            row.selected = true;
                            selectedRow.selected = true;
                            if (selectedRow.disabled) {
                                row.disabled = true;
                            }
                        }
                    });
                    this.totalSelected = this.rows.filter(row => row.selected).length === this.rows.length && this.rows.length !== 0;
                } else {
                    // 单选模式
                    if (this.selectedRow) { // 查询到的当前数组中的对象 放到选中中 否则仅仅字段相同不会选中 （比较的是地址）
                        const findRow = this.rows.find(item => item[this.selectedField] === this.selectedRow[this.selectedField]);
                        if (findRow) {
                            this.selected = [];
                            this.selected.push(findRow);
                        }
                    }
                }
                this.totalDisabled = this.rows.filter(item => item.disabled).length === this.rows.length && this.rows.length !== 0;
            });
        });
        this.subscriptions.push(onResponse);
    }

    // 获取页数和翻页按钮数据
    getPagersFromResponse() {
        if (this.pagers.pages.length === 0) {
            this.getPagers();
        } else if (this.pagers.count !== this.page.count) {
            this.getPagers();
        }
    }

    // 初始化pagers
    getPagers() {
        this.inputPage = (this.page.page + 1).toString(10);
        this.pagers = {
            maxPage: Math.ceil(this.page.count / this.page.size),
            count: this.page.count
        };
        this.pagers.pages = [];
        if (this.pagers.maxPage > 0 && this.pagers.maxPage <= 5) {
            for (let i = 0; i < this.pagers.maxPage; i++) {
                this.pagers.pages.push({page: i});
            }
        } else if (this.pagers.maxPage > 0) {
            for (let i = 0; i < 5; i++) {
                this.pagers.pages.push({page: i});
            }
        }
    }


    // 翻页动画结束
    pagingAnimationEnd() {
        if (this.pageAnimation) {
            const tableBody = d3.select(this.dataTable.element).select('datatable-body');
            tableBody.classed('page-left', false);
            tableBody.classed('page-right', false);
        }
    }

    // 大于5页时选中以及其他页码变化
    changePagers(page) { // 跳转的查询page 比页码小1
        if (this.pagers.maxPage > 5) {  // 如果总页数大于5
            const pages = this.pagers.pages;
            if (page + 2 <= this.pagers.maxPage - 1 && page - 2 >= 0) { // 当前页数的前后2页都在0~最大页数中间
                pages.forEach((item, index) => {
                    item.page = page - 2 + index;
                });
            } else if (page + 1 === this.pagers.maxPage - 1) { // 当前页码在倒数第二页
                pages.forEach((item, index) => {
                    item.page = page - 3 + index;
                });
            } else if (page - 1 === 0) { // 当前页码在第二页
                pages.forEach((item, index) => {
                    item.page = page - 1 + index;
                });
            } else if (page === 0) { // 当前页码在第一页
                pages.forEach((item, index) => {
                    item.page = page + index;
                });
            } else if (page === this.pagers.maxPage - 1) { // 当前页码在倒数第一页
                pages.forEach((item, index) => {
                    item.page = page - 4 + index;
                });
            }
        }
    }

    // 控制页码数字输入
    pageInput(event) {
        const reg = /(^[0-9]\d*$)/;
        if (reg.test(event.target.value)) {
            const inputNumber = Number(event.target.value);
            if (inputNumber === 0) { // 限制输入
                event.target.value = 1;
            } else if (inputNumber > this.pagers.maxPage) {
                event.target.value = this.pagers.maxPage;
            }
        } else { // 不是数字 \D匹配不是数字
            event.target.value = event.target.value.replace(/\D/g, '');
        }
        this.inputPage = event.target.value;
    }

    // 直接输入页数
    selectPage(event) {
        const inputNumber = Number(event.target.value);
        this.onPager({page: inputNumber - 1});
    }

    // 动画开关
    onPageAnimation() {
        localStorage.setItem(sessionStorage.getItem('username') + 'pageAnimation', JSON.stringify(this.pageAnimation));
    }

    // 自订翻页
    onPager(event) {
        const page = event.page;
        this.inputPage = (page + 1).toString();
        if (page !== this.page.page) {
            this.lastPage = this.page.page;
            const tableBody = d3.select(this.dataTable.element).select('datatable-body');
            if (page > this.lastPage && this.pageAnimation) {
                tableBody.classed('page-left', true);
            } else if (page < this.lastPage && this.pageAnimation) {
                tableBody.classed('page-right', true);
            }
            if (this.pageAnimationStamp) {
                clearTimeout(this.pageAnimationStamp);
            }
            this.pageAnimationStamp = setTimeout(() => {
                this.tablePaging.emit(event);
                this.changePagers(page);
            }, 250);
        }
    }

    // 上/下一页
    onePaging(event) {
        if (event) {
            this.onPager({page: this.page.page + 1 <= this.pagers.maxPage - 1 ? this.page.page + 1 : this.pagers.maxPage - 1});
        } else {
            this.onPager({page: this.page.page - 1 >= 0 ? this.page.page - 1 : 0});
        }

    }

    // 首/尾页
    lastPaging(event) {
        if (event) {
            this.onPager({page: this.pagers.maxPage - 1});
        } else {
            this.onPager({page: 0});
        }
    }

    // 窗口变化
    windowResize() {
        const lastStatus = JSON.parse(sessionStorage.getItem('leftMenu'));
        if (lastStatus && window.innerWidth >= 1280) { // 大于侧边栏open的临界
            this.getColumnWidth();
        } else if (!lastStatus && window.innerWidth < 1280) {  // 小于侧边栏关闭的临界
            this.getColumnWidth();
        }
        d3.select('ngx-datatable').style('overflow-x', null);
        this.scrollBarH = false;
    }

    // 日期选择 可选日期数组区间
    onStartDate(event, column) {
        column.startDate = event.target.value;
        column.value = (column.startDate ? column.startDate : '') + '-' + (column.endDate ? column.endDate : '');
        this.page.page = 0;
        this.search.emit();
    }

    onEndDate(event, column) {
        column.endDate = event.target.value;
        column.value = (column.startDate ? column.startDate : '') + '-' + (column.endDate ? column.endDate : '');
        this.page.page = 0;
        this.search.emit();
    }

    // 鼠标滚动
    onWheel(event) {
        if (this.noScrollPaging) {
            return;
        }
        if (this.scrollBarH) {
            d3.select('ngx-datatable').node().scrollLeft -= event.wheelDelta as any;
        } else {
            if (event.wheelDelta < 0) { // 向下滑动下一页
                if (this.page.page + 1 < Math.ceil(this.page.count / this.page.size)) {
                    this.onePaging(true);
                }
            } else { // 向上滚动上一页
                if (this.page.page - 1 >= 0) {
                    this.onePaging(false);
                }
            }

            // }, 500);
        }
    }

    // 快捷键
    onKeyUp(event) {
        switch (event.code) {
            case 'Home': {
                this.clearAll();
                break;
            }
            case 'PageDown': {
                if (this.page.page + 1 < Math.ceil(this.page.count / this.page.size)) {
                    event.preventDefault();
                    this.onePaging(true);
                }
                break;
            }
            case 'PageUp': {
                if (this.page.page - 1 >= 0) {
                    event.preventDefault();
                    this.onePaging(false);
                }
                break;
            }

        }
    }

    // sidebar 开关、折叠
    onSidebarChange() {
        // 临界点通过异步拿到
        const onOpenChange = this.notify.openChange.subscribe(res => {
            setTimeout(() => {
                this.getColumnWidth();
            }, 100);
        });
        // sidebar手动折叠
        const onFoldChange = this.notify.foldChange.subscribe(res => {
            setTimeout(() => {
                this.getColumnWidth();
            }, 100);
        });
        this.subscriptions.push(onOpenChange);
        this.subscriptions.push(onFoldChange);
    }

    showSelect() {
        this.selectLeft = window.innerWidth - this.dataTable.element.offsetWidth - 32 + 'px';
        const overlayRef = this.overlay.create({hasBackdrop: true});
        const portal = new TemplatePortal(this.selectTemplate, this.viewContainerRef);
        overlayRef.attach(portal);
        overlayRef.backdropClick().subscribe(res => {
            overlayRef.detach();
            this.selectShow = false;
        });
        this.selectShow = !this.selectShow;
    }

    selectColumn(all?) {
        if (all) { // 全选/反选
            if (this.allSelect) {
                this.totalColumns.forEach(column => column.selected = false);
            } else {
                this.totalColumns.forEach(column => column.selected = true);
            }
        }
        this.columns = this.totalColumns.filter(column => column.selected);
        this.allSelect = this.columns.length === this.totalColumns.length;
        this.getColumnWidth();
        setTimeout(() => {
            this.initDatePickers();
        }, 300);
    }

    // 获取列宽
    getColumnWidth() { // 列宽响应式
        let columnWidth;
        if (this.overPanel) {
            columnWidth = this.dataTable.element.offsetWidth - (50 + 50 * (this.checkbox ? 1 : 0));
        } else {
            columnWidth = this.dataTable.element.offsetWidth - (50 + 50 * ((this.hasDetail ? 1 : 0) + (this.hasStatistics ? 1 : 0)));
        }
        this.columns.forEach(column => column.width = columnWidth / this.columns.length);
    }

    // 点击新建
    onCreate() {
        this.create.emit();
    }

    // 自定义按钮点击
    onCustomClick() {
        this.customButtonClick.emit();
    }

    // 点击新增券规则
    onCreateRule() {
        this.createRule.emit();
    }

    // 点击下载
    onDownload() {
        this.download.emit();
    }

    // 条件查询
    onSearch(event, column) {
        event.test = true;
        if (event.target.value.trim() !== '') {
            this.page.page = 0;
            column.value = event.target.value.trim();
            this.search.emit();
        }
    }

    // 选择查询
    onSelect(column, event) {
        if (event === 'all') {
            // 全部时的value，默认为''
            column.value = '';
            setTimeout(() => {
                column.options = column.options.filter(option => option !== 'all');
            }, 500);
        } else {
            if (!column.options.find(option => option === 'all')) {
                setTimeout(() => {
                    column.options.unshift('all');
                }, 500);
            }
        }
        this.page.page = 0;
        this.search.emit();
    }

    // 清除日期
    clearDate(column, event) {
        column.value = '';
        if (event.target.value === '') {
            this.searchClear.emit();
        }
    }

    // 选择一个日期 转化为iso字符串tz形式 然后加一天 取一天范围
    dateChange(column, event) {
        if (event && event.value) {
            const date = event.value._d;
            column.value = date.toISOString();
            date.setDate(date.getDate() + 1);
            column.value = column.value + '_' + date.toISOString();
            this.page.page = 0;
            this.search.emit();
        }
    }

    // 删除查询内容自动清除查询内容
    inputClear(event) {
        if (event.target.value === '') {
            this.searchClear.emit();
        }
    }

    // 清空查询
    clearAll() {
        // if (this.dateInput && this.dateInput.nativeElement.value && this.picker) {
        //     this.dateInput.nativeElement.value = '';
        //     this.picker._selected = null;
        // }
        this.page.page = 0;
        this.page.sort = this.initSort;
        this.inputPage = '1';
        this.getPagers();
        this.sortColumn = '';
        // if (this.matSelect) {
        //     this.matSelect.writeValue('');
        // }
        this.columns.forEach(column => {
            column.value = '';
            if (column.startDate) {
                column.startDate = '';
            }
            if (column.endDate) {
                column.endDate = '';
            }
        });
        this.search.emit();
    }

    // 导入选择文件
    onImport(event) {

    }

    // 导出筛选
    exportFilterData() {
        this.exportFilter.emit();
    }

    // 导出全部
    exportAllData() {
        this.exportAll.emit();
    }

    // 排序
    sorting(event) {
        this.sortColumn = event.column.name;
        const order = event.sorts[0].dir;
        if (order === 'asc') {
            this.sortAsc = true;
        } else if (order === 'desc') {
            this.sortAsc = false;
        }
        const sort = this.sortColumn + ',' + order;
        this.tableSort.emit(sort);
    }


    // 列位拖动
    resizing(event) {
        this.columns.find(column => column.name === event.column.name).width = event.newValue;
        let totalWidth = 0;
        this.columns.forEach(column => totalWidth += column.width);
        if (totalWidth + (this.hasDetail ? 100 : 50) > this.dataTable.element.offsetWidth) {
            d3.select('ngx-datatable').style('overflow-x', 'auto');
            this.scrollBarH = true;
        } else {
            d3.select('ngx-datatable').style('overflow-x', null);
            this.scrollBarH = false;
        }
    }

    // 详情
    getDetail(row) {
        this.navigateDetail.emit(row);
    }

    // 统计
    getStatistics(row) {
        this.navigateStatistics.emit(row);
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
    }
}

export interface Column {
    name: string;  // 列名字段
    translate: string; // 列名翻译
    width?: any; // 列宽
    sort?: boolean; // 是否排序
    startDate?: string; // 开始日期
    endDate?: string; // 结束日期
    needTranslate?: boolean;  // 值作为翻译的key 比如值为STORE，作为国际化文件的key，翻译为商户
    needTranslateProject?: boolean; // 不同项目中的翻译key，项目key+'.'+值，同上
    type?: 'input' | 'select' | 'date' | 'color' | ''; // 类型
    value?: any; // 每列查询的值
    options?: any[]; // select下拉选

}

// 自定义按钮
export interface CustomButton {
    name: string; // 名称
    iconFont?: string; // iconfont class
    permissions: '' | []; // 权限
    matIcon?: string; // matIcon
    class?: string; // 按钮颜色class
    fn: () => {}; // 按钮点击触发函数
}

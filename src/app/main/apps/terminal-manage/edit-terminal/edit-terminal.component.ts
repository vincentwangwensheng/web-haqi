import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Utils} from '../../../../services/utils';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {TerminalManageService} from '../terminal-manage.service';
import {forkJoin, Observable, Subject} from 'rxjs';
import * as JSZip from 'jszip/dist/jszip.js';
import {fuseAnimations} from '../../../../../@fuse/animations';
import {DomSanitizer} from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';
import {moveItemInArray} from '@angular/cdk/drag-drop';
import {debounceTime} from 'rxjs/operators';
import * as d3 from 'd3';


@Component({
    selector: 'app-edit-terminal',
    templateUrl: './edit-terminal.component.html',
    styleUrls: ['./edit-terminal.component.scss'],
    animations: fuseAnimations
})
export class EditTerminalComponent implements OnInit {
    editFlag = 0;
    detailId: any;
    titles = ['新建街区', '街区详情', '编辑街区'];
    onSaving = false;

    terminalGroup: FormGroup;
    // 商场选择
    mallSources = [];
    filterMallById: Observable<any>;
    filterMallByName: Observable<any>;

    /** 地图上传相关*/
    private svgUploadEnd: Subject<any> = new Subject(); // 异步读取选择上传的文件时的可观察对象
    private mapUploadEnd: Subject<any> = new Subject(); // 异步读取选择上传的文件时的可观察对象

    uploadFiles = [];
    uploadSVGs = [];
    uploadMaps = [];
    importAreas = [];
    importCs = []; // 其他摄像头等信息
    lastAreas = [];
    floors = []; // 从接口获取的楼层信息
    mapChanges = []; // 单元号更新
    terminalNo = ''; // 上传地图后读取的terminalNo
    onSvgLoading = false; // 读取文件添加到数组中
    onMapLoading = false; // 读取地图内容添加到数组中
    onSvgSaving = false; // 是否在保存

    /**地图可视化相关*/
    animationOn = true; // 动画样式添加
    username = '';

    @ViewChild('update', {static: true})
    update: TemplateRef<any>;


    constructor(
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private loading: FuseProgressBarService,
        private router: Router,
        private terminalService: TerminalManageService,
        private utils: Utils,
        private sanitizer: DomSanitizer,
        private translate: TranslateService,
        private activatedRoute: ActivatedRoute,
    ) {
        this.terminalGroup = new FormGroup({
            id: new FormControl(''),
            terminalNo: new FormControl(null),
            terminalName: new FormControl('', Validators.required),
            mallId: new FormControl('', Validators.required),
            mallName: new FormControl('', Validators.required),
            blocId: new FormControl(''),
            floors: new FormControl({value: 0, disabled: true}),
            blocName: new FormControl(''),
            address: new FormControl(''),
            enabled: new FormControl(true),
            desc: new FormControl('')
        });

        this.detailId = this.activatedRoute.snapshot.paramMap.get('id');
        if (this.detailId) {
            this.editFlag = 1;
        }
    }

    ngOnInit() {
        this.username = sessionStorage.getItem('username');
        this.initOrReset();
        this.onUploadEnd();
        this.cancelExplorerProgram();
        if (!this.detailId) {
            this.initMallOptions();
        }
    }

    // 初始化或重置
    initOrReset() {
        this.uploadMaps = [];
        this.uploadSVGs = [];
        this.uploadFiles = [];
        this.initTerminal().then(res => { // 详情初始化
            this.initMallOptions(res).then(data => {
                this.terminalNo = data.terminalNo;
                this.terminalGroup.patchValue(data, {emitEvent: false});
                this.terminalGroup.disable({emitEvent: false});
            });
            if (res && res.floors && this.floors.length > 0) { // 有上传街区地图知晓楼层
                this.initSvg(res.mallId, res.terminalNo);
            } else {
                this.onSvgLoading = false;
            }
        });
    }

    showEdit() {
        this.editFlag = 2;
        this.terminalGroup.enable({emitEvent: false});
        this.terminalGroup.get('floors').disable({emitEvent: false});

    }


    /** 楼层相关操作*/
    // 添加楼层（可选上传地图）
    addFloor() {
        const floor = {editableName: '', order: 0, name: '', floor: '', svg: '', terminalNo: ''};
        this.uploadSVGs.push(floor);
        this.uploadSVGs.forEach((svg, index) => {
            svg.order = index;
        });
        this.terminalGroup.get('floors').setValue(this.uploadSVGs.length, {emitEvent: false});
    }

    onFloorNameInput(event, item) {
        console.log(event);
        item.editableName = event.target.value;

    }


    /** 地图预览操作相关*/

    // 地图预览
    loadMaps(init?) {
        return new Promise<any>(resolve => {
            // 除初始化外 地图有变化
            this.animationOn = false;
            this.uploadMaps.forEach((item, index, arr) => {
                const svgContent = d3.select('#' + item.id);
                svgContent.html(item.map);
                const oneThird = Math.round((arr.length - 1) / 4); // 初始地图在大约四分之一的位置
                if (index > oneThird) {
                    svgContent.style('top', -250 * (index - oneThird) + 'px');
                } else if (index < oneThird) {
                    svgContent.style('top', 250 * (oneThird - index) + 'px');
                } else {
                    svgContent.style('top', 0); // 中间层为0 上下适应加减
                }
                // svgContent.style('top', -200 * index + 'px');
                svgContent.style('left', -25 * index + 'px');
            });
            resolve();
        });
    }

    /**地图上传相关*/

    // 加载svg完毕
    onUploadEnd() {
        this.svgUploadEnd.pipe(debounceTime(1000)).subscribe(res => {
            if (this.uploadSVGs.length > 0) {
                if (res.update) { // 非初始化时
                    console.log(1111);
                    const first = this.uploadSVGs[0];
                    const terminal = first.name.substring(0, first.name.indexOf('-')).toUpperCase();
                    if (terminal) {
                        this.terminalNo = terminal;
                        this.terminalGroup.get('terminalNo').setValue(terminal);
                    }
                    this.terminalGroup.get('floors').setValue(this.uploadSVGs.length);
                    this.uploadSVGs.forEach((item, index) => {
                        item.order = index;
                    });
                }
                this.uploadSVGs.forEach(svg => {
                    const findFloor = this.floors.find(fr => fr.name === svg.floor);
                    if (findFloor) {
                        svg.editableName = findFloor.editableName;
                    }
                });
                this.floors.forEach(floor => {
                    if (!this.uploadSVGs.find(svg => svg.editableName === floor.editableName)) {
                        const sg = {
                            name: floor.svg,
                            floor: floor.name,
                            editableName: floor.editableName,
                            order: floor.order,
                            terminalNo: floor.terminalNo
                        };
                        this.uploadSVGs.push(sg);
                    }
                });
                this.uploadSVGs.sort((a, b) => a.order - b.order);
            }
            this.onSvgLoading = false;
        });
        this.mapUploadEnd.pipe(debounceTime(1000)).subscribe(data => {
            if (this.uploadMaps.length > 0) {
                this.uploadMaps.sort((a, b) => a.order - b.order);
                this.loadMaps(data.init);
            }
            // 从地图map中解析出单元号
            this.getAreasFromMaps(data.init);
            this.onMapLoading = false;
        });
    }

    // 解析单元号
    getAreasFromMaps(flag?) {
        if (flag) {
            this.lastAreas = [];
        }
        this.importAreas = [];
        this.importCs = [];
        this.uploadMaps.forEach(item => {
            const firstIds = item.map.split('id="');
            firstIds.forEach((id, index) => {
                if (index !== 0) {
                    const areaNo = id.substring(0, id.indexOf('"')).toUpperCase();
                    const reg = /^[0-9A-Z]+-[0-9A-Z]+-S[0-9]+$/;
                    if (reg.test(areaNo)) {
                        if (flag) { // 初始化从接口获取的单元号
                            this.lastAreas.push(areaNo);
                        }
                        // 上传文件或者接口获取的单元号
                        this.importAreas.push(areaNo);
                    }
                    const reg1 = /^[0-9A-Z]+-[0-9A-Z]+-C[0-9]+$/;
                    if (reg1.test(areaNo)) {
                        this.importCs.push(areaNo);
                    }
                }
            });
        });
        console.log(this.importCs);

    }

    // 初始化街区数据
    initTerminal() {
        return new Promise<any>(resolve => {
            if (this.detailId) {
                this.onSvgLoading = true;
                this.terminalService.getTerminalWithFloorsById(this.detailId).subscribe(res => {
                    this.terminalGroup.disable({emitEvent: false});
                    this.floors = res.floorDTOS;
                    resolve(res.terminalDTO);
                }, error1 => this.onSvgLoading = false);
            }
        });
    }

    // 初始化街区地图
    initSvg(mallId, terminalNo) {
        if (mallId && terminalNo) {
            this.terminalService.svgInit(mallId, terminalNo).subscribe(res => {
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
                                map.floor = floorName.toUpperCase();
                                const floor = this.floors.find(f => f.name === map.floor);
                                if (floor) {
                                    map.order = floor.order;
                                }
                                this.uploadMaps.push(map);
                                this.mapUploadEnd.next({init: this.uploadMaps});
                            });
                            item.async('base64').then(result => {
                                const svg: any = {};
                                svg.imgUrl = this.sanitizer.bypassSecurityTrustUrl('data:image/svg+xml;base64,' + result);
                                svg.name = item.name;
                                const floorName = svg.name.substring(svg.name.indexOf('-') + 1, svg.name.indexOf('.'));
                                svg.floor = floorName.toUpperCase();
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
                    this.onSvgLoading = false;
                    this.lastAreas = [];
                }
            }, error1 => {
                this.onSvgLoading = false;
                this.snackBar.open('获取街区地图失败，街区地图丢失或服务器故障，请重新上传地图或联系系统管理员！', '✖');
            });
        } else {
            this.uploadSVGs = [];
            this.floors.forEach(floor => {
                const svg = {
                    name: floor.svg,
                    floor: floor.name,
                    editableName: floor.editableName,
                    order: floor.order,
                    terminalNo: floor.terminalNo
                };
                this.uploadSVGs.push(svg);
            });
            this.onSvgLoading = false;
        }
    }


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

    onFileDrop(event) {
        const files = event.dataTransfer.files;
        this.uploadFilePreviewTrigger(null, false, true, files);
    }

    // 点击上传
    uploadFilePreviewTrigger(uploadFilePreview?, delay?, drag?, files?) {
        if (this.editFlag === 1) { // 详情状态
            return;
        }
        // 拖拽上传
        if (drag) {
            this.getUploadFiles(files);

        } else {
            uploadFilePreview.click();
        }
    }

    // 上传svg并预览
    getFilePreview(event, i?) {
        const files = event.target.files;
        console.log(i);
        this.getUploadFiles(files, event, i);
    }

    // 检查文件名是否合法 为t1-f1等街区+楼层编号的形式
    checkFileNames(files) {
        let flag = false;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const prefix = file.name.substring(0, file.name.indexOf('.'));
            const suffix = file.name.substring(file.name.indexOf('.') + 1, file.name.length);
            const reg = /^[0-9a-zA-Z]+[-][0-9a-zA-Z]+$/;
            if (suffix === 'svg' && !reg.test(prefix)) {
                flag = true;
                this.changeLoading(false);
            }
        }
        return flag;
    }

    // 检查是否上传了不同街区的文件
    checkTheSameTerminal(file) {
        return false;
        let flag = false;
        const terminalNo = file.name.toUpperCase().substring(0, file.name.toUpperCase().indexOf('-'));
        if (terminalNo && this.uploadSVGs.length > 0 && !this.uploadSVGs.find(item => item.name.toUpperCase().substring(0, item.name.toUpperCase().indexOf('-')) === terminalNo)) {
            flag = true;
            this.changeLoading(false);
        }
        return flag;
    }

    // 检查上传的多个文件中是否存在不同街区
    checkTheSameInOnceUpload(files) {
        let flag = false;
        const nos = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const terminalNo = file.name.toUpperCase().substring(0, file.name.toUpperCase().indexOf('-'));
            if (!nos.includes(terminalNo) && terminalNo) {
                nos.push(terminalNo);
            }
        }
        if (nos.length > 1) {
            this.changeLoading(false);
            flag = true;
        }
        return flag;
    }

    changeLoading(flag) {
        this.onSvgLoading = flag;
        this.onMapLoading = flag;
    }

    // 获取上传文件列表并预览
    getUploadFiles(files, event?, index?) {
        if (this.checkFileNames(files)) {
            this.snackBar.open('请确保SVG文件名命名方式为“街区代号(任意编号用来代指街区)-楼层编号”，例如：“K1-F1.svg”！', '✖');
            if (event) {
                event.target.value = '';
            }
            return;
        }
        if (this.checkTheSameInOnceUpload(files)) {
            this.snackBar.open('请确保上传的地图文件属于对应的单个街区！', '✖');
            if (event) {
                event.target.value = '';
            }
            return;
        }
        this.changeLoading(true);
        for (let i = 0; i < files.length; i++) { // 循环拿到上传文件
            const file = files[i];
            if (file.type === 'image/svg+xml') {
                if (this.checkTheSameTerminal(file)) {
                    this.snackBar.open('请确保上传的地图文件属于对应的单个街区！', '✖');
                    if (event) {
                        event.target.value = '';
                    }
                    return;
                }
                this.getUploadFile(file);
                const imageReader = new FileReader();
                imageReader.readAsDataURL(file);
                imageReader.onloadend = (res) => {
                    const result = res.currentTarget['result'];
                    this.getUploadSvg(file, result, index);
                };
                const svgReader = new FileReader();
                svgReader.readAsText(file);
                svgReader.onloadend = (res) => {
                    const result = res.currentTarget['result'];
                    this.getUploadMaps(file, result);
                };
            } else {
                this.onSvgLoading = false;
                this.onMapLoading = false;
                this.snackBar.open(this.translate.instant('airport.message.typeError'), '✖');
            }
        }
        // 清空上传input中value
        if (event) {
            event.target.value = '';
        }
    }

    // 获取上传文件数组
    getUploadFile(sourceFile) {
        const file: any = {};
        const prefix = sourceFile.name.substring(0, sourceFile.name.indexOf('.'));
        const suffix = sourceFile.name.substring(sourceFile.name.indexOf('.'), sourceFile.name.length);
        file.name = prefix.toUpperCase() + suffix.toLowerCase();
        file.file = new File([sourceFile], file.name, {type: sourceFile.type, lastModified: sourceFile.lastModified});
        this.uploadFiles.push(file);
        if (!this.uploadFiles.find(item => item.name.toUpperCase() === file.name.toUpperCase())) {
            this.uploadFiles.push(file);
        }
    }

    // 获取上传预览svg
    getUploadSvg(file, result, index?) {
        const url = this.sanitizer.bypassSecurityTrustUrl(result);
        const svg: any = this.uploadSVGs[index];
        const prefix = file.name.substring(0, file.name.indexOf('.'));
        const suffix = file.name.substring(file.name.indexOf('.'), file.name.length);
        svg.name = prefix.toUpperCase() + suffix.toLowerCase();
        const floorName = svg.name.substring(svg.name.indexOf('-') + 1, svg.name.indexOf('.'));
        svg.floor = floorName.toUpperCase();
        svg.imgUrl = url;
        if (!svg.editableName) {
            svg.editableName = svg.floor;
        }
        this.svgUploadEnd.next({update: this.uploadSVGs});
    }

    // 获取上传
    getUploadMaps(file, result) {
        const map = result.substring(result.indexOf('<svg'), result.lastIndexOf('</svg>') + 6);
        const svg: any = {};
        const prefix = file.name.substring(0, file.name.indexOf('.'));
        const suffix = file.name.substring(file.name.indexOf('.'), file.name.length);
        svg.name = prefix.toUpperCase() + suffix.toLowerCase();
        svg.map = map;
        svg.id = svg.name.toLowerCase().split('.')[0];
        const floorName = svg.name.substring(svg.name.indexOf('-') + 1, svg.name.indexOf('.'));
        svg.floor = floorName.toUpperCase();
        if (!this.uploadMaps.find(item => item.name.toUpperCase() === file.name.toUpperCase())) {
            this.uploadMaps.push(svg);
        }
        this.onMapLoading = false;
        this.mapUploadEnd.next({update: this.uploadMaps});
    }

    // 检查zip中文件是否为svg或zip
    checkZipMapType(files) {
        // .xxx为后缀的文件名则为xxx文件 lastIndexOf位置为最后一个的.xxx开始位置
        return files.name.toLowerCase().lastIndexOf('.svg') !== files.name.length - 4 &&
            files.name.toLowerCase().lastIndexOf('.zip') !== files.name.length - 4;
    }

    // 解压zip
    unzipFile(file, event) {
        const jsZip = new JSZip();
        jsZip.loadAsync(file).then(zip => {
            const zipFiles = zip.files;
            // 过滤文件夹 只留文件
            const onLyFiles: any[] = Object.values(zipFiles).filter(item => !item['dir']);
            onLyFiles.sort();
            if (this.checkFileNames(onLyFiles)) {
                this.snackBar.open('请确保上传或压缩包中的SVG文件名命名方式为“街区代号-楼层编号”，例如：“T1-F1”！');
                return;
            }
            if (this.checkTheSameInOnceUpload(onLyFiles)) {
                this.snackBar.open('请确保上传的地图文件属于对应的单个街区！', '✖');
                return;
            }
            // zip中文件名是否和航站楼相符
            onLyFiles.forEach((item, index, arr) => {
                if (this.checkZipMapType(item)) {
                    this.changeLoading(false);
                    // this.snackBar.open(this.translate.instant('airport.message.zipTypeError'), '✖');
                    return;
                }
                if (this.checkTheSameTerminal(item)) {
                    this.snackBar.open('请确保上传的地图文件属于对应的单个街区！', '✖');
                    return;
                }
                // 如果仍然包含zip 则递归调用解压方法
                if (item.name.toLowerCase().lastIndexOf('.zip') === item.name.length - 4) {
                    item.async('blob').then(result => {
                        this.unzipFile(result, event);
                    });
                } else {
                    item.async('blob').then(result => {
                        const newFile = new File([result], item.name, {type: 'image/svg+xml'});
                        this.getUploadFile(newFile);
                    });
                    item.async('base64').then(result => {
                        this.getUploadSvg(item, 'data:image/svg+xml;base64,' + result);
                    });
                    item.async('text').then(result => {
                        this.getUploadMaps(item, result);
                    });
                }
            });
        });
    }

    // 预览排序
    sortList(event) {
        moveItemInArray(this.uploadSVGs, event.previousIndex, event.currentIndex);
        moveItemInArray(this.uploadMaps, event.previousIndex, event.currentIndex);
        this.uploadSVGs.forEach((item, index) => {
            item.order = index;
        });
        this.uploadMaps.forEach((item, index) => {
            item.order = index;
        });
        this.loadMaps();
        // if (event.previousIndex !== event.currentIndex && this.obeyRule !== 1) {
        //     this.loadMapWithPreview(true);
        // }
    }

    // 预览删除
    deleteUploadSVG(item, i) {
        this.uploadSVGs.splice(i, 1);
        this.uploadMaps = this.uploadMaps.filter(svg => svg.name !== item.name);
        this.uploadFiles = this.uploadFiles.filter(svg => svg.name !== item.name);
        this.uploadSVGs.forEach((svg, index) => {
            svg.order = index;
        });
        if (this.uploadSVGs.length === 0) {
            this.terminalNo = '';
        }
        this.terminalGroup.get('floors').patchValue(this.uploadSVGs.length);
        // 删除楼层时也要重新获取单元号信息
        this.getAreasFromMaps();
    }


    /** 与地图无关业务*/

    initMallOptions(data?) {
        return new Promise<any>((resolve, reject) => {
            this.terminalService.getMallList(0, 0x3f3f3f3f, 'lastModifiedDate,desc').subscribe(res => {
                if (res.content && res.content.length > 0) {
                    this.mallSources = res.content.filter(item => item.enabled);
                    this.filterMallById = this.utils.getFilterOptions(this.terminalGroup.get('mallId'), this.mallSources, 'mallId', 'mallName');
                    this.filterMallByName = this.utils.getFilterOptions(this.terminalGroup.get('mallName'), this.mallSources, 'mallName', 'mallId');
                    if (data && data.blocId) {
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

    // 选中name补全id或者互选
    onSelectionChange(option, controlId, field) {
        this.terminalGroup.get(controlId).setValue(option[field], {emitEvent: false});
        if (controlId === 'mallId' || controlId === 'mallName') {
            this.terminalGroup.get('blocId').setValue(option.blocId);
            this.terminalGroup.get('blocName').setValue(option.blocName);
            this.terminalGroup.get('address').setValue(option.address);
            this.filterMallById = this.utils.getFilterOptions(this.terminalGroup.get('mallId'), this.mallSources, 'mallId', 'mallName');
            this.filterMallByName = this.utils.getFilterOptions(this.terminalGroup.get('mallName'), this.mallSources, 'mallName', 'mallId');
        }
    }

    saveOrUpdateEnd(flag) {
        this.onSaving = false;
        this.loading.hide();
        if (flag === 'save') {
            this.snackBar.open('保存街区成功！', '✓');
        } else if (flag === 'update') {
            this.snackBar.open('更新街区成功！', '✓');
        }
        this.goBack();
    }

    // 保存操作
    onSaveClick() {
        if (this.editFlag === 0) {
            this.saveData().then(data => {
                this.terminalService.createTerminalWithFloors(data).subscribe(res => {
                    this.saveSvg().then(() => {
                        this.saveCameraNos();
                        this.saveAreaNos().then(() => {
                            this.saveOrUpdateEnd('save');
                        });
                    });
                }, error1 => {
                    this.onSaving = false;
                });
            });

        } else if (this.editFlag === 2) {
            this.saveData().then(data => {
                this.terminalService.updateTerminalWithFloors(data).subscribe(res => {
                    this.saveSvg().then(() => {
                        this.saveCameraNos();
                        this.saveAreaNos().then(() => {
                            this.saveOrUpdateEnd('update');
                        });
                    });
                }, error1 => {
                    this.onSaving = false;
                });
            });

        }
    }

    saveData() {
        return new Promise<any>((resolve) => {
            const nameSet = new Set();
            const fileRepeatSet = new Set();
            let fileCount = 0;
            let editableNameFlag = false;
            let noSvg = false;
            this.uploadSVGs.forEach(item => {
                nameSet.add(item.editableName);
                if (item.name) {
                    fileCount += 1;
                    fileRepeatSet.add(item.name);
                }
                if (!item.editableName) {
                    editableNameFlag = true;
                }
                if (!item.name) {
                    noSvg = true;
                }
            });
            if (editableNameFlag) {
                this.snackBar.open('楼层名称不能为空！', '✖');
                return;
            }
            if (noSvg) {
                this.snackBar.open('存在未上传地图的楼层！', '✖');
                return;
            }
            if (nameSet.size !== this.uploadSVGs.length) {
                this.snackBar.open('楼层名称不能重复！', '✖');
                return;
            }
            if (fileRepeatSet.size !== fileCount) {
                this.snackBar.open('地图文件不能重复！', '✖');
                return;
            }

            if (this.terminalGroup.valid) {
                // 如果地图命名与街区代号输入不一致
                if (this.terminalNo && this.uploadSVGs.length > 0 && this.terminalGroup.get('terminalNo').value !== this.terminalNo) {
                    this.snackBar.open('当前输入的街区代号与地图文件命名中的街区代号不符！', '✖');
                // 地图中的单元号与街区代号不符
                } else if (this.terminalNo && this.importAreas.find(item => !item.includes(this.terminalNo))) {
                    this.snackBar.open('当前地图文件中的单元号命名与街区代号不相符！', '✖');
                // 接口获取的svg文件中的单元号与重新上传svg发生了改变
                } else if (this.lastAreas.length > 0 || this.uploadMaps.length > 0) {
                    this.mapChanges = [];
                    this.importAreas.forEach(item => { // 新增的单元号
                        if (!this.lastAreas.includes(item)) {
                            const change = {id: item, add: true};
                            this.mapChanges.push(change);
                        }
                    });
                    this.lastAreas.forEach(item => { // 删除了单元号
                        if (!this.importAreas.includes(item)) {
                            const change = {id: item, delete: true};
                            this.mapChanges.push(change);
                        }
                    });
                    this.dialog.open(this.update, {
                        id: 'mapUpdate',
                        maxWidth: '800px',
                        minWidth: '500px'
                    }).afterClosed().subscribe(res => {
                        if (res) {
                            this.getTerminalData().then(data => {
                                resolve(data);
                            });
                        }
                    });
                } else {
                    this.getTerminalData().then(data => {
                        resolve(data);
                    });
                }
            } else {
                this.terminalGroup.markAllAsTouched();
                document.getElementById('terminalForm').scrollTop = 0;
            }
        });
    }

    // 保存时获取航站楼数据及相关楼层数据 已有或者新增
    getTerminalData() {
        return new Promise<any>(resolve => {
            const terminalDTO = this.terminalGroup.getRawValue();
            this.getFloors(terminalDTO.terminalNo).then(floors => {
                this.uploadSVGs.forEach(svg => {
                    if (!floors.find(floor => floor.editableName === svg.editableName)) {
                        const floor = {
                            enabled: true,
                            name: svg.floor,
                            editableName: svg.editableName,
                            svg: svg.name,
                            terminalNo: terminalDTO.terminalNo
                        };
                        floors.push(floor);
                    }
                });
                const deleteFloors: Observable<any>[] = [];
                floors = floors.filter(floor => {
                    const svg = this.uploadSVGs.find(item => item.editableName === floor.editableName);
                    if (svg) {
                        floor.order = svg.order;  // 楼层排序
                        floor.svg = svg.name;
                        return floor;
                    } else {
                        if (floor.id) { // 如果此次上传不包含上次的楼层
                            deleteFloors.push(this.terminalService.deleteFloor(floor.id));
                        }
                        return null;
                    }
                });
                // 如果需要删除楼层和对应地图，等删除完再完成后续操作，否则会出现异步未删除问题
                if (deleteFloors.length > 0) {
                    forkJoin(deleteFloors).subscribe(() => {
                        this.onSaving = true;
                        this.loading.show();
                        resolve({floorDTOS: floors, terminalDTO: terminalDTO});
                    });
                } else {
                    this.onSaving = true;
                    this.loading.show();
                    resolve({floorDTOS: floors, terminalDTO: terminalDTO});
                }
            }, reason => {
                this.onSaving = false;
            });
        });
    }

    // 查询街区的楼层
    getFloors(terminalNo) {
        return new Promise<any>((resolve, reject) => {
            const filter = [{name: 'terminalNo', value: terminalNo}];
            this.terminalService.getFloors(0, 0x3f3f3f3f, 'lastModifiedDate,desc', null, filter).subscribe(res => {
                resolve(res.content);
            }, error1 => reject());
        });
    }

    saveSvg() {
        return new Promise((resolve) => {
            if (this.uploadFiles.length > 0) {
                const formData = new FormData();
                this.uploadFiles.forEach(svg => {
                    formData.append('file', svg.file);
                });
                const mallId = this.terminalGroup.get('mallId').value;
                const terminalNo = this.terminalGroup.get('terminalNo').value;
                formData.append('mallId', mallId);
                formData.append('terminalNo', terminalNo);
                this.terminalService.uploadSVGs(formData).subscribe(res => {
                    resolve(res);
                }, error1 => {
                    this.onSaving = false;
                });
            } else {
                resolve();
            }
        });
    }

    saveAreaNos() {
        return new Promise<any>(resolve => {
            if (this.importAreas.length > 0) {
                this.terminalService.importArea(this.importAreas).subscribe(res => {
                    resolve(res);
                }, error1 => {
                    this.onSaving = false;
                });
            } else {
                resolve();
            }
        });
    }

    // 保存摄像头
    saveCameraNos() {
        if (this.importCs.length > 0) {
            this.terminalService.importCameraNos(this.importCs).subscribe(res => {
                setTimeout(() => {
                    this.terminalService.produceCameraNos('2020-04-30', this.terminalNo).subscribe(r => {
                    });
                }, 500);
            }, error1 => {
                this.onSaving = false;
            });
        }
    }

    goBack() {
        if (this.editFlag === 2) {
            this.editFlag = 1;
            this.initOrReset();
            this.terminalGroup.disable({emitEvent: false});
        } else {
            this.router.navigate(['apps/terminalManage']).then();
        }
    }

}

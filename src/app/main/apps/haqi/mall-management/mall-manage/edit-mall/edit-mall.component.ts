import {AfterViewInit, Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialog, MatSnackBar} from '@angular/material';
import {forkJoin, Observable} from 'rxjs';
import {MallManageService} from '../mall-manage.service';
import {GroupManageService} from '../../group-manage/group-manage.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../../../../@fuse/components/progress-bar/progress-bar.service';
import {fuseAnimations} from '../../../../../../../@fuse/animations';
import {Utils} from '../../../../../../services/utils';

declare const BMap: any;

@Component({
    selector: 'app-edit-mall',
    templateUrl: './edit-mall.component.html',
    styleUrls: ['./edit-mall.component.scss'],
    animations: fuseAnimations
})
export class EditMallComponent implements OnInit, AfterViewInit {
    editFlag = 0; // 新建编辑的标记
    id = ''; // 详情ID
    titles = ['新建商场', '商场详情', '编辑商场'];
    onSaving = false; // 处于保存状态

    mallGroup: FormGroup;
    /** 基本信息面板*/
    blocs: any[] = []; // 集团列表
    filterBlocs: Observable<any>;
    currentPoint: any; // 当前经纬度
    selectPoint: any; // 选择的经纬度
    positioningEnd = false; // 定位结束
    autoSearch: Location[] = []; // 自动补全内容
    miniMap: any; // 迷你地图
    overlayMap: any; // 浮动面板地图
    aiValue = '';  // 自动补全显示地址

    /** 业态面板*/
    totalTypes = []; // 融合一二级业态的数据
    allFolded = false;
    allChecked = false;


    constructor(
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private loading: FuseProgressBarService,
        private router: Router,
        private utils: Utils,
        private activateRoute: ActivatedRoute,
        private groupService: GroupManageService,
        private mallService: MallManageService
    ) {
        this.mallGroup = new FormGroup({
            id: new FormControl(''),
            mallId: new FormControl(''),
            blocId: new FormControl(''),
            blocName: new FormControl('', Validators.required),
            mallName: new FormControl('', Validators.required),
            mallShortName: new FormControl(''), // 商场简称
            brevityCode: new FormControl(''), // 商场简码
            mobile: new FormControl(''), // 电话
            transportation: new FormControl(''), // 交通出行
            enabled: new FormControl(true),
            position: new FormControl(''),
            province: new FormControl(''),
            city: new FormControl(''),
            street: new FormControl(''),
            address: new FormControl(''),
            desc: new FormControl('')
        });
        this.id = this.activateRoute.snapshot.paramMap.get('id');
        this.utils.editFlag = 0;
        if (this.id) {
            this.positioningEnd = true;
            this.editFlag = 1;
            this.utils.editFlag = 1;
        }

    }

    ngOnInit() {
        if (this.editFlag === 0) {
            this.initTypes();
            this.initBlocs();
        }
    }

    showEdit() {
        this.editFlag = 2;
        this.utils.editFlag = 2;
        this.enableAll();
        this.mallGroup.get('mallId').disable({emitEvent: false});
    }

    disableAll() {
        this.mallGroup.disable({emitEvent: false});
    }

    enableAll() {
        this.mallGroup.enable({emitEvent: false});
    }


    // 富文本编辑器创建回调
    onEditorCreated(editor) {
        this.utils.onEditorCreated(editor, this.mallGroup.get('desc'));
    }

    // 展开折叠所有业态
    foldAllOrNot() {
        this.allFolded = !this.allFolded;
        this.totalTypes.forEach(type => type.folded = this.allFolded);
    }

    // 全选反选
    selectAllOrNot() {
        this.totalTypes.forEach(type => {
            type.checked = this.allChecked;
            type.children.forEach(second => second.checked = this.allChecked);
        });
    }


    // 全选反选一级业态
    onTypeChange(event, type) {
        const checked = event.checked;
        type.children.forEach(second => {
            second.checked = event.checked;
        });
    }

    // 自动补全选择了集团
    onStChange(event) {
        this.mallGroup.get('blocId').setValue(event.blocId);
        this.filterBlocs = this.utils.getFilterOptions(this.mallGroup.get('blocName'), this.blocs, 'blocName', 'blocId');
    }

    // 初始化时注意详情时得先赋值否则容易出现查不到的错误
    initBlocs(data?) {
        return new Promise(resolve => {
            this.groupService.getBlocList(0, 0x3f3f3f3f, 'lastModifiedDate,desc' , null , true).subscribe(res => {
                if (res.content && res.content.length > 0) {
                    this.blocs = res.content.filter(item => item.enabled);
                    if (data && data.blocId) {
                        const bloc = res.content.find(item => item.blocId === data.blocId);
                        if (bloc) {
                            data.blocName = bloc.blocName;
                            this.mallGroup.patchValue(data, {emitEvent: false});
                        }
                    }
                    this.filterBlocs = this.utils.getFilterOptions(this.mallGroup.get('blocName'), this.blocs, 'blocName', 'blocId');
                }
                resolve(data);
            }, error1 => {
                resolve(data);
            });
        });
    }


    // 初始化业态
    initTypes() {
        return new Promise(resolve => {
            this.getTypes().subscribe(res => {
                const types = res[0];
                const secondTypes = res[1];
                Object.assign(this.totalTypes, types);
                this.totalTypes.forEach(type => {
                    const children = secondTypes.filter(item => item.businessTypeId === type.id);
                    type.children = children;
                });
                resolve(this.totalTypes);
            });
        });
    }

    // 获取业态接口
    getTypes() {
        return new Observable<any>(subscriber => {
            forkJoin([this.mallService.getTypeList(), this.mallService.getSecondTypeList()]).subscribe(res => {
                subscriber.next(res);
            });
        });
    }

    // 获取选中业态
    getAllTypes() {
        const selectSecondTypes = [];
        const selectTypes = [];
        const idSet = new Set();
        this.totalTypes.forEach(type => {
            type.children.forEach(second => {
                if (second.checked) {
                    selectSecondTypes.push({id: second.id});
                    idSet.add(second.businessTypeId);
                }
            });
        });
        idSet.forEach(item => {
            const type = this.totalTypes.find(i => i.id === item);
            const newType: any = {};
            Object.assign(newType, type);
            delete newType.children;
            selectTypes.push({id: newType.id});
        });
        return {selectTypes: selectTypes, selectSecond: selectSecondTypes};
    }

    // 保存按钮点击
    onSaveClick() {
        if (this.editFlag === 0) {
            this.saveData().then(data => {
                this.mallService.createMall(data).subscribe(res => {
                    this.loading.hide();
                    this.onSaving = false;
                    this.goBack();
                    this.snackBar.open('新建商场成功！', '✓');
                }, error1 => {
                    this.onSaving = false;
                });
            });

        } else {
            this.saveData().then(data => {
                this.mallService.updateMall(data).subscribe(res => {
                    this.loading.hide();
                    this.onSaving = false;
                    this.goBack();
                    this.snackBar.open('更新商场成功！', '✓');
                }, error1 => {
                    this.onSaving = false;
                });
            });

        }
    }

    // 获取表单的验证内容
    saveData() {
        return new Promise(resolve => {
            if (this.mallGroup.valid) {
                this.loading.show();
                this.onSaving = true;
                // 直辖市省市相同
                if (this.mallGroup.get('province').value !== this.mallGroup.get('city').value) {
                    this.mallGroup.get('address').setValue(this.mallGroup.get('province').value +
                        this.mallGroup.get('city').value + this.mallGroup.get('street').value);
                } else {
                    this.mallGroup.get('address').setValue(this.mallGroup.get('city').value + this.mallGroup.get('street').value);
                }
                const data = this.mallGroup.getRawValue();
                const types = this.getAllTypes();
                data.businessTypes = types.selectTypes;
                data.secondTypes = types.selectSecond;
                resolve(data);
            } else {
                document.getElementById('infoForm').scrollTop = 0;
                this.mallGroup.markAllAsTouched();
            }
        });
    }

    goBack() {
        if (this.editFlag === 2) {
            this.editFlag = 1;
            this.utils.editFlag = 1;
            this.disableAll();
            this.initOrReset();
        } else {
            this.router.navigate(['apps/mallManage']);
        }
    }

    initOrReset() {
        this.loading.show();
        this.mallService.getMallById(this.id).subscribe(res => {
            this.initBlocs(res).then(data => {
                this.mallGroup.patchValue(data, {emitEvent: false});
                this.disableAll();
            });
            const positions = res.position.split(',');
            this.getNewMapAndLocation(positions[0], positions[1]).then(r => {
                this.miniMap.addOverlay(new BMap.Marker(r));
                this.currentPoint = r;
            });
            const types = res.businessTypes;
            const second = res.secondTypes;
            this.initTypes().then(rs => {
                let notAll = false; // 是否有未选中的
                this.totalTypes.forEach(type => {
                    if (types.find(item => item.id === type.id)) {
                        type.checked = true;
                    } else {
                        notAll = true;
                    }
                    type.children.forEach(item => {
                        if (second.find(i => i.id === item.id)) {
                            item.checked = true;
                        }
                    });
                });
                this.allChecked = !notAll;
            });
            this.loading.hide();
        });
    }

    ngAfterViewInit(): void {
        if (this.editFlag === 1) {
            this.initOrReset();
        } else {
            this.getUserPermission().then(permission => {
                this.getNewMapAndLocation(116.413387, 39.910924, permission).then(r => {
                    if (permission) {
                        const address = r.address;
                        this.mallGroup.patchValue(address);
                        this.currentPoint = r.point;
                        if (this.currentPoint.lng && this.currentPoint.lat) {
                            this.mallGroup.get('position').patchValue(this.currentPoint.lng + ',' + this.currentPoint.lat);
                        }
                    } else {
                        this.currentPoint = r;
                    }
                    this.positioningEnd = true;
                }, reason => {
                    this.positioningEnd = true;
                    this.snackBar.open(reason, '✖');
                });
            });
        }
    }

    // 获取定位用户授权状态
    getUserPermission() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                    // 谷歌浏览器会默认调用谷歌api 通常情况会无法访问  这里给定一个200ms的timeout 去到错误处理
                    resolve(true);
                }, error => {
                    console.log(error);
                    if (error.code === 1) {
                        this.positioningEnd = true;
                        this.snackBar.open('用户已拒绝授权访问地理位置，自动获取位置功能将不用，如需重新授权请修改浏览器定位设置！', '✖');
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                }, {timeout: 200});
            } else {
                resolve(false);
                this.snackBar.open('浏览器不支持定位功能！', '✖');
            }
        });
    }

    // 获取新地图和定位
    getNewMapAndLocation(longitude?, latitude?, permission?) {
        return new Promise<any>((resolve, reject) => {
            const bMap = new BMap.Map('allMap', {enableMapClick: false});
            this.miniMap = bMap;
            const point = new BMap.Point(longitude, latitude);
            bMap.setDefaultCursor('pointer');
            bMap.centerAndZoom(point, 14);
            bMap.disableDragging();
            // 新建且用户授权的情况下 自动定位
            if (this.editFlag === 0 && permission) {
                const geolocation = new BMap.Geolocation();
                geolocation.getCurrentPosition(function (r) {
                    if (this.getStatus() === 0) {
                        const mk = new BMap.Marker(r.point);
                        bMap.addOverlay(mk);
                        bMap.panTo(r.point);
                        resolve(r);
                    } else {
                        reject('获取定位信息出错!');
                    }
                }, {enableHighAccuracy: true});
            } else {
                resolve(point);
            }
        });
    }

    // 根据地点坐标获取位置信息
    getAddress(point) {
        return new Observable<any>((subscriber) => {
            const gc = new BMap.Geocoder();
            gc.getLocation(point, rs => {
                subscriber.next(rs);
            });
        });
    }

    // 浮动面板的地图
    showMapSelect(overlayMap) {
        if ((this.editFlag === 2 || this.editFlag === 0) && this.currentPoint) {
            const dialog = this.dialog.open(overlayMap, {id: 'overlayMap', width: '90%', height: '95%'});
            dialog.afterOpened().subscribe(() => {
                // 创建浮动面板地图并添加点击事件
                const bMap = new BMap.Map('olMap', {enableMapClick: false});
                this.overlayMap = bMap;
                bMap.enableScrollWheelZoom(true);
                bMap.centerAndZoom(this.currentPoint, 16);
                bMap.setDefaultCursor('pointer');
                const mk = new BMap.Marker(this.currentPoint);
                bMap.addOverlay(mk);
                bMap.panTo(this.currentPoint);
                this.showInfoByMap(bMap, this.currentPoint);
                bMap.addEventListener('click', event => {
                    bMap.clearOverlays();
                    const point = event.point;
                    this.selectPoint = point;
                    const marker = new BMap.Marker(point);
                    bMap.addOverlay(marker);
                    bMap.panTo(point);
                    this.showInfoByMap(bMap, point);
                });
                // 搜索框自动补全内容
                const ac = new BMap.Autocomplete({
                    input: 'autoInput', location: bMap, onSearchComplete: event => {
                        this.autoSearch = Object.values(event)[2] as any[];
                    }
                });
            });
            dialog.afterClosed().subscribe(res => {
                if (res && this.selectPoint) {
                    this.currentPoint = this.selectPoint;
                    this.miniMap.clearOverlays();
                    this.miniMap.centerAndZoom(this.currentPoint, 16);
                    this.miniMap.addOverlay(new BMap.Marker(this.currentPoint));
                    this.miniMap.panTo(this.currentPoint);
                    this.getAddress(this.currentPoint).subscribe(rs => {
                        this.mallGroup.patchValue(rs.addressComponents);
                        this.mallGroup.get('position').patchValue(this.currentPoint.lng + ',' + this.currentPoint.lat);
                    });
                } else {
                    this.selectPoint = null;
                }
                this.autoSearch = [];
            });
        }
    }

    // 回车搜索地址
    onSearch(event) {
        if (event.target.value !== this.aiValue) {
            const item = this.autoSearch[0]; // 确认选择第一位补全内容进行搜索
            const searchValue = item.province + item.city + item.district + item.street + item.business;
            this.searchLocation(searchValue);
            this.aiValue = event.target.value;
        }
    }

    // 自动补全地址选择并搜索地址
    onSelectionChange(event) {
        this.aiValue = event.business;
        const searchValue = event.province + event.city + event.district + event.street + event.business;
        this.searchLocation(searchValue);
    }

    // 搜索地址并打点
    searchLocation(searchValue: string) {
        // 智能搜索
        const local = new BMap.LocalSearch(this.overlayMap, {
            onSearchComplete: () => {
                const point = local.getResults().getPoi(0).point;    // 获取第一个智能搜索的结果
                if (point) {
                    this.overlayMap.clearOverlays();
                    this.overlayMap.centerAndZoom(point, 16);
                    this.overlayMap.addOverlay(new BMap.Marker(point));
                    this.overlayMap.panTo(point);
                    this.selectPoint = point;
                    this.showInfoByMap(this.overlayMap, point);
                } else {
                    this.snackBar.open('未能找到该地址，请手动点击地图进行定位！', '✖');
                }
            }
        });
        local.search(searchValue);
    }

    // 显示位置信息
    showInfoByMap(bMap, point) {
        this.getAddress(point).subscribe(res => {
            const context = '<table class="font-weight-600 theme-color"><tr><td>经纬：</td><td>' + res.point.lng + ',' + res.point.lat + '</td></tr><tr><td>地址：</td><td>' + res.address + '</td></tr></table>';
            const infoWindow = new BMap.InfoWindow(context);
            bMap.openInfoWindow(infoWindow, point);
        });
    }
}

export interface Location {
    province: string;
    city: string;
    district: string;
    street: string;
    business: string;

}

import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {MemberLevelService} from '../../../services/memberLevelService/member-level.service';
import {FuseProgressBarService} from '../../../../@fuse/components/progress-bar/progress-bar.service';


@Component({
    selector: 'app-members-basic-setting',
    templateUrl: './members-basic-setting.component.html',
    styleUrls: ['./members-basic-setting.component.scss']
})
export class MembersBasicSettingComponent implements OnInit, OnDestroy {
    initialData: any; // 从接口获取的-初始会员基础设置数据
    firstCardName = null; // 第一张会员卡名称
    firstCardOperation = 'create';
    cardValue = []; // 除第一张会员卡以后信息
    deleteInitialData = []; // 删除的原始数据

    constructor(private snackBar: MatSnackBar, private memberLevelService: MemberLevelService,
                private loading: FuseProgressBarService,
                ){}

    ngOnInit(): void {
        this.searchMemberLevelList();
    }

    // 获取会员基础设置信息
    searchMemberLevelList(){
        this.loading.show();
        this.memberLevelService.searchMemberLevelList('?sort=levelMin').subscribe(res => {
            if (res['body']) {
                this.initialData = res['body'];
                for (let i = 0; i < res['body']['length']; i++) {
                    if (res['body'][i]['levelMin'] === 0) {
                        this.firstCardName = res['body'][i]['levelName'];
                        this.firstCardOperation = 'edit';
                    } else {
                        this.cardValue.push({name: res['body'][i]['levelName'], value: res['body'][i]['levelMin'], id: res['body'][i]['id']});
                    }
                }
                console.log('this.firstCardName:', this.firstCardName);
                console.log('this.cardValue:', this.cardValue);
            } else {
                this.snackBar.open('查询数据为空', '✖');
            }
        }, () => {
            this.loading.hide();
        }, () => {
            this.loading.hide();
        });
    }

    // 添加会员卡
    addCard(param){
        if ('firstCard' === param) {
            /*第一个添加按钮 只有添加按钮没有减少按钮*/
            if (this.firstCardOperation === 'create') {
                const firstCardModel = {levelName: this.firstCardName, levelMin: 0};
                this.loading.show();
                this.memberLevelService.createMemberLevel(firstCardModel).subscribe(() => {
                    this.firstCardOperation = 'edit';
                    this.cardValue.push({name: null, value: null});
                }, () => {
                    this.loading.hide();
                }, () => {
                    this.loading.hide();
                });
            } else {
                const firstCardModel = {levelName: this.firstCardName, levelMin: 0, id: this.initialData[0]['id']};
                this.loading.show();
                this.memberLevelService.updateMemberLevelData(firstCardModel).subscribe(() => {
                    this.cardValue.push({name: null, value: null});
                }, () => {
                    this.loading.hide();
                }, () => {
                    this.loading.hide();
                });
            }
        } else if ('cardValue' === param) {
            if (this.cardValue.length > 1) {
                if (this.cardValue[this.cardValue.length - 1]['value'] <= this.cardValue[this.cardValue.length - 2]['value']) {
                    this.snackBar.open('请输入正确的成长值区间', '✖');
                    return;
                }
            }
            /*第二个及以后的添加按钮 添加按钮+减少按钮*/
            const levelName = this.cardValue[this.cardValue.length - 1]['name'];
            if (!levelName) {
                this.snackBar.open('请输入会员卡名称', '✖');
                return;
            }
            const levelMin = this.cardValue[this.cardValue.length - 1]['value'];
            if (!levelMin) {
                this.snackBar.open('请输入成长值区间', '✖');
                return;
            }
            const id = this.cardValue[this.cardValue.length - 1]['id'];
            if (id) {
                const updateModel = {id: id, levelName: levelName, levelMin: levelMin};
                this.memberLevelService.updateMemberLevelData(updateModel).subscribe((res) => {
                    this.cardValue.push({name: null, value: null});
                });
            } else {
                const createModel = { levelName: levelName, levelMin: levelMin};
                this.memberLevelService.createMemberLevel(createModel).subscribe((res) => {
                    const resultId = res['body']['id'];
                    this.cardValue[this.cardValue.length - 1]['id'] = resultId;
                    this.cardValue.push({name: null, value: null});
                });
            }
        }
    }

    // 删去会员卡
    deleteCard(index) {
        const id = this.cardValue[index]['id'];
        if (id) {
            this.memberLevelService.deleteMemberLevelData(id).subscribe(() => {
                this.cardValue.splice(this.cardValue.length - 1, 1);
            });
        } else {
            this.cardValue.splice(this.cardValue.length - 1, 1);
        }
    }

    // 控制页码数字输入
    cardValueInput(event) {
        const reg = /(^[0-9]\d*$)/;
        if (reg.test(event.target.value)) {
            const inputNumber = Number(event.target.value);
            if (inputNumber === 0) {
                event.target.value = 1;
            }
        } else { // 不是数字 \D匹配不是数字
            event.target.value = event.target.value.replace(/\D/g, '');
        }
    }

    // 保存数据
    onSave(){
        if (!this.firstCardName) {
            this.snackBar.open('请输入会员卡名称', '✖');
            return;
        }
        for (let i = 0; i < this.cardValue.length - 1; i++) {
            if (Number(this.cardValue[i]['value']) >= this.cardValue[i + 1]['value']) {
                this.snackBar.open('请输入正确的成长值区间', '✖');
                return;
            }
            if (!this.cardValue[i]['name']) {
                this.snackBar.open('请输入会员卡名称', '✖');
                return;
            }
        }
        if (this.cardValue.length > 0) {
            const id = this.cardValue[this.cardValue.length - 1]['id'];
            const levelName = this.cardValue[this.cardValue.length - 1]['name'];
            const levelMin = this.cardValue[this.cardValue.length - 1]['value'];
            if (id) {
                const updateModel = {id: id, levelName: levelName, levelMin: levelMin};
                this.memberLevelService.updateMemberLevelData(updateModel).subscribe((res) => {
                    this.firstCardName = null;
                    this.cardValue = [];
                    this.searchMemberLevelList();
                    this.snackBar.open('保存成功', '✖');
                });
            } else {
                const createModel = { levelName: levelName, levelMin: levelMin};
                this.memberLevelService.createMemberLevel(createModel).subscribe((res) => {
                    this.firstCardName = null;
                    this.cardValue = [];
                    this.searchMemberLevelList();
                    this.snackBar.open('保存成功', '✖');
                });
            }
        } else {
            if (this.firstCardOperation === 'create') {
                const firstCardModel = {levelName: this.firstCardName, levelMin: 0};
                this.loading.show();
                this.memberLevelService.createMemberLevel(firstCardModel).subscribe(() => {
                    this.firstCardName = null;
                    this.cardValue = [];
                    this.searchMemberLevelList();
                    this.snackBar.open('保存成功', '✖');
                }, () => {
                    this.loading.hide();
                }, () => {
                    this.loading.hide();
                });
            } else {
                const firstCardModel = {levelName: this.firstCardName, levelMin: 0, id: this.initialData[0]['id']};
                this.loading.show();
                this.memberLevelService.updateMemberLevelData(firstCardModel).subscribe(() => {
                     this.firstCardName = null;
                    this.cardValue = [];
                    this.searchMemberLevelList();
                    this.snackBar.open('保存成功', '✖');
                }, () => {
                    this.loading.hide();
                }, () => {
                    this.loading.hide();
                });
            }
        }
    }

    // 取消操作
    // onCancel() {
    //     this.firstCardName = null;
    //     this.cardValue = [];
    //     this.deleteInitialData = [];
    //     this.loading.show();
    //     for (let i = 0; i < this.initialData.length; i++) {
    //         if (this.initialData[i]['levelMin'] === 0) {
    //             this.firstCardName = this.initialData[i]['levelName'];
    //             this.firstCardOperation = 'edit';
    //         } else {
    //             this.cardValue.push({name: this.initialData[i]['levelName'], value: this.initialData[i]['levelMin'], id: this.initialData[i]['id']});
    //         }
    //     }
    //     this.loading.hide();
    //     this.snackBar.open('操作已取消', '✖');
    // }

    ngOnDestroy(): void {
    }
}

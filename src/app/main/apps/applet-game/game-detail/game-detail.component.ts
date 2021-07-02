import {Component, OnInit} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Utils} from '../../../../services/utils';
import {fuseAnimations} from '../../../../../@fuse/animations';
import {BaseOptions} from 'flatpickr/dist/types/options';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {GameDetailService} from './game-detail.service';

@Component({
    selector: 'app-game-detail',
    templateUrl: './game-detail.component.html',
    styleUrls: ['./game-detail.component.scss'],
    animations: fuseAnimations
})
export class GameDetailComponent implements OnInit {
    editFlag = 0;
    detailId: any;
    titles = ['新建游戏', '游戏详情', '编辑游戏'];
    onSaving = false;
    gameForm: FormGroup;

    startConfig: Partial<BaseOptions>;
    endConfig: Partial<BaseOptions>;

    selectedRow: any; // 选择数据
    currentRow: any; // 当前数据


    constructor(
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private loading: FuseProgressBarService,
        private router: Router,
        private utils: Utils,
        private service: GameDetailService,
        private activatedRoute: ActivatedRoute,
    ) {
        this.detailId = this.activatedRoute.snapshot.paramMap.get('id');
        if (this.detailId) {
            this.editFlag = 1;
        }
        this.gameForm = new FormGroup({
            id: new FormControl(''),
            gameId: new FormControl('', Validators.required),
            gameName: new FormControl('', Validators.required),
            startTime: new FormControl('', Validators.required),
            enabled: new FormControl(''),
            mallId: new FormControl('', Validators.required),
            endTime: new FormControl('', Validators.required),
            showStartTime: new FormControl('', Validators.required),
            showEndTime: new FormControl('', Validators.required),
            gameUrl: new FormControl('', Validators.required),
            gameImg: new FormControl('', Validators.required),
            desc: new FormControl('', Validators.required)
        });

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
    }

    ngOnInit() {
        if (this.detailId) {
            this.getDetailById(this.detailId).then(res => {
                this.gameForm.patchValue(res);
                this.gameForm.disable({emitEvent: false});
                this.editFlag = 1;
                if (res.mallId) {
                    this.getMallByMallId(res.mallId);
                }
            });
        }
    }

    // 根据mallId获取当前整条数据
    getMallByMallId(mallId) {
        this.service.getMallByMallId(mallId).subscribe(res => {
            this.currentRow = res;
        });
    }

    // 打开商场选择
    openMallSelect(template) {
        this.selectedRow = this.currentRow;
        this.dialog.open(template, {id: 'mallSelect', width: '80%'}).afterClosed().subscribe(res => {
            if (res) {
                this.currentRow = this.selectedRow;
                if (this.currentRow) {
                    this.gameForm.get('mallId').setValue(this.currentRow.mallId);
                } else {
                    this.gameForm.get('mallId').setValue('');
                }
            } else {
                this.selectedRow = null;
            }
        });
    }

    onDataSelect(event) {
        this.selectedRow = event;
    }


    // 根据id获取数据
    getDetailById(id) {
        return new Promise<any>(resolve => {
            this.service.getGameById(id).subscribe(res => {
                resolve(res);
            });
        });
    }

    // 上传游戏封面
    onUploadProgress(event) {
        if (event.data) {
            this.gameForm.get('gameImg').setValue(event.data);
        }
    }


    /** 策略表单*/
    // 开始时间选择后设定结束时间最小时间
    onStartSourceDate(event, endTime) {
        endTime.picker.set('minDate', event);
    }

    // 反之
    onEndSourceDate(event, startTime) {
        startTime.picker.set('maxDate', event);
    }


    // 打开编辑模式
    showEdit() {
        this.editFlag = 2;
        this.gameForm.enable({emitEvent: false});
    }

    // 保存操作
    onSaveClick() {
        if (this.gameForm.valid) {
            const data = this.gameForm.getRawValue();
            if (data.gameUrl.lastIndexOf(data.gameId) === -1) {
                this.snackBar.open('游戏地址中应当包含游戏ID，请输入正确的参数后保存！', '×');
                return;
            }
            const keys = Object.keys(data);
            keys.forEach(key => {
                if (key.includes('Time')) {
                    data[key] = new Date(data[key]).toISOString();
                }
            });
            this.loading.show();
            if (this.editFlag === 0) {
                this.service.postGame(data).subscribe(() => {
                    this.loading.hide();
                    this.snackBar.open('新建游戏成功！');
                    this.goBack();
                });
            } else {
                this.service.putGame(data).subscribe(() => {
                    this.loading.hide();
                    this.snackBar.open('更新游戏成功！');
                    this.goBack();
                });
            }

        } else {
            this.gameForm.markAllAsTouched();
        }

    }

    goBack() {
        if (this.editFlag === 2) {
            this.editFlag = 1;
            this.gameForm.disable({emitEvent: false});
        } else {
            this.router.navigate(['apps/appletGame']);
        }
    }
}

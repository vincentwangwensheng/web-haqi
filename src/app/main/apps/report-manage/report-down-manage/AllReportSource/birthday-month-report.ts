import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {NewDateTransformPipe} from '../../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {MatSnackBar} from '@angular/material';
import {NotifyAsynService} from '../../../../../services/notify-asyn.service';
import {FuseProgressBarService} from '../../../../../../@fuse/components/progress-bar/progress-bar.service';
import {ReportIn} from './base/interImpl/reportIn';
import {ReportChartIn} from './base/baseClass/report-chart-In';
import {FormControl, FormGroup} from '@angular/forms';
import {DetailTableDataBase} from '../../../../../components/detail-table-list/detail-table-dataBase';

/**
 *   生日月报表
 * **/
export class BirthdayMonthReport implements ReportChartIn{


    blocList = [];
    mallList = [];
    mouthList = [];
    constructor(
        private snackBar: MatSnackBar,
        private translate: TranslateService,
        private router: Router,
        private loading: FuseProgressBarService,
        private notify: NotifyAsynService ,
        private dateTransform: NewDateTransformPipe ,
        private service: ReportIn,
    ){
    }

    getFormGroup() {
        return new FormGroup({
            blocName: new FormControl(''), // 集团名称
            mallName: new FormControl(''), // 商场名称
            mouth: new FormControl(''), // 月份
        });
    }

    getFormKeys() {
        this.getBlocList();
        this.getMallList();
        this.getMouthList();
        const formKeys = [
            // {formControlName: 'blocName' , CNText: '集团' , placeholder: '选择集团' , type: 'checkBoxSelect' , selectOptions: this.blocList , dataInType: 'equal'},
            {formControlName: 'mallName' , CNText: '商场' , placeholder: '选择商场' , type: 'checkBoxSelect' ,
                selectOptions: this.mallList , dataInType: 'in' , needSearchType: true , paramFiled: 'sourceMall'},
            // {formControlName: 'mouth' , CNText: '月份' , placeholder: '选择月份' , type: 'checkBoxSelect' ,
            //     selectOptions: this.mouthList, dataInType: 'in', needSearchType: true, paramFiled: 'sourceMall'},
        ];
        return formKeys;
    }

    getBlocList(){
        this.blocList = [];
        this.service.getBlocList().subscribe(res => {
            // console.log('res---' , res);
            res.content.forEach( v => {
                this.blocList.push({CNValue: v.blocName , value: v.blocId});
            });
            // this.blocList = res.content;
        });
    }

    getMallList(){
        this.mallList = [];
        this.service.getMallList().subscribe( res => {
            // console.log('res---' , res);
            // this.mallList = res.content;
            res.content.forEach( v => {
                this.mallList.push({CNValue: v.mallName , value: v.mallId});
            });
        });
    }

    getMouthList(){
        this.mouthList = [];
        this.mouthList = this.service.getMouthList();
    }

    getOtherData(param) {

    }

    getRightDataList() {
        return new BirthdayMonthList(this.router , this.service );
    }
}

export class BirthdayMonthList extends DetailTableDataBase {
    // sourceMall.in
    type = 'notEs_memberBirthday';
    exportUrlType = 'oneExport';
    exportReportName = '生日月报表';
    hasEnableFilter = false;
    page = {page: 0, size: 10, count: 0, sort: 'id,desc'};
    dateTimeConfig = 'time';
    dataColumns = [ {name: 'id', type: 'string'},  {name: 'name', type: 'string'}
                    ,  {name: 'birthday', type: 'string'},  {name: 'mobile', type: 'string'} ];
    //  {name: 'number', type: 'string'},    ['number', '会员编号'], 没有会员编号
    dataHeaders = new Map([
        ['id', '数据ID'],
        ['name', '昵称'],
        ['birthday', '出生日月'],
        ['mobile', '手机号'],
    ]);
    otherDataHandle(){
        // this.dataRecords = [
        //     {id: '序号' , name: '昵称', birthday: '出生日月', mobile: '手机号'}
        // ];
        // this.page.count =  this.dataRecords.length;
    }
}


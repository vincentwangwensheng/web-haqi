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
 * 积分异常报表
 * **/
export class IntegralAnomalyReport implements ReportChartIn{

    blocList = [];
    mallList = [];
    IntegralType = [];
    formGroup: any;
    configBegin = {
        enableTime: false,
        time_24hr: true,
        enableSeconds: true,
    };

    configEnd = {
        enableTime: false,
        time_24hr: true,
        enableSeconds: true,
    };
    constructor(
        private snackBar: MatSnackBar,
        private translate: TranslateService,
        private router: Router,
        private loading: FuseProgressBarService,
        private notify: NotifyAsynService ,
        private dateTransform: NewDateTransformPipe ,
        private service: ReportIn,
    ){
        this.IntegralType = [
            {CNValue: '单店多笔积分' , value: 'true'},
            {CNValue: '多店多笔积分' , value: 'false'},
        ];
    }

    getFormGroup() {
        this.formGroup =  new FormGroup({
            blocName: new FormControl(null), // 集团名称
            mallName: new FormControl(null), // 商场名称  '0002'
            startTime1: new FormControl(null), // 开始时间
            endTime1: new FormControl(null), // 结束时间
            isOne: new FormControl(null), // 积分  'true'
            num: new FormControl(null), // 笔数 '3'
        });
        return this.formGroup;
    }


    getFormKeys() {
        this.getBlocList();
        this.getMallList();
        const formKeys = [
            // {formControlName: 'blocName' , CNText: '集团' , placeholder: '选择集团' , type: 'checkBoxSelect' , selectOptions: this.blocList , dataInType: 'equal'},
            {formControlName: 'mallName' , CNText: '商场' , placeholder: '选择商场' , type: 'select' , needAllHasValue: true ,
                selectOptions: this.mallList , dataInType: 'input' , needSearchType: true , paramFiled: 'mallId'},
            {type: 'datePicker'  , hasEventListener: 'dateSelect' ,  CNText: '时间' , twoDate: true , twoFiled: true ,  needAllHasValue: true ,
                configBegin: this.configBegin , configEnd: this.configEnd , dataInType: 'input' ,
                formControlNames: [
                    {name: 'startTime1' ,  placeholder: '请选择开始时间' },
                    {name: 'endTime1' ,  placeholder: '请选择结束时间' },
                ]
            },
            {formControlName: 'isOne' , CNText: '积分' , placeholder: '积分类型' , type: 'select' ,  needAllHasValue: true ,
                selectOptions: this.IntegralType , dataInType: 'input' , needSearchType: true  },
            {formControlName: 'num' , CNText: '笔数' , placeholder: '笔数' , type: 'input' ,  needSearchType: true ,  needAllHasValue: true , dataInType: 'input'  },
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

    getOtherData(param) {

    }

    getRightDataList() {
        return new IntegralAnomalyList(this.router , this.service );
    }

}

export class IntegralAnomalyList extends DetailTableDataBase {
    type = 'notEs_memberException';
    exportUrlType = 'threeExport';
    exportReportName = '积分异常报表';
    hasEnableFilter = false;
    page = {page: 0, size: 10, count: 0, sort: 'id,desc'};
    dateTimeConfig = 'date';
    onceSearch = false;
    // filter = [{name: 'mallId', value: '0002', type: 'input'} , {name: 'num', value: '3', type: 'input'},
    //           {name: 'isOne', value: 'true', type: 'input'} ,  {name: 'startTime', value: '2021-01-01', type: 'input'} ,
    //           {name: 'endTime', value: '2021-01-05', type: 'input'}];
    dataColumns = [  {name: 'mobile', type: 'string'} , {name: 'name', type: 'string'}
                  , {name: 'level', type: 'string'}  , {name: 'storeName', type: 'string'}  , {name: 'time', type: 'string'}  , {name: 'amount', type: 'string'}
                  , {name: 'point', type: 'string'}];

    dataHeaders = new Map([
        // ['id', '序号'],
        // ['memberNo', '会员编号'],
        ['mobile', '手机号'],
        ['name', '昵称'],
        ['level' , '卡等级'],
        ['storeName' , '店铺名称'],
        ['time' , '交易时间'],
        ['amount' , '金额'],
        ['point' , '积分']
    ]);

    otherDataHandle(){
        // this.dataRecords = [
        //     {id: '序号' , memberNo: '会员编号', mobile: '手机号', name: '昵称', cardLevel: '卡等级', storeName: '店铺名称'
        //         , completionTime: '交易时间', amount: '金额', point: '积分'}
        // ];
        // this.page.count =  this.dataRecords.length;
    }

    getTheDate(){

    }



}


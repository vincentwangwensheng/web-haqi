import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {NewDateTransformPipe} from '../../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {MatSnackBar} from '@angular/material';
import {NotifyAsynService} from '../../../../../services/notify-asyn.service';
import {FuseProgressBarService} from '../../../../../../@fuse/components/progress-bar/progress-bar.service';
import {ReportIn} from './base/interImpl/reportIn';
import {ReportChartIn} from './base/baseClass/report-chart-In';
import {DetailTableDataBase} from '../../../../../components/detail-table-list/detail-table-dataBase';
import {FormControl, FormGroup} from '@angular/forms';

/***
 * 积分补录报表
 * */
export class PointsSupplementReport implements ReportChartIn{


    blocList = [];
    mallList = [];

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
            time1: new FormControl(''),
            time2: new FormControl(''),
            mobile: new FormControl(''), // 手机号
            orderNo: new FormControl(''), // 单号
        });
    }


    getFormKeys() {
        this.getBlocList();
        this.getMallList();
        const formKeys = [
            // {formControlName: 'blocName' , CNText: '集团' , placeholder: '选择集团' , type: 'checkBoxSelect' , selectOptions: this.blocList , dataInType: 'equal'},
            {formControlName: 'mallName' , CNText: '商场' , placeholder: '选择商场' , type: 'checkBoxSelect' , selectOptions: this.mallList , dataInType: 'equal'},
            // {formControlName: 'mobile' , CNText: '手机号' , placeholder: '请填写手机号' , type: 'input'  },
            // {formControlName: 'orderNo' , CNText: '单号' , placeholder: '请填写单号' , type: 'input'  },
            // {type: 'datePicker'  , hasEventListener: 'dateSelect' ,  CNText: '时间' , twoDate: true ,
            //     formControlNames: [
            //         {name: 'time1' ,  placeholder: '请选择开始时间' },
            //         {name: 'time2'   ,  placeholder: '请选择结束时间' },
            //     ]
            // },
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
        return new PointsSupplementList(this.router , this.service );
    }
}

export class PointsSupplementList extends DetailTableDataBase {
    type = 'notEs_memberReplenish';
    exportUrlType = 'threeExport';
    exportReportName = '积分补录报表';
    hasEnableFilter = false;
    dateTimeConfig = 'time';
    page = {page: 0, size: 10, count: 0, sort: 'id,desc'};
    dataColumns = [  {name: 'orderTime', type: 'string'}, {name: 'mobile', type: 'string'} , {name: 'name', type: 'string'}
        , {name: 'storeId', type: 'string'} , {name: 'storeName', type: 'string'} , {name: 'serialNumber', type: 'string'} , {name: 'amount', type: 'string'}
        , {name: 'changePoint', type: 'string'}];
    //  ['supplementTime', '补录时间'], {name: 'id', type: 'string'}, ['id', '序号'],
    dataHeaders = new Map([
        ['orderTime', '销售时间'],
        ['mobile', '手机号'],
        ['name', '昵称'],
        ['storeId' , '店铺编号'],
        ['storeName' , '店铺名称'],
        ['serialNumber' , '订单编号'],
        ['amount' , '金额'],
        ['changePoint' , '积分']
    ]);

    otherDataHandle(){
        // this.dataRecords = [
        //     {id: '序号' , supplementTime: '补录时间', mobile: '手机号', name: '昵称', storeNo: '店铺编号', storeName: '店铺名称'
        //         , orderNo: '订单编号', amount: '金额', point: '积分'}
        // ];
        // this.page.count =  this.dataRecords.length;
    }
}


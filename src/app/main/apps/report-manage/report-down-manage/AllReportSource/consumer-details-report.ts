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
 *   消费明细报表
 * **/
export class ConsumerDetailsReport implements ReportChartIn{

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
            {formControlName: 'mallName' , CNText: '商场' , placeholder: '选择商场' , type: 'checkBoxSelect' , selectOptions: this.mallList , dataInType: 'equal'},
            // {formControlName: 'mouth' , CNText: '月份' , placeholder: '选择月份' , type: 'checkBoxSelect' , selectOptions: this.mouthList, dataInType: 'equal'},
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
        return new ConsumerDetailsList(this.router , this.service );
    }
}

export class ConsumerDetailsList extends DetailTableDataBase {
    type = 'notEs_memberConsume';
    exportUrlType = 'twoExport';
    exportReportName = '消费明细报表';
    hasEnableFilter = false;
    page = {page: 0, size: 10, count: 0, sort: 'id,desc'};
    dateTimeConfig = 'time';
    dataColumns = [ {name: 'id', type: 'string'},  {name: 'name', type: 'string'}
       ,  {name: 'mobile', type: 'string'} ,  {name: 'consumeCount', type: 'string'},  {name: 'consumeAmount', type: 'string'}
       ,  {name: 'consumePoint', type: 'string'},  {name: 'point', type: 'string'} ];
     // 没有会员编号  sourceMall.in
    dataHeaders = new Map([
        ['id', '序号'],
        ['name', '昵称'],
        ['mobile', '手机号'],
        ['consumeCount', '消费笔数'],
        ['consumeAmount', '消费金额'],
        ['consumePoint', '消费积分'],
        ['point', '当前积分'],
    ]);
    otherDataHandle(){
        // this.dataRecords = [
        //     {id: '序号' , number: '会员编号', name: '昵称', mobile: '手机号', consumeCount: '消费笔数', consumeNum: '消费金额'
        //         ,  consumePoint: '消费积分', currentPoint: '当前积分'}
        // ];
        // this.page.count =  this.dataRecords.length;
    }
}



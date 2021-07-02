import {Component, OnInit} from '@angular/core';
import {PageEvent, Sort} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {
    MarketingHeaderEntity,
    MarketingManagementServiceService,
    MarketListEntity
} from '../../../services/marketingManagementService/marketing-management-service.service';

@Component({
  selector: 'app-marketing-list',
  templateUrl: './marketing-list.component.html',
  styleUrls: ['./marketing-list.component.scss']
})
export class MarketingListComponent implements OnInit {
    sidebarShow;
    displayedColumns: string[] = ['id', 'title', 'type', 'IssuingVoucher', 'startTime', 'endTime', 'EnginePush',
        'state', 'upPerson', 'upTime', 'operation'];
    tableColumns: string[] = ['id', 'title', 'type', 'IssuingVoucher', 'startTime', 'endTime', 'EnginePush',
        'state', 'upPerson', 'upTime', 'operation'];
    pageSize: 5;
    pageSizeOptions: number[] = [5, 10, 25, 100];
    dataSource: MarketListEntity[];
    hearSource: MarketingHeaderEntity[];
    page: PageEvent;
    shortcutKeys = {all: [], map: [], share: []}; // 快捷鍵
    constructor(private marketingManagementServiceService: MarketingManagementServiceService, private translate: TranslateService) {
    }

    ngOnInit() {
        this.dataSource = [
            {
                id: '2019050231',
                title: '五动全城 一降到底',
                type: '活动',
                IssuingVoucher: '是',
                startTime: '2019/05/01 00:00:00',
                endTime: '2019/05/01 23:59:59',
                EnginePush: '是',
                state: '已发布',
                upPerson: 'admin',
                upTime: '2019/04/05 18:23:11',
                operation: '详情'
            },
            {
                id: '2019050231',
                title: '五一钜惠',
                type: '文章',
                IssuingVoucher: '否',
                startTime: '2019/05/01 00:00:00',
                endTime: '2019/05/01 23:59:59',
                EnginePush: '是',
                state: '已发布',
                upPerson: 'admin',
                upTime: '2019/04/05 18:23:11',
                operation: '详情'
            },
            {
                id: '2019050231',
                title: '五动全城 一降到底',
                type: '文章',
                IssuingVoucher: '否',
                startTime: '2019/05/02 00:00:00',
                endTime: '2019/05/05 23:59:59',
                EnginePush: '否',
                state: '未发布',
                upPerson: 'admin',
                upTime: '2019/04/05 18:23:11',
                operation: '详情'
            },
            {
                id: '2019050231',
                title: '周年庆',
                type: '活动',
                IssuingVoucher: '否',
                startTime: '2019/05/03 00:00:00',
                endTime: '2019/05/05 23:59:59',
                EnginePush: '否',
                state: '已过期',
                upPerson: 'admin',
                upTime: '2019/04/05 18:23:11',
                operation: '详情'
            },
            {
                id: '2019050231',
                title: '六一钜惠',
                type: '文章',
                IssuingVoucher: '是',
                startTime: '2019/05/04 00:00:00',
                endTime: '2019/05/09 23:59:59',
                EnginePush: '否',
                state: '已驳回',
                upPerson: 'admin',
                upTime: '2019/04/05 18:23:11',
                operation: '详情'
            },
        ];
        this.hearSource = [
            {
                id: 'ID', title: '标题', type: '类型', IssuingVoucher: '发券', startTime: '开始时间', endTime: '结束时间',
                EnginePush: '引擎推送', state: '状态', upPerson: '修改人', upTime: '修改时间', operation: '操作'
            },
        ];
    }

    sortData(sort: Sort){
        const data = this.dataSource.slice();
        if (!sort.active || sort.direction === '') {
            this.dataSource = data;
            return;
        }
        this.dataSource = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'id': return this.compare(a['id'], b['id'] , isAsc);
                case 'title': return this.compare(a['title'], b['title'] , isAsc);
                case 'type': return this.compare(a['type'], b['type'] , isAsc);
                case 'IssuingVoucher': return this.compare(a['IssuingVoucher'], b['IssuingVoucher'] , isAsc);
                case 'startTime': return this.compare(a['startTime'], b['startTime'] , isAsc);
                case 'endTime': return this.compare(a['endTime'], b['endTime'] , isAsc);
                case 'EnginePush': return this.compare(a['EnginePush'], b['EnginePush'] , isAsc);
                case 'state': return this.compare(a['state'], b['state'] , isAsc);
                case 'upPerson': return this.compare(a['upPerson'], b['upPerson'] , isAsc);
                case 'upTime': return this.compare(a['upTime'], b['upTime'] , isAsc);
                case 'operation': return this.compare(a['operation'], b['operation'] , isAsc);
                default: return 0;
            }
        });
    }
    compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }


    changesEvent( p: PageEvent){
        if ( p.pageSize === 5){
            this.dataSource = [
                {
                    id: '2019050231',
                    title: '五动全城 一降到底',
                    type: '活动',
                    IssuingVoucher: '是',
                    startTime: '2019/05/01 00:00:00',
                    endTime: '2019/05/01 23:59:59',
                    EnginePush: '是',
                    state: '已发布',
                    upPerson: 'admin',
                    upTime: '2019/04/05 18:23:11',
                    operation: '详情'
                },
                {
                    id: '2019050231',
                    title: '五一钜惠',
                    type: '文章',
                    IssuingVoucher: '否',
                    startTime: '2019/05/01 00:00:00',
                    endTime: '2019/05/01 23:59:59',
                    EnginePush: '是',
                    state: '已发布',
                    upPerson: 'admin',
                    upTime: '2019/04/05 18:23:11',
                    operation: '详情'
                },
                {
                    id: '2019050231',
                    title: '五动全城 一降到底',
                    type: '文章',
                    IssuingVoucher: '否',
                    startTime: '2019/05/02 00:00:00',
                    endTime: '2019/05/05 23:59:59',
                    EnginePush: '否',
                    state: '未发布',
                    upPerson: 'admin',
                    upTime: '2019/04/05 18:23:11',
                    operation: '详情'
                },
                {
                    id: '2019050231',
                    title: '周年庆',
                    type: '活动',
                    IssuingVoucher: '否',
                    startTime: '2019/05/03 00:00:00',
                    endTime: '2019/05/05 23:59:59',
                    EnginePush: '否',
                    state: '已过期',
                    upPerson: 'admin',
                    upTime: '2019/04/05 18:23:11',
                    operation: '详情'
                },{
                    id: '2019050231',
                    title: '六一钜惠',
                    type: '文章',
                    IssuingVoucher: '是',
                    startTime: '2019/05/04 00:00:00',
                    endTime: '2019/05/09 23:59:59',
                    EnginePush: '否',
                    state: '已驳回',
                    upPerson: 'admin',
                    upTime: '2019/04/05 18:23:11',
                    operation: '详情'
                },
            ];
            if (p.pageIndex === 0) {
                this.dataSource = [
                    {
                        id: '2019050231',
                        title: '五动全城 一降到底',
                        type: '活动',
                        IssuingVoucher: '是',
                        startTime: '2019/05/01 00:00:00',
                        endTime: '2019/05/01 23:59:59',
                        EnginePush: '是',
                        state: '已发布',
                        upPerson: 'admin',
                        upTime: '2019/04/05 18:23:11',
                        operation: '详情'
                    },
                    {
                        id: '2019050231',
                        title: '五一钜惠',
                        type: '文章',
                        IssuingVoucher: '否',
                        startTime: '2019/05/01 00:00:00',
                        endTime: '2019/05/01 23:59:59',
                        EnginePush: '是',
                        state: '已发布',
                        upPerson: 'admin',
                        upTime: '2019/04/05 18:23:11',
                        operation: '详情'
                    },
                    {
                        id: '2019050231',
                        title: '五动全城 一降到底',
                        type: '文章',
                        IssuingVoucher: '否',
                        startTime: '2019/05/02 00:00:00',
                        endTime: '2019/05/05 23:59:59',
                        EnginePush: '否',
                        state: '未发布',
                        upPerson: 'admin',
                        upTime: '2019/04/05 18:23:11',
                        operation: '详情'
                    },
                    {
                        id: '2019050231',
                        title: '周年庆',
                        type: '活动',
                        IssuingVoucher: '否',
                        startTime: '2019/05/03 00:00:00',
                        endTime: '2019/05/05 23:59:59',
                        EnginePush: '否',
                        state: '已过期',
                        upPerson: 'admin',
                        upTime: '2019/04/05 18:23:11',
                        operation: '详情'
                    },
                    {
                        id: '2019050231',
                        title: '六一钜惠',
                        type: '文章',
                        IssuingVoucher: '是',
                        startTime: '2019/05/04 00:00:00',
                        endTime: '2019/05/09 23:59:59',
                        EnginePush: '否',
                        state: '已驳回',
                        upPerson: 'admin',
                        upTime: '2019/04/05 18:23:11',
                        operation: '详情'
                    },
                ];
            } else {
                this.dataSource = [
                    {
                        id: '2019100231',
                        title: '双十一钜惠',
                        type: '活动',
                        IssuingVoucher: '是',
                        startTime: '2019/9/01 00:00:00',
                        endTime: '2019/11/11 23:59:59',
                        EnginePush: '是',
                        state: '已发布',
                        upPerson: 'admin',
                        upTime: '2019/04/05 18:23:11',
                        operation: '详情'
                    },
                    {
                        id: '2019100231',
                        title: '双十一全场优惠来袭',
                        type: '文章',
                        IssuingVoucher: '否',
                        startTime: '2019/08/01 00:00:00',
                        endTime: '2019/11/11 23:59:59',
                        EnginePush: '是',
                        state: '已发布',
                        upPerson: 'admin',
                        upTime: '2019/04/05 18:23:11',
                        operation: '详情'
                    },
                    {
                        id: '2019100231',
                        title: '双十一打折季',
                        type: '文章',
                        IssuingVoucher: '否',
                        startTime: '2019/08/02 00:00:00',
                        endTime: '2019/11/11 23:59:59',
                        EnginePush: '否',
                        state: '未发布',
                        upPerson: 'admin',
                        upTime: '2019/04/05 18:23:11',
                        operation: '详情'
                    },
                    {
                        id: '2019100231',
                        title: '周年庆',
                        type: '活动',
                        IssuingVoucher: '否',
                        startTime: '2019/06/03 00:00:00',
                        endTime: '2019/11/11 23:59:59',
                        EnginePush: '否',
                        state: '已过期',
                        upPerson: 'admin',
                        upTime: '2019/04/05 18:23:11',
                        operation: '详情'
                    }
                ];
            }
        } else {
            this.dataSource = [ {
                id: '2019050231',
                title: '五动全城 一降到底',
                type: '活动',
                IssuingVoucher: '是',
                startTime: '2019/05/01 00:00:00',
                endTime: '2019/05/01 23:59:59',
                EnginePush: '是',
                state: '已发布',
                upPerson: 'admin',
                upTime: '2019/04/05 18:23:11',
                operation: '详情'
            },
                {
                    id: '2019050231',
                    title: '五一钜惠',
                    type: '文章',
                    IssuingVoucher: '否',
                    startTime: '2019/05/01 00:00:00',
                    endTime: '2019/05/01 23:59:59',
                    EnginePush: '是',
                    state: '已发布',
                    upPerson: 'admin',
                    upTime: '2019/04/05 18:23:11',
                    operation: '详情'
                },
                {
                    id: '2019050231',
                    title: '五动全城 一降到底',
                    type: '文章',
                    IssuingVoucher: '否',
                    startTime: '2019/05/02 00:00:00',
                    endTime: '2019/05/05 23:59:59',
                    EnginePush: '否',
                    state: '未发布',
                    upPerson: 'admin',
                    upTime: '2019/04/05 18:23:11',
                    operation: '详情'
                },
                {
                    id: '2019050231',
                    title: '周年庆',
                    type: '活动',
                    IssuingVoucher: '否',
                    startTime: '2019/05/03 00:00:00',
                    endTime: '2019/05/05 23:59:59',
                    EnginePush: '否',
                    state: '已过期',
                    upPerson: 'admin',
                    upTime: '2019/04/05 18:23:11',
                    operation: '详情'
                },
                {
                    id: '2019050231',
                    title: '六一钜惠',
                    type: '文章',
                    IssuingVoucher: '是',
                    startTime: '2019/05/04 00:00:00',
                    endTime: '2019/05/09 23:59:59',
                    EnginePush: '否',
                    state: '已驳回',
                    upPerson: 'admin',
                    upTime: '2019/04/05 18:23:11',
                    operation: '详情'
                },{
                    id: '2019100231',
                    title: '双十一钜惠',
                    type: '活动',
                    IssuingVoucher: '是',
                    startTime: '2019/9/01 00:00:00',
                    endTime: '2019/11/11 23:59:59',
                    EnginePush: '是',
                    state: '已发布',
                    upPerson: 'admin',
                    upTime: '2019/04/05 18:23:11',
                    operation: '详情'
                },
                {
                    id: '2019100231',
                    title: '双十一全场优惠来袭',
                    type: '文章',
                    IssuingVoucher: '否',
                    startTime: '2019/08/01 00:00:00',
                    endTime: '2019/11/11 23:59:59',
                    EnginePush: '是',
                    state: '已发布',
                    upPerson: 'admin',
                    upTime: '2019/04/05 18:23:11',
                    operation: '详情'
                },
                {
                    id: '2019100231',
                    title: '双十一打折季',
                    type: '文章',
                    IssuingVoucher: '否',
                    startTime: '2019/08/02 00:00:00',
                    endTime: '2019/11/11 23:59:59',
                    EnginePush: '否',
                    state: '未发布',
                    upPerson: 'admin',
                    upTime: '2019/04/05 18:23:11',
                    operation: '详情'
                },
                {
                    id: '2019100231',
                    title: '周年庆',
                    type: '活动',
                    IssuingVoucher: '否',
                    startTime: '2019/06/03 00:00:00',
                    endTime: '2019/11/11 23:59:59',
                    EnginePush: '否',
                    state: '已过期',
                    upPerson: 'admin',
                    upTime: '2019/04/05 18:23:11',
                    operation: '详情'
                } ];
        }

    }


}



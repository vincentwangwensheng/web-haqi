import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'app-applet-game',
    templateUrl: './applet-game.component.html',
    styleUrls: ['./applet-game.component.scss']
})
export class AppletGameComponent implements OnInit {

    columns: any[];

    constructor() {
        this.columns = [
            {name: 'gameName', translate: '游戏名称', value: '', type: 'input'},
            {name: 'desc', translate: '游戏描述', value: ''},
            {name: 'gameId', translate: '游戏ID', value: ''},
            {name: 'gameUrl', translate: '游戏地址', value: ''},
            {
                name: 'enabled', translate: '状态', value: '', type: 'select', options: [
                    {translate: '正常', value: true},
                    {translate: '冻结', value: false}
                ], transform: [{true: '正常'}, {false: '冻结'}]
            },
            {name: 'startTime', translate: '游戏开始时间', value: '', transformType: 'date'},
            {name: 'endTime', translate: '游戏结束时间', value: '', transformType: 'date'},
            {name: 'showStartTime', translate: '显示开始时间', value: '', transformType: 'date'},
            {name: 'showEndTime', translate: '显示结束时间', value: '', transformType: 'date'},
            {name: 'lastModifiedBy', translate: '修改人', value: ''},
            {name: 'lastModifiedDate', translate: '修改时间', value: '', transformType: 'date'},


        ];
    }

    ngOnInit() {
    }

}

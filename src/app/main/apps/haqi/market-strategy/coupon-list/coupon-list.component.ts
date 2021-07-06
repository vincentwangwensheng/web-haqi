import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {CouponListService} from './coupon-list.service';

@Component({
    selector: 'app-coupon-list',
    templateUrl: './coupon-list.component.html',
    styleUrls: ['./coupon-list.component.scss']
})
export class CouponListComponent implements OnInit {
    @Input()
    overPanel: boolean;
    @Input()
    createButton = false;
    @Input()
    checkbox: boolean;
    @Input()
    selectedRows: [];

    typeTransform = [];

    @Output()
    dataSelect = new EventEmitter();

    columns = [
        {name: 'id', translate: '规则ID', value: ''},
        {name: 'name', translate: '规则名称', value: ''},
        {name: 'type', translate: '类型', value: '', transform: this.typeTransform},
        {name: 'number', translate: '券编码', value: ''},
        {name: 'beginTime', translate: '开始时间', transformType: 'date', value: ''},
        {name: 'endTime', translate: '结束时间', transformType: 'date', value: ''},

    ];

    constructor(private service: CouponListService) {
    }


    ngOnInit() {
        console.log(this.getCouponType());
    }

    getCouponType() {
        this.service.getCouponType().subscribe(res => {
            console.log(res);
            if (res) {
                res.forEach(item => {
                    const value = {};
                    value[item.id] = item.name;
                    this.typeTransform.push(value);

                });
            }
        });
    }

    onDataSelect(event) {
        this.dataSelect.emit(event);
    }
}

import {
    AfterViewInit,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import {fuseAnimations} from '../../../@fuse/animations/index';
import {DetailTableDataBase} from './detail-table-dataBase';
import * as d3 from 'd3';

@Component({
    selector: 'app-detail-table-list',
    templateUrl: './detail-table-list.component.html',
    styleUrls: ['./detail-table-list.component.scss'],
    animations: fuseAnimations
})
export class DetailTableListComponent implements OnInit , AfterViewInit {

    @ViewChild('datatable', {static: true})
    dataTable;
    /** 使用记录 **/

    @Input()
    DetailTableParam: DetailTableDataBase;

    @Output()
    onPageEvent: EventEmitter<any> = new EventEmitter();

    @Output()
    goToDetailEvent: EventEmitter<any> = new EventEmitter();

    tableColumnWidth = 0;
    timeOutNum: any;


    constructor() {
    }

    ngOnInit() {
     // status  state
    }


    // 获取列宽
    getColumnWidth() {
        if (document.getElementById('detail_table_list')) {
            const columnWidth = (document.getElementById('detail_table_list').offsetWidth) - 32;
            this.tableColumnWidth = columnWidth / (this.DetailTableParam.dataColumns.length + 1); // dataColumns
            window.addEventListener('resize', () => {
                if (this.timeOutNum) {
                    clearTimeout(this.timeOutNum);
                }
                this.timeOutNum = setTimeout(() => {
                    this.getColumnWidth();
                }, 100);
            });
        }
    }

    // 列位拖动
    resizing(event) {
        if (!this.DetailTableParam.scrollbarH) {
            this.DetailTableParam.dataColumns.find(column => column.name === event.column.name).width = event.newValue;
            let totalWidth = 0;
            this.DetailTableParam.dataColumns.forEach(column => totalWidth += column.width);
            if (totalWidth + (this.DetailTableParam.dataColumns.includes('operation') ? 100 : 50) > this.dataTable.element.offsetWidth) {
                d3.select('ngx-datatable').style('overflow-x', 'auto');
            } else {
                d3.select('ngx-datatable').style('overflow-x', null);
            }
        }

    }

    onPage(event){
        this.onPageEvent.emit(event);
    }

    goToDetail(row){
        this.goToDetailEvent.emit(row);
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.getColumnWidth();
        });
    }

}

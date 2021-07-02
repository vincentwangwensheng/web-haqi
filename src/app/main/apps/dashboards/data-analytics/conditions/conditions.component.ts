import {Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {FlatTreeControl, NestedTreeControl} from '@angular/cdk/tree';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDatepicker, MatTreeFlatDataSource, MatTreeFlattener, MatTreeNestedDataSource} from '@angular/material';

import * as _moment from 'moment';
import { Moment } from 'moment';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {FormControl} from '@angular/forms';
// const moment = _rollupMoment || _moment;
const moment = _moment;
// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY',
  },
  display: {
    dateInput: 'YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

interface FoodNode {
  name: string;
  children?: FoodNode[];
}

const TREE_DATA: FoodNode[] = [
  {
    name: '日期',
    children: [
      {name: 'dateFlag'}
    ]
  },
  {
    name: '年份',
    children: [
      {name: 'yearFlag'}
    ]
  },
  {
    name: '年份（周）',
    children: [
      {name: 'yearWeekFlag'}
    ]
  }
];

/** Flat node with expandable and level information */
interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}


@Component({
  selector: 'app-conditions',
  templateUrl: './conditions.component.html',
  styleUrls: ['./conditions.component.scss'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class ConditionsComponent implements OnInit {
  date = new FormControl(moment());
  date1 = new FormControl(moment());
  currentSelectYear = (new Date()).getFullYear();
  @Output()
  onSearch = new EventEmitter();
  @Output()
  onYearSerch = new EventEmitter();
  @Output()
  onYearWeekSearch = new EventEmitter();
  private _transformer = (node: FoodNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
    };
  }
  treeControl = new FlatTreeControl<ExampleFlatNode>(
      node => node.level, node => node.expandable);

  treeFlattener = new MatTreeFlattener(
      this._transformer, node => node.level, node => node.expandable, node => node.children);

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor() {
    this.dataSource.data = TREE_DATA;
  }

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  ngOnInit(): void {
  }
  onClick(val){
    this.onSearch.emit(val);
  }

  onClickYear(val) {
    this.onYearSerch.emit(val);
  }

  // 日期控件获取年份的方法
  chosenYearHandler(normalizedYear: Moment, datepicker: MatDatepicker<Moment>) {
    this.currentSelectYear = normalizedYear.year();
    const ctrlValue = this.date.value;
    ctrlValue.year(normalizedYear.year());
    this.date.setValue(ctrlValue);
    datepicker.close();
  }

  // 年份周查询日期控件
  chosenYearWeekHandler(normalizedYear: Moment, datepicker: MatDatepicker<Moment>){
    this.currentSelectYear = normalizedYear.year();
    const ctrlValue = this.date1.value;
    ctrlValue.year(normalizedYear.year());
    this.date1.setValue(ctrlValue);
    datepicker.close();
  }

  onClickYearWeek(val) {
    this.onYearWeekSearch.emit(val);
  }

}

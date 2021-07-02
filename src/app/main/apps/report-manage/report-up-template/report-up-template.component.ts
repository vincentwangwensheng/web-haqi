import {
    AfterViewInit,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output, SimpleChanges,
    TemplateRef,
    ViewChild
} from '@angular/core';
import {fuseAnimations} from '../../../../../@fuse/animations';
import {MatDialog, MatSnackBar} from '@angular/material';
import {CenterDataBase} from './centerDataBase';
import {CouponParameter} from '../../../../services/EcouponService/CouponParameter';

@Component({
    selector: 'app-report-right-template',
    templateUrl: './report-up-template.component.html',
    styleUrls: ['./report-up-template.component.scss'],
    animations: fuseAnimations
})

 /** 金茂报表管理 统一报表模板 使用方法在后面**/
export class ReportUpTemplateComponent implements OnInit, AfterViewInit , OnChanges{

    @ViewChild('tableTg', {static: true}) tableTg: TemplateRef<any>;

    @Input()
    hasReportList = false; // 是否显示旁边的报表查询内容
    @Input()
    allListSearch = true ; // 查询全部内容

    @Input()
    formGroup_: any; // 当前报表筛选框的数据，我们这里用form集中起来

    @Output()
    searchData: EventEmitter<any> = new EventEmitter(); // 点击查询，发射出一系列接口需要的数据

    @Output()
    clearData: EventEmitter<any> = new EventEmitter(); // 清空查询，发射清空的标记，告诉调用方。我要清空了

    @Output()
    exData: EventEmitter<any> = new EventEmitter(); // 导出数据，发射导出请求

    @Input()
    formKeys = []; // formGroup_的字段集，会循环此字段来创建对应的输入款之类的页面
    //  {formControlName: '' , CNText: '' , placeholder: '' , type: 'input' , hasEventListener: 'dialog' } , // 根据类型定义原型是什么样的
    // type是当前空间显示类型:  目前input --> 输入框 、 datePicker --> 日期框 、 checkbox --> checkbox选择框
    // formControlName是表单对应的Control名称， CNText：是左边栏位的名称 ，  placeholder提示 ， hasEventListener 是否有点击事件：暂定'dialog'是点击弹框事件，null是无点击事件
    @Input()
    dateTimeConfig = 'time'; // 是日期的选择框（不带时分秒）还是时间的选择框，默认是时间（带时分秒）
    configBegin: any;
    configEnd: any;

    centerTable: CenterDataBase; // 列表依赖的对象，如果有需要弹框，需要继承此类

    dataSelects = []; // 当前弹出框列表数据选择后所拿到的值

    twoDateChoose = false;
    constructor(
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
    ) {

        this.formKeys.forEach( f => {
            if (f.datePicker === 'datePicker'){
                if (f.configBegin && f.configEnd){
                    this.configBegin = f.configBegin ;
                    this.configEnd =   f.configEnd ;
                    console.log('-------' , this.configBegin );
                }
            }
        });
    }

    ngOnInit() {
        console.log('-------www' , this.configBegin );
        this.setTimeConfig();
    }

    // 清空筛选
    clearSearch() {
        this.formGroup_.enable();
        this.formGroup_.reset('');
        this.formKeys.forEach(
            v => {
                if (v.type === 'checkbox') {
                    v.checked = false ;
                    this.formGroup_.get(v.formControlName).patchValue(false);
                }
                if (v.hasEventListener === 'dialog') {
                    v.dialogEntity.currentDara = [];
                }
            }
        );
        this.twoDateChoose = false;
        this.allListSearch = true ;
        this.clearData.emit(true);
    }

    // 查询列表
    onSearchData() {
        const e = this.formGroup_.getRawValue();
        const search_arr = this.getSearchArr(e);
        this.formGroup_.disable();
        this.searchData.emit(search_arr);
    }

    // 导出
    exportData(){
        this.exData.emit(true);
    }

    // 拼接查询条件
    getSearchArr(e) {
        const filed = [];
        let multiSearch = [];
        for (const ar_f of Object.keys(e)) {
            if (!this.isNull(e[ar_f])) {
                filed.push(ar_f);
            }
        }
        this.formKeys.forEach( key => {
            if (key.type === 'datePicker'){
                if (key.twoDate) {
                    const value1 = this.formGroup_.get(key.formControlNames[0].name).value ;
                    const value2 = this.formGroup_.get(key.formControlNames[1].name).value ;
                    if (value1 && value2){
                        multiSearch = this.getSearch(multiSearch , filed , e , key , key.formControlNames[0].name , key.formControlNames[1].name);
                    } else {
                        if (!value1 && !value2){

                        } else {
                            this.snackBar.open('时间条件不完整，将不添加时间查询', '✖');
                            this.formGroup_.get(key.formControlNames[0].name).patchValue('');
                            this.formGroup_.get(key.formControlNames[1].name).patchValue('');
                        }

                    }
                } else {
                    multiSearch = this.getSearch(multiSearch , filed , e , key , key.formControlNames[0].name , key.formControlNames[1].name);
                }

            } else {
                multiSearch = this.getSearch(multiSearch , filed , e , key , key.formControlName);
            }
        });
        return multiSearch;
    }

    getSearch(multiSearch , filed , e , key , c_name , c_name2?){
        if (filed.includes(c_name) || filed.includes(c_name2)) {
            if (key.type === 'datePicker') {
                const value1 = this.formGroup_.get(key.formControlNames[0].name).value ;
                const value2 = this.formGroup_.get(key.formControlNames[1].name).value ;
                if (key.twoFiled && key.twoFiled === true) {
                    let search_arr1 = {};
                    let search_arr2 = {};
                    const len1 = key.formControlNames[0].name.length - 1 ;
                    const len2 = key.formControlNames[1].name.length - 1 ;
                    if (key.dataInType){ // && key.dataInType === 'number'
                        search_arr1 = {name: key.formControlNames[0].name.substring(0 , len1), value: value1 , type: 'date' , dataInType: key.dataInType};
                        search_arr2 = {name: key.formControlNames[1].name.substring(0 , len2), value: value2 , type: 'date' , dataInType: key.dataInType};
                    } else {
                        search_arr1 = {name: key.formControlNames[0].name.substring(0 , len1), value: value1 , type: 'date'};
                        search_arr2 = {name: key.formControlNames[1].name.substring(0 , len2), value: value2 , type: 'date'};
                    }
                    multiSearch.push(search_arr1); // , reg: type
                    multiSearch.push(search_arr2); // , reg: type
                } else {
                    let search_arr = {};
                    const len = key.formControlNames[0].name.length - 1 ;
                    const time_se =  value1 + 'TO' + value2 ;
                    if (key.dataInType){ // && key.dataInType === 'number'
                        search_arr = {name: key.formControlNames[0].name.substring(0 , len), value: time_se , type: 'date' , dataInType: key.dataInType};
                    } else {
                        search_arr = {name: key.formControlNames[0].name.substring(0 , len), value: time_se , type: 'date'};
                    }
                    multiSearch.push(search_arr); // , reg: type
                }

                // multiSearch.push(search_arr); // , reg: type
                // console.log('multiSearch----' , multiSearch);
            } else {


                if (key.type === 'input') {
                    const name  = this.setInputSearchParamGetName(key);
                    const value = this.setInputSearchParamGetValue(e , key);
                    if (key.needReqResult && key.needReqResult === true){
                        multiSearch.push({name: name, value: value , needReqResult: key.needReqResult});
                    } else if (key.needSearchType && key.needSearchType === true){
                        multiSearch.push({name: name, value: value , type: key.dataInType});
                    } else  {
                        multiSearch.push({name: name, value: value}); // , reg: type
                    }
                } else if (key.type === 'select'){
                    const name  = this.setInputSearchParamGetName(key);
                    const value   = this.setInputSearchParamGetValue(e , key);
                    if ( key.needSearchType && key.needSearchType === true) {
                        multiSearch.push({name: name, value: value, type: key.dataInType}); // , reg: type
                    } else {
                        multiSearch.push({name: name, value: value}); // , reg: type
                    }
                }else {
                    let name = key.formControlName;
                    let value = e[key.formControlName];
                    if (key.dialogFiled) {
                        value = key.dialogFiledList;
                    }
                    if (key.paramFiled) {
                        name = key.paramFiled ;
                    }
                    if ( key.needSearchType && key.needSearchType === true) {
                        multiSearch.push({name: name, value: value, type: key.dataInType}); // , reg: type
                    } else {
                        multiSearch.push({name: name, value: value}); // , reg: type
                    }
                }

            }

        }
        return multiSearch;
    }
    // 因为int(number)类型与string类型不同，所以接口查询需要分情况写条件
    setInputSearchParamGetName(key){
        let name =  key.formControlName;
        if (key.paramFiled) {
            name = key.paramFiled ;
        }
        if (key.dataInType && key.dataInType === 'number' || key.dataInType === 'equal'  || key.dataInType === 'input') {
            name = name ;
        }  else  {
            name = name + '.keyword';
        }
        return name;
    }

    // 因为int(number)类型与string类型不同，所以接口查询需要分情况写条件
    setInputSearchParamGetValue(e , key){
        let value = e[key.formControlName];
        if (key.dialogFiled) {
            value = key.dialogFiledList;
        }
        if (value.includes(',')) {
            if (key.dataInType && key.dataInType === 'number') {
                const value1 = value.split(',');
                const value2 = [];
                value1.forEach( v => {
                    const v_ =  '"' + v + '"';
                    value2.push(v_);
                });
                value = this.ArrayToStr(value2);
            } else if (key.dataInType && key.dataInType === 'equal'){
                const value1 = value.split(',');
                const value2 = [];
                value1.forEach( v => {
                    const v_ =  '' + v + '';
                    value2.push(v_);
                });
                value = this.ArrayToStr(value2);
            } else {
                const value1 = value.split(',');
                const value2 = [];
                value1.forEach( v => {
                    const v_ =  v + '*';
                    value2.push(v_);
                });
                value = this.ArrayToStr(value2);
                value = value.replace(/,/g, ' OR ');
            }
            value = '(' + value + ')' ;
        } else {
            if (key.dataInType && key.dataInType === 'number'){
                value =  '"' + value + '"';
            } else if (key.dataInType && key.dataInType === 'equal' ) {
                value =  value ;
            } else if (key.dataInType &&  key.dataInType === 'input') {
                value =  value ;
            } else {
                value = value + '*';
            }
        }
        return value ;
    }

    // 页面完成后做的操作
    ngAfterViewInit(): void {
        this.formKeys.forEach(k => {
            const k_document = document.getElementById(k.formControlName);
            if (k.hasEventListener && k.hasEventListener === 'dialog') {
                // 弹框
                this.clickDialogEvent(k_document, k);
            }
        });

    }

    // 添加获取焦点事件事件
    clickDialogEvent(k_document, k) {
        k_document.addEventListener('focus', () => {
            // 拿到tableList对象 ,
            this.centerTable = k.dialogEntity;
            this.dataSelects = [];
            Object.assign(this.dataSelects, this.centerTable.currentDara);
            this.centerTable.initSearch();
            const dialog = this.dialog.open(this.tableTg, {
                id: 'comTableDialog', width: '80%'
            });
            dialog.afterClosed().subscribe( res => {
                    if (res) {
                        this.centerTable.currentDara = [];
                        Object.assign(this.centerTable.currentDara, this.dataSelects);
                        const  value = this.ArrayToStr(this.centerTable.currentDara , this.centerTable['selectFiled']);
                        this.formGroup_.get(k.formControlName).patchValue(value);
                        if (k.dialogFiled){
                            k.dialogFiledList = this.ArrayToStr(this.centerTable.currentDara , k.dialogFiled);
                        }
                    } else {
                        this.dataSelects = [];
                    }
            });
        });
    }

    ListSelect(e) {
        this.dataSelects = e ;
    }

    eventCheckboxChange(e, c) {
        c.checked = e.checked;
        this.formGroup_.get(c.formControlName).patchValue(e.checked);
    }

    onSourceDate(e, timeBegin, timeEnd, p) {
        'timeBegin' === p ? timeEnd.picker.set('minDate', e) : timeBegin.picker.set('maxDate', e);
    }


    // 设置按钮状态
    getStatus(p) {
        let flag = true;
        if (this.formGroup_) {
            // let i = 0 ;
            let allValue = false ;
            this.formKeys.forEach(v => {
                if (v.type !== 'checkbox') {
                    if (this.formGroup_.get(v.formControlName) && !this.isNull(this.formGroup_.get(v.formControlName).value)) {
                        if (!this.twoDateChoose) {
                            flag = false;
                        }
                        if (v.needAllHasValue && v.needAllHasValue === true) {
                            // i = i + 1 ;
                            allValue = true;
                        }
                    }
                }
                if (v.type === 'datePicker') {
                    if (v.twoDate && v.twoDate === true){ // 这个属性设置两个日期框必须都填
                        const date1 = v.formControlNames[0].name;
                        const date2 = v.formControlNames[1].name;
                        if (!this.isNull(this.formGroup_.get(date1).value) && !this.isNull(this.formGroup_.get(date2).value)) {
                            flag = false;
                        }
                        if (!this.isNull(this.formGroup_.get(date1).value) || !this.isNull(this.formGroup_.get(date2).value)) {
                            this.twoDateChoose = flag;
                        } else {
                            this.twoDateChoose = false;
                        }
                        if (v.needAllHasValue && v.needAllHasValue === true) {
                            // i = i + 1 ;
                            allValue = true;
                        }
                    } else {
                        v.formControlNames.forEach( c_name => {
                            if (this.formGroup_.get(c_name.name) && !this.isNull(this.formGroup_.get(c_name.name).value)) {
                                flag = false;
                                if (v.needAllHasValue && v.needAllHasValue === true) {
                                    // i = i + 1 ;
                                    allValue = true;
                                }
                            }
                        });
                    }


                }
                if (v.type === 'checkbox') {
                    if (this.formGroup_.get(v.formControlName) && !this.formGroup_.get(v.formControlName).value === false) {
                        if (!this.twoDateChoose) {
                            flag = false;
                        }
                        // if (v.needAllHasValue && v.needAllHasValue === true) {
                        //     i = i + 1 ;
                        //     allValue = true;
                        // }
                    }
                }
            });

            if (allValue) {
                let flag1 = true ;
                this.formKeys.forEach( r => {
                    if (this.formGroup_.get(r.formControlName) && !this.formGroup_.get(r.formControlName).value === false){
                        flag1 = false ;
                    } else {
                        flag1 = true ;
                    }
                });
                flag = flag1;
                // if (!flag1) {
                //     flag = false;
                // } else {
                //     flag = false;
                // }
                // if (p === 'search') {
                //     if (this.hasReportList) { // && this.allListSearch === false
                //         flag = true;
                //     } else {
                //         flag = false;
                //     }
                // }
            } else {
                if (!flag) {
                    if (p === 'search') {
                        if (this.hasReportList) { // && this.allListSearch === false
                            flag = true;
                        } else {
                            flag = false;
                        }
                    }
                }
            }

        }
        return flag;
    }

    isNull(value) {
        if (value !== null && value !== '' && value !== 'null' && value !== undefined) {
            const len = value.length;
            if (len > 0){
                return false;
            } else {
                return true;
            }
        } else {
            return true;
        }
    }

    setTimeConfig() {

        if (this.dateTimeConfig === 'date') {

            this.configBegin = {
                enableTime: false,
                time_24hr: true,
                enableSeconds: true,
            };

            this.configEnd = {
                enableTime: false,
                time_24hr: true,
                enableSeconds: true,
            };

        } else {
            this.configBegin = {
                enableTime: true,
                time_24hr: true,
                enableSeconds: true,
                defaultHour: '0',
                defaultMinute: '0',
                defaultSeconds: '0'
            };

            this.configEnd = {
                enableTime: true,
                time_24hr: true,
                enableSeconds: true,
                defaultHour: '23',
                defaultMinute: '59',
                defaultSeconds: '59'
            };
        }
    }

    ArrayToStr(arr , filed? ,  separator?){
        if (arr.length > 0){
            const result =   arr.map( a_a => {
                if (filed) {
                    return a_a[filed];
                } else {
                    return a_a;
                }
            }).join( (separator ? separator : ','));
            return result;
        }
    }

    ArrayToStr2(arr , filed? ,  separator? , p?){
        if (arr.length > 0){
            const result =   arr.map( a_a => {
                if (filed) {
                    return a_a[filed] + p;
                } else {
                    return a_a + p;
                }
            }).join( (separator ? separator : ','));
            return result;
        }
    }


    ngOnChanges(changes: SimpleChanges): void {
        for (const propName of Object.keys(changes)) {
            const chng = changes[propName];
            // const cur1 = JSON.stringify(chng.currentValue).replace('"', '').replace('"', '');
            // console.log(propName , '-----propName');
            // if (propName === 'dateTimeConfig'){
            //     console.log(propName , '-----propName');
            //     console.log(chng.currentValue , '-----cur1');
            // }
            if (chng.currentValue !== undefined && chng.currentValue !== 'undefined') {

                if (propName === 'dateTimeConfig' && chng.currentValue === 'date') {
                    this.configBegin = {
                        enableTime: false,
                        time_24hr: true,
                        enableSeconds: true,
                    };

                    this.configEnd = {
                        enableTime: false,
                        time_24hr: true,
                        enableSeconds: true,
                    };
                }
            }
        }

    }

}

// 使用说明
// 1. html 方
//   <app-report-up-template class="w-100-p h-100-p" [hasReportList]="hasReportList" [formGroup_]="formGroup" [formKeys]="testKeys"
//                                (searchData)="onSearchData($event)" (clearData)="clearSearch($event)">
//     </app-report-up-template>
// 2. ts 中 定义formKeys， 大致如下：
//  this.formKeys = [
//             {formControlName: 'projectName' , CNText: '项目'     , placeholder: '请选择项目' , type: 'input' , hasEventListener: 'dialog'  , dialogEntity:  this.cashProject},
//             {formControlName: 'siteName'    , CNText: '站点名称' , placeholder: '请选择站点' , type: 'input' , hasEventListener: 'dialog'  , dialogEntity:  this.cashSite},
//             {formControlName: 'cityName' , CNText: '所在城市' , placeholder: '请选择城市' , type: 'input' , hasEventListener: 'dialog'  , dialogEntity:  this.cashCity},
//             {type: 'datePicker'  , hasEventListener: 'dateSelect' ,  CNText: '日期' ,
//                 formControlNames: [
//                     {name: 'timeBegin' ,  placeholder: '请选择开始日期' },
//                     {name: 'timeEnd'   ,  placeholder: '请选择结束日期' },
//                 ]
//             },
//             {formControlName: 'pricingMode' , CNText: '计费模式'    , type: 'select' ,
//                 selectOptions: [
//                     {value: 'MILEAGE' , CNValue: '按里程'},
//                     {value: 'POWER' , CNValue: '按电量'}
//                 ]
//             },
//             {formControlName: 'HasSetMeal' , CNText: '是否含套餐' , type: 'checkbox' , hasEventListener: 'checkbox' , desc: '含套餐' , checked: false },
//         ];
// 目前各字段意思：
// 1. formControlName --> 查询筛选的FormGroup中对应的 FormControl 名， 主要用于html页面生成对应的input， 并给input一个ID，在画面完成后根据id添加一个click事件
// 2. CNText --> 项目左侧名称说明
// 3. placeholder , 有相关提示就写，无相关提示可不写此字段
// 4. type --> 必填项， html会根据这个类型去生成对应的效果图，且根据这个类型确定事件,目前有['input' , 'checkbox' , 'datePicker'  , 'checkbox'  , 'select' , 'checkBoxSelect'] (checkBoxSelect-->多选框)
// 5. hasEventListener --> 事件类型，dialog就是打开弹出框事件 目前只定义了这一种。 如果没有事件，不用写此字段
// 6. dialogEntity ---> 弹出框列表对应的对象实体。需要继承 CenterDataBase， 如果没有【hasEventListener】事件，这个地方不必写 , 具体继承方式在CenterDataBase下拉即可看到
// 7. formControlNames --> 如果是日期，或者右边需要有两格，需要添加此字段，写法参考上面
// 8. desc ---> checkbox会用到的字段，用于描述 、 checked --->  checkbox会用到的字段，用于记录和操控当前checkbox的状态
// 9. selectOptions ---> 当类型是select时，需要将循环显示的数组放到这里，格式如上
// 10. twoDate === true  // 这个属性设置两个日期框必须都填  twoFiled --》表示日期框是两个不同的字段
// 11. dialogFiled: 'id' , paramFiled: 'preReviewSite'// dialogFiled弹框中列表需要获取的字段，有就用这个。
//     paramFiled表示当前接口查询字段与表单中的formControlName不同，将采用这个字段去接口查询 , paramFiled通用的
// 12. dialogFiledList // 这个字段定义弹出dialog额外选择的查询的字段的值，需用在查询中。 必须要有dialogFiled字段才行
// 13. dataInType  // es查询：如果是number类型， 说明需要传的参数不是string类型。不需要keyword, string类型才需要keyword . equal类型是 value: 1 , 普通查询, 如果是其他的查询就是对应的reg里面的查询类型 比如: in

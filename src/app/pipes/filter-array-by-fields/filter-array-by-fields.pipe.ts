import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'filterArrayByFields'
})
export class FilterArrayByFieldsPipe implements PipeTransform {

    /**
     * 根据对应字段和值来过滤数组并返回
     * @param values  数组
     * @param reg 匹配对象的字段值 {id:1,name:'xxx'}  传入方式为管道后 :({id:xx,name:'xxx'})
     * @return any[] 过滤后的数组
     */
    transform(values: any[], reg: {} = {}): any[] {
        const keys = Object.keys(reg);
        if (values && values.length > 0 && keys.length > 0) {
            return values.filter(item => {
                let flag = true;
                keys.forEach(key => {
                    flag = flag && item[key] === reg[key];
                });
                return flag;
            });
        } else {
            return values;
        }
    }

}

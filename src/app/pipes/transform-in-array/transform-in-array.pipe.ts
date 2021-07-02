import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'transformInArray'
})
export class TransformInArrayPipe implements PipeTransform {

    /**
     *
     * @param value 数值
     * @param args 传参方式为 :any[]:valueField:'transformField'
     * 数组为包含该数值的总数组  valueField为数值对应的字段  transformField为展示的字段
     * 例如 显示数值是id字段为 1，需要转化为对应对象的name  那么传如包含所有对象的数组，valueField为'id', transformField为'name'
     */
    transform(value: any, ...args: any[]): any {
        const dataArray = args[0];
        const valueField = args[1];
        const transformFiled = args[2];
        if (dataArray && valueField && transformFiled && Array.isArray(dataArray)) {
            const findValue = dataArray.find(item => String(item[valueField]) === String(value));
            if (findValue && findValue[transformFiled]) {
                return findValue[transformFiled];
            } else {
                return value;
            }
        } else {
            return value;
        }
    }

}

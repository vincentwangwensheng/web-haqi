import {Pipe, PipeTransform} from '@angular/core';
import {DatePipe} from '@angular/common';

@Pipe({
    name: 'newDateTransform'
})
export class NewDateTransformPipe implements PipeTransform {
    constructor(private datePipe?: DatePipe) {
    }

    // 日期格式的字符串 转化
    transform(value: any, ...args: any[]): any {
        if (value) {
            const separator = args.length > 0 ? args[0] : '';
            const transform = this.datePipe.transform(new Date(value), 'yyyy/MM/dd HH:mm:ss');
            if (separator) {
                return transform.replace(/\//g, separator);
            } else {
                return transform;
            }
        } else {
            return value;
        }
    }

}

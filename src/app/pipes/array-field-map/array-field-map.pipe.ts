import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'arrayFieldMap'
})
export class ArrayFieldMapPipe implements PipeTransform {

    /**
     * 根据字段返回值数组
     * @param value
     * @param args
     */
    transform(value: any[], ...args: any[]): any {
        return value.map(item => item[args[0]]);
    }

}

import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'values'
})
export class ValuesPipe implements PipeTransform {

    /**
     * 返回对象的值数组
     * @param value
     * @param args
     */
    transform(value: any, ...args: any[]): any {
        return Object.values(value);
    }

}

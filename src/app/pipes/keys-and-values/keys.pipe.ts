import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'keys'
})
export class KeysPipe implements PipeTransform {

    /**
     * 返回对象的键数组
     * @param value
     * @param args
     */
    transform(value: any, ...args: any[]): any {
        return Object.keys(value);
    }

}

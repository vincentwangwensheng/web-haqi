import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'joinObjectByField'
})
export class JoinObjectByFieldPipe implements PipeTransform {

    /**
     *
     * @param value
     * @param args 第一位传拼接field数组[id,name,xxx] 第二位传拼接符，如“，”、“-”、“|”等
     * xxxxx|joinObjectByField:[]:'-'
     */
    transform(value: any, ...args: any[]): any {
        const fields = args[0];
        const separator = args[1] ? args[1] : ',';
        if (fields && Array.isArray(fields)) {
            let str = '';
            fields.forEach((field, index) => {
                if (value[field] && index === fields.length - 1) {
                    str += value[field];
                } else {
                    str += value[field] + separator;
                }
            });
            return str;
        } else {
            return value;
        }
    }

}

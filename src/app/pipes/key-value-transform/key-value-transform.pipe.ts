import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'keyValueTransform'
})
export class KeyValueTransformPipe implements PipeTransform {

    /**
     * 转化值为相关的字符串，如true false转化为是、否等
     * @param key
     * @param args  [{key:value},{key:value}]
     */
    transform(key: any, args: any[] = []): any {

        if (((key && args) || (key === false && args)) && args.length > 0) {
            const transform = args.find(item => Object.keys(item)[0] === key.toString());
            if (transform) {
                return transform[key.toString()];
            } else {
                return key;
            }

        } else {
            return key;
        }
    }

}

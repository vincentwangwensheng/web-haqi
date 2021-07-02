import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'getUrlBySaveId'
})
export class GetUrlBySaveIdPipe implements PipeTransform {

    transform(value: any, ...args: any[]): any {
        console.log(value);
        return this.getUrlBySaveId(value);
    }

    // 通过saveId获取url
    getUrlBySaveId(saveId) {
        const reg = /^[0-9]*$/;
        if (saveId && reg.test(saveId)) {
            return sessionStorage.getItem('baseUrl') + 'file/api/file/showImg?saveId=' + saveId;
        } else {
            return '';
        }
    }

}

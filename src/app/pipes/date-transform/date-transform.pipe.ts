import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'dateTransform'
})
export class DateTransformPipe implements PipeTransform {

    // 传入type方式 :'/' :'-'等
    transform(value: any, ...args: any[]): any {
        const separator = args.length > 0 ? args[0] : '-';
        if (value) {
            const items = value.split('');
            if (items.length % 2 === 0) {
                items.forEach((char, index) => {
                    if (index === 4) {
                        items[4] = separator + char;
                    } else if (index === 6) {
                        items[6] = separator + char;
                    } else if (index === 8) {
                        items[8] = ' ' + char;
                    } else if (index === 10) {
                        items[10] = ':' + char;
                    } else if (index === 12) {
                        items[12] = ':' + char;
                    }
                });
                return items.join('');
            } else {
                return value;
            }
        } else {
            return value;
        }
    }

    // 获取当前日期前n天的日期字符串
    getBeforeDate(days: number){
        const now = new Date().getTime();
        const ago = now - 86400000 * days; // 一天的毫秒数为86400000
        const agoData = new Date(ago);
        let mon = agoData.getMonth() + 1 + '';
        let day = agoData.getDate() + '';
        let hour = agoData.getHours() + '';
        let minute = agoData.getMinutes() + '';
        let second = agoData.getSeconds() + '';
        mon = Number(mon) < 10 ? '0' + mon : mon;
        day = Number(day) < 10 ? '0' + day : day;
        hour = Number(hour) < 10 ? '0' + hour : hour;
        minute = Number(minute) < 10 ? '0' + minute : minute;
        second = Number(second) < 10 ? '0' + second : second;
        const dateString = agoData.getFullYear() + mon + day + hour + minute + second;
        return dateString;
    }
}

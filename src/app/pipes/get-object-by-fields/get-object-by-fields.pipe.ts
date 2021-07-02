import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'getObjectByField'
})
export class GetObjectByFieldsPipe implements PipeTransform {

    /**
     * 根据对应字段和值来匹配数组中的对象并返回
     * @param values  数组
     * @param reg 匹配对象的字段值 {id:1,name:'xxx'}，传入方式为管道后 :({id:xx,name:'xxx'})
     * @return any 匹配后的对象
     */
    transform(values: any[], reg: {} = {}): any | any[] {
        const keys = Object.keys(reg);
        if (values && values.length > 0 && keys.length > 0) {
            const findValue = values.find(item => {
                let flag = true;
                keys.forEach(key => {
                    flag = flag && item[key] === reg[key];
                });
                return flag;
            });
            if (findValue) {
                return findValue;
            } else {
                console.error('未找到匹配对象，请检查字段和对应值！');
                return values;
            }
        } else {
            return values;
        }
    }

}

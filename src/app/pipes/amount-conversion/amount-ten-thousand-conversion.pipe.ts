import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'amountTenThousandConversion'
})
export class AmountTenThousandConversionPipe implements PipeTransform {

    transform(value: any, args?: any): any {
        if (value) {
            const currency = value.replace(/,/g, '');
            return Math.round(parseFloat(currency) / 10000);
        } else {
            return null;
        }
    }

}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dataThousands'
})
export class DataThousandsPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    return String(value).replace(/(\d)(?=(\d{3})+\b)/g, '$1,');
  }

}

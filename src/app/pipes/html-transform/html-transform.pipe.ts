import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'htmlTransform'
})
export class HtmlTransformPipe implements PipeTransform {

    /**
     * Transform
     *
     * @param {string} value
     * @param {any[]} args
     * @returns {string}
     */
    transform(value: string, args: any[] = []): string
    {
        return value ? String(value).replace(/<[^>]+>/gm, '') : '';
    }
}

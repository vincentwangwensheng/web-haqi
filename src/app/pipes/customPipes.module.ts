import {NgModule} from '@angular/core';
import {AmountTenThousandConversionPipe} from './amount-conversion/amount-ten-thousand-conversion.pipe';
import {DateTransformPipe} from './date-transform/date-transform.pipe';
import {NewDateTransformPipe} from './date-new-date-transform/new-date-transform.pipe';
import {GetUrlBySaveIdPipe} from './get-url-by-save-id/get-url-by-save-id.pipe';
import {KeyValueTransformPipe} from './key-value-transform/key-value-transform.pipe';
import {GetObjectByFieldsPipe} from './get-object-by-fields/get-object-by-fields.pipe';
import {FilterArrayByFieldsPipe} from './filter-array-by-fields/filter-array-by-fields.pipe';
import {ArrayFieldMapPipe} from './array-field-map/array-field-map.pipe';
import {KeysPipe} from './keys-and-values/keys.pipe';
import {ValuesPipe} from './keys-and-values/values.pipe';
import {JoinObjectByFieldPipe} from './join-object-by-field/join-object-by-field.pipe';
import {TransformInArrayPipe} from './transform-in-array/transform-in-array.pipe';
import {DatePipe} from '@angular/common';
import {HtmlTransformPipe} from './html-transform/html-transform.pipe';
import {DataThousandsPipe} from './data-thousands/data-thousands.pipe';

@NgModule({
    declarations: [
        AmountTenThousandConversionPipe,
        DateTransformPipe,
        NewDateTransformPipe,
        GetUrlBySaveIdPipe,
        KeyValueTransformPipe,
        GetObjectByFieldsPipe,
        FilterArrayByFieldsPipe,
        ArrayFieldMapPipe,
        KeysPipe,
        ValuesPipe,
        JoinObjectByFieldPipe,
        TransformInArrayPipe,
        DataThousandsPipe,
        HtmlTransformPipe
    ],
    exports: [
        AmountTenThousandConversionPipe,
        DateTransformPipe,
        NewDateTransformPipe,
        GetUrlBySaveIdPipe,
        KeyValueTransformPipe,
        FilterArrayByFieldsPipe,
        GetObjectByFieldsPipe,
        ArrayFieldMapPipe,
        KeysPipe,
        ValuesPipe,
        JoinObjectByFieldPipe,
        TransformInArrayPipe,
        DataThousandsPipe,
        HtmlTransformPipe
    ],
    providers: [
        AmountTenThousandConversionPipe,
        DateTransformPipe,
        NewDateTransformPipe,
        GetUrlBySaveIdPipe,
        KeyValueTransformPipe,
        FilterArrayByFieldsPipe,
        GetObjectByFieldsPipe,
        ArrayFieldMapPipe,
        KeysPipe,
        ValuesPipe,
        JoinObjectByFieldPipe,
        TransformInArrayPipe,
        DatePipe,
        HtmlTransformPipe
    ]
})
export class CustomPipesModule {

}

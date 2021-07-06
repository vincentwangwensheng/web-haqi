import {NgModule} from '@angular/core';
import {BsTypeComponent} from './bs-type.component';
import {TableListModule} from '../../../../components/table-list/table-list.module';
import {RootModule} from '../../../../root.module';
import {ColorPickerModule} from 'ngx-color-picker';


@NgModule({
    declarations: [BsTypeComponent],
    imports: [
        RootModule,
        ColorPickerModule,
        TableListModule
    ],
    exports: [BsTypeComponent]
})
export class BsTypeExportModule {
}

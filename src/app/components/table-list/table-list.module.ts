import {NgModule} from '@angular/core';
import {TableListComponent} from './table-list.component';
import {RootModule} from '../../root.module';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {
    MatButtonToggleModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatRippleModule,
    MatSelectModule, MatSlideToggleModule
} from '@angular/material';
import {OverlayModule} from '@angular/cdk/overlay';
import {MaterialDatePickerModule} from '../material-date-picker/material-date-picker.module';


@NgModule({
    declarations: [TableListComponent],
    imports: [
        RootModule,
        MatSelectModule,
        MatDatepickerModule,
        MatInputModule,
        MatDividerModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MaterialDatePickerModule,
        NgxDatatableModule,
        MatRippleModule,
        MatSlideToggleModule,
        MatMenuModule,
        OverlayModule,
        MatButtonToggleModule
    ],
    exports: [
        TableListComponent
    ]
})
export class TableListModule {
}

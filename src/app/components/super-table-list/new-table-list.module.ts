import {ModuleWithProviders, NgModule, Optional, SkipSelf} from '@angular/core';
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
import {DirectivesModule} from '../../directives/directives.module';
import {SuperTableListComponent, TABLE_FUNCTION, TABLE_SERVICE} from './super-table-list/super-table-list.component';
import { NgxPermissionsModule } from 'ngx-permissions';

@NgModule({
    declarations: [TableListComponent, SuperTableListComponent],
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
        MatButtonToggleModule,
        DirectivesModule,
        NgxPermissionsModule.forChild()

    ],
    exports: [
        TableListComponent,
        SuperTableListComponent
    ]
})
export class NewTableListModule {
    constructor(@Optional() @SkipSelf() parentModule: NewTableListModule) {
        if (parentModule) {
            throw new Error('TableListModule is already loaded. Import it in the AppModule only!');
        }
    }

    static forChild(tableService, functionNames?: string[]): ModuleWithProviders {
        return {
            ngModule: NewTableListModule,
            providers: [
                {
                    provide: TABLE_SERVICE,
                    useClass: tableService
                },
                {
                    provide: TABLE_FUNCTION,
                    useValue: functionNames
                }
            ]
        };
    }
}

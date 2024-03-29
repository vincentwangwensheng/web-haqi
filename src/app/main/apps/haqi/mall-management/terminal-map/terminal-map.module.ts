import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {
    MatRippleModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatDividerModule,
    MatListModule,
    MatChipsModule,
    MatAutocompleteModule, MatCheckboxModule, MatTableModule,
} from '@angular/material';
import {FuseSidebarModule} from '../../../../../../@fuse/components';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {TextFieldModule} from '@angular/cdk/text-field';
import {HistorySearchModule} from '../../../../../components/history-search/history-search.module';
import {ColorPickerModule} from 'ngx-color-picker';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {RootModule} from '../../../../../root.module';
import {DateTransformPipe} from '../../../../../pipes/date-transform/date-transform.pipe';
import {MerchantsTagManagementExportModule} from '../../merchants-tag-management/merchants-tag-management-export.module';
import {TerminalMapComponent} from './terminal-map.component';
import {AutoSelectModule} from '../../../../../components/auto-select/auto-select.module';
import {ScrollingModule} from '@angular/cdk/scrolling';

@NgModule({
    declarations: [TerminalMapComponent],
    imports: [
        FuseSidebarModule,
        RootModule,

        DragDropModule,
        TextFieldModule,
        MatMenuModule,
        MatSlideToggleModule,
        MatRippleModule,
        MatProgressSpinnerModule,
        MatExpansionModule,
        MatDividerModule,
        MatListModule,
        MatChipsModule,
        MatCheckboxModule,
        MatAutocompleteModule,
        HistorySearchModule,
        MatTableModule,
        ScrollingModule,
        AutoSelectModule,
        ColorPickerModule,
        MerchantsTagManagementExportModule,
        NgxDatatableModule,
        RouterModule.forChild([{path: '', component: TerminalMapComponent}])
    ],
    providers: [
        DateTransformPipe
    ]
})
export class TerminalMapModule {
}

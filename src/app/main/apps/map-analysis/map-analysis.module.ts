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
import {FuseSidebarModule} from '../../../../@fuse/components';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {TextFieldModule} from '@angular/cdk/text-field';
import {HistorySearchModule} from '../../../components/history-search/history-search.module';
import {ColorPickerModule} from 'ngx-color-picker';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {RootModule} from '../../../root.module';
import {DateTransformPipe} from '../../../pipes/date-transform/date-transform.pipe';
import {MerchantsTagManagementExportModule} from '../tag-management/merchants-tag-management/merchants-tag-management-export.module';
import {AutoSelectModule} from '../../../components/auto-select/auto-select.module';
import {MapAnalysisComponent} from './map-analysis.component';
import {ScrollingModule} from '@angular/cdk/scrolling';

@NgModule({
    declarations: [MapAnalysisComponent],
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
        ScrollingModule,
        MatTableModule,
        AutoSelectModule,
        ColorPickerModule,
        MerchantsTagManagementExportModule,
        NgxDatatableModule,
        RouterModule.forChild([{path: '', component: MapAnalysisComponent}])
    ],
    providers: [
        DateTransformPipe
    ]
})
export class MapAnalysisModule {
}

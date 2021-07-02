import {NgModule} from '@angular/core';
import {AirportMapComponent} from './airport-map.component';
import {RouterModule} from '@angular/router';
import {
    MatButtonModule,
    MatRippleModule,
    MatIconModule,
    MatMenuModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
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

@NgModule({
    declarations: [AirportMapComponent],
    imports: [
        FuseSidebarModule,
        RootModule,

        DragDropModule,
        TextFieldModule,
        MatFormFieldModule,

        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        MatMenuModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatRippleModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        MatInputModule,
        MatCardModule,
        MatExpansionModule,
        MatDividerModule,
        MatListModule,
        MatChipsModule,
        MatCheckboxModule,
        MatAutocompleteModule,
        HistorySearchModule,
        MatTableModule,
        ColorPickerModule,
        MerchantsTagManagementExportModule,
        NgxDatatableModule,
        RouterModule.forChild([{path: '', component: AirportMapComponent}])
    ],
    providers: [
        DateTransformPipe
    ]
})
export class AirportMapModule {
}

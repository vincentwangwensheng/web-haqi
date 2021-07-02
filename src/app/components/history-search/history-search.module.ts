import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HistorySearchComponent} from './history-search.component';
import {TranslateModule} from '@ngx-translate/core';
import {MatAutocompleteModule, MatFormFieldModule, MatIconModule, MatInputModule, MatRippleModule} from '@angular/material';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FormsModule} from '@angular/forms';

@NgModule({
    declarations: [HistorySearchComponent],
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        MatFormFieldModule,
        MatInputModule,
        MatFormFieldModule,
        MatAutocompleteModule,
        FlexLayoutModule,
        MatIconModule,
        MatRippleModule
    ],
    exports: [HistorySearchComponent]
})
export class HistorySearchModule {
}

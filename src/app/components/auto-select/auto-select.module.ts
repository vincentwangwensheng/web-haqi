import {NgModule} from '@angular/core';
import {AutoSelectComponent} from './auto-select.component';
import {RootModule} from '../../root.module';
import {MatAutocompleteModule} from '@angular/material';


@NgModule({
    declarations: [
        AutoSelectComponent
    ],
    imports: [
        MatAutocompleteModule,
        RootModule
    ],
    exports: [AutoSelectComponent]
})
export class AutoSelectModule {
}

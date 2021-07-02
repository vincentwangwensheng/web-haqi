import {NgModule} from '@angular/core';
import {MaterialDatePickerComponent} from './material-date-picker.component';
import {RootModule} from '../../root.module';
import {MatFormFieldModule, MatInputModule} from '@angular/material';
import {TextFieldModule} from '@angular/cdk/text-field';

@NgModule({
    declarations: [MaterialDatePickerComponent],
    imports: [
        RootModule,
        MatFormFieldModule,
        MatInputModule,
        TextFieldModule,
    ],
    exports: [
        MaterialDatePickerComponent
    ]
})
export class MaterialDatePickerModule {
}

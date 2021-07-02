import {NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatProgressSpinnerModule} from '@angular/material';
import {SpinnerLoadingComponent} from './spinner-loading.component';
import {RootModule} from '../../root.module';


@NgModule({
    declarations: [SpinnerLoadingComponent],
    exports: [SpinnerLoadingComponent],
    imports: [
        CommonModule,
        RootModule,
        MatProgressSpinnerModule
    ],
})
export class SpinnerLoadingModule { }

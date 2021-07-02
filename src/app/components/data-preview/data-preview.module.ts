import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RootModule} from '../../root.module';
import {DataPreviewComponent} from './data-preview.component';
import {DragDropModule} from '@angular/cdk/drag-drop';


@NgModule({
    declarations: [DataPreviewComponent],
    exports: [DataPreviewComponent],
    imports: [
        CommonModule,
        RootModule,
        DragDropModule,
    ]
})
export class DataPreviewModule {
}

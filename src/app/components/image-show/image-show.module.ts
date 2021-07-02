import {NgModule} from '@angular/core';
import {ImageShowComponent} from './image-show.component';
import {MatButtonModule, MatDialogModule, MatIconModule, MatTooltipModule} from '@angular/material';
import {ImageShowDirective} from './image-show.directive';
import {CommonModule} from '@angular/common';
import {CustomPipesModule} from '../../pipes/customPipes.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import {ImageShowService} from './image-show.service';


@NgModule({
    declarations: [ImageShowComponent, ImageShowDirective],
    imports: [
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        CustomPipesModule,
        FlexLayoutModule,
        CommonModule
    ],
    exports: [ImageShowDirective],
    providers: [ImageShowService],
    entryComponents: [ImageShowComponent]
})
export class ImageShowModule {
}

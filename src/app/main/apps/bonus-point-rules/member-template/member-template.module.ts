import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MemberTemplateComponent} from './member-template.component';
import {RootModule} from '../../../../root.module';
import {MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule} from '@angular/material';
import {DragDropModule} from '@angular/cdk/drag-drop';



@NgModule({
    declarations: [MemberTemplateComponent],
    exports: [MemberTemplateComponent],
    imports: [
        RootModule,
        CommonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        DragDropModule,
  ]
})
export class MemberTemplateModule { }

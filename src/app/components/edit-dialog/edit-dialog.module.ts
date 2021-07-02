import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatButtonModule, MatDialogModule, MatIconModule} from '@angular/material';
import {TranslateModule} from '@ngx-translate/core';
import {EditDialogComponent} from './edit-dialog.component';
import {SharedModule} from '../../../@fuse/shared.module';



@NgModule({
  declarations: [EditDialogComponent],
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    SharedModule,
    TranslateModule
  ],
  exports: [EditDialogComponent]
})
export class EditDialogModule { }

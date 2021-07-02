import { NgModule } from '@angular/core';
import {ConditionsComponent} from './conditions.component';
import {RouterModule} from '@angular/router';
import {MatDatepickerModule, MatDividerModule, MatFormFieldModule, MatIconModule, MatInputModule, MatListModule, MatSelectModule, MatTreeModule} from '@angular/material';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../../../../../../@fuse/shared.module';

@NgModule({
  declarations: [ConditionsComponent],
  imports: [
    RouterModule,

    MatDividerModule,
    MatListModule,
    MatTreeModule,
    MatIconModule,
    CommonModule,
    MatInputModule,
    MatDatepickerModule,
    MatFormFieldModule,
    SharedModule,
    MatSelectModule
  ],
  exports: [
    ConditionsComponent
  ]
})
export class ConditionsModule { }

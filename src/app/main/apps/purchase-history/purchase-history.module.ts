import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {PurchaseHistoryComponent} from './purchase-history.component';
import {RootModule} from '../../../root.module';
import {TableListModule} from '../../../components/table-list/table-list.module';
import {RouterModule} from '@angular/router';
import {NewDateTransformPipe} from '../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {MatFormFieldModule} from '@angular/material';

@NgModule({
  declarations: [PurchaseHistoryComponent],
    imports: [
        CommonModule,
        RootModule,
        TableListModule,
        RouterModule.forChild([{path: '', component: PurchaseHistoryComponent}]),
        MatFormFieldModule
    ],
  providers: [
    NewDateTransformPipe
  ]
})
export class PurchaseHistoryModule { }

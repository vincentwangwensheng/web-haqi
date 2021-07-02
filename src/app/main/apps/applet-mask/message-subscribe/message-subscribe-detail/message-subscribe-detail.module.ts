import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RootModule} from '../../../../../root.module';
import {TableListModule} from '../../../../../components/table-list/table-list.module';
import {TranslateModule} from '@ngx-translate/core';
import {RouterModule} from '@angular/router';
import {NewDateTransformPipe} from '../../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {MessageSubscribeDetailComponent} from './message-subscribe-detail.component';
import {MatCheckboxModule, MatRadioModule, MatSlideToggleModule, MatTabsModule} from '@angular/material';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {TabsVerticalModule} from '../../../../../components/tabs-vertical/tabs-vertical.module';
import {MessageSubscribeService} from '../message-subscribe.service';



@NgModule({
  declarations: [MessageSubscribeDetailComponent],
    imports: [
        CommonModule,
        RootModule,
        TableListModule,
        TranslateModule,
        NgxDatatableModule,
        TabsVerticalModule,
        MatSlideToggleModule,
        RouterModule.forChild([{path: '', component: MessageSubscribeDetailComponent}]),
        MatTabsModule,
        MatCheckboxModule,
        MatRadioModule
    ],
  providers: [
    NewDateTransformPipe,
      MessageSubscribeService
  ]
})
export class MessageSubscribeDetailModule { }

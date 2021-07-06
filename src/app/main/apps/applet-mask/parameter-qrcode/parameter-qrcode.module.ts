import { NgModule } from '@angular/core';
import {ParameterQRCodeComponent} from './parameter-qrcode.component';
import {CommonModule} from '@angular/common';
import {RootModule} from '../../../../root.module';
import {RouterModule} from '@angular/router';
import {MallManageExportModule} from '../../haqi/mall-management/mall-manage/mall-manage-export.module';
import {AutoSelectModule} from '../../../../components/auto-select/auto-select.module';
import {TableListModule} from '../../../../components/table-list/table-list.module';
import {EditDialogModule} from '../../../../components/edit-dialog/edit-dialog.module';
import {CouponManageService} from '../../haqi/coupon-manage/coupon-manage.service';
import {ContentManageService} from '../../haqi/contentManage/content-manage.service';
import {StoreManageExportModule} from '../../haqi/mall-management/store-mange/store-manage-export.module';
import {ActivityListExportModule} from '../../haqi/coupon-manage/activity-list/activity-list-export.module';
import {MessageSubscribeService} from '../message-subscribe/message-subscribe.service';

@NgModule({
  declarations: [
    ParameterQRCodeComponent
  ],
  imports: [
    CommonModule,
    RootModule,
    EditDialogModule,
    TableListModule,
    AutoSelectModule,
    MallManageExportModule,
    RouterModule.forChild([{path: '', component: ParameterQRCodeComponent}]),
    StoreManageExportModule,
    ActivityListExportModule
  ],
  providers: [
    CouponManageService,
    ContentManageService,
    MessageSubscribeService
  ]
})
export class ParameterQRCodeModule { }

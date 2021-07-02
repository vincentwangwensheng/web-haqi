import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ActivityAnalysisComponent} from './activity-analysis.component';
import {RootModule} from '../../../../root.module';
import {RouterModule} from '@angular/router';
import {
    MatDatepickerModule, MatDialogModule,
    MatFormFieldModule,
    MatIconModule, MatInputModule,
    MatMenuModule,
    MatSelectModule, MatTableModule,
    MatTabsModule, MatTooltipModule
} from '@angular/material';
import {TranslateModule} from '@ngx-translate/core';
import {ChartsModule} from 'ng2-charts';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {SharedModule} from '../../../../../@fuse/shared.module';
import {FuseDemoModule, FuseSidebarModule, FuseWidgetModule} from '../../../../../@fuse/components';



@NgModule({
  declarations: [ActivityAnalysisComponent],
  imports: [
      CommonModule,
      RootModule,
      MatFormFieldModule,
      MatIconModule,
      MatMenuModule,
      MatSelectModule,
      MatTabsModule,
      TranslateModule,
      MatDatepickerModule,
      MatInputModule,
      MatTableModule,
      ChartsModule,
      NgxChartsModule,
      MatTooltipModule,
      SharedModule,
      FuseWidgetModule,
      FuseSidebarModule,
      FuseDemoModule,
      MatDialogModule,
      RouterModule.forChild([{path: '', component: ActivityAnalysisComponent}])
  ]
})
export class ActivityAnalysisModule { }

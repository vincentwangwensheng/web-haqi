import { NgModule } from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {PassengersAnalysisComponent} from './passengers-analysis.component';
import {
  MatButtonModule, MatCardModule,
  MatDatepickerModule, MatDialogModule,
  MatFormFieldModule,
  MatIconModule, MatInputModule,
  MatMenuModule,
  MatSelectModule, MatTableModule,
  MatTabsModule, MatTooltipModule
} from '@angular/material';
import {ChartsModule} from 'ng2-charts';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {SharedModule} from '../../../../@fuse/shared.module';
import {FuseDemoModule, FuseSidebarModule, FuseWidgetModule} from '../../../../@fuse/components';
import {TranslateModule} from '@ngx-translate/core';
import {MaterialDatePickerModule} from '../../../components/material-date-picker/material-date-picker.module';

const routes: Routes = [
  {path: '', component: PassengersAnalysisComponent}
];
@NgModule({
  declarations: [PassengersAnalysisComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    MatButtonModule,
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
    NgxChartsModule,
    MatTooltipModule,
    SharedModule,
    FuseWidgetModule,
    FuseSidebarModule,
    FuseDemoModule,
    MatDialogModule,
    MatCardModule,
    MaterialDatePickerModule,
  ],
  providers: [
    DatePipe
  ]
})
export class PassengersAnalysisModule { }

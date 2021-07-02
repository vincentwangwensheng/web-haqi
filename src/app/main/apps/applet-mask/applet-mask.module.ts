import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AppletMaskComponent} from './applet-mask.component';
import {RouterModule} from '@angular/router';
import {TableListModule} from '../../../components/table-list/table-list.module';
import {RootModule} from '../../../root.module';
import {NewDateTransformPipe} from '../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {TranslateModule} from '@ngx-translate/core';



@NgModule({
  declarations: [AppletMaskComponent],
  imports: [
      CommonModule,
      RootModule,
      TableListModule,
      TranslateModule,
      RouterModule.forChild([{path: '', component: AppletMaskComponent}])
  ],
    providers: [
        NewDateTransformPipe
    ]
})
export class AppletMaskModule { }

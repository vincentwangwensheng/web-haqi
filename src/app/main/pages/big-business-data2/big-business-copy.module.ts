import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BigBusinessCopyComponent} from './big-business-copy.component';
import {TranslateModule} from '@ngx-translate/core';
import {MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatInputModule} from '@angular/material';
import {CustomPipesModule} from '../../../pipes/customPipes.module';
import {RouterModule} from '@angular/router';
import {SharedModule} from '../../../../@fuse/shared.module';


const routes = [
    {
        path: 'bigBusinessData2',
        component: BigBusinessCopyComponent
    }
];

@NgModule({
  declarations: [BigBusinessCopyComponent],
  imports: [
      RouterModule.forChild(routes),
      CommonModule,
      MatButtonModule,
      MatCheckboxModule,
      MatFormFieldModule,
      MatIconModule,
      MatInputModule,
      SharedModule,
      TranslateModule,
      CustomPipesModule
  ]
})
export class BigBusinessCopyModule { }

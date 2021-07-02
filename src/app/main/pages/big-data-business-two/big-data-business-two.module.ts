import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BigDataBusinessTwoComponent} from './big-data-business-two.component';
import {RouterModule} from '@angular/router';
import {MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatInputModule} from '@angular/material';
import {TranslateModule} from '@ngx-translate/core';
import {SharedModule} from '../../../../@fuse/shared.module';
import {CustomPipesModule} from '../../../pipes/customPipes.module';

const routes = [
    {
        path: 'bigDataBusinessTwo',
        component: BigDataBusinessTwoComponent
    }
];

@NgModule({
  declarations: [BigDataBusinessTwoComponent],
  imports: [
      CommonModule,
      RouterModule.forChild(routes),
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
export class BigDataBusinessTwoModule { }

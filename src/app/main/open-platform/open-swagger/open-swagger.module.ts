import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {OpenSwaggerComponent} from './open-swagger.component';
import {TranslateModule} from '@ngx-translate/core';
import {MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatInputModule} from '@angular/material';
import {SharedModule} from '../../../../@fuse/shared.module';
import {CustomPipesModule} from '../../../pipes/customPipes.module';
import {RouterModule} from '@angular/router';

const routes = [
    {
        path     : '',
        component: OpenSwaggerComponent
    }
];

@NgModule({
  declarations: [OpenSwaggerComponent],
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
export class OpenSwaggerModule { }

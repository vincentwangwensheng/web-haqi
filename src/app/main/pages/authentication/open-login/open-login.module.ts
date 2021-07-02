import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from '../../../../../@fuse/shared.module';
import {MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatInputModule} from '@angular/material';
import {CustomPipesModule} from '../../../../pipes/customPipes.module';
import {TranslateModule} from '@ngx-translate/core';
import {RouterModule} from '@angular/router';
import {OpenLoginComponent} from './open-login.component';
import {ConfirmDialogModule} from '../../../../components/confirm-dialog/confirm-dialog.module';

const routes = [
    {
        path     : 'openLogin',
        component: OpenLoginComponent
    }
];

@NgModule({
  declarations: [OpenLoginComponent],
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
      CustomPipesModule,
      ConfirmDialogModule
  ]
})
export class OpenLoginModule { }

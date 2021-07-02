import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HomePageComponent} from './home-page.component';
import {MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatInputModule} from '@angular/material';
import {TranslateModule} from '@ngx-translate/core';
import {CustomPipesModule} from '../../../../pipes/customPipes.module';
import {RouterModule} from '@angular/router';
import {SharedModule} from '../../../../../@fuse/shared.module';

const routes = [
    {
        path     : 'home',
        component: HomePageComponent
    }
];

@NgModule({
  declarations: [HomePageComponent],
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
export class HomePageModule { }

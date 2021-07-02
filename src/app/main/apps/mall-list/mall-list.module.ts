import { NgModule } from '@angular/core';
import {RouterModule} from '@angular/router';
import {MallListExportModule} from './mall-list-export.module';
import {MallListComponent} from './mall-list.component';

const routes = [{
  path: '',
  component: MallListComponent
}];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
      MallListExportModule
  ]
})
export class MallListModule { }

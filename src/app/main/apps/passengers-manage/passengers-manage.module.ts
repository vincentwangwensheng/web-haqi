import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PassengersManageComponent} from './passengers-manage.component';
import {PassengersManageExportModule} from './passengers-manage-export.module';

const routes: Routes = [
  {
    path     : '',
    component: PassengersManageComponent,
  }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        PassengersManageExportModule,
    ]
})
export class PassengersManageModule { }

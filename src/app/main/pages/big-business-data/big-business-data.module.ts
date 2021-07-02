import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BigBusinessDataComponent} from './big-business-data.component';
import {RouterModule} from '@angular/router';
import {MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatInputModule, MatMenuModule} from '@angular/material';
import {SharedModule} from '../../../../@fuse/shared.module';
import {CustomPipesModule} from '../../../pipes/customPipes.module';
import {TranslateModule} from '@ngx-translate/core';

const routes = [
    {
        path: 'bigBusinessData',
        component: BigBusinessDataComponent
    }
];

@NgModule({
    declarations: [BigBusinessDataComponent],
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
export class BigBusinessDataModule {
}

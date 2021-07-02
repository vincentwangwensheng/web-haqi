import {NgModule} from '@angular/core';
import {GameDetailComponent} from './game-detail.component';
import {RootModule} from '../../../../root.module';
import {RouterModule} from '@angular/router';
import {MaterialDatePickerModule} from '../../../../components/material-date-picker/material-date-picker.module';
import {MallManageExportModule} from '../../mall-manage/mall-manage-export.module';
import {MatSlideToggleModule} from '@angular/material';


@NgModule({
    declarations: [GameDetailComponent],
    imports: [
        RootModule,
        RouterModule.forChild([{path: '', component: GameDetailComponent}]),
        MaterialDatePickerModule,
        MallManageExportModule,
        MatSlideToggleModule
    ]
})
export class GameDetailModule {
}

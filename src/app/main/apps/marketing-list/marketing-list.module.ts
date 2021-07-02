import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {SharedModule} from '../../../../@fuse/shared.module';
import {MatButtonModule, MatIconModule, MatMenuModule, MatSnackBarModule, MatTooltipModule , MatFormFieldModule,
                                               MatTableModule , MatSortModule, MatPaginatorModule, MatCheckboxModule } from '@angular/material';
import {ConfirmDialogModule} from '../../../components/confirm-dialog/confirm-dialog.module';
import {FuseSidebarModule} from '../../../../@fuse/components';
import {TranslateModule} from '@ngx-translate/core';
import {MarketingListComponent} from  "./marketing-list.component";

@NgModule({
    declarations: [MarketingListComponent],
    imports: [
        SharedModule,
        FuseSidebarModule,

        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        MatMenuModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatCheckboxModule,
        MatFormFieldModule,
        TranslateModule,

        ConfirmDialogModule,
        MatSnackBarModule,

        RouterModule.forChild([{path: '', component: MarketingListComponent}])
    ]
})
export class MarketingListModule {
}

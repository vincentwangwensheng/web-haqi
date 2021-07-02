import {NgModule} from '@angular/core';
import {MatDividerModule, MatIconModule, MatListModule, MatSlideToggleModule, MatTooltipModule} from '@angular/material';

import {SharedModule} from '@fuse/shared.module';

import {QuickPanelComponent} from 'app/layout/components/quick-panel/quick-panel.component';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
    declarations: [
        QuickPanelComponent
    ],
    imports: [
        MatDividerModule,
        MatListModule,
        MatSlideToggleModule,

        MatIconModule,
        MatTooltipModule,

        SharedModule,
        TranslateModule
    ],
    exports: [
        QuickPanelComponent
    ]
})
export class QuickPanelModule {
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule, MatDividerModule, MatFormFieldModule, MatIconModule, MatInputModule, MatListModule, MatMenuModule, MatTooltipModule } from '@angular/material';
import { CookieService } from 'ngx-cookie-service';

import { FuseShortcutsComponent } from './shortcuts.component';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule} from '@angular/forms';

@NgModule({
    declarations: [
        FuseShortcutsComponent
    ],
    imports     : [
        CommonModule,
        FormsModule,
        RouterModule,

        FlexLayoutModule,

        MatButtonModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatListModule,
        MatTooltipModule,

        TranslateModule
    ],
    exports     : [
        FuseShortcutsComponent
    ],
    providers   : [
        CookieService
    ]
})
export class FuseShortcutsModule
{
}

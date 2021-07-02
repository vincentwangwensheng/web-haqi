import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatInputModule, MatMenuModule, MatSnackBarModule} from '@angular/material';

import { SharedModule } from '@fuse/shared.module';
import {Login2Component} from './login-2.component';
import {TranslateModule} from '@ngx-translate/core';


const routes = [
    {
        path     : 'login',
        component: Login2Component
    }
];

@NgModule({
    declarations: [
        Login2Component
    ],
    imports     : [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatMenuModule,
        MatSnackBarModule,
        MatInputModule,

        TranslateModule,

        SharedModule


    ]
})
export class Login2Module
{
}

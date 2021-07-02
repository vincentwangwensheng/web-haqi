import {NgModule} from '@angular/core';
import {SharedModule} from '../@fuse/shared.module';
import {TranslateModule} from '@ngx-translate/core';
import {ConfirmDialogModule} from './components/confirm-dialog/confirm-dialog.module';
import {
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule, MatInputModule, MatSelectModule,
    MatSnackBarModule,
    MatTooltipModule
} from '@angular/material';
import {CustomPipesModule} from './pipes/customPipes.module';
import {QuillModule} from 'ngx-quill';
import {NewDateTransformPipe} from './pipes/date-new-date-transform/new-date-transform.pipe';
import {DirectivesModule} from './directives/directives.module';


// 基础引用模块 包含fuse中的模块 国际化模块、 弹框模块 通知栏模块等基础模块
@NgModule({
    imports: [
        SharedModule,
        TranslateModule,
        ConfirmDialogModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatDividerModule,
        MatIconModule,
        MatSelectModule,
        MatSnackBarModule,
        MatTooltipModule,
        MatCardModule,
        DirectivesModule,
        CustomPipesModule,
        // 初始化默认配置的quill富文本编辑器
        QuillModule.forRoot( {
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                    ['blockquote', 'code-block'],

                    [{'header': 1}, {'header': 2}],               // custom button values
                    [{'list': 'ordered'}, {'list': 'bullet'}],
                    [{'script': 'sub'}, {'script': 'super'}],      // superscript/subscript
                    [{'indent': '-1'}, {'indent': '+1'}],          // outdent/indent
                    [{'direction': 'rtl'}],                         // text direction

                    [{'size': ['small', false, 'large', 'huge']}],  // custom dropdown
                    [{'header': [1, 2, 3, 4, 5, 6, false]}],

                    [{'color': []}, {'background': []}],          // dropdown with defaults from theme
                    [{'font': []}],
                    [{'align': []}],

                    ['clean'],                                         // remove formatting button

                    ['image']                         // media
                ]
            }
        })
    ],
    exports: [
        SharedModule,
        TranslateModule,
        ConfirmDialogModule,
        MatDialogModule,
        MatDividerModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatIconModule,
        MatTooltipModule,
        MatSnackBarModule,
        MatCardModule,
        DirectivesModule,
        CustomPipesModule,
        QuillModule
    ],
    providers: [
        // 管道
        NewDateTransformPipe
    ]
})
export class RootModule {
}

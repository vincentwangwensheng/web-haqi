import {
    Directive,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    Output,
    Renderer2
} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {FileUploadService} from './file-upload.service';

@Directive({
    selector: '[appFileUpload]'
})
export class FileUploadDirective implements OnInit, OnDestroy {
    @Input('appFileUpload')
    upload: any | { multi?: boolean, params?: { maxCount?: number, existCount?: number, maxSize?: number, sizeType?: 'mb' | 'kb' | 'b', accept?: string } };

    @Input()
    boxShadow = false;

    @Input()
    disabled = false;

    // 上传结果  返回false为开始，遇到异常会返回true，否则结束后单个上传返回{data:id,fileName:xxx.jpg} 多文件上传返回[id1,id2,...]
    @Output()
    uploadProgress: EventEmitter<any> = new EventEmitter<any>();

    constructor(private element?: ElementRef,
                private renderer?: Renderer2,
                private snackBar?: MatSnackBar,
                private fileUpload?: FileUploadService) {
    }

    ngOnInit(): void {
        this.renderer.setStyle(this.element.nativeElement, 'cursor', 'pointer');
        if (this.boxShadow) {
            this.renderer.addClass(this.element.nativeElement, 'dark-box-shadow-hover');
        }
        this.fileUpload.onUpload.subscribe(res => {
            this.uploadProgress.emit(res);
        });
    }

    @HostListener('click')
    onClick() {
        if (!this.disabled) {
            if (!this.upload) {
                this.upload = {params: {}};
            }
            if (this.upload.multi) {
                if (!this.upload.params) {
                    this.upload.params = {};
                }
                this.fileUpload.uploadMultiFiles(this.upload.params.maxCount, this.upload.params.existCount, this.upload.params.maxSize, this.upload.params.sizeType, this.upload.params.accept).then(res => {
                    this.uploadProgress.emit(res);
                }, reason => {
                    this.uploadProgress.emit(true);
                    this.snackBar.open(reason, '✖');
                });
            } else {
                this.fileUpload.uploadFile(this.upload.params.maxSize, this.upload.params.sizeType, this.upload.params.accept).then(res => {
                    this.uploadProgress.emit(res);
                }, reason => {
                    this.uploadProgress.emit(true);
                    this.snackBar.open(reason, '✖');
                });
            }
        }

    }

    ngOnDestroy(): void {
        this.uploadProgress.complete();
    }
}

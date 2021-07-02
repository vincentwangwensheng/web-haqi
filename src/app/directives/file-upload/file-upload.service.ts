import {Injectable} from '@angular/core';
import {forkJoin, Observable, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {MatSnackBar} from '@angular/material';

@Injectable()
export class FileUploadService {
    onUpload = new Subject(); // 上传进度控制 true 开始 false结束

    constructor(
        private http?: HttpClient,
        private snackBar?: MatSnackBar
    ) {
    }


    /**
     *
     * @param maxSize 上传大小
     * @param sizeType  大小单位 mb kb
     * @param accept
     */
    uploadFile(maxSize?, sizeType?: 'mb' | 'kb' | 'b', accept?: string) {
        return new Promise<any>((resolve, reject) => {
            const inputElement = document.createElement('input');
            inputElement.setAttribute('type', 'file');
            inputElement.setAttribute('accept', accept ? accept : 'image/*');
            inputElement.hidden = true;
            inputElement.addEventListener('change', () => {
                const file = inputElement.files[0];
                if (!accept && !file.type.includes('image')) {
                    console.log(file);
                    console.error('请选择图片文件');
                    reject('请选择图片文件！');
                    return;
                } else if (accept && accept.includes('video') && !file.type.includes('video')) {
                    console.log(file);
                    console.error('请选择视频文件');
                    reject('请选择视频文件！');
                    return;
                }
                if (maxSize && sizeType) {
                    let maxSizeCount = 0;
                    switch (sizeType) {
                        case 'mb': {
                            maxSizeCount = maxSize * 1024 * 1024;
                            break;
                        }
                        case 'kb': {
                            maxSizeCount = maxSize * 1024;
                            break;
                        }
                        case 'b': {
                            maxSizeCount = maxSize;
                            break;
                        }
                    }
                    if (file.size > maxSizeCount) {
                        this.snackBar.open('单个文件超出上传大小 ' + maxSize + sizeType + ' ，请重新选择支持大小的文件之后上传！', '✖');
                        return;
                    }
                }
                const fileName = file['name'];
                const formData = new FormData();
                formData.append('files', file);
                this.onUpload.next(false);
                this.http.post(sessionStorage.getItem('baseUrl') + 'file/api/file/upload', formData).subscribe(res => {
                    if (res) {
                        resolve({data: res, fileName: fileName});
                    } else {
                        reject('获取saveId失败！');
                    }
                    inputElement.remove();
                }, error1 => {
                    reject('接口调用失败！');
                    inputElement.remove();
                });
            });
            inputElement.click();
        });
    }

    /**
     *
     * @param maxCount  最大上传数量
     * @param existCount  已传数量
     * @param maxSize  最大文件大小
     * @param sizeType   文件大小单位 mb为1024*1024 kb 1024 b 1
     * @param accept
     */
    uploadMultiFiles(maxCount?: number, existCount?: number, maxSize?: number, sizeType?: 'mb' | 'kb' | 'b', accept?: string) {
        return new Promise<any>((resolve, reject) => {
            const inputElement: HTMLInputElement = document.createElement('input');
            inputElement.setAttribute('type', 'file');
            inputElement.setAttribute('multiple', 'true');
            inputElement.setAttribute('accept', accept ? accept : 'image/*');
            inputElement.hidden = true;
            inputElement.addEventListener('change', () => {
                const files = inputElement.files;
                // 超出剩余可传数量
                if (files.length > (maxCount - existCount)) {
                    this.snackBar.open('超出最大上传数量' + (maxCount - existCount) + '，请重新选择最大上传数量以下后上传', '✖');
                    return;
                } else {
                    let overSize = false;
                    let maxSizeCount = 0;
                    maxSize = maxSize ? maxSize : 0;
                    switch (sizeType) {
                        case 'mb': {
                            maxSizeCount = maxSize * 1024 * 1024;
                            break;
                        }
                        case 'kb': {
                            maxSizeCount = maxSize * 1024;
                            break;
                        }
                        case 'b': {
                            maxSizeCount = maxSize;
                            break;
                        }
                        default : {
                            maxSizeCount = null;
                        }
                    }
                    const fileObservables: Observable<any>[] = [];
                    for (let i = 0; i < files.length; i++) { // 也可用Array.from转化FileList为数组
                        if (maxSizeCount && files.item(i).size > maxSizeCount) {
                            overSize = true;
                        }
                        const formData = new FormData();
                        formData.append('files', files.item(i));
                        fileObservables.push(this.http.post(sessionStorage.getItem('baseUrl') + 'file/api/file/upload', formData));
                    }
                    // 单个超出大小
                    if (overSize) {
                        this.snackBar.open('单个文件超出上传大小 ' + maxSize + sizeType + ' ，请重新选择支持大小的文件之后上传！', '✖');
                        return;
                    }
                    this.onUpload.next(false);
                    forkJoin(fileObservables).subscribe(res => {
                        resolve(res);
                        inputElement.remove();
                    }, error1 => {
                        inputElement.remove();
                        reject(error1);
                    });
                }
            });
            inputElement.click();
        });
    }

}

import {Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-spinner-loading',
    templateUrl: './spinner-loading.component.html',
    styleUrls: ['./spinner-loading.component.scss']
})
export class SpinnerLoadingComponent implements OnInit {

    @Input()
    showData: any;

    constructor() {
    }

    ngOnInit() {
        if (!this.showData) {
            this.showData = 'loading...';
        }
    }

}

/** 使用方法 **/
// ========不带百分比数字的方法========================================================
// 1. html 中添加  如下
// <ng-template #loadTg>
//     <app-spinner-loading></app-spinner-loading>
// </ng-template>
// 2. 声明一个   @ViewChild('loadTg', {static: true}) loadTg: TemplateRef<any> ;
// 3. 打开弹框
//  const dialog = this.dialog.open(this.loadTg, {
//             id: 'loadingDialog', width: '100%' , height: '100%'
//         });
//      dialog.afterOpened().subscribe(re => {
//             this.batteryListService.batteryExport(0, 0x3f3f3f3f, 'lastModifiedDate,desc', this.multiSearch, this.filter).subscribe(
//                 res => {
//                      接口可换，接口反应结束，拿到结果就关掉弹框
//                     if (res['type'] === 4) {
//                         this.fileDownload.blobDownload(res['body'], '电池导出列表.csv');
//                     }
//                 },
//                 error1 => { dialog.close();  }  ,
//                 () => { dialog.close();  }
//             );
//         });
// 4. css中添加
// ::ng-deep{
//   #loadingDialog{
//     padding: 0!important;
//     background-color: rgba(255 , 255, 255 , 0.1);
//   }
// }
// ============带百分比数字===========================================================
// 1. html 中添加  如下
// <ng-template #loadTg>
//     <app-spinner-loading [showData]="loadingShowData"></app-spinner-loading>
// </ng-template>
// 2. ts 中添加      @ViewChild('loadTg', {static: true}) loadTg: TemplateRef<any> ;
// 3. 打开弹框
//   this.loadingShowData = '0%';
//   const dialog = this.dialog.open(this.loadTg, {
//                     id: 'loadingDialog', width: '100%' , height: '100%' ,  data: {id: 'loading'}
//                 });
//                 dialog.afterOpened().subscribe(re => {
//                     this.carModelService.carModelImport(formData).subscribe(res => {
//                         let pros = '';
//                         if (res.type === 1) {
//                             const load  = res['loaded'] ? res['loaded'] : 0 ;
//                             const total = res['total'] ? res['total'] : 0 ;
//                             pros = ((load / total) * 100).toFixed(0) ;
//                         }
//                         if (this.loadingShowData !==  '100%'){
//                             this.loadingShowData = pros === 'NaN' ? '0%' : (pros + '%');
//                         }
//                         if (res['type'] === 4){
//
//                             dialog.close();
//                         }
//
//                     }, error1 => {
//                         dialog.close();
//
//                     } , () => {  dialog.close(); });
//                 });
// 4. 添加css
// ::ng-deep{
//   #loadingDialog{
//     padding: 0!important;
//     background-color: rgba(255 , 255, 255 , 0.1);
//   }
// }
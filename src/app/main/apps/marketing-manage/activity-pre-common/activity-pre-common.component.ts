import {AfterViewInit, Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-activity-pre-common',
  templateUrl: './activity-pre-common.component.html',
  styleUrls: ['./activity-pre-common.component.scss']
})
export class ActivityPreCommonComponent implements OnInit , AfterViewInit {


   @Input()
   AcPre: any;


    preImgSource = [];
  constructor() { }

  ngOnInit() {

      this.AcPre.cover = sessionStorage.getItem('baseUrl') + 'file/api/file/showImg?saveId=' + this.AcPre.cover;
      if (this.AcPre.couType === 'DEFAULT' ||  this.AcPre.couType === 'GROUPBUY' || this.AcPre.couType === 'POINT' || this.AcPre.couType === 'AR'){
          const cou_len = this.AcPre.couDe.length;
          for ( let i = 0 ; i < cou_len ; i ++) {
              if (cou_len.length !== 0) {
                  const cou_ = this.AcPre.couDe[i];
                  let im = 300;
                  im = im * (i + 0.5);
                  setTimeout( () => {
                      this.ToPreImg_ac(cou_, i);
                  } , im);
              }
          }
      }  else if (this.AcPre.couType === 'GROUP'){
           let allI = 0;
           if (this.AcPre.couA.length > 0) {
               for ( let i = 0 ; i < this.AcPre.couA.length ; i++) {
                   this.ToPreImg_ac(this.AcPre.couA[i] , allI);
                   allI++;
               }
           }

          if (this.AcPre.couB.length > 0) {
              for ( let i = 0 ; i < this.AcPre.couB.length ; i++) {
                  this.ToPreImg_ac(this.AcPre.couB[i] , allI);
                  allI++;
              }
          }

          if (this.AcPre.couOth.length > 0) {
              for ( let i = 0 ; i < this.AcPre.couOth.length ; i++) {
                  const cou_arr = this.AcPre.couOth[i];
                  for (let y = 0 ; y < cou_arr.length ; y++ ) {
                      this.ToPreImg_ac(cou_arr[y] , allI);
                      allI++;
                  }
              }
          }

      }

  }


    // 活动请求预览图片
    ToPreImg_ac(cou_ , id){
        this.preImgSource[id] = {name: cou_.name , useImgBg: sessionStorage.getItem('baseUrl') + 'file/api/file/showImg?saveId=' +  cou_.image  };
    }

    ngAfterViewInit(): void {
        const acTextContent = document.getElementById('acTeTextContent');
        const  v = acTextContent.innerHTML.replace(/&amp;nbsp;/g , '').replace(/"/g, '').replace(/&lt;/g, '<').replace(/&gt;/g , '>').replace(/<br>/g , '\n');
        acTextContent.innerHTML = v ;
        const v_node = acTextContent.childNodes;
        for (let i = 0 ; i < v_node.length ; i ++  ){
            if (v_node[i].nodeName !== '#text') {
                const ch = v_node[i];
                ch['style'].margin = '0px';
                ch['style'].wordBreak = 'break-word';
                ch['style'].letterSpacing = '2px';
                ch['style'].lineHeight = '2.2rem';
                ch['style'].fontSize = '10px';

            }
        }
    }




}

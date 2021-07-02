import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-tabs-vertical',
  templateUrl: './tabs-vertical.component.html',
  styleUrls: ['./tabs-vertical.component.scss']
})
export class TabsVerticalComponent implements OnInit {
  @Input()
  tabsForbid = false;
  @Input()
  itemList = [];
  @Input()
  itemInfo = null;
  @Output()
  sendItemInfo: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

  getPositionInfo(index){
    this.itemList.forEach(item => {
      if (item['index'] === index){
        this.itemInfo['name'] = item['name'];
        this.itemInfo['index'] = item['index'];
      }
    });
    this.sendItemInfo.emit(this.itemInfo);
  }

  // 下一步(父组件中直接调用)
  nextStep(){
    const index = this.itemInfo['index'];
    if (index === this.itemList.length){
      this.itemInfo['name'] = this.itemList[0]['name'];
      this.itemInfo['index'] = this.itemList[0]['index'];
    } else {
      this.itemInfo['name'] = this.itemList[index]['name'];
      this.itemInfo['index'] = this.itemList[index]['index'];
    }
  }

  // 上一步(父组件中直接调用)
  lastStep(){
    const index = this.itemInfo['index'];
    if (index !== 1) {
      this.itemInfo['name'] = this.itemList[index - 2]['name'];
      this.itemInfo['index'] = this.itemList[index - 2]['index'];
    }
  }

}

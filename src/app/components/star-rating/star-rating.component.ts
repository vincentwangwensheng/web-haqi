import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {CouponParameter} from '../../services/EcouponService/CouponParameter';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss']
})
export class StarRatingComponent implements OnInit , OnDestroy ,  OnChanges{

    private _unsubscribeAll: Subject<any> = new Subject();
    sysPra: SysPra;

    @Input()
    starRating: number;

    @Input()
    readonly: false;

    @Output()
    RatingNumber: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
    this.sysPra = new SysPra();
    this.sysPra.starSource = [];
    if (!this.starRating) {
        this.sysPra.starRating = 0;
        this.starRating = 0;
    } else {
        this.sysPra.starRating = this.starRating;
    }
    this.initStarNum(this.starRating);
  }

    // 处理星星 给星星数据赋值
    initStarNum(starP){
        const star_ra = starP + '';
        let star_rat = star_ra;
        if (star_ra.includes('.')) {
            star_rat = star_ra.substring(0 , star_ra.indexOf('.'));
        }
        const star_rating = Number(star_rat);
        for (let i = 1 ; i <= 5 ; i ++) {
            if (i > star_rating ) {
                this.sysPra.starSource[i - 1] = 0;
            } else {
                this.sysPra.starSource[i - 1 ] = 1 ;
            }
        }
    }

    // 星星事件
    changeStar(i , star){
        if (star === 1) {
            i = i - 1;
        }
        this.sysPra.starRating = i + 1;
        this.initStarNum(this.sysPra.starRating);
        this.RatingNumber.emit(this.sysPra.starRating);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    ngOnChanges(changes: SimpleChanges): void {
        for (const propName in changes) {
            const chng = changes[propName];
            if (chng.currentValue !== undefined && chng.currentValue !== 'undefined') {
                if (!this.sysPra) {
                    this.sysPra = new SysPra();
                }
                this.sysPra.starSource = [];
                this.initStarNum(chng.currentValue);
            }

        }
    }

}


export class SysPra {
    starRating: number;
    starSource: any;  //  星级评价需用的变量
}
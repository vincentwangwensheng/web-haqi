import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CouponLotComponent } from './coupon-lot.component';

describe('CouponLotComponent', () => {
  let component: CouponLotComponent;
  let fixture: ComponentFixture<CouponLotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CouponLotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CouponLotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

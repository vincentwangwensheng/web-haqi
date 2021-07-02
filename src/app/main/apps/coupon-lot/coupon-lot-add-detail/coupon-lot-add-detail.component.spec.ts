import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CouponLotAddDetailComponent } from './coupon-lot-add-detail.component';

describe('CouponLotAddDetailComponent', () => {
  let component: CouponLotAddDetailComponent;
  let fixture: ComponentFixture<CouponLotAddDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CouponLotAddDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CouponLotAddDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

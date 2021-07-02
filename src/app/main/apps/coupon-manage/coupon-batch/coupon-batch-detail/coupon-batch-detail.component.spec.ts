import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CouponBatchDetailComponent } from './coupon-batch-detail.component';

describe('CouponBatchDetailComponent', () => {
  let component: CouponBatchDetailComponent;
  let fixture: ComponentFixture<CouponBatchDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CouponBatchDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CouponBatchDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

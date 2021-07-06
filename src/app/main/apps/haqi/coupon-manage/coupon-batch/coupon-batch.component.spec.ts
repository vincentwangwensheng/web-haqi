import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CouponBatchComponent } from './coupon-batch.component';

describe('CouponBatchComponent', () => {
  let component: CouponBatchComponent;
  let fixture: ComponentFixture<CouponBatchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CouponBatchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CouponBatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

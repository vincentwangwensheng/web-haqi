import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CouponMaintainComponent } from './coupon-maintain.component';

describe('CouponMaintainComponent', () => {
  let component: CouponMaintainComponent;
  let fixture: ComponentFixture<CouponMaintainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CouponMaintainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CouponMaintainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

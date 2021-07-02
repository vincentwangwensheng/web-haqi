import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CouponPushComponent } from './coupon-push.component';

describe('CouponPushComponent', () => {
  let component: CouponPushComponent;
  let fixture: ComponentFixture<CouponPushComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CouponPushComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CouponPushComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

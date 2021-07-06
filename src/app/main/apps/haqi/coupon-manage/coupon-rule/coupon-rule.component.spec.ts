import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CouponRuleComponent } from './coupon-rule.component';

describe('CouponRuleComponent', () => {
  let component: CouponRuleComponent;
  let fixture: ComponentFixture<CouponRuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CouponRuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CouponRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

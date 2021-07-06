import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CouponRuleDetailComponent } from './coupon-rule-detail.component';

describe('CouponRuleDetailComponent', () => {
  let component: CouponRuleDetailComponent;
  let fixture: ComponentFixture<CouponRuleDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CouponRuleDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CouponRuleDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

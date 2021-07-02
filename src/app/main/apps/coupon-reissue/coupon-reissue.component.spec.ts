import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CouponReissueComponent } from './coupon-reissue.component';

describe('CouponReissueComponent', () => {
  let component: CouponReissueComponent;
  let fixture: ComponentFixture<CouponReissueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CouponReissueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CouponReissueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

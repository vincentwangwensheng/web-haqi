import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CouponTemplateComponent } from './coupon-template.component';

describe('CouponTemplateComponent', () => {
  let component: CouponTemplateComponent;
  let fixture: ComponentFixture<CouponTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CouponTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CouponTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

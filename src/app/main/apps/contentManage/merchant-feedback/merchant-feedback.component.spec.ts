import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantFeedbackComponent } from './merchant-feedback.component';

describe('MerchantFeedbackComponent', () => {
  let component: MerchantFeedbackComponent;
  let fixture: ComponentFixture<MerchantFeedbackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MerchantFeedbackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

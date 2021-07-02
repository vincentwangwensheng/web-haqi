import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentRecordDetailComponent } from './payment-record-detail.component';

describe('PaymentRecordDetailComponent', () => {
  let component: PaymentRecordDetailComponent;
  let fixture: ComponentFixture<PaymentRecordDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentRecordDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentRecordDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

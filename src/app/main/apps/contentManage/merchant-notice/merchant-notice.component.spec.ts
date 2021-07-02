import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantNoticeComponent } from './merchant-notice.component';

describe('MerchantNoticeComponent', () => {
  let component: MerchantNoticeComponent;
  let fixture: ComponentFixture<MerchantNoticeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MerchantNoticeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantNoticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

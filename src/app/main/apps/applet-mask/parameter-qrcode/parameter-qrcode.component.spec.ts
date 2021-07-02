import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParameterQRCodeComponent } from './parameter-qrcode.component';

describe('ParameterQRCodeComponent', () => {
  let component: ParameterQRCodeComponent;
  let fixture: ComponentFixture<ParameterQRCodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParameterQRCodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParameterQRCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

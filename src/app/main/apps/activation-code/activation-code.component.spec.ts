import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivationCodeComponent } from './activation-code.component';

describe('ActivationCodeComponent', () => {
  let component: ActivationCodeComponent;
  let fixture: ComponentFixture<ActivationCodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivationCodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivationCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

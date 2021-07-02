import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IntegralAdjustmentComponent } from './integral-adjustment.component';

describe('IntegralAdjustmentComponent', () => {
  let component: IntegralAdjustmentComponent;
  let fixture: ComponentFixture<IntegralAdjustmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IntegralAdjustmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntegralAdjustmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

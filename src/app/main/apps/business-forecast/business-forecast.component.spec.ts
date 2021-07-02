import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessForecastComponent } from './business-forecast.component';

describe('BusinessForecastComponent', () => {
  let component: BusinessForecastComponent;
  let fixture: ComponentFixture<BusinessForecastComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BusinessForecastComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessForecastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

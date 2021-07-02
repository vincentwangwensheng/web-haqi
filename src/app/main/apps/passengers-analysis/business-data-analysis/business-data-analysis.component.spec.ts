import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessDataAnalysisComponent } from './business-data-analysis.component';

describe('BusinessDataAnalysisComponent', () => {
  let component: BusinessDataAnalysisComponent;
  let fixture: ComponentFixture<BusinessDataAnalysisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BusinessDataAnalysisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessDataAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalysisOfMarketingDataComponent } from './analysis-of-marketing-data.component';

describe('AnalysisOfMarketingDataComponent', () => {
  let component: AnalysisOfMarketingDataComponent;
  let fixture: ComponentFixture<AnalysisOfMarketingDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnalysisOfMarketingDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalysisOfMarketingDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

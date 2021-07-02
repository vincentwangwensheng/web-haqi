import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityAnalysisComponent } from './activity-analysis.component';

describe('ActivityAnalysisComponent', () => {
  let component: ActivityAnalysisComponent;
  let fixture: ComponentFixture<ActivityAnalysisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityAnalysisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

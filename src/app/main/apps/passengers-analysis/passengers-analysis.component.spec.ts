import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PassengersAnalysisComponent } from './passengers-analysis.component';

describe('PassengersAnalysisComponent', () => {
  let component: PassengersAnalysisComponent;
  let fixture: ComponentFixture<PassengersAnalysisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PassengersAnalysisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PassengersAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

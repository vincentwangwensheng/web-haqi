import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapAnalysisComponent } from './map-analysis.component';

describe('MapAnalysisComponent', () => {
  let component: MapAnalysisComponent;
  let fixture: ComponentFixture<MapAnalysisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapAnalysisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

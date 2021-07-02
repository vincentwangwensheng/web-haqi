import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportUpTemplateComponent } from './report-up-template.component';

describe('ReportUpTemplateComponent', () => {
  let component: ReportUpTemplateComponent;
  let fixture: ComponentFixture<ReportUpTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportUpTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportUpTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

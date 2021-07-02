import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportMainManageComponent } from './report-main-manage.component';

describe('ReportMainManageComponent', () => {
  let component: ReportMainManageComponent;
  let fixture: ComponentFixture<ReportMainManageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportMainManageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportMainManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

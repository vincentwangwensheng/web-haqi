import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityPreCommonComponent } from './activity-pre-common.component';

describe('ActivityPreCommonComponent', () => {
  let component: ActivityPreCommonComponent;
  let fixture: ComponentFixture<ActivityPreCommonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityPreCommonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityPreCommonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

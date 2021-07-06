import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityListDetailComponent } from './activity-list-detail.component';

describe('ActivityListDetailComponent', () => {
  let component: ActivityListDetailComponent;
  let fixture: ComponentFixture<ActivityListDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityListDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityListDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

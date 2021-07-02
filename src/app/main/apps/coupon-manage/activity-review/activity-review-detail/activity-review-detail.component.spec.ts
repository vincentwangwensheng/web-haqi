import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityReviewDetailComponent } from './activity-review-detail.component';

describe('ActivityReviewDetailComponent', () => {
  let component: ActivityReviewDetailComponent;
  let fixture: ComponentFixture<ActivityReviewDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityReviewDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityReviewDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpinionFeedbackComponent } from './opinion-feedback.component';

describe('OpinionFeedbackComponent', () => {
  let component: OpinionFeedbackComponent;
  let fixture: ComponentFixture<OpinionFeedbackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpinionFeedbackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpinionFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

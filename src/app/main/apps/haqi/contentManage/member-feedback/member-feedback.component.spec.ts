import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberFeedbackComponent } from './member-feedback.component';

describe('MemberFeedbackComponent', () => {
  let component: MemberFeedbackComponent;
  let fixture: ComponentFixture<MemberFeedbackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MemberFeedbackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

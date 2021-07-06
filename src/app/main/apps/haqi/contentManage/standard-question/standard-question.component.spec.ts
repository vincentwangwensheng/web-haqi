import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StandardQuestionComponent } from './standard-question.component';

describe('StandardQuestionComponent', () => {
  let component: StandardQuestionComponent;
  let fixture: ComponentFixture<StandardQuestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StandardQuestionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StandardQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

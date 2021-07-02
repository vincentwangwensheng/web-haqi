import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WriteIdeaSetUpComponent } from './write-idea-set-up.component';

describe('WriteIdeaSetUpComponent', () => {
  let component: WriteIdeaSetUpComponent;
  let fixture: ComponentFixture<WriteIdeaSetUpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WriteIdeaSetUpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WriteIdeaSetUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

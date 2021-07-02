import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WriteIdeaControlComponent } from './write-idea-control.component';

describe('WriteIdeaControlComponent', () => {
  let component: WriteIdeaControlComponent;
  let fixture: ComponentFixture<WriteIdeaControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WriteIdeaControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WriteIdeaControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

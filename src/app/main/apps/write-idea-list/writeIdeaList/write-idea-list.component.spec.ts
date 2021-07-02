import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WriteIdeaListComponent } from './write-idea-list.component';

describe('WriteIdeaListComponent', () => {
  let component: WriteIdeaListComponent;
  let fixture: ComponentFixture<WriteIdeaListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WriteIdeaListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WriteIdeaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

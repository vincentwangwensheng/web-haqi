import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WriteIdeaDetailComponent } from './write-idea-detail.component';

describe('WriteIdeaDetailComponent', () => {
  let component: WriteIdeaDetailComponent;
  let fixture: ComponentFixture<WriteIdeaDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WriteIdeaDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WriteIdeaDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

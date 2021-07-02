import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RelationPassengerTagsComponent } from './relation-passenger-tags.component';

describe('RelationPassengerTagsComponent', () => {
  let component: RelationPassengerTagsComponent;
  let fixture: ComponentFixture<RelationPassengerTagsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RelationPassengerTagsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RelationPassengerTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

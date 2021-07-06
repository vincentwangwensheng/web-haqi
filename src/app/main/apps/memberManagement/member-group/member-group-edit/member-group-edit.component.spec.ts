import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberGroupEditComponent } from './member-group-edit.component';

describe('MemberGroupEditComponent', () => {
  let component: MemberGroupEditComponent;
  let fixture: ComponentFixture<MemberGroupEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MemberGroupEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberGroupEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

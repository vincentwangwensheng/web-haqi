import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberGroupAddComponent } from './member-group-add.component';

describe('MemberGroupAddComponent', () => {
  let component: MemberGroupAddComponent;
  let fixture: ComponentFixture<MemberGroupAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MemberGroupAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberGroupAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

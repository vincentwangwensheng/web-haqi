import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberCardDetailComponent } from './member-card-detail.component';

describe('MemberCardDetailComponent', () => {
  let component: MemberCardDetailComponent;
  let fixture: ComponentFixture<MemberCardDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MemberCardDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberCardDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

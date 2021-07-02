import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MembersSettingDetailComponent } from './members-setting-detail.component';

describe('MembersSettingDetailComponent', () => {
  let component: MembersSettingDetailComponent;
  let fixture: ComponentFixture<MembersSettingDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MembersSettingDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MembersSettingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

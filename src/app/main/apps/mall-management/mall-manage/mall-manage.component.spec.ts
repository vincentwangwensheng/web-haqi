import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MallManageComponent } from './mall-manage.component';

describe('MallManageComponent', () => {
  let component: MallManageComponent;
  let fixture: ComponentFixture<MallManageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MallManageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MallManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

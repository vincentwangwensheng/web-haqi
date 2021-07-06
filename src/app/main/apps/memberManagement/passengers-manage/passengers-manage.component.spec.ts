import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PassengersManageComponent } from './passengers-manage.component';

describe('PassengersManageComponent', () => {
  let component: PassengersManageComponent;
  let fixture: ComponentFixture<PassengersManageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PassengersManageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PassengersManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

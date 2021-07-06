import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PassengersManageDetailComponent } from './passengers-manage-detail.component';

describe('PassengersManageDetailComponent', () => {
  let component: PassengersManageDetailComponent;
  let fixture: ComponentFixture<PassengersManageDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PassengersManageDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PassengersManageDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

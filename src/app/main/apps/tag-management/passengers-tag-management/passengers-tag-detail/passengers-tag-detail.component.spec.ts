import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PassengersTagDetailComponent } from './passengers-tag-detail.component';

describe('PassengersTagDetailComponent', () => {
  let component: PassengersTagDetailComponent;
  let fixture: ComponentFixture<PassengersTagDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PassengersTagDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PassengersTagDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

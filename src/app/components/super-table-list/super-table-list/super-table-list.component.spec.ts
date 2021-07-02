import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperTableListComponent } from './super-table-list.component';

describe('SuperTableListComponent', () => {
  let component: SuperTableListComponent;
  let fixture: ComponentFixture<SuperTableListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuperTableListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuperTableListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

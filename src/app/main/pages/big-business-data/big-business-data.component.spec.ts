import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BigBusinessDataComponent } from './big-business-data.component';

describe('BigBusinessDataComponent', () => {
  let component: BigBusinessDataComponent;
  let fixture: ComponentFixture<BigBusinessDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BigBusinessDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BigBusinessDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

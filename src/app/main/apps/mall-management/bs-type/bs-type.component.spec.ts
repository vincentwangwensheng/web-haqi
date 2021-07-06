import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BsTypeComponent } from './bs-type.component';

describe('BsTypeComponent', () => {
  let component: BsTypeComponent;
  let fixture: ComponentFixture<BsTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BsTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BsTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

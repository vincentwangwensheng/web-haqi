import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenSwaggerComponent } from './open-swagger.component';

describe('OpenSwaggerComponent', () => {
  let component: OpenSwaggerComponent;
  let fixture: ComponentFixture<OpenSwaggerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenSwaggerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenSwaggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

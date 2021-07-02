import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeveloperDataComponent } from './developer-data.component';

describe('DeveloperDataComponent', () => {
  let component: DeveloperDataComponent;
  let fixture: ComponentFixture<DeveloperDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeveloperDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeveloperDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

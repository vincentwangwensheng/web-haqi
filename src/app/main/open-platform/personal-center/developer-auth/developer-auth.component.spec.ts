import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeveloperAuthComponent } from './developer-auth.component';

describe('DeveloperAuthComponent', () => {
  let component: DeveloperAuthComponent;
  let fixture: ComponentFixture<DeveloperAuthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeveloperAuthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeveloperAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AirportMapComponent } from './airport-map.component';

describe('AirportMapComponent', () => {
  let component: AirportMapComponent;
  let fixture: ComponentFixture<AirportMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AirportMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AirportMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

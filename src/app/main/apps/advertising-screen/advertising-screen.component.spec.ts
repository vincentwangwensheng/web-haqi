import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvertisingScreenComponent } from './advertising-screen.component';

describe('AdvertisingScreenComponent', () => {
  let component: AdvertisingScreenComponent;
  let fixture: ComponentFixture<AdvertisingScreenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdvertisingScreenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvertisingScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

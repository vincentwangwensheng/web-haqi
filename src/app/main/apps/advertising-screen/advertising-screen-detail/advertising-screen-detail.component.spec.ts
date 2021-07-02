import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvertisingScreenDetailComponent } from './advertising-screen-detail.component';

describe('AdvertisingScreenDetailComponent', () => {
  let component: AdvertisingScreenDetailComponent;
  let fixture: ComponentFixture<AdvertisingScreenDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdvertisingScreenDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvertisingScreenDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

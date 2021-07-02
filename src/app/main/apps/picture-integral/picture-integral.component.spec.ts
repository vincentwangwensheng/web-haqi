import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PictureIntegralComponent } from './picture-integral.component';

describe('PictureIntegralComponent', () => {
  let component: PictureIntegralComponent;
  let fixture: ComponentFixture<PictureIntegralComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PictureIntegralComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PictureIntegralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

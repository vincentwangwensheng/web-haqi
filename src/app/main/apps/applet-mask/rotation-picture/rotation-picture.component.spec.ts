import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RotationPictureComponent } from './rotation-picture.component';

describe('RotationPictureComponent', () => {
  let component: RotationPictureComponent;
  let fixture: ComponentFixture<RotationPictureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RotationPictureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RotationPictureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

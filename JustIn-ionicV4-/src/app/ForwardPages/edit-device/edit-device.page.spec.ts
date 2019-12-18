import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDevicePage } from './edit-device.page';

describe('EditDevicePage', () => {
  let component: EditDevicePage;
  let fixture: ComponentFixture<EditDevicePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditDevicePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditDevicePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

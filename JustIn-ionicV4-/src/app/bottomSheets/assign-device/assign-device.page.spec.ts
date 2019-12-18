import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignDevicePage } from './assign-device.page';

describe('AssignDevicePage', () => {
  let component: AssignDevicePage;
  let fixture: ComponentFixture<AssignDevicePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignDevicePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignDevicePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

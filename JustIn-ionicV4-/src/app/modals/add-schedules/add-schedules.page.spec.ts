import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSchedulesPage } from './add-schedules.page';

describe('AddSchedulesPage', () => {
  let component: AddSchedulesPage;
  let fixture: ComponentFixture<AddSchedulesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddSchedulesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSchedulesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

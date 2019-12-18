import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SitesPage } from './sites.page';

describe('SitesPage', () => {
  let component: SitesPage;
  let fixture: ComponentFixture<SitesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SitesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SitesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { InitialDataSaveService } from './initial-data-save.service';

describe('InitialDataSaveService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InitialDataSaveService = TestBed.get(InitialDataSaveService);
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { AirbnService } from './airbn-service';

describe('AirbnService', () => {
  let service: AirbnService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AirbnService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

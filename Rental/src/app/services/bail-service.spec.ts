import { TestBed } from '@angular/core/testing';

import { BailService } from './bail-service';

describe('BailService', () => {
  let service: BailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

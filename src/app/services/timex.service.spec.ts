import { TestBed } from '@angular/core/testing';

import { TimexService } from './timex.service';

describe('TimexService', () => {
  let service: TimexService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimexService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

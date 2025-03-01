import { TestBed } from '@angular/core/testing';

import { DummiesService } from './dummies.service';

describe('DummiesService', () => {
  let service: DummiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DummiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { QuestSevice } from './quest-service';

describe('QuestSevice', () => {
  let service: QuestSevice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuestSevice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

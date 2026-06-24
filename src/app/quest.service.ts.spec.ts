import { TestBed } from '@angular/core/testing';

import { QuestServiceTs } from './quest.service.ts';

describe('QuestServiceTs', () => {
  let service: QuestServiceTs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuestServiceTs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

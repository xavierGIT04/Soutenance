import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContratsTab } from './contrats-tab';

describe('ContratsTab', () => {
  let component: ContratsTab;
  let fixture: ComponentFixture<ContratsTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContratsTab]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContratsTab);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

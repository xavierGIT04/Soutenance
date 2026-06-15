import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BailComponent } from './bail-component';

describe('BailComponent', () => {
  let component: BailComponent;
  let fixture: ComponentFixture<BailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

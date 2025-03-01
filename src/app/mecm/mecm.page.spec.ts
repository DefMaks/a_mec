import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MecmPage } from './mecm.page';

describe('MecmPage', () => {
  let component: MecmPage;
  let fixture: ComponentFixture<MecmPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MecmPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

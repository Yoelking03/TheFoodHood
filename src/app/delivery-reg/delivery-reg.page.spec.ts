import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeliveryRegPage } from './delivery-reg.page';

describe('DeliveryRegPage', () => {
  let component: DeliveryRegPage;
  let fixture: ComponentFixture<DeliveryRegPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliveryRegPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StoreAutoRenewablesComponent } from './store-auto-renewables.component';

describe('StoreAutoRenewablesComponent', () => {
  let component: StoreAutoRenewablesComponent;
  let fixture: ComponentFixture<StoreAutoRenewablesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreAutoRenewablesComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StoreAutoRenewablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

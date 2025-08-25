import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule, Platform } from '@ionic/angular';
import { Router } from '@angular/router';

import { SignupPage } from './signup.page';
import { ContentService } from '../../content.service';
import { FeedbackService } from '../../feedback.service';
import { DarkModeService } from '../../dark-mode.service';
import { environment } from '../../../environments/environment';
import { UtilitiesModule } from 'src/app/components/utilities.module';

describe('SignupPage', () => {
  let component: SignupPage;
  let fixture: ComponentFixture<SignupPage>;
  let httpController: HttpTestingController;
  let router: Router;
  let feedbackService: jasmine.SpyObj<FeedbackService>;
  let darkModeService: jasmine.SpyObj<DarkModeService>;
  let platform: jasmine.SpyObj<Platform>;

  beforeEach(async () => {
    const contentServiceSpy = jasmine.createSpyObj('ContentService', ['get']);
    const feedbackServiceSpy = jasmine.createSpyObj('FeedbackService', ['registerNow']);
    const darkModeServiceSpy = jasmine.createSpyObj('DarkModeService', ['isAvailableAndEnabled']);
    const platformSpy = jasmine.createSpyObj('Platform', ['is']);

    await TestBed.configureTestingModule({
      declarations: [SignupPage],
      imports: [
        IonicModule.forRoot(),
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        UtilitiesModule
      ],
      providers: [
        { provide: ContentService, useValue: contentServiceSpy },
        { provide: FeedbackService, useValue: feedbackServiceSpy },
        { provide: DarkModeService, useValue: darkModeServiceSpy },
        { provide: Platform, useValue: platformSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignupPage);
    component = fixture.componentInstance;
    httpController = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    feedbackService = TestBed.inject(FeedbackService) as jasmine.SpyObj<FeedbackService>;
    darkModeService = TestBed.inject(DarkModeService) as jasmine.SpyObj<DarkModeService>;
    platform = TestBed.inject(Platform) as jasmine.SpyObj<Platform>;

    darkModeService.isAvailableAndEnabled.and.returnValue(Promise.resolve(false));
    platform.is.and.returnValue(false);
  });

  afterEach(() => {
    httpController.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /*describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.currentStep).toBe(1);
      expect(component.useDarkMode).toBe(false);
      expect(component.formIsLoading).toBe(false);
      expect(component.form).toBeDefined();
      expect(component.passwordToggle).toBeDefined();
      expect(component.passwordConfirmToggle).toBeDefined();
    });

    it('should set dark mode on initialization', async () => {
      darkModeService.isAvailableAndEnabled.and.returnValue(Promise.resolve(true));
      await component.ngOnInit();
      expect(component.useDarkMode).toBe(true);
    });
  });

  describe('Form Validation and Steps', () => {
    it('should set correct validators for step 1 (email)', () => {
      component.currentStep = 1;
      component.setValidatorsForCurrentStep();
      
      const emailControl = component.form.get('email');
      expect(emailControl?.hasError('required')).toBe(true);
      
      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBe(true);
      
      emailControl?.setValue('test@example.com');
      expect(emailControl?.valid).toBe(true);
    });

    it('should set correct validators for step 2 (names)', () => {
      component.currentStep = 2;
      component.setValidatorsForCurrentStep();
      
      const firstnameControl = component.form.get('firstname');
      const lastnameControl = component.form.get('lastname');
      
      expect(firstnameControl?.hasError('required')).toBe(true);
      expect(lastnameControl?.hasError('required')).toBe(true);
      
      firstnameControl?.setValue('John');
      lastnameControl?.setValue('Doe');
      
      expect(firstnameControl?.valid).toBe(true);
      expect(lastnameControl?.valid).toBe(true);
    });

    it('should set correct validators for step 3 (password)', () => {
      component.currentStep = 3;
      component.setValidatorsForCurrentStep();
      
      const passwordControl = component.form.get('password');
      const passwordConfirmControl = component.form.get('password_confirm');
      
      expect(passwordControl?.hasError('required')).toBe(true);
      expect(passwordConfirmControl?.hasError('required')).toBe(true);
    });

    it('should set correct validators for step 4 (conditions)', () => {
      component.currentStep = 4;
      component.setValidatorsForCurrentStep();
      
      const acceptConditionsControl = component.form.get('acceptConditions');
      expect(acceptConditionsControl?.hasError('required')).toBe(true);
    });
  });

  describe('Email Validation Step', () => {
    beforeEach(() => {
      component.currentStep = 1;
      component.setValidatorsForCurrentStep();
    });

    it('should not proceed if email is invalid', async () => {
      component.form.get('email')?.setValue('invalid-email');
      await component.validateEmail();
      
      expect(component.currentStep).toBe(1);
      expect(component.formIsLoading).toBe(false);
    });

    it('should proceed to step 2 if email is available', async () => {
      component.form.get('email')?.setValue('test@example.com');
      
      const validateEmailPromise = component.validateEmail();
      
      const req = httpController.expectOne(`${environment.apiEndpoint}/users-check-email-availability?email=test@example.com`);
      req.flush({ available: true });
      
      await validateEmailPromise;
      
      expect(component.currentStep).toBe(2);
      expect(component.formIsLoading).toBe(false);
    });

    it('should show error if email is not available', async () => {
      component.form.get('email')?.setValue('taken@example.com');
      
      const validateEmailPromise = component.validateEmail();
      
      const req = httpController.expectOne(`${environment.apiEndpoint}/users-check-email-availability?email=taken@example.com`);
      req.flush({ available: false });
      
      await validateEmailPromise;
      
      expect(component.currentStep).toBe(1);
      expect(feedbackService.registerNow).toHaveBeenCalledWith("L'email est déjà utilisé", 'danger');
    });

    it('should handle network errors during email validation', async () => {
      component.form.get('email')?.setValue('test@example.com');
      
      const validateEmailPromise = component.validateEmail();
      
      const req = httpController.expectOne(`${environment.apiEndpoint}/users-check-email-availability?email=test@example.com`);
      req.flush(null, { status: 500, statusText: 'Server Error' });
      
      await validateEmailPromise;
      
      expect(component.currentStep).toBe(1);
      expect(feedbackService.registerNow).toHaveBeenCalled();
    });
  });

  describe('Names Validation Step', () => {
    beforeEach(() => {
      component.currentStep = 2;
      component.setValidatorsForCurrentStep();
    });

    it('should not proceed if names are invalid', () => {
      component.form.get('firstname')?.setValue('');
      component.form.get('lastname')?.setValue('');
      
      component.validateNames();
      
      expect(component.currentStep).toBe(2);
    });

    it('should proceed to step 3 if names are valid', () => {
      component.form.get('firstname')?.setValue('John');
      component.form.get('lastname')?.setValue('Doe');
      
      component.validateNames();
      
      expect(component.currentStep).toBe(3);
    });
  });

  describe('Password Validation Step', () => {
    beforeEach(() => {
      component.currentStep = 3;
      component.setValidatorsForCurrentStep();
    });

    it('should not proceed if passwords are invalid', async () => {
      component.form.get('password')?.setValue('');
      component.form.get('password_confirm')?.setValue('');
      
      await component.submitForm();
      
      expect(component.currentStep).toBe(3);
    });

    it('should show error if passwords do not match', async () => {
      component.form.get('password')?.setValue('password123');
      component.form.get('password_confirm')?.setValue('different123');
      
      await component.submitForm();
      
      expect(component.displayedError.password_confirm).toBe('Les mots de passe ne correspondent pas');
      expect(component.currentStep).toBe(3);
    });

    it('should proceed to step 4 if passwords match', async () => {
      component.form.get('password')?.setValue('password123');
      component.form.get('password_confirm')?.setValue('password123');
      
      await component.submitForm();
      
      expect(component.currentStep).toBe(4);
    });
  });

  describe('Final Submission Step', () => {
    beforeEach(() => {
      component.currentStep = 4;
      component.form.patchValue({
        email: 'test@example.com',
        firstname: 'John',
        lastname: 'Doe',
        password: 'password123',
        password_confirm: 'password123',
        acceptConditions: true
      });
      component.setValidatorsForCurrentStep();
    });

    it('should not submit if conditions are not accepted', async () => {
      component.form.get('acceptConditions')?.setValue(false);
      
      await component.submitForm();
      
      expect(feedbackService.registerNow).toHaveBeenCalledWith(
        'Vous devez accepter les conditions générales d\'utilisation', 
        'danger'
      );
    });

    it('should submit successfully with valid data', async () => {
      spyOn(router, 'navigate');
      
      const submitPromise = component.submitForm();
      
      const req = httpController.expectOne(`${environment.apiEndpoint}/users`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        email: 'test@example.com',
        firstname: 'John',
        lastname: 'Doe',
        password: 'password123',
        password_confirm: 'password123',
        acceptConditions: true
      });
      
      req.flush({ success: true });
      
      await submitPromise;
      
      expect(feedbackService.registerNow).toHaveBeenCalledWith(
        'Inscription effectuée, vous pouvez désormais vous connecter'
      );
      expect(router.navigate).toHaveBeenCalledWith(['/verify-mail']);
    });

    it('should handle validation errors from server', async () => {
      const submitPromise = component.submitForm();
      
      const req = httpController.expectOne(`${environment.apiEndpoint}/users`);
      req.flush({ errors: { email: ['Email already exists'] } }, { status: 422, statusText: 'Validation Error' });
      
      await submitPromise;
      
      expect(component.displayedError.email).toEqual(['Email already exists']);
      expect(component.formIsLoading).toBe(false);
    });

    it('should handle network errors', async () => {
      const submitPromise = component.submitForm();
      
      const req = httpController.expectOne(`${environment.apiEndpoint}/users`);
      req.flush(null, { status: 0, statusText: 'Network Error' });
      
      await submitPromise;
      
      expect(feedbackService.registerNow).toHaveBeenCalledWith(
        'Veuillez vérifier votre connexion internet',
        'danger'
      );
    });

    it('should handle server errors', async () => {
      const submitPromise = component.submitForm();
      
      const req = httpController.expectOne(`${environment.apiEndpoint}/users`);
      req.flush(null, { status: 500, statusText: 'Server Error' });
      
      await submitPromise;
      
      expect(feedbackService.registerNow).toHaveBeenCalledWith('Erreur 500', 'danger');
    });
  });

  describe('Navigation Methods', () => {
    it('should go back to previous step', () => {
      component.currentStep = 3;
      component.goBack();
      expect(component.currentStep).toBe(2);
    });

    it('should not go below step 1', () => {
      component.currentStep = 1;
      component.goBack();
      expect(component.currentStep).toBe(1);
    });

    it('should navigate to login with Google token', () => {
      spyOn(router, 'navigate');
      
      component.loginWithGoogle({ google_token: 'test_token' });
      
      expect(router.navigate).toHaveBeenCalledWith(['/login'], {
        queryParams: { google_token: 'test_token' }
      });
    });
  });

  describe('Conditions Toggle', () => {
    it('should toggle conditions acceptance', () => {
      component.form.get('acceptConditions')?.setValue(false);
      
      component.toggleConditions();
      
      expect(component.form.get('acceptConditions')?.value).toBe(true);
    });

    it('should clear errors when toggling conditions', () => {
      component.displayedError.acceptConditions = 'Some error';
      
      component.toggleConditions();
      
      expect(component.displayedError.acceptConditions).toBeUndefined();
    });
  });

  describe('CGU Opening', () => {
    it('should open CGU in browser on web platform', () => {
      spyOn(window, 'open');
      platform.is.and.returnValue(false);
      
      component.openCGU();
      
      expect(window.open).toHaveBeenCalledWith(
        environment.rootEndpoint + environment.cgu_uri,
        '_blank'
      );
    });

    it('should open CGU with capacitor browser on mobile', async () => {
      platform.is.and.returnValue(true);
      
      // Mock Browser.open since it's from Capacitor
      const mockBrowserOpen = jasmine.createSpy('Browser.open');
      (window as any).Browser = { open: mockBrowserOpen };
      
      component.openCGU();
      
      // We can't easily test Capacitor Browser.open without more complex mocking
      // This test verifies the platform check logic
      expect(platform.is).toHaveBeenCalledWith('capacitor');
    });
  });

  describe('Error Management', () => {
    it('should clear displayed errors', () => {
      component.displayedError = {
        email: 'Some error',
        firstname: 'Another error',
        lastname: undefined,
        password: undefined,
        password_confirm: undefined,
        acceptConditions: undefined
      };
      
      component.clearDisplayedErrors();
      
      Object.values(component.displayedError).forEach(error => {
        expect(error).toBeUndefined();
      });
    });
  });*/
});
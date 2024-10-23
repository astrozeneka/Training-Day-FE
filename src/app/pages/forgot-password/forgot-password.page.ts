import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ContentService} from "../../content.service";
import {Router} from "@angular/router";
import {FeedbackService} from "../../feedback.service";
import {catchError, finalize, throwError} from "rxjs";
import { ThemeDetection, ThemeDetectionResponse } from '@ionic-native/theme-detection/ngx';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  })
  displayedError = {
    email: ''
  }
  isLoading: boolean = false;

  constructor(
    private contentService: ContentService,
    private router: Router,
    private feedbackService: FeedbackService,
    private themeDetection: ThemeDetection
  ) { }

  async ngOnInit() {

    // 1. Checking if the darkmode is enabled
    try {
      this.useDarkMode = await this.isDarkModeAvailable() && (await this.isDarkModeEnabled()).value;
    } catch (e) {
      console.log("Getting device theme not available on web");
    }
  }

  submit(){
    this.isLoading = true;
    this.contentService.post('/password-reset', this.form.value)
      .pipe(catchError(error=>{
        if(error.status == 403){
          this.feedbackService.register("L'adresse email n'existe pas, veuillez entrer une adresse email inscrite sur la plateforme")
          this.router.navigate(['/login'])
        }
        return throwError(error)
      }), finalize(()=>{this.isLoading = false}))
      .subscribe(async(res)=>{
        //this.feedbackService.register("L'email de vérification a été envoyé à l'adresse email indiquée")
        this.feedbackService.register(
          null,
          'success',
          {
            type: 'modal',
            modalTitle: 'Email envoyé',
            modalContent: "L'email de vérification a été envoyé à l'adresse email indiquée",
            primaryButtonText: "Retour à la page d'accueil",
            primaryButtonAction: '/home',
            secondaryButtonText: "Se connecter",
            secondaryButtonAction: '/login',
            modalImage: this.useDarkMode ? 'assets/logo-dark-cropped.png' : 'assets/logo-light-cropped.png',
          }
        )
        this.router.navigate(['/login'])
      })
  }

  /**
   * 
   * The code below is really redundant and should be refactored
   */
  useDarkMode: boolean = true;
  private async isDarkModeAvailable(): Promise<any> {
    try {
      let dark_mode_available: ThemeDetectionResponse = await this.themeDetection.isAvailable();
      return dark_mode_available;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
  private async isDarkModeEnabled(): Promise<ThemeDetectionResponse> {
    try {
      let dark_mode_enabled: ThemeDetectionResponse = await this.themeDetection.isDarkModeEnabled();
      return dark_mode_enabled;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}

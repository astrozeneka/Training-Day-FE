import { FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { Browser } from "@capacitor/browser";
import { ThemeDetection } from "@ionic-native/theme-detection/ngx";
import { Platform } from "@ionic/angular";
import { DarkModeService } from "src/app/dark-mode.service";
import { FeedbackService } from "src/app/feedback.service";
import { environment } from "src/environments/environment";


export abstract class AbstractPurchaseInvoicePage {

  // Generic properties used by both iOS and android
  isLoading: boolean = false;
  loadingStep: string = null;

  // Used for both iOS and Android
  productList:any = {} // Bound to the Store
  productId:string|undefined = undefined
  
  constructor(
    protected platform: Platform,
    protected router: Router,
    private dms: DarkModeService,
    protected feedbackService: FeedbackService
  ) { }

  /**
   * Compute productType based on the producdtID
   * @param productId 
   * @returns 
   */
  protected getProductType(productId:string) {
    let inappSlugs = ["foodcoach", "sportcoach", "trainer"];
    let subsSlugs = ["hoylt", "moreno", "smiley", "gursky", "alonzo"];
    for(var i = 0; i < inappSlugs.length; i++) {
      if(productId.includes(inappSlugs[i])) {
        return 'inapp'
      }
    }
    for(var i = 0; i < subsSlugs.length; i++) {
      if(productId.includes(subsSlugs[i])) {
        return 'subs'
      }
    }
    return 'null'
  }


  openCGV(){
    let url = environment.rootEndpoint + environment.cgv_uri
    if (this.platform.is('capacitor')) {
      Browser.open({url: url})
    }else{
      window.open(url, '_blank')
    }
  }

  /**
   * Redirect with feedback depending on the purchased product
   */
  protected async redirectWithFeedback(){
    // The code below is redundant, should be refactored
    let feedbackOpts = {
      type: 'modal',
      buttonText: null,
      primaryButtonText: (this.productId.includes('foodcoach') || this.productId.includes('smiley')) ? 'Prendre contact avec mon nutritionniste' : 'Prendre contact avec mon coach',
      secondaryButtonText: 'Retour à l\'accueil',
      primaryButtonAction: '/messenger-master',
      secondaryButtonAction: '/home',
      modalImage: (await this.dms.isAvailableAndEnabled()) ? 'assets/logo-dark-cropped.png' : 'assets/logo-light-cropped.png',
    }
    if(["hoylt", "gursky", "moreno", "smiley", "alonzo"].includes(this.productId)){ // Auto-renewables
      this.feedbackService.register(
        null,
        'success',
        {
          modalTitle: "Votre achat d'abonnement a été effectué",
          modalContent: 'Bienvenue chez Training Day vous pouvez dès à présent prendre rendez-vous avez votre ' +
            (["smiley"].includes(this.productId) ? "nutritionniste" : "coach"),
          ...feedbackOpts
        }
      )
    } else{ // Non-renewables
      let content;
      if(this.productId.includes('foodcoach')){
        content = 'Votre nutritionniste prendra contact avec vous dans les prochaines 24h afin de programmer et ' +
          'de planifier votre programme nutritionnel en fonction de vos attentes'
      }else if(this.productId.includes('sportcoach')){
        content = 'Votre coach prendra contact avec vous dans les prochaines 24h afin de programmer et ' +
          'de planifier votre programme sportif en fonction de vos attentes'
      }else if(this.productId.includes('trainer')){
        content = 'Votre coach prendra contact avec vous dans les prochaines 24h afin de programmer et ' +
          'de planifier votre entraînement en fonction de vos attentes'
      }
      this.feedbackService.register(
        null,
        'success',
        {
          modalTitle: 'Votre achat a été effectué',
          modalContent: content,
          ...feedbackOpts
        }
      )
    }
    this.router.navigate(['/home'])
  }
}
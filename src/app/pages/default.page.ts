import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {Router} from "@angular/router";


export class DefaultPage {

  constructor(
    private sanitizer:DomSanitizer,
    private router:Router
  ) {
  }

  getSafeImageURL(image:any): SafeUrl {
    // Assuming your base64 data is prefixed with "data:image/png;base64,"
    const imageSource = `data:${image.type};base64,${image.base64}`;
    return this.sanitizer.bypassSecurityTrustUrl(imageSource);
  }

  navigateTo(url:string){
    this.router.navigate([url])
  }
}

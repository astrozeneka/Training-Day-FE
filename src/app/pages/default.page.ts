import {DomSanitizer, SafeUrl} from "@angular/platform-browser";


export class DefaultPage {

  constructor(
    private sanitizer:DomSanitizer
  ) {
  }

  getSafeImageURL(image:any): SafeUrl {
    // Assuming your base64 data is prefixed with "data:image/png;base64,"
    const imageSource = `data:${image.type};base64,${image.base64}`;
    return this.sanitizer.bypassSecurityTrustUrl(imageSource);
  }
}

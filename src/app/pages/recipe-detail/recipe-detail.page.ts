import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, distinctUntilChanged, tap, throwError } from 'rxjs';
import { ContentService } from 'src/app/content.service';
import { User } from 'src/app/models/Interfaces';
import { Recipe, RecipesService } from 'src/app/recipes.service';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.page.html',
  styleUrls: ['./recipe-detail.page.scss'],
})
export class RecipeDetailPage implements OnInit {

  // Recipe information
  recipeId: number = null
  recipe: Recipe = null
  docUrl: SafeResourceUrl

  // User data
  user:User = null

  constructor(
      public router: Router,
      public cs: ContentService,
      public route: ActivatedRoute,
      private cdr: ChangeDetectorRef,
      private sanitizer: DomSanitizer,
      private rs: RecipesService,
      private http: HttpClient
    ) { 
      this.recipeId = parseInt(this.route.snapshot.paramMap.get('id'))
      this.rs.onRecipeDetail(this.recipeId)
      .pipe(
        tap((data:Recipe)=>{
          this.recipe = data
        }),
        distinctUntilChanged((a,b)=>a.docSmallPhoneUrl === b.docSmallPhoneUrl && a.docLargePhoneUrl === b.docLargePhoneUrl && a.docTabletUrl === b.docTabletUrl)      
      )
      .subscribe((data:Recipe)=>{
        console.log(data)
        if (data.docLargePhoneUrl){
          if (data.docLargePhoneBase64)
            this.docUrl = this.sanitizer.bypassSecurityTrustResourceUrl(data.docLargePhoneBase64)
          else
            this.docUrl = data.docLargePhoneUrl
        }
      })
  }

  /**
   * May be used later for caching
   * @param buffer 
   * @returns 
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * May be used later for caching
   * @param blob 
   */
  convertBlobToBase64(blob: Blob): void {
    const reader = new FileReader();
    reader.readAsDataURL(blob); // Read the blob as a data URL (base64)
    console.log(`Loading blob the blob with FileReader`);
    reader.onload = () => { // Sometimes it use onloadend (idk)
      const base64data = reader.result as string;
      // Mark the base64 URL as safe for use in an iframe
      console.log(`base64 generated ${base64data.length} characters`);
      // this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(base64data);
      // set cache here ....
    };
    reader.onerror = (error) => {
      console.error('Error converting blob to base64:', error);
    };
  }

  ngOnInit() {

    this.cs.userStorageObservable.getStorageObservable().subscribe((res)=>{
      this.user = res
    })

  }

  editRecipe(){
    this.router.navigate(['/edit-recipe/', this.recipeId])
  }
}

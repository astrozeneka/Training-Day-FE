import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {MenuController} from "@ionic/angular";
import {Storage} from "@ionic/storage-angular";
import {ContentService} from "../../content.service";
import {AbstractComponent} from "../abstract-component";
import { ThemeDetection, ThemeDetectionResponse } from "@ionic-native/theme-detection/ngx";
import { ChatService } from 'src/app/chat.service';


@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss'],
})
export class MainMenuComponent extends AbstractComponent implements OnInit {
  user: any = null
  unreadMessages: any = null

  constructor(
    private router: Router,
    private menuController: MenuController,
    contentService: ContentService,
    public chatService: ChatService,
    private cdr: ChangeDetectorRef,
    public themeService: ThemeDetection
  ) {
    super(contentService);
    /*this.router.events.subscribe(async(event:any)=>{
      if (event instanceof NavigationEnd) {
        this.user = await this.contentService.storage.get('user')
        if(this.user) {
          this.contentService.getOne('/chat/unread', {})
            .subscribe((data: any) => {
              this.unreadMessages = data.unread
            })
        }
      }
    })*/
  }

  async ngOnInit() {
    this.chatService.unreadMessages$.subscribe((unreadMessages) => {
      this.unreadMessages = unreadMessages
      this.cdr.detectChanges()
    })

    // The content service should not be used for managing user
    // Sth like authService should manage it, cause the user go paired with the bearer token
    this.contentService.userStorageObservable.gso$().subscribe(async (user: any) => {
      this.user = user;
      // The code below has been commented, issue might arise
      // After testing, the code below doesn't even work
      /*if(this.user) {
        await new Promise((resolve) => setTimeout(resolve, 100)) // Unoptimized way for waiting the token to be loaded
        this.contentService.getOne('/chat/unread', {})
          .subscribe((data: any) => {
            // this.unreadMessages = data.unread // old code
            this.chatService.unreadMessagesSubject.next(data.unread)
          })
      }*/
    })
  }

  menuNavigate(url:string){
    this.menuController.close();
    this.router.navigate([url])
  }
}

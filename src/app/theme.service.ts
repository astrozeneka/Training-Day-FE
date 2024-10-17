import { Injectable, OnInit } from '@angular/core';
import { ThemeDetection, ThemeDetectionResponse } from '@ionic-native/theme-detection/ngx';

@Injectable({
  providedIn: 'root'
})
export class ThemeService implements OnInit{

  darkModeIsAvailable: boolean = false;
  darkModeIsEnabled: boolean = false

  constructor(
    private themeDetection: ThemeDetection
  ) { }

  async ngOnInit() {
    // Check if dark mode is available
    try {
      const response: ThemeDetectionResponse = await this.themeDetection.isAvailable();
      this.darkModeIsAvailable = response.value;
    } catch (error) {
      console.log("Dark mode is not available");
    }

    // Check if dark mode is enabled
    try {
      const response: ThemeDetectionResponse = await this.themeDetection.isDarkModeEnabled();
      this.darkModeIsEnabled = response.value;
    } catch (error) {
      console.log("Dark mode is not enabled");
    }
  }

}

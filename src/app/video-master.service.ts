import { Injectable, signal, WritableSignal } from '@angular/core';
import { from, map, Observable, of, shareReplay, switchMap, take } from 'rxjs';
import { ContentService } from './content.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment.prod';
import { User } from './models/Interfaces';
import { Meta } from '@angular/platform-browser';
import { FeedbackService } from './feedback.service';


export interface DaumExtra {
  isExercise: boolean
  level: any
  duration: any
  calorie: any
  material: any
  repetitions: any
}

export interface Metainfo {
  total_count: number
  title: string
}

export interface Daum {
  id: number
  created_at: string
  updated_at: string
  title: string
  description: string
  quality: string
  user_id: number
  file_id: any
  thumbnail_id: any
  tags: string
  hidden: number
  privilege: string[]
  sort_field: string
  awsUrl: string
  hlsUrl: string
  thumbnailUrl: string
  extra: DaumExtra
  available: boolean
  user: User
  file: any
  thumbnail: any
}

export interface VideoPageState {
  exercises: any[];
  programs: any[];
  isLoading: boolean;
  pageTitle: string;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class VideoMasterService {

  private videoDatas: {[key: string]: WritableSignal<VideoPageState>} = {}

  constructor(
    private contentService: ContentService,
    private http: HttpClient,
    private authService: AuthService,
    private feedbackService: FeedbackService
  ) {

  }

  getSignal(category: string): WritableSignal<VideoPageState> {
    if (!this.videoDatas[category]) {
      this.loadData(category);
    }
    return this.videoDatas[category];
  }

  loadData(category: string): void {
    if (!this.videoDatas[category]) {
      this.videoDatas[category] = signal<VideoPageState>({
        exercises: [],
        programs: [],
        isLoading: false,
        pageTitle: '',
        error: null
      });
    }
    const currentState = this.videoDatas[category]();
    this.videoDatas[category].set({
      ...currentState,
      isLoading: true,
      error: null
    });
    this.authService.httpGet(`${environment.apiEndpoint}/videos/exercises-by-category?category=${category}`)
      .subscribe({
        next: (response: {data: Daum[], metainfo: Metainfo}) => {
          this.videoDatas[category].set({
            ...this.videoDatas[category](),
            exercises: response.data,
            isLoading: false,
            pageTitle: response.metainfo.title,
            error: null
          });
        },
        error: (error) => {
          this.videoDatas[category].set({
            ...this.videoDatas[category](),
            isLoading: false,
            error: `Erreur lors du chargement des exercices: ${error.message}`
          });
          this.feedbackService.registerNow(`Erreur lors du chargement des exercices: ${error.message}`, 'danger');
        }
      })
    this.authService.httpGet(`${environment.apiEndpoint}/videos/programs-by-category?category=${category}`)
          .subscribe({
            next: (response: any) => {
              this.videoDatas[category].set({
                ...this.videoDatas[category](),
                programs: response.data || []
              });
            },
            error: (error) => {
              this.videoDatas[category].set({
                ...this.videoDatas[category](),
                isLoading: false,
                error: `Erreur lors du chargement des programmes: ${error.message}`
              });
              this.feedbackService.registerNow(`Erreur lors du chargement des programmes: ${error.message}`, 'danger');
            }
          });
  }
}

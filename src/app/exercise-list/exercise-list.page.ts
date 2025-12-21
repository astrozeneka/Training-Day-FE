import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentService } from '../content.service';
import { FeedbackService } from '../feedback.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { from, map, Observable, of, shareReplay, switchMap, take } from 'rxjs';
import { VideoMasterService, VideoPageState } from '../video-master.service';



interface Video {
  id: number;
  title: string;
  description: string;
  tags: string;
  privilege: string[];
  awsUrl: string;
  hlsUrl: string;
  thumbnailUrl: string;
  extra: {
    isExercise: boolean;
    program: string;
    niveau: string;
    duree: string;
    calorie: string;
    materiel: string;
  };
  available: boolean;
}

interface Program {
  name: string;
  category: string;
  videoCount: number;
  videoIds: number[];

  id: number;
  title: string;
  duration: string;
  level: string;
  equipment: string;
  videoUrl: string;
  description: string;
  instructor: string;
  calories: string;
}

interface Exercise {
  id: number;
  name: string;
  icon: string;
  description: string;
  videoUrl: string;
  targetMuscles: string;
  difficulty: string;
  steps: string[];
  available: boolean; // Is available for the user
}

@Component({
  selector: 'app-exercise-list',
  templateUrl: './exercise-list.page.html',
  styleUrls: ['./exercise-list.page.scss'],
})
export class ExerciseListPage implements OnInit {
  categoryName: string|undefined = undefined;
  selectedSegment: string = 'exercises';
  selectedExercise: Exercise | null = null;
  selectedProgram: Program | null = null;

  
  videoData: WritableSignal<VideoPageState> = signal({
    exercises: [],
    programs: [],
    isLoading: false,
    pageTitle: '',
    error: null
  });

  constructor(
    private route: ActivatedRoute,
    private contentService: ContentService,
    private feedbackService: FeedbackService,
    private http: HttpClient,
    private router: Router,
    private videoMasterService: VideoMasterService
  ) { }

  ngOnInit() {
    // Subscribe to query params to handle both navigation and refresh
    this.route.queryParams.pipe(take(1)).subscribe(params => {
      if (params['category']) {
        this.categoryName = params['category'];
        this.videoData = this.videoMasterService.getSignal(this.categoryName);
      }
    });
  }

  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  }

  openExerciseDetail(exercise: any) {
    let videoId = exercise.id;
    this.router.navigateByUrl(`/video-view/${videoId}?mode=exercise`);
    /*this.selectedExercise = {
      id: exercise.id,
      name: exercise.title,
      icon: 'fitness-outline',
      description: exercise.description,
      videoUrl: exercise.hlsUrl || exercise.awsUrl,
      targetMuscles: exercise.extra?.niveau || 'Non spécifié',
      difficulty: exercise.extra?.niveau || 'Non spécifié',
      steps: [exercise.description]
    };
    this.selectedProgram = null;*/
  }

  /*
  loadProgramDetails(program: Program) {
    // First load all videos for this program
    this.contentService.get(`/videos/videos-by-program?program=${program.name}`)
      .subscribe({
        next: (response: any) => {
          if (response.data && response.data.length > 0) {
            const firstVideo = response.data[0];
            this.selectedProgram = {
              id: firstVideo.id,
              title: program.name,
              duration: firstVideo.extra?.duree || 'Non spécifié',
              level: firstVideo.extra?.niveau || 'Non spécifié',
              equipment: firstVideo.extra?.materiel || 'Non spécifié',
              videoUrl: firstVideo.hlsUrl || firstVideo.awsUrl,
              description: firstVideo.description,
              instructor: firstVideo.user?.name || 'Coach',
              calories: firstVideo.extra?.calorie || 'Non spécifié'
            } as Program;
          } else {
            // Create a placeholder if no videos are found
            this.selectedProgram = {
              id: 0,
              title: program.name,
              duration: 'Non spécifié',
              level: 'Non spécifié',
              equipment: 'Non spécifié',
              videoUrl: '',
              description: 'Aucune information disponible pour ce programme.',
              instructor: 'Coach',
              calories: 'Non spécifié'
            } as Program;
          }
          this.selectedExercise = null;
        },
        error: (error) => {
          this.feedbackService.registerNow('Erreur lors du chargement des détails du programme', 'danger');
        }
      });
  }*/

  openProgramDetail(program: Program) {
    /*this.selectedProgram = program;
    this.selectedExercise = null;*/
    console.log("Selected program:", program);
    let firstVideoId = program.videoIds[0];
    this.router.navigateByUrl(`/video-view/${firstVideoId}?mode=program`);
  }

  closeDetail() {
    this.selectedExercise = null;
    this.selectedProgram = null;
  }

  getMinimumRequiredLevel(privilegeArray: string[]): string {
    // This is the hierarchy of privilege levels from lowest to highest
    const privilegeHierarchy = ['public', 'hoylt', 'gursky', 'smiley', 'moreno', 'alonzo'];

    if (!privilegeArray || privilegeArray.length === 0) {
      return 'Premium';
    }

    // Find the lowest privilege level required
    let lowestIndex = Infinity;
    for (const privilege of privilegeArray) {
      const index = privilegeHierarchy.indexOf(privilege);
      if (index !== -1 && index < lowestIndex) {
        lowestIndex = index;
      }
    }

    // Return the privilege name, or default to "Premium" if not found
    return lowestIndex < privilegeHierarchy.length ?
      privilegeHierarchy[lowestIndex].charAt(0).toUpperCase() + privilegeHierarchy[lowestIndex].slice(1) :
      'Premium';
  }
}
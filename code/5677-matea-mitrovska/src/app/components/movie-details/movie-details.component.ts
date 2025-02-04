import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MovieService, Movie, Actor } from '../../services/movie.service';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './movie-details.component.html',
  styleUrl: './movie-details.component.css'
})
export class MovieDetailsComponent implements OnInit {
  movie: Movie | null = null;
  loading = true;
  error: string | null = null;
  actorDetails: { [key: string]: Actor } = {};
  similarMovies: Movie[] = [];
  similarDirectorMovies: Movie[] = [];
  similarActorMovies: Movie[] = [];
  protected readonly Object = Object;

  constructor(
    private movieService: MovieService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      this.loadMovie(id);
    });
  }

  loadMovie(id: number): void {
    this.loading = true;
    this.movieService.getMovie(id).pipe(
      switchMap(movie => {
        this.movie = movie;
        // Try to load actor details for each cast member
        if (movie.cast && movie.cast.length > 0) {
          const actorObservables = movie.cast.map(castMember =>
            this.movieService.getActorByName(castMember.actor).pipe(
              catchError(() => of(null))
            )
          );
          return forkJoin(actorObservables);
        }
        return of([]);
      })
    ).subscribe({
      next: (actors) => {
        actors.forEach((actor, index) => {
          if (actor && this.movie?.cast[index]) {
            this.actorDetails[this.movie.cast[index].actor] = actor;
          }
        });
        this.loadSimilarContent();
      },
      error: (error) => {
        this.error = 'Failed to load movie details. Please try again later.';
        this.loading = false;
        console.error('Error loading movie:', error);
      }
    });
  }

  deleteMovie(): void {
    if (!this.movie) return;
    
    if (confirm('Are you sure you want to delete this movie?')) {
      this.movieService.deleteMovie(this.movie.id).subscribe({
        next: () => {
          this.router.navigate(['/movies']);
        },
        error: (error) => {
          console.error('Error deleting movie:', error);
          alert('Failed to delete movie. Please try again later.');
        }
      });
    }
  }

  formatOscarName(oscarType: string): string {
    return oscarType
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .trim();
  }

  getSortedOscars(): [string, string][] {
    if (!this.movie?.oscars) return [];
    return Object.entries(this.movie.oscars).sort((a, b) => a[0].localeCompare(b[0]));
  }

  hasActorDetails(actorName: string): boolean {
    return !!this.actorDetails[actorName];
  }

  getActorId(actorName: string): number | null {
    return this.actorDetails[actorName]?.id || null;
  }

  private loadSimilarContent(): void {
    if (!this.movie) return;

    this.movieService.getMovies().subscribe({
      next: (movies) => {
        // Filter out the current movie
        const otherMovies = movies.filter(m => m.id !== this.movie?.id);

        // Find movies with similar genres
        this.similarMovies = otherMovies
          .filter(m => this.hasCommonGenres(m.genre, this.movie?.genre || []))
          .sort((a, b) => this.getGenreOverlap(b.genre, this.movie?.genre || []) - 
                         this.getGenreOverlap(a.genre, this.movie?.genre || []))
          .slice(0, 5);

        // Find movies by the same director
        this.similarDirectorMovies = otherMovies
          .filter(m => m.director === this.movie?.director)
          .sort((a, b) => b.year - a.year)
          .slice(0, 5);

        // Find movies with common actors
        this.similarActorMovies = otherMovies
          .filter(m => this.hasCommonActors(m.cast || [], this.movie?.cast || []))
          .sort((a, b) => this.getActorOverlap(b.cast || [], this.movie?.cast || []) -
                         this.getActorOverlap(a.cast || [], this.movie?.cast || []))
          .slice(0, 5);

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading similar content:', error);
        this.loading = false;
      }
    });
  }

  private hasCommonGenres(genres1: string[], genres2: string[]): boolean {
    return genres1.some(genre => genres2.includes(genre));
  }

  private getGenreOverlap(genres1: string[], genres2: string[]): number {
    return genres1.filter(genre => genres2.includes(genre)).length;
  }

  private hasCommonActors(cast1: { actor: string }[], cast2: { actor: string }[]): boolean {
    const actors1 = cast1.map(c => c.actor);
    const actors2 = cast2.map(c => c.actor);
    return actors1.some(actor => actors2.includes(actor));
  }

  private getActorOverlap(cast1: { actor: string }[], cast2: { actor: string }[]): number {
    const actors1 = cast1.map(c => c.actor);
    const actors2 = cast2.map(c => c.actor);
    return actors1.filter(actor => actors2.includes(actor)).length;
  }

  getCastList(movie: Movie): string {
    return movie.cast?.map(c => c.actor).join(', ') || '';
  }
}

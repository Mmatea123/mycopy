import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MovieService, Movie, Genre } from '../../services/movie.service';

@Component({
  selector: 'app-movie-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './movie-edit.component.html',
  styleUrl: './movie-edit.component.css'
})
export class MovieEditComponent implements OnInit {
  movie: Movie | null = null;
  genres: Genre[] = [];
  loading = true;
  error: string | null = null;
  saving = false;

  constructor(
    private movieService: MovieService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load genres first
    this.movieService.getGenres().subscribe({
      next: (genres) => {
        this.genres = genres;
        // After genres are loaded, load the movie
        this.route.params.subscribe(params => {
          const id = Number(params['id']);
          this.loadMovie(id);
        });
      },
      error: (error) => {
        console.error('Error loading genres:', error);
        this.error = 'Failed to load genres. Please try again later.';
        this.loading = false;
      }
    });
  }

  loadMovie(id: number): void {
    this.movieService.getMovie(id).subscribe({
      next: (movie) => {
        this.movie = movie;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading movie:', error);
        this.error = 'Failed to load movie. Please try again later.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (!this.movie) return;
    
    this.saving = true;
    this.movieService.updateMovie(this.movie.id, this.movie).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/movies', this.movie?.id]);
      },
      error: (error) => {
        console.error('Error updating movie:', error);
        this.error = 'Failed to update movie. Please try again later.';
        this.saving = false;
      }
    });
  }

  onGenreChange(genre: string, isChecked: boolean): void {
    if (!this.movie) return;
    
    if (isChecked) {
      if (!this.movie.genre.includes(genre)) {
        this.movie.genre = [...this.movie.genre, genre];
      }
    } else {
      this.movie.genre = this.movie.genre.filter(g => g !== genre);
    }
  }

  isGenreSelected(genre: string): boolean {
    return this.movie?.genre.includes(genre) || false;
  }

  cancel(): void {
    if (this.movie) {
      this.router.navigate(['/movies', this.movie.id]);
    } else {
      this.router.navigate(['/movies']);
    }
  }
}

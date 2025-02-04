import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MovieService, Movie, Genre } from '../../services/movie.service';

@Component({
  selector: 'app-movie-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './movie-create.component.html',
  styleUrl: './movie-create.component.css'
})
export class MovieCreateComponent implements OnInit {
  movie: Partial<Movie> = {
    title: '',
    year: new Date().getFullYear(),
    director: '',
    genre: [],
    plot: '',
    cast: [],
    oscars: {},
    rating: undefined
  };
  
  genres: Genre[] = [];
  loading = true;
  error: string | null = null;
  saving = false;

  constructor(
    private movieService: MovieService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.movieService.getGenres().subscribe({
      next: (genres) => {
        this.genres = genres;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading genres:', error);
        this.error = 'Failed to load genres. Please try again later.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    console.log('Form submitted', this.movie);
    if (!this.isValidMovie()) {
      this.error = 'Please fill in all required fields.';
      console.log('Validation failed', {
        title: this.movie.title,
        year: this.movie.year,
        director: this.movie.director,
        genre: this.movie.genre
      });
      return;
    }

    this.saving = true;
    console.log('Creating movie', this.movie);
    this.movieService.createMovie(this.movie as Omit<Movie, 'id'>).subscribe({
      next: (createdMovie) => {
        this.saving = false;
        this.router.navigate(['/movies', createdMovie.id]);
      },
      error: (error) => {
        console.error('Error creating movie:', error);
        this.error = 'Failed to create movie. Please try again later.';
        this.saving = false;
      }
    });
  }

  onGenreChange(genre: string, isChecked: boolean): void {
    if (!this.movie.genre) {
      this.movie.genre = [];
    }
    
    if (isChecked) {
      if (!this.movie.genre.includes(genre)) {
        this.movie.genre = [...this.movie.genre, genre];
      }
    } else {
      this.movie.genre = this.movie.genre.filter(g => g !== genre);
    }
  }

  isGenreSelected(genre: string): boolean {
    return this.movie.genre?.includes(genre) || false;
  }

  private isValidMovie(): boolean {
    return !!(
      this.movie.title &&
      this.movie.year &&
      this.movie.director &&
      this.movie.genre?.length
    );
  }

  cancel(): void {
    this.router.navigate(['/movies']);
  }
}

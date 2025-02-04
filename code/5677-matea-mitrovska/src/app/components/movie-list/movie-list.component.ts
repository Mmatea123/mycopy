import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovieService, Movie, Genre } from '../../services/movie.service';

interface SortConfig {
  field: keyof Movie | 'oscars';
  direction: 'asc' | 'desc';
}

interface FilterConfig {
  title: string;
  year: number | null;
  genre: string;
  rating: number | null;
}

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.css'
})
export class MovieListComponent implements OnInit {
  movies: Movie[] = [];
  filteredMovies: Movie[] = [];
  genres: Genre[] = [];
  loading = true;
  error: string | null = null;

  sortConfig: SortConfig = {
    field: 'title',
    direction: 'asc'
  };

  filterConfig: FilterConfig = {
    title: '',
    year: null,
    genre: '',
    rating: null
  };

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;

    // Load movies
    this.movieService.getMovies().subscribe({
      next: (movies) => {
        this.movies = movies;
        this.applyFiltersAndSort();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load movies. Please try again later.';
        this.loading = false;
        console.error('Error loading movies:', error);
      }
    });

    // Load genres
    this.movieService.getGenres().subscribe({
      next: (genres) => {
        this.genres = genres;
      },
      error: (error) => {
        console.error('Error loading genres:', error);
      }
    });
  }

  toggleSort(field: keyof Movie | 'oscars'): void {
    if (this.sortConfig.field === field) {
      this.sortConfig.direction = this.sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortConfig.field = field;
      this.sortConfig.direction = 'asc';
    }
    this.applyFiltersAndSort();
  }

  getSortIcon(field: keyof Movie | 'oscars'): string {
    if (this.sortConfig.field !== field) return '↕';
    return this.sortConfig.direction === 'asc' ? '↑' : '↓';
  }

  applyFilters(): void {
    this.applyFiltersAndSort();
  }

  private applyFiltersAndSort(): void {
    let filtered = [...this.movies];

    // Apply filters
    if (this.filterConfig.title) {
      const searchTerm = this.filterConfig.title.toLowerCase();
      filtered = filtered.filter(movie => 
        movie.title.toLowerCase().includes(searchTerm)
      );
    }

    if (this.filterConfig.year) {
      filtered = filtered.filter(movie => 
        movie.year === this.filterConfig.year
      );
    }

    if (this.filterConfig.genre) {
      filtered = filtered.filter(movie => 
        movie.genre.includes(this.filterConfig.genre)
      );
    }

    if (this.filterConfig.rating) {
      filtered = filtered.filter(movie => 
        movie.rating >= (this.filterConfig.rating || 0)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[this.sortConfig.field];
      let bValue: any = b[this.sortConfig.field];

      if (this.sortConfig.field === 'oscars') {
        aValue = this.getOscarCount(a);
        bValue = this.getOscarCount(b);
      } else if (this.sortConfig.field === 'genre') {
        aValue = a.genre.length;
        bValue = b.genre.length;
      }

      if (aValue === bValue) {
        // Secondary sort by title
        return this.sortConfig.direction === 'asc' 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }

      return this.sortConfig.direction === 'asc'
        ? (aValue < bValue ? -1 : 1)
        : (aValue > bValue ? -1 : 1);
    });

    this.filteredMovies = filtered;
  }

  deleteMovie(id: number): void {
    if (confirm('Are you sure you want to delete this movie?')) {
      this.movieService.deleteMovie(id).subscribe({
        next: () => {
          this.movies = this.movies.filter(movie => movie.id !== id);
          this.applyFiltersAndSort();
        },
        error: (error) => {
          console.error('Error deleting movie:', error);
          alert('Failed to delete movie. Please try again later.');
        }
      });
    }
  }

  getOscarCount(movie: Movie): number {
    return Object.keys(movie.oscars || {}).length;
  }

  formatGenres(genres: string[]): string {
    return genres.join(' / ');
  }
}

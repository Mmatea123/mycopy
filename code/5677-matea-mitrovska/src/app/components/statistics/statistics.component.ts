import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService, Movie, Actor } from '../../services/movie.service';
import { forkJoin } from 'rxjs';

interface Statistics {
  totalMovies: number;
  totalActors: number;
  totalGenres: number;
  totalOscars: number;
  oscarsPerType: { [key: string]: number };
  oscarsPerGenre: { [key: string]: number };
  moviesPerDecade: { [key: string]: number };
  moviesPerGenre: { [key: string]: number };
  actorsWithoutDetails: number;
  actorsWithoutDetailsList: string[];
  moviesWithoutDetails: number;
  moviesWithoutDetailsList: Movie[];
}

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.css'
})
export class StatisticsComponent implements OnInit {
  statistics: Statistics | null = null;
  loading = true;
  error: string | null = null;

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    forkJoin({
      movies: this.movieService.getMovies(),
      actors: this.movieService.getActors(),
      genres: this.movieService.getGenres()
    }).subscribe({
      next: ({ movies, actors, genres }) => {
        this.statistics = this.calculateStatistics(movies, actors, genres);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        this.error = 'Failed to load statistics. Please try again later.';
        this.loading = false;
      }
    });
  }

  private calculateStatistics(movies: Movie[], actors: Actor[], genres: any[]): Statistics {
    const stats: Statistics = {
      totalMovies: movies.length,
      totalActors: this.getUniqueActorsCount(movies),
      totalGenres: genres.length,
      totalOscars: this.getTotalOscars(movies),
      oscarsPerType: this.getOscarsPerType(movies),
      oscarsPerGenre: this.getOscarsPerGenre(movies),
      moviesPerDecade: this.getMoviesPerDecade(movies),
      moviesPerGenre: this.getMoviesPerGenre(movies),
      actorsWithoutDetails: 0,
      actorsWithoutDetailsList: [],
      moviesWithoutDetails: 0,
      moviesWithoutDetailsList: []
    };

    // Calculate actors without details
    const movieActors = this.getAllMovieActors(movies);
    const actorNames = actors.map(a => a.name);
    stats.actorsWithoutDetailsList = movieActors.filter(a => !actorNames.includes(a));
    stats.actorsWithoutDetails = stats.actorsWithoutDetailsList.length;

    // Calculate movies without details
    stats.moviesWithoutDetailsList = movies.filter(m => !m.plot || !m.director || !m.genre || m.genre.length === 0);
    stats.moviesWithoutDetails = stats.moviesWithoutDetailsList.length;

    return stats;
  }

  private getUniqueActorsCount(movies: Movie[]): number {
    const uniqueActors = new Set(this.getAllMovieActors(movies));
    return uniqueActors.size;
  }

  private getAllMovieActors(movies: Movie[]): string[] {
    return movies
      .filter(movie => movie.cast)
      .flatMap(movie => movie.cast.map(c => c.actor));
  }

  private getTotalOscars(movies: Movie[]): number {
    return movies
      .filter(movie => movie.oscars)
      .reduce((total, movie) => total + Object.keys(movie.oscars || {}).length, 0);
  }

  private getOscarsPerType(movies: Movie[]): { [key: string]: number } {
    const oscarsPerType: { [key: string]: number } = {};
    movies.forEach(movie => {
      if (movie.oscars) {
        Object.keys(movie.oscars).forEach(type => {
          oscarsPerType[type] = (oscarsPerType[type] || 0) + 1;
        });
      }
    });
    return oscarsPerType;
  }

  private getOscarsPerGenre(movies: Movie[]): { [key: string]: number } {
    const oscarsPerGenre: { [key: string]: number } = {};
    movies.forEach(movie => {
      if (movie.oscars && movie.genre) {
        const oscarCount = Object.keys(movie.oscars).length;
        movie.genre.forEach(genre => {
          oscarsPerGenre[genre] = (oscarsPerGenre[genre] || 0) + oscarCount;
        });
      }
    });
    return oscarsPerGenre;
  }

  private getMoviesPerDecade(movies: Movie[]): { [key: string]: number } {
    const moviesPerDecade: { [key: string]: number } = {};
    movies.forEach(movie => {
      if (movie.year) {
        const decade = Math.floor(movie.year / 10) * 10;
        const decadeKey = `${decade}s`;
        moviesPerDecade[decadeKey] = (moviesPerDecade[decadeKey] || 0) + 1;
      }
    });
    return moviesPerDecade;
  }

  private getMoviesPerGenre(movies: Movie[]): { [key: string]: number } {
    const moviesPerGenre: { [key: string]: number } = {};
    movies.forEach(movie => {
      if (movie.genre) {
        movie.genre.forEach(genre => {
          moviesPerGenre[genre] = (moviesPerGenre[genre] || 0) + 1;
        });
      }
    });
    return moviesPerGenre;
  }

  formatOscarType(type: string): string {
    return type
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }
}

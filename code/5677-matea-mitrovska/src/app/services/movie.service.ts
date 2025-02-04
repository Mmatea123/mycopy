import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Movie {
  id: number;
  title: string;
  year: number;
  director: string;
  genre: string[];
  plot: string;
  cast: {
    actor: string;
    character: string;
  }[];
  oscars: {
    [key: string]: string;
  };
  rating: number;
}

export interface Genre {
  id: string;
  name: string;
}

export interface Actor {
  id: number;
  name: string;
  birthdate: string;
  height: number;
  nationality: string;
  notable_works: string[];
}

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  // Movie endpoints
  getMovies(): Observable<Movie[]> {
    return this.http.get<Movie[]>(`${this.apiUrl}/movies`);
  }

  getMovie(id: number): Observable<Movie> {
    return this.http.get<Movie>(`${this.apiUrl}/movies/${id}`);
  }

  createMovie(movie: Omit<Movie, 'id'>): Observable<Movie> {
    return this.http.post<Movie>(`${this.apiUrl}/movies`, movie);
  }

  updateMovie(id: number, movie: Movie): Observable<Movie> {
    return this.http.put<Movie>(`${this.apiUrl}/movies/${id}`, movie);
  }

  deleteMovie(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/movies/${id}`);
  }

  // Genre endpoints
  getGenres(): Observable<Genre[]> {
    return this.http.get<Genre[]>(`${this.apiUrl}/genres`);
  }

  // Actor endpoints
  getActors(): Observable<Actor[]> {
    return this.http.get<Actor[]>(`${this.apiUrl}/actors`);
  }

  getActor(id: number): Observable<Actor> {
    return this.http.get<Actor>(`${this.apiUrl}/actors/${id}`);
  }

  getActorByName(name: string): Observable<Actor> {
    return this.http.get<Actor>(`${this.apiUrl}/actors`, {
      params: { name }
    });
  }
}

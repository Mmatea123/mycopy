import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MovieService, Movie } from '../../services/movie.service';

interface CastMember {
  actor: string;
  character: string;
}

@Component({
  selector: 'app-cast-add',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cast-add.component.html',
  styleUrl: './cast-add.component.css'
})
export class CastAddComponent implements OnInit {
  movie: Movie | null = null;
  newCastMember: CastMember = {
    actor: '',
    character: ''
  };
  loading = true;
  error: string | null = null;
  saving = false;

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
    if (!this.movie || !this.isValidCastMember()) {
      this.error = 'Please fill in both actor name and character name.';
      return;
    }

    this.saving = true;
    const updatedMovie = {
      ...this.movie,
      cast: [
        ...(this.movie.cast || []),
        this.newCastMember
      ]
    };

    this.movieService.updateMovie(this.movie.id, updatedMovie).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/movies', this.movie?.id]);
      },
      error: (error) => {
        console.error('Error adding cast member:', error);
        this.error = 'Failed to add cast member. Please try again later.';
        this.saving = false;
      }
    });
  }

  private isValidCastMember(): boolean {
    return !!(
      this.newCastMember.actor.trim() &&
      this.newCastMember.character.trim()
    );
  }

  cancel(): void {
    if (this.movie) {
      this.router.navigate(['/movies', this.movie.id]);
    } else {
      this.router.navigate(['/movies']);
    }
  }
}

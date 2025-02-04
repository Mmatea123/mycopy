import { Routes } from '@angular/router';
import { MovieListComponent } from './components/movie-list/movie-list.component';
import { MovieDetailsComponent } from './components/movie-details/movie-details.component';
import { MovieEditComponent } from './components/movie-edit/movie-edit.component';
import { MovieCreateComponent } from './components/movie-create/movie-create.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { AboutComponent } from './components/about/about.component';
import { CastAddComponent } from './components/cast-add/cast-add.component';

export const routes: Routes = [
  { path: '', redirectTo: '/movies', pathMatch: 'full' },
  { path: 'movies', component: MovieListComponent },
  { path: 'movies/create', component: MovieCreateComponent },
  { path: 'movies/:id/edit', component: MovieEditComponent },
  { path: 'movies/:id/cast/add', component: CastAddComponent },
  { path: 'movies/:id', component: MovieDetailsComponent },
  { path: 'statistics', component: StatisticsComponent },
  { path: 'about', component: AboutComponent }
];

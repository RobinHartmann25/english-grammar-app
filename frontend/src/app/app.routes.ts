import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '', loadComponent: () => import('./startpage/startpage').then(x => x.Startpage)
  },
  {
    path: 'exercisepage', loadComponent: () => import('./exercisepage/exercisepage').then(x => x.Exercisepage)
  }
];

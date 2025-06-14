import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListProjectsComponent } from './list-projects/list-projects.component';
import { DetailProjectComponent } from './detail-project/detail-project.component';
import { AuthGuard } from '../auth/auth.guard';

const routes: Routes = [
  {
    path: 'listproject',
    component: ListProjectsComponent,
    canActivate: [AuthGuard],
  },
  { path: '', redirectTo: 'listproject', pathMatch: 'full' },
  {
    path: 'detailproject/:idProject',
    component: DetailProjectComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectRoutingModule {}

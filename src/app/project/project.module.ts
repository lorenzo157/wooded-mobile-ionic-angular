import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ListProjectsComponent } from './list-projects/list-projects.component';
import { ProjectRoutingModule } from './project-routing.module';
import { ProjectService } from './project.service';
import { AuthModule } from '../auth/auth.module';
import { NavigationComponent } from '../shared/navigation/navigation.component';
import { DetailProjectComponent } from './detail-project/detail-project.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProjectRoutingModule,
    AuthModule,
    NavigationComponent,
  ],
  declarations: [ListProjectsComponent, DetailProjectComponent],
  providers: [ProjectService],
})
export class ProjectModule {}

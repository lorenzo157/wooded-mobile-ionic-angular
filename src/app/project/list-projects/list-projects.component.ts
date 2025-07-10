import { Component, OnInit } from '@angular/core';
import { ProjectDto, ProjectService } from '../project.service'; // Adjust the path as necessary
import { Router } from '@angular/router';
import { UiService } from '../../utils/ui.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-list-projects',
  templateUrl: './list-projects.component.html',
  styleUrls: ['./list-projects.component.scss'],
  standalone: false,
})
export class ListProjectsComponent implements OnInit {
  projects: ProjectDto[] = []; // Array to hold project data
  filterProjectName!: string;
  firstName!: string;

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private uiService: UiService,
    private authService: AuthService,
  ) {
    this.authService.getUser().subscribe({
      next: (user) => (this.firstName = user.firstName),
      error: (error) => (this.firstName = 'Sin nombre'),
    });
  }

  async ngOnInit() {
    await this.uiService.cargando(true);
    this.projectService.getAssignedProjects().subscribe({
      next: (value) => {
        this.uiService.cargando(false);
        this.projects = value;
      },
      error: (error) => {
        this.uiService.alert('No se pudieron cargar los proyectos.', 'Error');
        this.uiService.cargando(false);
      },
    });
  }
  viewProjectDetails(project: ProjectDto) {
    // Navigating with state to pass the idProject of the selected project
    this.router.navigate([`project/detailproject/${project.idProject}`]);
  }

  get filteredProjects() {
    return this.filterProjectName
      ? this.projects.filter((project) =>
          project.projectName
            .toLowerCase()
            .includes(this.filterProjectName.trim().toLowerCase()),
        )
      : this.projects;
  }
}

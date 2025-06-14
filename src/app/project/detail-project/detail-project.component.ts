import { Component, OnInit } from '@angular/core';
import { ProjectDto, ProjectService } from '../project.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UiService } from '../../utils/ui.service';

@Component({
  selector: 'app-detail-project',
  templateUrl: './detail-project.component.html',
  styleUrls: ['./detail-project.component.scss'],
  standalone: false,
})
export class DetailProjectComponent implements OnInit {
  idProject!: number;
  project!: ProjectDto;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private uiService: UiService,
  ) {}

  async ngOnInit() {
    await this.uiService.cargando(true);
    // Access the project object from the router state
    this.route.paramMap.subscribe((params) => {
      this.idProject = +params.get('idProject')!; // Retrieve project ID from route
      this.loadProject();
    });
  }
  loadProject() {
    this.projectService.findProjectById(this.idProject).subscribe({
      next: (project) => {
        this.uiService.cargando(false);
        this.project = project; // Load tree details
      },
      error: (error) => {
        //if(error.status === 401)
        this.uiService.alert('No se pudo cargar el proyecto.', 'Error');
        this.uiService.cargando(false);
      },
    });
  }
  createTree() {
    this.router.navigate([
      `/project/${this.idProject}/tree/${
        this.project.projectType ? 'muestreo' : 'individual'
      }/createtree/0`,
    ]);
  }

  showAllTrees() {
    this.router.navigate([
      `/project/${this.idProject}/tree/${
        this.project.projectType ? 'muestreo' : 'individual'
      }/listtree`,
    ]);
  }
}

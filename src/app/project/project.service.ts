import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, Observable, switchMap } from 'rxjs';
import { API } from '../constants/API';
import { AuthService } from '../auth/auth.service';

export interface ProjectDto {
  idProject: number;
  projectName: string;
  projectDescription: string;
  startDate: string;
  endDate: string;
  projectType: boolean;
  cityName: string;
  provinceName: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly API_URL = `${API}/project`; // Base URL for the project API

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  // Method to get assigned projects by user ID
  getAssignedProjects(): Observable<ProjectDto[]> {
    return this.authService.getIdUserFromToken().pipe(
      switchMap((idUser) => {
        // Ensure idUser is not null or undefined
        if (idUser == null) {
          throw new Error('User ID is missing or could not be retrieved');
        }
        return this.http.get<ProjectDto[]>(
          `${this.API_URL}/assignedproject/${idUser}`,
        );
      }),
    );
  }

  findProjectById(idProject: number): Observable<ProjectDto> {
    return this.http.get<ProjectDto>(`${this.API_URL}/${idProject}`);
  }
}

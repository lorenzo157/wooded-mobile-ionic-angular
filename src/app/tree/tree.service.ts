import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from '../constants/API';
import { AuthService } from '../auth/auth.service';
import { CreateTreeDto } from './dto/create-tree.dto';
import { ReadTreeDto } from './dto/read-tree.dto';
import { SimplyReadTreeDto } from './dto/simply-read-tree.dto';

@Injectable({
  providedIn: 'root',
})
export class TreeService {
  private readonly API_URL = `${API}/project`; // Base URL for the project API

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  createOrUpdateTree(
    newTree: CreateTreeDto,
    idTree: number | null,
  ): Observable<number> {
    if (idTree)
      return this.http.put<number>(`${this.API_URL}/0/tree/${idTree}`, newTree);
    else return this.http.post<number>(`${this.API_URL}/0/tree`, newTree);
  }
  // Method to get assigned projects by user ID
  getTreesByProjectId(idProject: number): Observable<SimplyReadTreeDto[]> {
    return this.http.get<SimplyReadTreeDto[]>(
      `${this.API_URL}/${idProject}/tree`,
    );
  }

  getTreeById(idTree: number): Observable<ReadTreeDto> {
    return this.http.get<ReadTreeDto>(`${this.API_URL}/0/tree/${idTree}`);
  }

  logout() {
    this.authService.logout();
  }
}

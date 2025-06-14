import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    // Create or initialize the storage
    const storage = await this.storage.create();
    this._storage = storage;
  }

  // Save a value to storage
  public async set(key: string, value: any) {
    await this._storage?.set(key, value);
  }

  // Retrieve a value from storage
  public async get(key: string): Promise<any> {
    return await this._storage?.get(key);
  }

  // Clear all values from storage
  public async clear() {
    await this._storage?.clear();
  }

  // Remove a specific key
  public async remove(key: string) {
    await this._storage?.remove(key);
  }
}

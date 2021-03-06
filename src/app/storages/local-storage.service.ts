import { Injectable } from '@angular/core';
const LocalStorage = require('nativescript-localstorage');

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  constructor() {}

  public remove(key: string): void {
    LocalStorage.removeItem(key);
  }

  public get(key: string): string {
    const value = LocalStorage.getItem(key) || undefined;
    return value !== 'null' ? value : undefined;
  }

  public set(key: string, value: string | number | object): void {
    if (typeof value === 'string' || value instanceof String) {
      LocalStorage.setItem(key, value);
    } else {
      const json = JSON.stringify(value);
      LocalStorage.setItem(key, json);
    }
  }

  public has(key: string): boolean {
    return this.get(key) !== undefined;
  }
}

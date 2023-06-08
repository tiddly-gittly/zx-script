/**
 * Copy from TidGi-Desktop src/services/native/interface.ts
 */
import type { Observable } from 'rxjs';

export type IZxFileInput = { fileContent: string; fileName: string } | { filePath: string };
export interface INativeService {
  executeZxScript$(zxWorkerArguments: IZxFileInput, workspaceID?: string): Observable<string>;
}
declare global {
  interface Window {
    observables: {
      native: INativeService;
    };
  }
}

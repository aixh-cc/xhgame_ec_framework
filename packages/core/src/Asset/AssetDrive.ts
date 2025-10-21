export interface IBundle {
    loadDir(dir: string, onProgress: ((finished: number, total: number, item: any) => void) | null, onComplete: (err: Error | null, data: any[]) => void): void
    load<T>(paths: string, type: T | null, onComplete?: ((err: Error | null, data: T) => void) | null): void;
}

export interface IAssetDrive {
    loadBundle(nameOrUrl: string, onComplete?: (err: Error, data: IBundle) => void): void
}

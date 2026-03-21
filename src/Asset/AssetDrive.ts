export interface IBundle {
    loadDir<T>(dir: string, onComplete: (err: Error | null, data: T[]) => void): void
    loadDir<T>(dir: string, onProgress: ((finished: number, total: number, item: any) => void) | null, onComplete: (err: Error | null, data: T[]) => void): void
    load<T>(paths: string, onComplete?: ((err: Error | null, data: T) => void) | null): void;
    release(path: string): void;
}

export interface IAssetDrive {
    loadBundle<T extends IBundle>(nameOrUrl: string, onComplete?: (err: Error, data: T) => void): void
}

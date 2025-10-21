export interface IBundle {
    loadDir(dir: string, onProgress: ((finished: number, total: number, item: any) => void) | null, onComplete: (err: Error | null, data: any[]) => void): void
}

export interface IAssetDrive {
    loadBundle(nameOrUrl: string, onComplete?: (err: Error, data: IBundle) => void): void
}

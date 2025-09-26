export interface IItem {
    node: any
    itemId: number
    itemNo: string
    alive: boolean
    positions: number[]
    init(itemNo: string, itemId: number): void
    reset(): void
    clone(): any
    toScene(): void
    toPool(): void
}

export interface IItemProduceDrive {
    preloadItemsResource(): Promise<boolean>
    createItem(itemNo: string, itemId: number): IItem
    removeItem(item: IItem): void
}
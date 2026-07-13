export interface IEventItem {
    id: number;
    name: string;
    event: Function;
    context: unknown;
    tag: string;
}

/** 类型化、可在派发期间安全增删监听器的事件管理器。 */
export class EventManager<T extends Record<string, any> = Record<string, any>> {
    private _is_debug = false;
    private _tag = '';
    private _nextEventItemId = 0;
    private _listeners = new Map<string, IEventItem[]>();

    setDebug(val: boolean): void { this._is_debug = val; }

    /** @deprecated 请直接向 on/onSingle 的第四个参数传 tag。 */
    setTag(tag: string): this {
        this._tag = tag;
        return this;
    }

    private consumeTag(explicitTag?: string): string {
        const tag = explicitTag ?? this._tag;
        this._tag = '';
        return tag;
    }

    createEventItem(name: string, event: Function, context: unknown, tag = ''): number {
        const item: IEventItem = {
            id: ++this._nextEventItemId,
            name,
            event,
            context,
            tag
        };
        const listeners = this._listeners.get(name) ?? [];
        listeners.push(item);
        this._listeners.set(name, listeners);
        return item.id;
    }

    removeEventItem(eventItemId: number): void {
        for (const [name, listeners] of this._listeners) {
            const index = listeners.findIndex(item => item.id === eventItemId);
            if (index < 0) continue;
            listeners.splice(index, 1);
            if (listeners.length === 0) this._listeners.delete(name);
            return;
        }
    }

    on<K extends keyof T & string>(name: K, event: (event: IEventItem, obj: T[K]) => void, context?: unknown, tag?: string): void;
    on(name: string, event: (event: IEventItem, obj: any) => void, context?: unknown, tag?: string): void;
    on(name: string, event: Function, context?: unknown, tag?: string): void {
        this.createEventItem(name, event, context, this.consumeTag(tag));
        this.debug(`添加监听器 name=${name}`);
    }

    onSingle<K extends keyof T & string>(name: K, event: (event: IEventItem, obj: T[K]) => void, context?: unknown, tag?: string): void;
    onSingle(name: string, event: (event: IEventItem, obj: any) => void, context?: unknown, tag?: string): void;
    onSingle(name: string, event: Function, context?: unknown, tag?: string): void {
        const listeners = this._listeners.get(name) ?? [];
        for (const item of [...listeners]) {
            if (item.context === context) this.removeEventItem(item.id);
        }
        this.createEventItem(name, event, context, this.consumeTag(tag));
    }

    once<K extends keyof T & string>(name: K, event: (event: IEventItem, obj: T[K]) => void, context?: unknown, tag?: string): void;
    once(name: string, event: (event: IEventItem, obj: any) => void, context?: unknown, tag?: string): void;
    once(name: string, event: Function, context?: unknown, tag?: string): void {
        const wrapper = (item: IEventItem, obj: any) => {
            this.removeEventItem(item.id);
            event.call(context, item, obj);
        };
        this.on(name, wrapper, context, tag);
    }

    off<K extends keyof T & string>(name: K, event: ((event: IEventItem, obj: T[K]) => void) | null, context?: unknown): void;
    off(name: string, event: Function | null, context?: unknown): void;
    off(name: string, event: Function | null, context?: unknown): void {
        const listeners = this._listeners.get(name) ?? [];
        for (const item of [...listeners]) {
            if (item.context === context && (event === null || item.event === event)) {
                this.removeEventItem(item.id);
            }
        }
    }

    emit<K extends keyof T & string>(name: K, obj?: T[K], context?: unknown): void;
    emit(name: string, obj?: any, context?: unknown): void;
    emit(name: string, obj: any = null, context?: unknown): void {
        const snapshot = [...(this._listeners.get(name) ?? [])];
        for (const item of snapshot) {
            const stillRegistered = this._listeners.get(name)?.some(current => current.id === item.id);
            if (!stillRegistered || item.context !== context) continue;
            try {
                item.event.call(context, item, obj);
            } catch (e) {
                console.error(`[EventManager] emit "${name}" 处理器异常:`, e);
            }
        }
    }

    clearByTag(tag: string | null = null): void {
        if (tag === null) {
            this._listeners.clear();
            this._tag = '';
            return;
        }
        for (const listeners of [...this._listeners.values()]) {
            for (const item of [...listeners]) {
                if (item.tag === tag) this.removeEventItem(item.id);
            }
        }
    }

    private debug(message: string): void {
        if (this._is_debug) console.log(`[EventManager] ${message}`, this._listeners);
    }
}

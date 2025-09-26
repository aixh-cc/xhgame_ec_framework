
export interface IEventItem {
    id: number
    name: string
    event: Function
    context: unknown
}

// 获取 满足value的所有indexs的数组
function getAllIndices(arr: any[], value: any): any[] {
    return arr.reduce((indices, element, index) => {
        if (element === value) {
            indices.push(index);
        }
        return indices;
    }, []);
}
// 发布订阅模式
// 事件管理者
export class EventManager {

    /** _debug模式下可以看到更多的打印数据 */
    private _is_debug: boolean = false

    /** 设置_debug */
    setDebug(val: boolean) {
        this._is_debug = val
    }
    private _tag: string = ''
    private _nextEventItemId: number = 0
    // 索引到一维
    private _eventIndex_EventItemArray: IEventItem[] = []
    private _eventIndex_EventIdArray: number[] = []
    private _eventIndex_NameArray: string[] = []
    private _eventIndex_TagArray: string[] = []

    /** 需在on之前使用 */
    setTag(tag: string) {
        this._tag = tag
        return this
    }

    createEventItem(name: string, event: (event: IEventItem, obj: any) => void, context: any) {
        let eventItemId = ++this._nextEventItemId
        let eventIndex = this._eventIndex_EventIdArray.length; // 当前可用的长度
        let eventItem = { name, event, context, id: eventItemId }
        this._eventIndex_EventIdArray[eventIndex] = eventItemId
        this._eventIndex_EventItemArray[eventIndex] = eventItem
        this._eventIndex_NameArray[eventIndex] = name
        this._eventIndex_TagArray[eventIndex] = this._tag
        return eventItemId
    }

    removeEventItem(eventItemId: number) {
        let eventItemIndex = this._eventIndex_EventIdArray.indexOf(eventItemId)
        let lastEventItemIndex = this._eventIndex_EventItemArray.length - 1 // 最后一个index
        let tmp_EventItem = this._eventIndex_EventItemArray[eventItemIndex]
        let tmp_EventId = this._eventIndex_EventIdArray[eventItemIndex]
        let tmp_Name = this._eventIndex_NameArray[eventItemIndex]
        let tmp_Tag = this._eventIndex_TagArray[eventItemIndex]
        //  置换1
        this._eventIndex_EventItemArray[eventItemIndex] = this._eventIndex_EventItemArray[lastEventItemIndex]
        this._eventIndex_EventItemArray[lastEventItemIndex] = tmp_EventItem
        //  置换2
        this._eventIndex_EventIdArray[eventItemIndex] = this._eventIndex_EventIdArray[lastEventItemIndex]
        this._eventIndex_EventIdArray[lastEventItemIndex] = tmp_EventId
        //  置换3
        this._eventIndex_NameArray[eventItemIndex] = this._eventIndex_NameArray[lastEventItemIndex]
        this._eventIndex_NameArray[lastEventItemIndex] = tmp_Name
        //  置换4
        this._eventIndex_TagArray[eventItemIndex] = this._eventIndex_TagArray[lastEventItemIndex]
        this._eventIndex_TagArray[lastEventItemIndex] = tmp_Tag
        // 删除
        this._eventIndex_EventItemArray.length = this._eventIndex_EventItemArray.length - 1
        this._eventIndex_EventIdArray.length = this._eventIndex_EventIdArray.length - 1
        this._eventIndex_NameArray.length = this._eventIndex_NameArray.length - 1
        this._eventIndex_TagArray.length = this._eventIndex_TagArray.length - 1
    }

    on(name: string, event: (event: IEventItem, obj: any) => void, context?: unknown) {
        if (this._eventIndex_NameArray.indexOf(name) > -1) {
            let indexs = getAllIndices(this._eventIndex_NameArray, name)
            let is_has_same = false
            for (let i = 0; i < indexs.length; i++) {
                let _index = indexs[i]
                let eventItem = this._eventIndex_EventItemArray[_index]
                if (eventItem && eventItem.context === context && eventItem.event == event) {
                    is_has_same = true
                    break;
                }
            }
            if (is_has_same) {
                this._debug('有重复了,不进行push')
            } else {
                this._debug('event不同,进行push')
                this.createEventItem(name, event, context)
            }
        } else {
            this.createEventItem(name, event, context)
            this._debug('在通过 事件名name=' + name + ' 在 name2EventItemsMap 中未找到,则新增一个')
        }
        this._tag = '' // 置空
    }

    off(name: string, event: Function, context?: unknown) {
        if (this._eventIndex_NameArray.indexOf(name) > -1) {
            let indexs = getAllIndices(this._eventIndex_NameArray, name)
            let eventItemIds: number[] = []
            for (let i = 0; i < indexs.length; i++) {
                let eventItem = this._eventIndex_EventItemArray[indexs[i]] // 注意在循环删除时_eventIndex_EventItemArray已被改变
                if (eventItem && eventItem.context === context && eventItem.event == event) {
                    eventItemIds.push(eventItem.id) // 所以只能先通过eventItemIds先获取ids
                }
            }
            for (let i = 0; i < eventItemIds.length; i++) {
                this.removeEventItem(eventItemIds[i])
            }
        }
    }

    emit(name: string, obj: any = null, context?: unknown) {
        if (this._eventIndex_NameArray.indexOf(name) > -1) {
            let indexs = getAllIndices(this._eventIndex_NameArray, name)
            for (let i = 0; i < indexs.length; i++) {
                let _index = indexs[i]
                let eventItem = this._eventIndex_EventItemArray[_index]
                if (eventItem && eventItem.context === context) {
                    eventItem.event.apply(context, [eventItem, obj])
                }
            }
        }
    }

    clearByTag(tag: string | null = null) {
        if (tag == null) {
            this._eventIndex_EventIdArray = []
            this._eventIndex_EventItemArray = []
            this._eventIndex_NameArray = []
            this._debug('全部清空')
        } else {
            if (this._eventIndex_TagArray.indexOf(tag) > -1) {
                let remove_indexs = getAllIndices(this._eventIndex_TagArray, tag)
                let eventItemIds: number[] = []
                for (let i = 0; i < remove_indexs.length; i++) {
                    let eventItem = this._eventIndex_EventItemArray[remove_indexs[i]]
                    eventItemIds.push(eventItem.id)
                }
                for (let i = 0; i < eventItemIds.length; i++) {
                    this.removeEventItem(eventItemIds[i])
                }
                this._debug('清空tag=' + tag)
            } else {
                this._debug('未找到tag=' + tag)
            }
        }
    }

    private _debug(str = '') {
        if (!this._is_debug) {
            return
        }
        console.log('======' + str + '======')
        console.log('_eventIndex_EventIdArray', this._eventIndex_EventIdArray)
        console.log('_eventIndex_EventItemArray', this._eventIndex_EventItemArray)
        console.log('_eventIndex_NameArray', this._eventIndex_NameArray)
        console.log('_eventIndex_TagArray', this._eventIndex_TagArray)
    }
}
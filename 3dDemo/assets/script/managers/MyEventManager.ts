import { EventManager } from "@aixh-cc/xhgame_ec_framework"

export class MyEventManager extends EventManager {
    get enums() {
        return EventEnums
    }
}

export enum EventEnums {
    join = "join",
}
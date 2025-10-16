import { Node, sys } from "cc";
import { CryptoEmpty, CryptoManager, IManagers, INode, StorageManager, Websocket } from "@aixh-cc/xhgame_ec_framework";
import { MyUiManager } from "./managers/MyUiManager";
import { MyAudioManager } from "./managers/MyAudioManager";
import { MyNetManager } from "./managers/MyNetManager";
import { MyFactoryManager } from "./managers/MyFactoryManager";
import { MyTableManager } from "./managers/MyTableManager";
import { MyEventManager } from "./managers/MyEventManager";
import { xhgame } from "./xhgame";

export class CocosGameManagers implements IManagers {
    node: Node

    init(node: Node | INode) {
        this.node = node as Node
        this.build();
    }

    build() {
        this.setEventManager(new MyEventManager())
        this.setTableManager(this.getTables())
        this.setFactoryManager(this.getFactorys())
        this.setNetManager(new MyNetManager())
        this.setGuiManager(new MyUiManager())
        this.setStorageManager(new StorageManager('xhgame', sys.localStorage))
        this.setCryptoManager(new CryptoManager('s', new CryptoEmpty()))
        // 
        this.setAudioManager(new MyAudioManager<CocosAudioDrive>(this.node.addComponent(CocosAudioDrive)))
    }
    getTables() {
        let tableManager = new MyTableManager()
        tableManager.autoRegister()
        return tableManager
    }
    getFactorys() {
        let factoryManager = new MyFactoryManager()
        factoryManager.autoRegister()
        return factoryManager
    }
    guiManager: MyUiManager
    setGuiManager(guiManager) {
        this.guiManager = guiManager
    }
    getGuiManager(): MyUiManager {
        return this.guiManager
    }
    cryptoManager: CryptoManager<CryptoEmpty>
    setCryptoManager(cryptoManager) {
        this.cryptoManager = cryptoManager
    }
    getCryptoManager(): CryptoManager<CryptoEmpty> {
        return this.cryptoManager
    }
    audioManager: MyAudioManager<CocosAudioDrive>
    setAudioManager(audioManager: MyAudioManager<CocosAudioDrive>) {
        this.audioManager = audioManager
    }
    getAudioManager(): MyAudioManager<CocosAudioDrive> {
        return this.audioManager
    }
    // table
    tableManager: MyTableManager
    setTableManager(tableManager: MyTableManager) {
        this.tableManager = tableManager
    }
    getTableManager(): MyTableManager {
        return this.tableManager
    }
    // factory
    factoryManager: MyFactoryManager
    setFactoryManager(factoryManager: MyFactoryManager) {
        this.factoryManager = factoryManager
    }
    getFactoryManager(): MyFactoryManager {
        return this.factoryManager
    }
    // 
    // cameraManager: CameraManager<UICamera, UICamera>
    // setCameraManager(cameraManager) {
    //     this.cameraManager = cameraManager
    //     return this
    // }
    // getCameraManager(): CameraManager<UICamera, UICamera> {
    //     return this.cameraManager
    // }
    netManager: MyNetManager
    setNetManager(netManager: MyNetManager) {
        this.netManager = netManager
        return this
    }
    getNetManager(): MyNetManager {
        return this.netManager
    }
    storageManager: StorageManager
    setStorageManager(storageManager: StorageManager) {
        this.storageManager = storageManager
    }
    getStorageManager(): StorageManager {
        return this.storageManager
    }
    private _eventManager: MyEventManager
    setEventManager(eventManager: MyEventManager) {
        this._eventManager = eventManager
    }
    getEventManager(): MyEventManager {
        return this._eventManager
    }
}


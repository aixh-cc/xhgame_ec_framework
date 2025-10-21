import { IAssetDrive } from "./Asset/AssetDrive"
import { AssetManager } from "./Asset/AssetManager"
import { IAudioDrive } from "./Audio/AudioDrive"
import { AudioManager } from "./Audio/AudioManager"
import { ICrypto } from "./Crypto/Crypto"
import { CryptoManager } from "./Crypto/CryptoManager"
import { EventManager } from "./Event/EventManager"
import { FactoryManager } from "./Factory/FactoryManager"
import { IHttp } from "./Net/Http"
import { NetManager } from "./Net/NetManager"
import { ISocket } from "./Net/Socket"
import { StorageManager } from "./Storage/StorageManager"
import { TableManager } from "./Table/TableManager"
import { INode, IUiDrive } from "./Ui/UiDrive"
import { UiManager } from "./Ui/UiManager"

export interface IManagers {
    // table
    setTableManager(tableManager: TableManager<any>): void
    getTableManager(): TableManager<any>
    // event
    setEventManager(eventManager: EventManager): void
    getEventManager(): EventManager
    // factory
    setFactoryManager(factoryManager: FactoryManager<any>): void
    getFactoryManager(): FactoryManager<any>
    // storage
    setStorageManager(storageManager: StorageManager): void
    getStorageManager(): StorageManager
    // crypto
    setCryptoManager(cryptoManager: CryptoManager<ICrypto>): void
    getCryptoManager(): CryptoManager<ICrypto>
    // net
    setNetManager(netManager: NetManager<IHttp, ISocket>): void
    getNetManager(): NetManager<IHttp, ISocket>
    // ui
    setGuiManager(guiManager: UiManager<IUiDrive, INode>): void
    getGuiManager(): UiManager<IUiDrive, INode>
    // audio
    setAudioManager(audioManager: AudioManager<IAudioDrive>): void
    getAudioManager(): AudioManager<IAudioDrive>
    // asset
    setAssetManager(audioManager: AssetManager<IAssetDrive>): void
    getAssetManager(): AssetManager<IAssetDrive>
}
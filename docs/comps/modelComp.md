---
outline: deep
---

# modelComp组件

## 主要职责

 - 1、modelComp存储非临时数据
 - 2、modelSystem负责与后端接口交互

## 具体说明

### 1、modelComp存储非临时数据

这里以玩家数据为例子，

```ts
export class PlayerModelComp extends BaseModelComp {
    compName: string = 'PlayerModelComp'
    initBySystems: (typeof System)[] = []
    // 
    //
    accountInfo: IAccountInfo = null
    playerInfo: IPlayer = null
    selectedBattleId: number = 0
    reset() {
        this.accountInfo = null
        this.playerInfo = null
        this.selectedBattleId = 0
    }
    actions = {
        postGetAccount: (pdata: IPostParam) => {
            return PlayerModelSystem.postGetAccount(this, pdata)
        },
        postPlayerEnter: () => {
            return PlayerModelSystem.postPlayerEnter(this)
        }
    }
    onDetach(): void {

    }
}
```

主要存储了:

- 1、账号信息`accountInfo`
- 2、玩家后端信息`IPlayer`
- 3、及玩家当前的选择信息 `selectedBattleId`

已经2个对外的方法：postGetAccount，postPlayerEnter




### 2、modelSystem负责与后端接口交互

```ts
export class PlayerModelSystem extends System {

    static async getAccount(comp: PlayerModelComp, pdata: IPostParam) {
        return new Promise<IAccountInfo>(async (resolve, reject) => {
            let data = {
                code: pdata.code,
                platform: xhgame.game.at_platform,
                anonymousCode: pdata.anonymousCode,
                version: xhgame.game.meta.version
            }
            let resdata = await xhgame.net.http.post(xhgame.game.meta.account_domain + '/' + xhgame.net.enums.GetServerInfo, data)
            console.log(resdata)
            if (resdata) {
                resdata = resdata.res
                let hallDomain = resdata.hallDomain.replace(/^\/+|\/+$/g, '')
                xhgame.storage.origin_set('account', resdata.account)
                xhgame.storage.origin_set('account_token', resdata.account_token)
                xhgame.storage.origin_set('hallDomain', hallDomain)
                comp.accountInfo = {
                    account: resdata.account,
                    account_token: resdata.account_token,
                    hallDomain: hallDomain
                }
                resolve(comp.accountInfo)
            } else {
                reject(false)
            }
        })
    }

    static postPlayerEnter(comp: PlayerModelComp) {
        return new Promise<boolean>(async (resolve, reject) => {
            let data = {
                account: comp.accountInfo.account,
                account_token: comp.accountInfo.account_token,
                gameCode: xhgame.game.meta.game_code,
                serverNo: xhgame.game.meta.server_no,
            }
            let ret = await xhgame.net.http.post(comp.accountInfo.hallDomain + '/' + xhgame.net.enums.PlayerEnter, data)
            console.log(ret)
            if (ret) {
                console.log(comp.accountInfo.hallDomain + '/' + xhgame.net.enums.PlayerEnter, ret)
                ret = ret.res
                xhgame.storage.origin_set('token', ret.token)
                comp.playerInfo = ret.playerInfo
                comp.selectedBattleId = ret.playerInfo.maxBattleId
                comp.notify()
                resolve(true)
            } else {
                reject(false)
            }
        })
    }

}
```

主要处理了:

- 1、检测是否需要向后方发起请求
- 2、接口请求获取数据
- 3、将获取的数据加工处理保存

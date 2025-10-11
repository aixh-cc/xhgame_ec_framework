---
outline: deep
---

## 说明

![alt text](GlobalEntry(总入口).png)

## 架构说明

主门面`xhgame`,主要构成为`managers`及`game`

### managers
开发者可以根据自己的喜好构建`managers`，并将其加入到门面`xhgame`。

### game
开发者默认使用`cocosGame`。如果开发者同时想兼容终端开发，则需要自行建一个`TestGame`

### 流程

cocosGame/TestGame.start() // 进入安装

触发xhgame.init(),完成managers.init()及game.init()
完成后触发xhgame.playGame() 进入游戏首页

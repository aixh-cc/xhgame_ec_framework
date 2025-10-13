import { assert, describe, test } from "poku";
import { DI, autoBindForDI, inject } from "../../../packages/core/src/DI/DI";

// 定义测试服务接口
interface IEmailService {
    sendEmail(to: string, content: string): Promise<string>;
}
// 定义测试服务接口
interface ISmsService {
    sendPhone(to: string, content: string): Promise<string>;
}
export interface IUserService {
    getUser(id: number): Promise<string>;
}
// 使用装饰器绑定服务
@autoBindForDI()
class EmailService implements IEmailService {
    async sendEmail(to: string, content: string): Promise<string> {
        return `EmailService: Sending email to ${to}: ${content}`;
    }
}
@autoBindForDI('SmsService')
class SmsService implements ISmsService {
    async sendPhone(to: string, content: string): Promise<string> {
        return `SmsService: Sending ${to}: ${content}`;
    }
}

@autoBindForDI('UserService')
export class UserService implements IUserService {
    async getUser(id: number): Promise<string> {
        return `User ${id}`;
    }
}

export class UserController {
    constructor(
        @inject('UserService') private userService: IUserService,
        @inject('SmsService') private smsService: SmsService
    ) { }

    async sendUserSms(userId: number) {
        const user = await this.userService.getUser(userId);
        return await this.smsService.sendPhone(user, 'Welcome!');
    }
    getSmsService() {
        return this.smsService
    }
}

test('测试DI', async () => {
    assert.equal(DI.isBound(EmailService), true, '服务是否已通过装饰器默认类绑定正常')
    assert.equal(DI.isBound('SmsService'), true, '服务是否已通过装饰器字符串绑定正常')
    const emailService = DI.make<IEmailService>(EmailService);
    let res_email = await emailService.sendEmail('direct@example.com', 'Hello from direct call');
    assert.equal(res_email, 'EmailService: Sending email to direct@example.com: Hello from direct call', '获取EmailService实例正常')
    const smsService = DI.make<ISmsService>('SmsService');
    let res_sms = await smsService.sendPhone('13500001111', 'hello');
    assert.equal(res_sms, 'SmsService: Sending 13500001111: hello', '获取SmsService实例正常')

    // 手动绑定
    DI.bindTransient<UserController>('UserController', UserController);
    const controller = DI.make<UserController>('UserController');
    assert.equal(DI.isBound('UserController'), true, '手动绑定正常')
    const result = await controller.sendUserSms(11);
    assert.equal(result, 'SmsService: Sending User 11: Welcome!', '依赖注入正常')
    // 是否是同一个实例
    assert.equal(controller.getSmsService() === smsService, true, '是同一个实例正确')

    // 手动重新绑
    DI.unbind('SmsService')
    DI.bindTransient<ISmsService>('SmsService', SmsService);
    const smsServiceTwo = DI.make<ISmsService>('SmsService');
    // 是否是同一个实例
    assert.equal(controller.getSmsService() === smsServiceTwo, false, '不是同一个实例正确')

    // 整个应用生命周期内同一实例
    DI.unbind('SmsService')
    DI.bindSingleton<ISmsService>('SmsService', SmsService);
    const smsServiceThree = DI.make<ISmsService>('SmsService');
    // 重新手动绑定(这次的SmsService,因为上面的绑定时是同一实例,所以相同)
    DI.bindTransient<UserController>('UserController', UserController);
    const controllerThree = DI.make<UserController>('UserController');
    assert.equal(controllerThree.getSmsService() === smsServiceThree, true, 'DI.bindSingleton同一个实例正确')

    // 整个应用生命周期内同一实例
    DI.unbind('SmsService')
    DI.bindInstance<ISmsService>('SmsService', new SmsService());
    const smsServiceFour = DI.make<ISmsService>('SmsService');
    // 重新手动绑定(这次的SmsService,因为上面的绑定时是同一实例,所以相同)
    DI.bindTransient<UserController>('UserController', UserController);
    const controllerFour = DI.make<UserController>('UserController');
    assert.equal(controllerFour.getSmsService() === smsServiceFour, true, 'DI.bindInstance同一个实例正确')



})

import { describe, test, expect } from "bun:test";
import { DI, autoBindForDI } from "../../src/DI/DI";

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

    @DI.lazyInject('UserService')
    private userService!: IUserService
    @DI.lazyInject('SmsService')
    private smsService!: SmsService

    async sendUserSms(userId: number) {
        const user = await this.userService.getUser(userId);
        return await this.smsService.sendPhone(user, 'Welcome!');
    }
    getSmsService() {
        return this.smsService
    }
}

describe("DI功能", () => {
    test("测试DI", async () => {
        expect(DI.isBound(EmailService)).toBe(true)
        expect(DI.isBound('SmsService')).toBe(true)
        const emailService = DI.make<IEmailService>(EmailService);
        let res_email = await emailService.sendEmail('direct@example.com', 'Hello from direct call');
        expect(res_email).toBe('EmailService: Sending email to direct@example.com: Hello from direct call')
        const smsService = DI.make<ISmsService>('SmsService');
        let res_sms = await smsService.sendPhone('13500001111', 'hello');
        expect(res_sms).toBe('SmsService: Sending 13500001111: hello')

        // 手动绑定
        DI.bindTransient<UserController>('UserController', UserController);
        const controller = DI.make<UserController>('UserController');
        expect(DI.isBound('UserController')).toBe(true)
        const result = await controller.sendUserSms(11);
        expect(result).toBe('SmsService: Sending User 11: Welcome!')
        // 是否是同一个实例
        expect(controller.getSmsService() === smsService).toBe(true)

        // 手动重新绑
        DI.unbind('SmsService')
        DI.bindTransient<ISmsService>('SmsService', SmsService);
        const smsServiceTwo = DI.make<ISmsService>('SmsService');
        // 是否是同一个实例
        expect(controller.getSmsService() === smsServiceTwo).toBe(false)

        // 整个应用生命周期内同一实例
        DI.unbind('SmsService')
        DI.bindSingleton<ISmsService>('SmsService', SmsService);
        const smsServiceThree = DI.make<ISmsService>('SmsService');
        // 重新手动绑定(这次的SmsService,因为上面的绑定时是同一实例,所以相同)
        DI.bindTransient<UserController>('UserController', UserController);
        const controllerThree = DI.make<UserController>('UserController');
        expect(controllerThree.getSmsService() === smsServiceThree).toBe(true)

        // 整个应用生命周期内同一实例
        DI.unbind('SmsService')
        DI.bindInstance<ISmsService>('SmsService', new SmsService());
        const smsServiceFour = DI.make<ISmsService>('SmsService');
        // 重新手动绑定(这次的SmsService,因为上面的绑定时是同一实例,所以相同)
        DI.bindTransient<UserController>('UserController', UserController);
        const controllerFour = DI.make<UserController>('UserController');
        expect(controllerFour.getSmsService() === smsServiceFour).toBe(true)
    });
});

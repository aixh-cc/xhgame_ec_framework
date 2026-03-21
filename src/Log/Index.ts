// index.ts - 主导出文件

import { ColorLogger } from './ColorLogger';
import { ColorLoggerOptions, LogLevel, ColorName } from './Types';

// 默认日志实例
const defaultLogger = new ColorLogger();

// 工厂函数
function createLogger(options: ColorLoggerOptions = {}): ColorLogger {
    return new ColorLogger(options);
}

// 创建预设的日志实例
const loggers = {
    development: createLogger({ level: 'debug', includeCallerInfo: true }),
    production: createLogger({ level: 'warn', colorsEnabled: false }),
    test: createLogger({ level: 'verbose', showTimestamp: false }),
};

// 导出
export {
    ColorLogger,
    defaultLogger as logger,
    createLogger,
    loggers,
};

// 导出类型
export type { ColorLoggerOptions, LogLevel, ColorName };
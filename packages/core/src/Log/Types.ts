// types.ts - 类型定义文件

export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'verbose';
export type ColorName =
    | 'reset' | 'bright' | 'dim' | 'underscore' | 'blink' | 'reverse' | 'hidden'
    | 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white'
    | 'bgBlack' | 'bgRed' | 'bgGreen' | 'bgYellow' | 'bgBlue' | 'bgMagenta' | 'bgCyan' | 'bgWhite';

export interface ColorLoggerOptions {
    /** 日志级别，默认 'info' */
    level?: LogLevel;
    /** 是否显示时间戳，默认 true */
    showTimestamp?: boolean;
    /** 是否启用颜色，默认 true */
    colorsEnabled?: boolean;
    /** 自定义时间戳格式 */
    timestampFormat?: string;
    /** 自定义级别标签 */
    levelLabels?: Partial<Record<LogLevel, string>>;
    /** 是否包含调用者信息（仅限Node.js） */
    includeCallerInfo?: boolean;
}

export interface NodeColors {
    [key: string]: string;
}

export interface BrowserStyles {
    [key: string]: string;
}

export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    levelLabel: string;
    message: string;
    args: any[];
    caller?: string;
}
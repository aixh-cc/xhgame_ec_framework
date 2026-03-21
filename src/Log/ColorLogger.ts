// color-logger.ts

import {
  BrowserStyles,
  ColorLoggerOptions,
  ColorName,
  LogEntry,
  LogLevel,
  NodeColors
} from './Types';

export class ColorLogger {
  private options: Required<ColorLoggerOptions>;
  private readonly isNode: boolean;
  private readonly isBrowser: boolean;
  private readonly levels: Record<LogLevel, number>;
  private currentLevel: number;

  private static readonly DEFAULT_LEVEL_LABELS: Record<LogLevel, string> = {
    error: 'ERROR',
    warn: 'WARN',
    info: 'INFO',
    debug: 'DEBUG',
    verbose: 'VERBOSE'
  };
  // 单例模式
  private static instance: ColorLogger | null = null;
  /**
   * 获取单例实例
   */
  public static getInstance(options: ColorLoggerOptions = {}): ColorLogger {
    if (!ColorLogger.instance) {
      ColorLogger.instance = new ColorLogger(options);
    }
    return ColorLogger.instance;
  }

  constructor(options: ColorLoggerOptions = {}) {
    this.options = {
      level: 'info',
      showTimestamp: true,
      colorsEnabled: true,
      timestampFormat: 'YYYY-MM-DD HH:mm:ss',
      levelLabels: ColorLogger.DEFAULT_LEVEL_LABELS,
      includeCallerInfo: false,
      ...options
    };

    // 环境检测
    this.isNode = typeof process !== 'undefined' &&
      process.versions?.node !== undefined;
    this.isBrowser = typeof window !== 'undefined' &&
      typeof document !== 'undefined';

    // 日志级别定义
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      verbose: 4
    };

    this.currentLevel = this.levels[this.options.level];
  }

  /**
   * 设置日志级别
   */
  setLevel(level: LogLevel): void {
    if (this.levels[level] !== undefined) {
      this.currentLevel = this.levels[level];
      this.options.level = level;
    }
  }

  /**
   * 获取当前日志级别
   */
  getLevel(): LogLevel {
    return this.options.level;
  }

  /**
   * 启用/禁用颜色输出
   */
  enableColors(enabled: boolean = true): void {
    this.options.colorsEnabled = enabled;
  }

  /**
   * 启用/禁用时间戳
   */
  enableTimestamp(enabled: boolean = true): void {
    this.options.showTimestamp = enabled;
  }

  /**
   * 获取 Node.js 环境的颜色代码
   */
  private get nodeColors(): NodeColors {
    return {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      dim: '\x1b[2m',
      underscore: '\x1b[4m',
      blink: '\x1b[5m',
      reverse: '\x1b[7m',
      hidden: '\x1b[8m',

      // 前景色
      black: '\x1b[30m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      white: '\x1b[37m',

      // 背景色
      bgBlack: '\x1b[40m',
      bgRed: '\x1b[41m',
      bgGreen: '\x1b[42m',
      bgYellow: '\x1b[43m',
      bgBlue: '\x1b[44m',
      bgMagenta: '\x1b[45m',
      bgCyan: '\x1b[46m',
      bgWhite: '\x1b[47m'
    };
  }

  /**
   * 获取浏览器环境的 CSS 样式
   */
  private get browserStyles(): BrowserStyles {
    return {
      reset: 'color: inherit; font-weight: normal;',
      bold: 'font-weight: bold;',
      italic: 'font-style: italic;',
      underline: 'text-decoration: underline;',

      // 前景色
      black: 'color: black;',
      red: 'color: #e74c3c;',
      green: 'color: #2ecc71;',
      yellow: 'color: #f39c12;',
      blue: 'color: #3498db;',
      magenta: 'color: #9b59b6;',
      cyan: 'color: #1abc9c;',
      white: 'color: white;',

      // 背景色
      bgBlack: 'background-color: black; color: white;',
      bgRed: 'background-color: #e74c3c; color: white;',
      bgGreen: 'background-color: #2ecc71; color: white;',
      bgYellow: 'background-color: #f39c12; color: black;',
      bgBlue: 'background-color: #3498db; color: white;',
      bgMagenta: 'background-color: #9b59b6; color: white;',
      bgCyan: 'background-color: #1abc9c; color: white;',
      bgWhite: 'background-color: white; color: black;'
    };
  }

  /**
   * 格式化时间戳
   */
  private getTimestamp(): string {
    const now = new Date();

    // 简单的格式化，可以根据需要扩展
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * 获取调用者信息（用于调试）
   */
  private getCallerInfo(): string | undefined {
    if (!this.options.includeCallerInfo || !this.isNode) {
      return undefined;
    }

    try {
      const prepareStackTrace = Error.prepareStackTrace;
      Error.prepareStackTrace = (_, stack) => stack;

      const error = new Error();
      const stack = error.stack as unknown as NodeJS.CallSite[];
      Error.prepareStackTrace = prepareStackTrace;

      // 第0个是getCallerInfo自身，第1个是_log，第2个是调用者
      if (stack && stack.length > 2) {
        const caller = stack[2];
        const fileName = caller.getFileName() || '';
        const lineNumber = caller.getLineNumber() || 0;
        // const functionName = caller.getFunctionName() || 'anonymous';
        // 只显示文件名和行号
        const shortFileName = fileName.split('/').pop() || fileName;
        return `${shortFileName}:${lineNumber}`;
      }
    } catch (error) {
      // 忽略错误
    }

    return undefined;
  }

  /**
   * 格式化参数
   */
  private formatArgs(...args: any[]): any[] {
    return args.map(arg => {
      // 处理 Error 对象
      if (arg instanceof Error) {
        return {
          message: arg.message,
          stack: arg.stack,
          name: arg.name
        };
      }

      // 处理对象（避免循环引用）
      if (typeof arg === 'object' && arg !== null) {
        try {
          // 尝试 JSON.stringify，如果失败则返回字符串表示
          JSON.stringify(arg);
          return arg;
        } catch {
          return String(arg);
        }
      }

      return arg;
    });
  }

  /**
   * 通用日志方法
   */
  private _log(
    levelName: LogLevel,
    styles: { node?: string; browser?: string },
    ...args: any[]
  ): void {
    // 检查日志级别是否满足
    if (this.levels[levelName] > this.currentLevel) {
      return;
    }

    const timestamp = this.options.showTimestamp ? this.getTimestamp() : '';
    const levelLabel = `[${this.options.levelLabels?.[levelName] || levelName.toUpperCase()}]`;
    const callerInfo = this.getCallerInfo();

    // 格式化参数
    const formattedArgs = this.formatArgs(...args);

    if (this.isNode && this.options.colorsEnabled) {
      // Node.js 环境带颜色输出
      const colorCode = styles.node || '';
      const reset = this.nodeColors.reset;

      // 构建日志消息
      let message = '';
      if (timestamp) {
        message += `${timestamp} `;
      }
      message += `${colorCode}${levelLabel}${reset} `;
      if (callerInfo) {
        message += ` ${this.nodeColors.dim} (${callerInfo})${reset} `;
      }

      console.log(message, ...formattedArgs);
    } else if (this.isBrowser && this.options.colorsEnabled) {
      // 浏览器环境带样式输出
      const style = styles.browser || '';

      // 构建浏览器控制台参数
      const consoleArgs: any[] = [];
      let formatString = '';

      if (timestamp) {
        formatString += '%c%s %c%s';
        consoleArgs.push('color: gray;', timestamp, style, levelLabel);
      } else {
        formatString += '%c%s';
        consoleArgs.push(style, levelLabel);
      }

      if (callerInfo) {
        formatString += ' %c%s';
        consoleArgs.push('color: #95a5a6; font-style: italic;', `(${callerInfo})`);
      }

      // 添加格式化字符串用于消息
      if (formattedArgs.length > 0) {
        formatString += ' %s'.repeat(formattedArgs.length);
        consoleArgs.push(...formattedArgs);
      }

      console.log(formatString, ...consoleArgs);
    } else {
      // 无颜色输出
      let message = '';
      if (timestamp) {
        message += `${timestamp} `;
      }
      message += `${levelLabel} `;
      if (callerInfo) {
        message += ` (${callerInfo})`;
      }

      console.log(message, ...formattedArgs);
    }

    // 触发日志事件（可用于扩展）
    this.emitLogEvent({
      timestamp: timestamp || new Date().toISOString(),
      level: levelName,
      levelLabel,
      message: formattedArgs.map(arg => String(arg)).join(' '),
      args: formattedArgs,
      caller: callerInfo
    });
  }

  /**
   * 触发日志事件（用于扩展）
   */
  private emitLogEvent(entry: LogEntry): void {
    // 可以在这里添加事件发射器逻辑
    // 例如：this.eventEmitter.emit('log', entry);
  }

  /**
   * 错误级别日志
   */
  error(...args: any[]): void {
    const styles = {
      node: this.nodeColors.red + this.nodeColors.bright,
      browser: this.browserStyles.red + this.browserStyles.bold
    };
    this._log('error', styles, ...args);
  }

  /**
   * 警告级别日志
   */
  warn(...args: any[]): void {
    const styles = {
      node: this.nodeColors.yellow + this.nodeColors.bright,
      browser: this.browserStyles.yellow + this.browserStyles.bold
    };
    this._log('warn', styles, ...args);
  }

  /**
   * 信息级别日志
   */
  info(...args: any[]): void {
    const styles = {
      node: this.nodeColors.green,
      browser: this.browserStyles.green
    };
    this._log('info', styles, ...args);
  }

  /**
   * 调试级别日志
   */
  debug(...args: any[]): void {
    const styles = {
      node: this.nodeColors.blue,
      browser: this.browserStyles.blue
    };
    this._log('debug', styles, ...args);
  }

  /**
   * 详细级别日志
   */
  verbose(...args: any[]): void {
    const styles = {
      node: this.nodeColors.cyan,
      browser: this.browserStyles.cyan
    };
    this._log('verbose', styles, ...args);
  }

  /**
   * 自定义颜色输出
   */
  custom(color: ColorName, ...args: any[]): void {
    if (!this.options.colorsEnabled) {
      console.log(...args);
      return;
    }

    if (this.isNode) {
      const colorCode = this.nodeColors[color] || this.nodeColors.white;
      const reset = this.nodeColors.reset;
      console.log(colorCode, ...args, reset);
    } else if (this.isBrowser) {
      const style = this.browserStyles[color] || this.browserStyles.white;

      if (args.length === 1) {
        console.log(`% c${args[0]} `, style);
      } else {
        console.log(`% c${args[0]} `, style, ...args.slice(1));
      }
    } else {
      console.log(...args);
    }
  }

  /**
   * 成功日志（绿色高亮）
   */
  success(...args: any[]): void {
    const styles = {
      node: this.nodeColors.green + this.nodeColors.bright,
      browser: this.browserStyles.green + this.browserStyles.bold
    };
    const successLabel = '[SUCCESS]';

    if (this.isNode && this.options.colorsEnabled) {
      console.log(`${styles.node}${successLabel}${this.nodeColors.reset} `, ...args);
    } else if (this.isBrowser && this.options.colorsEnabled) {
      console.log(`% c${successLabel} `, styles.browser, ...args);
    } else {
      console.log(successLabel, ...args);
    }
  }
}
/**
 * PM2 Ecosystem Configuration for Bible VibeCoder
 *
 * Конфигурация для запуска всех сервисов в development режиме
 * с видимыми логами и автоматическим перезапуском.
 */

module.exports = {
  apps: [
    {
      name: 'http-server',
      script: 'bun',
      args: 'run src/server.ts',
      cwd: process.cwd(),
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'development',
        PORT: '7103',
        FORCE_COLOR: '1',
      },
      log_file: './logs/http-server.log',
      out_file: './logs/http-server-out.log',
      error_file: './logs/http-server-error.log',
      time: true,
    },
    // ОТКЛЮЧЕН: telegram-bot - бот уже запускается внутри http-server
    // {
    //   name: "telegram-bot",
    //   script: "bun",
    //   args: "run --watch index.ts",
    //   cwd: process.cwd(),
    //   interpreter: "none",
    //   instances: 1,
    //   autorestart: true,
    //   watch: false, // bun уже делает watch
    //   max_memory_restart: "500M",
    //   env: {
    //     NODE_ENV: "development",
    //     FORCE_COLOR: "1", // Цветные логи
    //   },
    //   log_file: "./logs/telegram-bot.log",
    //   out_file: "./logs/telegram-bot-out.log",
    //   error_file: "./logs/telegram-bot-error.log",
    //   time: true,
    // },
    {
      name: 'inngest-dev',
      script: 'npx',
      args: [
        'inngest-cli',
        'dev',
        '--port',
        '8288',
        '--connect-gateway-port',
        '8289',
        '--log-level',
        'debug',
      ],
      cwd: process.cwd(),
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'development',
        INNGEST_DEV_PORT: '8288',
        INNGEST_CONNECT_PORT: '8289',
        FORCE_COLOR: '1',
      },
      log_file: './logs/inngest-dev.log',
      out_file: './logs/inngest-dev-out.log',
      error_file: './logs/inngest-dev-error.log',
      time: true,
    },
  ],

  deploy: {
    production: {
      user: 'node',
      host: 'your-server.com',
      ref: 'origin/master',
      repo: 'git@github.com:your-repo.git',
      path: '/var/www/production',
      'post-deploy':
        'npm install && pm2 reload ecosystem.config.js --env production',
    },
  },
};

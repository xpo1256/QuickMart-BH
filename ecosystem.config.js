<<<<<<< HEAD
module.exports = {
  apps: [
    {
      name: 'quickmart-backend',
      script: 'src/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
=======
module.exports = {
  apps: [
    {
      name: 'quickmart-backend',
      script: 'src/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
>>>>>>> master

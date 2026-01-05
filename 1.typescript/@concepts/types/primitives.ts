type AppConfig = {
  appName: string;
  port: number;
  isProduction: boolean;
};

const config: AppConfig = {
  appName: "MERN Shop",
  port: 5000,
  isProduction: false
};

function startServer(config: AppConfig): void {
  if (config.isProduction) {
    console.log(`Running ${config.appName} in production on port ${config.port}`);
  } else {
    console.log(`Running ${config.appName} in development on port ${config.port}`);
  }
}

startServer(config);

import express, { Application } from 'express';

export function createApp(): Application {
    const app = express();

    app.use(express.json());

    return app;
}

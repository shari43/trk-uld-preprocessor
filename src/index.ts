import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import pinohttp from 'pino-http';
import logger from './logger';

// Load .env file
dotenv.config();

import { requestTypes } from './utils/constants';
import { processEvent } from './functions/process';
import { Success } from './classes/success';
import { HttpError } from './classes/error';

const app = express();
const port = process.env.PORT || 7575;

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(pinohttp({ logger }));

// Simple route for testing
app.post('/ingress/:type', async (req: Request, res: Response) => {

    try {
        const type: string = req.params.type;
        if (!(type == requestTypes.PROX || type == requestTypes.MESH)) {
            req.log.error({ type }, `Unrecognized type provided to service.`);
            return res.status(400).send({
                message: 'Bad Request.'
            });
        }

        const bodyObject = req.body;
        const result: Success = await processEvent(bodyObject);
        return res.status(result.statusCode).send({ message: result.message });

    } catch (err) {
        req.log.error(err, `Error processing event.`);
        if (err instanceof HttpError) {
            return res.status(err.statusCode).send({ message: err.message });
        }
        return res.status(500).send({ message: 'Internal Server Error.' });
    }

});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

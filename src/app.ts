import express from "express";

import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import compression from "compression";

import globalError from "@/middleware/global-error.middleware";
import unhandledRoutes from "@/resources/controllers/unhandled-error.controller";

// Application Variables

const app = express();
// Set security HTTP header
app.use(helmet());

app.use(cors());

// Body parser
app.use(express.json({ limit: "10kb" }));

// Data sanitzation against query injection
app.use(mongoSanitize());

// Data sanitization against xss
app.use(xss());

app.use(compression());

app.use(express.urlencoded({ extended: false }));

// unhandled routes
app.all("*", unhandledRoutes);
// global error
app.use(globalError);

export { app };

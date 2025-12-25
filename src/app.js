const express = require('express');
const cors = require('cors');

const clinicRoutes = require('./routes/clinic.routes');
const doctorRoutes = require('./routes/doctor.routes');
const practitionerRoleRoutes = require('./routes/practitionerRole.routes');
const specialtyRoutes = require('./routes/specialty.routes');
const engagementRoutes = require('./routes/engagement.routes');
const commentRoutes = require('./routes/comment.routes');
const mediaRoutes = require('./routes/media.routes');
const authRoutes = require('./routes/auth.routes');
const homeRoutes = require('./routes/home.routes');
const searchRoutes = require('./routes/search.routes');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const requestLogger = require('./middlewares/requestLogger.middleware');
const { notFound, errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(requestLogger);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/practitioner-roles', practitionerRoleRoutes);
app.use('/api/specialties', specialtyRoutes);
app.use('/api/engagement', engagementRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/search', searchRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

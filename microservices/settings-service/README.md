# Settings Service

Microservice for managing application settings and configurations in Raqmi Bazaar.

## Features

- Company information management
- System preferences
- User preferences
- Tax configurations
- Currency settings
- Payment method settings
- Email templates
- Notification settings
- Feature flags
- Integration configurations

## API Endpoints

### Settings
- `GET /api/settings` - Get all settings
- `GET /api/settings/:key` - Get setting by key
- `PUT /api/settings/:key` - Update setting
- `POST /api/settings/bulk` - Bulk update settings

### Categories
- `GET /api/settings/company` - Company settings
- `GET /api/settings/system` - System settings
- `GET /api/settings/user/:userId` - User settings
- `GET /api/settings/tax` - Tax settings
- `GET /api/settings/payment` - Payment settings

## Environment Variables

See `.env.example` for required environment variables.

## Running the Service

```bash
npm install
npm run migrate:latest
npm run dev
```

## Port

Default port: 3012

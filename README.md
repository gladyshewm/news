# News Aggregation and Analytics System

## Overview
This project is a microservices-based system for aggregating, processing, and analyzing news data. It consists of multiple backend services and a frontend client, all managed via Docker Compose. The system fetches news data from external APIs, stores it in a database, and provides analytics and search functionalities.

## Architecture
### Services
- **Client:** A frontend web application for interacting with the backend services.
- **Data Fetcher:** Responsible for fetching news data from external APIs and processing it.
- **Search Delivery:** Handles search queries and delivers relevant news data to users.
- **Analytics:** Provides analytics based on news data, including top authors and frequently read news.

### Libraries
- **DB:** A shared library for database connection and configuration.
- **Redis:** A shared library for Redis integration.
- **RMQ:** A shared library for RabbitMQ messaging.
- **Shared:** Common DTOs and entities used across services.

## Project Structure
```
apps/
├── analytics
├── data-fetcher
├── search-delivery
libs/
├── db
├── redis
├── rmq
└── shared
```

## Environment Variables
Each service requires specific environment variables for configuration.

### Common Environment Variables
```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=news
REDIS_PASSWORD=my_redis_password
REDIS_USER=my_user
REDIS_USER_PASSWORD=my_user_password
```

### Service-Specific Variables
#### **Search Delivery**
```
PORT=3001
CLIENT_URL=http://localhost:5000
POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=news
RMQ_URI=amqp://rmq:5672
RMQ_SEARCH_DELIVERY_QUEUE=search-delivery
RMQ_DATA_FETCHER_QUEUE=data-fetcher
RMQ_ANALYTICS_QUEUE=analytics
REDIS_HOST=redis
REDIS_PORT=6379
```
#### **Data Fetcher**
```
PORT=3000
POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=news
REDIS_HOST=redis
REDIS_PORT=6379
RMQ_URI=amqp://rmq:5672
RMQ_SEARCH_DELIVERY_QUEUE=search-delivery
RMQ_DATA_FETCHER_QUEUE=data-fetcher
API_URL=https://news-api14.p.rapidapi.com/v2
API_KEY=your_api_key_here
API_HOST=news-api14.p.rapidapi.com
```
#### **Analytics**
```
PORT=3002
POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=news
RMQ_URI=amqp://rmq:5672
RMQ_SEARCH_DELIVERY_QUEUE=search-delivery
RMQ_ANALYTICS_QUEUE=analytics
REDIS_HOST=redis
REDIS_PORT=6379
```

## Getting Started
### Prerequisites
- Docker and Docker Compose installed.

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/gladyshewm/news.git
   cd news
   ```
2. Create `.env` files for each service based on the provided templates.
3. Start the services:
   ```bash
   docker-compose up --build
   ```
4. Access the services:
   - Client: [http://localhost:5000](http://localhost:5000)
   - Search Delivery API: [http://localhost:3001](http://localhost:3001)
   - Data Fetcher API: [http://localhost:3000](http://localhost:3000)
   - Analytics API: [http://localhost:3002](http://localhost:3002)
   
### Volumes
Postgres and other services store data persistently in volumes:
```
volumes:
  pgdata:
  redisdata:
```

### Hot Reload
Each service is configured for development mode with hot reload support.

## Technologies Used
- **Backend:** NestJS, TypeScript
- **Frontend:** React
- **Database:** PostgreSQL
- **Messaging:** RabbitMQ
- **Cache:** Redis
- **Containerization:** Docker, Docker Compose

## API Endpoints
### Search Delivery
- `search-delivery/trending-topics`
- `search-delivery/latest-news`
- `search-delivery/search/articles`
- `search-delivery/search/publishers`
- `search-delivery/analytics/news-click`
- `search-delivery/analytics/frequently-read-news`
- `search-delivery/analytics/top-authors`

## Testing
Each service includes unit and e2e tests.
To run tests:
```bash
npm run test
npm run test:e2e
```

## Deployment
The system can be deployed using Docker Compose. Ensure all environment variables are correctly set.


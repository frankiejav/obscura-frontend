# Elasticsearch Setup Guide

## Quick Fix for Connection Issues

The error you're seeing indicates that Elasticsearch is not accessible. Here are the steps to fix this:

### 1. Check if Elasticsearch is Running

If you're using Docker, make sure Elasticsearch is running:

```bash
# Check if Elasticsearch container is running
docker ps | grep elasticsearch

# If not running, start it
docker-compose up -d elasticsearch
```

### 2. Set Environment Variables

Create a `.env.local` file in your project root with:

```bash
# For local development
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=changeme

# For cloud Elasticsearch
# ELASTICSEARCH_URL=https://your-cluster.elastic-cloud.com:9243
# ELASTICSEARCH_USERNAME=elastic
# ELASTICSEARCH_PASSWORD=your-password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database
```

### 3. Test Elasticsearch Connection

You can test if Elasticsearch is accessible:

```bash
# Test with curl
curl -X GET "localhost:9200" -u elastic:changeme

# Or test the health endpoint
curl -X GET "localhost:9200/_cluster/health" -u elastic:changeme
```

### 4. Common Issues and Solutions

**Issue: Connection refused**
- Elasticsearch is not running
- Wrong port (should be 9200 for HTTP, 9243 for HTTPS)

**Issue: Authentication failed**
- Wrong username/password
- Check your Elasticsearch credentials

**Issue: SSL/TLS errors**
- Use `http://` for local development
- Use `https://` for cloud instances

### 5. For Vercel Deployment

Add these environment variables in your Vercel dashboard:

```bash
ELASTICSEARCH_URL=https://your-elasticsearch-host:9243
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your-password
JWT_SECRET=your-super-secret-jwt-key
DATABASE_URL=your-neon-postgres-url
```

### 6. Docker Setup (if using Docker)

If you're using Docker, make sure your `docker-compose.yml` includes:

```yaml
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=true
      - ELASTIC_PASSWORD=changeme
    ports:
      - "9200:9200"
      - "9300:9300"
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data

volumes:
  elasticsearch-data:
```

### 7. Verify Setup

After setting up, restart your development server:

```bash
npm run dev
```

Then check the console for Elasticsearch connection messages. You should see:
- "Elasticsearch connected successfully" if working
- Detailed error messages if there are issues 
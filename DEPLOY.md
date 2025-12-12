# Deployment Guide

This guide describes how to deploy the application to a production server using Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on the server.
- [Docker Compose](https://docs.docker.com/compose/install/) installed.

## Environment Configuration

1.  Copy `.env.local.docker` to `.env.production` (or creates new one).
    ```bash
    cp .env.local.docker .env.production
    ```
2.  Edit `.env.production` and secure the credentials:
    - Change `POSTGRES_PASSWORD`.
    - Change `JWT_SECRET` to a strong random string.
    - Set `PGADMIN_DEFAULT_EMAIL` and `PGADMIN_DEFAULT_PASSWORD` if you want to change default pgadmin credentials.

## Deployment Steps

1.  **Transfer Files**: Upload the project to your server. You can use `scp`, `rsync`, or git clone.
2.  **Navigate to Directory**:
    ```bash
    cd automate-object-detection-system-app
    ```
3.  **Start Services**:
    Run the production docker-compose file with `--build` to ensure images are created.
    ```bash
    docker-compose -f docker-compose.prod.yml up -d --build
    ```

## Accessing the Application

- **Frontend**: http://<server-ip>:8060
- **Backend API**: http://<server-ip>:8066
- **PostgreSQL**: http://<server-ip>:8004 (Database Port)
- **PgAdmin**: http://<server-ip>:8005

## Managing Services

- **Stop Services**:
    ```bash
    docker-compose -f docker-compose.prod.yml down
    ```
- **View Logs**:
    ```bash
    docker-compose -f docker-compose.prod.yml logs -f
    ```

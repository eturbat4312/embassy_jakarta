# filename: README_DEPLOY.md

## Production (IP only)

Server:

- export NEXT_PUBLIC_API_URL="http://SERVER_IP/api"
- export NEXT_PUBLIC_MEDIA_BASE_URL="http://SERVER_IP"
- docker compose -f docker-compose.prod.yml up -d --build

Update:

- docker compose -f docker-compose.prod.yml down
- git pull
- export NEXT_PUBLIC_API_URL="http://SERVER_IP/api"
- export NEXT_PUBLIC_MEDIA_BASE_URL="http://SERVER_IP"
- docker compose -f docker-compose.prod.yml up -d --build

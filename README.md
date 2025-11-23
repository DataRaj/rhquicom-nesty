## Development:

- Make `.env` files ready:

```
cp ./.env.example ./.env
cp ./.env.docker.example ./.env.docker
```

- Start Docker containers:

```
pnpm docker:dev:up
```

- Run migrations:

```
docker exec -it nestjs-boilerplate-server sh
pnpm migration:up
```

##### For local development:

- Start container:

```
pnpm docker:dev:up
```

- Stop container:

```
pnpm docker:dev:down
```

##### For prod build:

- Start container:

```
pnpm docker:prod:up
```

- Stop container:

```
pnpm docker:prod:down
```

##### Deployment:

```
pnpm erd:generate
```

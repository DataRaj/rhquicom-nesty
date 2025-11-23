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
sh ./bin/deploy.sh
```
<img src="./github-assets/react-email.png" />

### Dependency Graph 📈

Visualize all of your project modules and their dependencies. Also, detect circular dependencies.

NOTE: Make sure [Graphviz](https://www.graphviz.org/) is installed first.

- All dependencies:

```
pnpm graph:app
```

- Only circular dependencies:

```
pnpm graph:circular
```

<figure>
<img src="./github-assets/graph.png" />
</figure>

### Database Entity Relationship Diagram🛢️

Visualize your database entities and their relationships.

```
pnpm erd:generate
```


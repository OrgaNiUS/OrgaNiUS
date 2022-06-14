# OrgaNiUS

OrgaNiUS aims to be a central hub for forming, planning and organising group work.

Available at: https://organius.herokuapp.com/ (still very much a Work-in-Progress!), might take a while to load as Heroku servers sleeps the application when unused for a while.

Built by Kannusami Saraan and See Toh Jin Wei.

## Local Development

The [Makefile](makefile) has some shortcuts for some of the below commands.

```sh
# to install node dependencies
npm install --prefix "client"
# build react client (necessary for Go server because it simply serves the final build)
npm run build --prefix "client"
# run react client as standalone
npm start --prefix "client"

# run go tests
go test -v ./...

# run go server
go run main.go

# compile go server
go build -o main .
# run compiled binary
./main

# build docker container
docker build -t organius .
# run docker container
docker run -p 8080:8080 organius
```

## API

Refer to the [API Documentation](api.md) for more information on how to interact with the server.

## Deployment

This application is deployed on Heroku servers automatically using [Github Actions](.github/workflows/main.yml).

Refer to the [Deployment Guide](deploy.md) for instructions on how to setup the deployment and for future deployments.

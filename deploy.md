# Deployment Guide

This guide is for how to deploy a Golang + React application onto Heroku with a Docker container.

Replace "organius" with your own application name.

## Setup

This section is for initial deployment and is only to be done _once_.

### Docker Setup

1. Install Docker Desktop.
2. Run Docker Desktop application so that you can build and run Docker containers locally.
3. Write a [Dockerfile](Dockerfile). Note that the order of instructions is important to ensure that re-builds of the Docker container doesn't re-download everything. Specifically, run `go mod download` _after_ copying `go.mod` and `go.sum` but _before_ copying your own source code into the Docker image. Waiting 1+ minute every re-build is very painful when trying to debug the Dockerfile .-.

### Local Docker Testing

Remember to run Docker Desktop application/daemon.

```sh
# note that if you are using my Dockerfile and want to run it locally for testing, remember to follow the instructions at the top of the Dockerfile

# build the docker container
# -t flag to give the container a name
docker build -t organius .

# run the docker container
# -p flag to give the container a port
docker run -p 8080:8080 organius

# add a sh at the back to "ssh" into the docker container
# useful for checking the structure of the docker container and verify if it's as expected
docker run -p 8080:8080 organius sh
```

### Heroku Setup

For the steps below, those prefixed with a "\*" is to be done only _once_ regardless of device. The rest are to be done only _once_ on each new device.

1. Download the Heroku CLI.
2. Login to heroku via `heroku login`.
3. \* Create a Heroku application (either through the website or `heroku create organius`).
4. Setup the Heroku git remote location via `heroku git:remote -a organius`.
5. `git remote` should now indicate `heroku` as a remote location.
6. Run `heroku stack:set container` so that Heroku will recognise that you are uploading a Docker container and not an application.
7. \* Set up heroku configs, including environment variables, as follows:

```sh
# the default Go version on Heroku is 1.12 (which is very outdated and breaks some modules)
# replace 1.18 with whatever version you are using
heroku config:set GOVERSION=go1.18

# for each of your environment variables, add them as KEY, VALUE pairs
# KEY is the name of environment variable
# VALUE is the value of the enviornment variable
heroku config:set KEY=VALUE

# to check a particular key
heroku config:get KEY
# to check the full config
heroku config
```

8. Setup [Procfile](Procfile) and [heroku.yml](heroku.yml) files.

### Deploying to Heroku

After following the steps as listed above, do the steps below for the first and all subsequent deployments to Heroku servers.

```sh
# remember to do your usual staging and committing before pushing

# if deploying main branch
git push heroku main

# if deploying <local> where <local> is a local branch name
git push heroku <local>:main

# force push if you are working on a completely different branch
# it's pretty safe to force push to heroku because we are not really using it as a proper git repo (assuming you do have a proper git repo stored in some other remote location too!)
git push heroku <local>:main -f
```

After pushing to the heroku git repo, Heroku server will automatically re-build the Docker container and serve the application once done.

It is safe to kill (Ctrl-C) the process locally after git pushes go through (aka kill it during the Docker build stage). You can still see the build process/log through Heroku website. I know this because I killed it on accident :D

### Helpful Heroku CLI Commands

Great for debugging.

```sh
# runs your server locally
heroku local

# outputs heroku logs
heroku logs
# similar to above but only the lastest few logs
heroku logs --tail

# runs shell on the heroku application
# allows you to peek into the files on the server
# kind of similar to ssh
heroku run sh

# restarts the heroku server
heroku restart
```

### Extra Notes on Golang

Below sums up some of the problems I faced when trying to deploy, and their solutions.

Do indicate release (production) mode somewhere in your code. For Gin, `gin.SetMode(gin.ReleaseMode)`.

Do _not_ hard code a PORT. If you are using Gin, just use `router.Run()` without any arguments. Gin will default to using the PORT as specified in the environment variable "PORT", which is exactly what we want as Heroku will add the actual port number as an environment variable.

If you are using any other router module, do something similarly to below, [source](https://stackoverflow.com/questions/56936448/deploying-a-golang-app-on-heroku-build-succeed-but-application-error).

```go
PORT := os.Getenv("PORT")
if PORT == "" {
  PORT = "8080"
}
http.ListenAndServe(":" + PORT, nil)
```

If you are using `godotenv` module from "github.com/joho/godotenv". `godotenv.Load()` will return an error when running on Heroku servers. Just ignore the error, [source](https://github.com/joho/godotenv/issues/40).

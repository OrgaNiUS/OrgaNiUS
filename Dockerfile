# Usage for local development
# NOTE: line 28 - 29
# docker build -t organius .
# docker run -p 8080:8080 organius

FROM node:18-alpine3.14 as build-node
WORKDIR /app
COPY client/ .
RUN npm install --legacy-peer-deps
RUN npm run build

FROM golang:1.18.2-alpine3.16 as build-go
WORKDIR /back
ENV GO111MODULE=on
RUN go env -w GOPROXY=direct
COPY go.mod go.sum /back/

RUN apk add git
RUN go mod download
# Copy source code after download so that go mod download is "cached"
COPY server/ server/
COPY . .
RUN go build -o main .

FROM alpine:3.16
# alpine image does not have timezone data by default, so we have to install timezone data
RUN apk add --no-cache tzdata
ENV TZ=Asia/Singapore
COPY --from=build-node /app/build ./client/build

# need the following line if running locally
# COPY --from=build-go /back/.env .
COPY --from=build-go /back/main .
EXPOSE 8080
CMD ["./main"]

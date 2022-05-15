.PHONY: g go
g: go
go:
	go run main.go

.PHONY: r react
r: react
react:
	npm start --prefix "client"

.PHONY: init-client
init-client:
	npm install --prefix "client"

.PHONY: bc build-client
bc: build-client
build-client:
	npm run build --prefix "client"

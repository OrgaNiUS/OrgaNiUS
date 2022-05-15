.PHONY: g go
g: go
go:
	go run main.go

.PHONY: r react
r: react
react:
	cd client && npm start && cd

.PHONY: init-client
init-client:
	cd client && npm install && cd

.PHONY: bc build-client
bc: build-client
build-client:
	cd client && npm run build && cd

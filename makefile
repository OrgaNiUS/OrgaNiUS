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
 	# legacy peer deps flag required because react-big-calendar does not officially support react 18 (they did not update their package.json)
	npm install --prefix "client" --legacy-peer-deps

.PHONY: bc build-client
bc: build-client
build-client:
	npm run build --prefix "client"

# run all tests
.PHONY: test
test: go-test postman-test

.PHONY: gt go-test
gt: go-test
go-test:
	go test -v ./...

# run all API tests using newman/postman
.PHONY: pm postman-test
pm: postman-test
postman-test:
	newman run server/postman_tests/*.json

# Tests

```sh
# run ALL tests in server (this is the command ran before deployment)
go test ./...

# clears the test cache
go clean -testcache

# run ALL tests in server (with verbose output)
go test -v ./...

# run ALL tests & disply coverage % of tests
go test -cover ./...
```

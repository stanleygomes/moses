.PHONY: build run test fmt lint clean

BINARY_NAME=bin/moses
MAIN_PACKAGE=./cmd/moses

build:
	mkdir -p bin
	go build -o $(BINARY_NAME) $(MAIN_PACKAGE)

run:
	go run $(MAIN_PACKAGE)

test:
	go test ./... -v

fmt:
	go fmt ./...

lint:
	golangci-lint run

clean:
	rm -rf bin
	go clean

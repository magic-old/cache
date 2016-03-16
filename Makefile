.PHONY: \
	all \
	dev \
	build \
	clean \
	lint \
	lint-fix \
	test

all: help

dev:
	@./cli.sh dev

build:
	@./cli.sh build

test:
	@./cli.sh test

lint:
	@./cli.sh lint

lint-fix:
	@./cli.sh lint-fix

clean:
	@./cli.sh clean

help:
	@./cli.sh help
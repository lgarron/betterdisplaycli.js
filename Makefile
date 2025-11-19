.PHONY: lint
lint: setup
	bun x @biomejs/biome check
	bun x tsc --noEmit --project .

.PHONY: format
format: setup
	bun x @biomejs/biome check --write

.PHONY: test
test: setup
	bun test

.PHONY: setup
setup:
	bun install --frozen-lockfile

.PHONY: clean
clean:
	rm -rf ./dist

.PHONY: reset
reset: clean
	rm -rf ./node_modules

.PHONY: publish
publish:
	npm publish

.PHONY: prepublishOnly
prepublishOnly: lint test clean

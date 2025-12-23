.PHONY: check
check: lint test check-package.json

.PHONY: lint
lint: lint-biome lint-tsc

.PHONY: lint-biome
lint-biome: setup
	bun x -- bun-dx --package @biomejs/biome biome -- check

.PHONY: lint-tsc
lint-tsc: setup
	bun x -- bun-dx --package typescript tsc -- --project .

.PHONY: format
format: setup
	bun x -- bun-dx --package @biomejs/biome biome -- check --write

.PHONY: check-package.json
check-package.json: setup
	bun x -- bun-dx --package @cubing/dev-config package.json -- check

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
prepublishOnly: lint clean check

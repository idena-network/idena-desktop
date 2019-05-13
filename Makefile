NODE_DIR ?= ~/Projects/golang/src/idena-go
SELF_ADDR ?= 0xB7Fc5B9b34b8328460D79981aBEE1d278611fa1A

.PHONY: help node node-full

# suppress makes own output
#.SILENT:

help:
	@echo ''
	@echo 'Usage: make [TARGET]'
	@echo 'Targets:'
	@echo ' node-auto		run standalone idena node'
	@echo ' node				run full idena node'
	@echo ''

node-auto:
	cd $(NODE_DIR) && go run main.go --automine --bootnode="" --ipfsbootnode="" --nodiscovery --godaddress=$(SELF_ADDR)

node:
	cd $(NODE_DIR) && go run main.go

clean:
	cd $(NODE_DIR) && rm -rf datadir/idenachain.db
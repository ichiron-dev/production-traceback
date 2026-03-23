# ────────────────────────────────────────────────────
APP_NAME  := production-traceback
DEPLOY    := deploy

# Runtime packages (bundled ไว้ใน build/ แล้ว ยกเว้น @grpc)
GRPC_PKGS := \
	@grpc/grpc-js @grpc/proto-loader \
	protobufjs long lodash.camelcase \
	@js-sdsl/ordered-map yargs

.PHONY: all build pack clean help

all: build pack  ## 🚀  Build + pack (default)

# ── Clean ────────────────────────────────────────────
clean:          ## 🧹  ลบ build/ .svelte-kit/ node_modules/ deploy/
	@echo "---------------------------------------------------"
	@echo "🧹 [$@] Wiping previous artifacts..."
	@rm -rf build .svelte-kit node_modules $(DEPLOY)
	@sleep 2
	@echo "✅ [$@] Workspace is clean"

# ── Build ────────────────────────────────────────────
build: clean    ## 🔨  clean → bun install → bun run build
	@echo "---------------------------------------------------"
	@echo "📦 [$@] Installing dependencies..."
	@bun install > /dev/null 2>&1
	@echo "✅ [$@] Dependencies installed"
	@echo "🔨 [$@] Compiling $(APP_NAME)..."
	@bun run build > /dev/null 2>&1
	@echo "✅ [$@] Build complete → build/"

# ── Pack ─────────────────────────────────────────────
pack: build     ## 📦  สร้าง deploy/ folder แล้ว cleanup src artifacts
	@echo "---------------------------------------------------"
	@echo "🗂️  [$@] Creating deploy structure → $(DEPLOY)/"
	@mkdir -p $(DEPLOY)/node_modules
	@cp -r build        $(DEPLOY)/
	@cp    package.json $(DEPLOY)/
	@echo "✅ [$@] Copied build/ and package.json"
	@[ -f .env ] \
		&& cp .env $(DEPLOY)/ && echo "🔑 [$@] .env copied" \
		|| echo "⚠️  [$@] .env not found — skipped (set env vars manually on server)"
	@if [ -f setup_production_traceback.sh ]; then \
		cp setup_production_traceback.sh $(DEPLOY)/; \
		chmod +x $(DEPLOY)/setup_production_traceback.sh; \
		echo "✅ [$@] setup_production_traceback.sh copied (executable)"; \
	else \
		echo "⚠️  [$@] setup_production_traceback.sh not found — skipped"; \
	fi
	@echo "📂 [$@] Bundling runtime node_modules..."
	@for pkg in $(GRPC_PKGS); do \
		src="node_modules/$$pkg"; \
		dst="$(DEPLOY)/node_modules/$$pkg"; \
		if [ -d "$$src" ]; then \
			mkdir -p "$$(dirname $$dst)"; \
			cp -r "$$src" "$$(dirname $$dst)/"; \
			echo "     ✅ $$pkg"; \
		else \
			echo "     ⚠️  $$pkg — not found, deploy may fail"; \
		fi; \
	done
	@echo "📊 [$@] Deploy package size:"
	@du -sh $(DEPLOY)/build        | awk '{print "     build/        " $$1}'
	@du -sh $(DEPLOY)/node_modules | awk '{print "     node_modules/ " $$1}'
	@du -sh $(DEPLOY)              | awk '{print "     ─────────────────"}'
	@du -sh $(DEPLOY)              | awk '{print "     total          " $$1}'
	@echo "🧹 [$@] Removing source artifacts (build/ .svelte-kit/ node_modules/)..."
	@rm -rf build .svelte-kit node_modules
	@echo "✅ [$@] Source artifacts removed"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "🚀 $(APP_NAME) is ready to deploy!"
	@echo "   Folder : $(DEPLOY)/"
	@echo "   Run    : bun $(DEPLOY)/build/index.js"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── Help ─────────────────────────────────────────────
help:           ## ❓  แสดง help นี้
	@echo "Usage: make [target]"
	@grep -E '^[a-z]+:.*##' $(MAKEFILE_LIST) \
		| awk -F'[: ].*## ' \
		      '{printf "  %-8s %s\n", $$1, $$2}'
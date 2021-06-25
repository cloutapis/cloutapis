start:
	docker compose down
	docker compose up --force-recreate

stop:
	docker compose down

.PHONY: run
.PHONY: build-template up down seed-saas test-provision

build-template:
	@./deploy/run.sh build-template

up:
	@./deploy/run.sh up

down:
	@./deploy/run.sh down

seed-saas:
	@./deploy/run.sh seed-saas

test-provision:
	@./deploy/run.sh test-provision $(SLUG) $(EMAIL) $(NAME)

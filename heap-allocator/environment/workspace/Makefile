CC = gcc
CFLAGS = -Wall -Wextra -std=c11 -g -O0

test_runner: test.c myalloc.c
	$(CC) $(CFLAGS) -o $@ $^

clean:
	rm -f test_runner

.PHONY: clean

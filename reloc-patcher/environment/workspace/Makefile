CC = gcc
CFLAGS = -Wall -Wextra -O2 -std=c11

all: myld

myld: myld.c
	$(CC) $(CFLAGS) -o $@ $<

clean:
	rm -f myld

.PHONY: all clean

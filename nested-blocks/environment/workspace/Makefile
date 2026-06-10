all: md2html

md2html: md2html.c
	gcc -O2 -Wall -std=c11 -o md2html md2html.c

clean:
	rm -f md2html *.o

.PHONY: all clean

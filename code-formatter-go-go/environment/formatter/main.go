#!/usr/bin/env go run

package main

import (
	"fmt"
	"os"
	"path/filepath"
)

// FormatCode formats Go source code and returns the formatted version.
//
// Parameters:
//   - source: The Go source code to format.
//   - filepath: The file path (unused for Go, but available for context).
//
// Returns the formatted source code.
//
// TODO: Implement the formatter logic.
func FormatCode(source string, filepath string) string {
	panic("Formatter not implemented yet")
}

func main() {
	if len(os.Args) != 3 {
		fmt.Fprintf(os.Stderr, "Usage: %s <input_file> <output_file>\n", os.Args[0])
		os.Exit(1)
	}

	inputPath := os.Args[1]
	outputPath := os.Args[2]

	source, err := os.ReadFile(inputPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error reading input: %v\n", err)
		os.Exit(1)
	}

	formatted := FormatCode(string(source), filepath.Base(inputPath))

	if err := os.WriteFile(outputPath, []byte(formatted), 0644); err != nil {
		fmt.Fprintf(os.Stderr, "Error writing output: %v\n", err)
		os.Exit(1)
	}
}

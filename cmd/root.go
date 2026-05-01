package cmd

import (
	"os"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "moses",
	Short: "Moses CLI is a powerful tool for your workflow",
	Long:  `A comprehensive CLI tool built with Go to streamline development tasks.`,
}

func Execute() {
	err := rootCmd.Execute()
	if err != nil {
		os.Exit(1)
	}
}

func init() {
	// Root flags can be defined here
}

package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "Prints the version of moses-cli",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("moses-cli version v0.1.0")
	},
}

func init() {
	rootCmd.AddCommand(versionCmd)
}

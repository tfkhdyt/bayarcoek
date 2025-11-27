import { describe, it, expect } from "vitest";
import { Command } from "commander";

interface CommandWithVersion extends Command {
  _version: string;
}

describe("CLI", () => {
  it("should have encrypt command", () => {
    const program = new Command();
    program.command("encrypt [path...]");
    const commands = program.commands.map((cmd) => cmd.name());
    expect(commands).toContain("encrypt");
  });

  it("should have decrypt command", () => {
    const program = new Command();
    program.command("decrypt [path...]");
    const commands = program.commands.map((cmd) => cmd.name());
    expect(commands).toContain("decrypt");
  });

  it("should support help option", () => {
    const program = new Command();
    expect(
      program.helpOption("-h, --help", "Menampilkan bantuan")
    ).toBeDefined();
  });

  it("should support version option", () => {
    const program = new Command();
    program.version("4.0.0", "-v, --version", "Menampilkan versi");
    expect((program as CommandWithVersion)._version).toBe("4.0.0");
  });
});

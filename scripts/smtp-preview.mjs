import { SMTPServer } from "smtp-server";
import { mkdirSync, appendFileSync } from "node:fs";
mkdirSync(".verification", { recursive: true });
const server = new SMTPServer({
  authOptional: true,
  disabledCommands: ["STARTTLS"],
  onData(stream, session, callback) {
    let message = "";
    stream.on("data", (chunk) => {
      message += chunk.toString();
    });
    stream.on("end", () => {
      appendFileSync(
        ".verification/mail-capture.jsonl",
        JSON.stringify({
          to: session.envelope.rcptTo.map((r) => r.address),
          from: session.envelope.mailFrom.address,
          message,
        }) + "\n",
      );
      callback();
    });
  },
});
server.listen(1025, "127.0.0.1", () =>
  console.log(
    "Local SMTP test inbox is ready on 127.0.0.1:1025. No email leaves this machine.",
  ),
);

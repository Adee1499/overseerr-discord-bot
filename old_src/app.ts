import { verifyKeyMiddleware } from "discord-interactions";
import "dotenv/config";
import express from "express";
import { handleInteraction } from "./discord/interaction-handler";

const app = express();
const PORT = process.env.PORT || 3000;
const DEV = process.env.NODE_ENV !== "production";

if (DEV) app.use(express.json());

function verify() {
  if (DEV) {
    return (_req: any, _res: any, next: any) => next();
  }
  return verifyKeyMiddleware(process.env.PUBLIC_KEY!);
}

app.post("/interactions", verify(), async function (req, res) {
  try {
    const body = DEV
      ? req.body
      : (req as any).rawBody
        ? JSON.parse((req as any).rawBody)
        : req.body;
    const result = await handleInteraction(body);

    if ((result as any)?.error) return res.status(400).json(result);
    return res.json(result);
  } catch (err: any) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "internal_error", detail: err?.message });
  }
});

app.listen(PORT, () => {
  console.log(
    "Listening on port",
    PORT,
    DEV ? "(DEV mode, signature bypassed)" : "",
  );
});

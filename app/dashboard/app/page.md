# ping-me 🟢

Keep your free backends alive and healthy. `ping-me` is a zero-config library + dashboard system that keeps your backend awake on platforms like Render, Railway, and Cyclic — complete with live metrics, custom intervals, and alerts.

## 🚀 Features

- 🔁 Self-pinging keep-alive system
- 📊 Beautiful metrics dashboard (`/dashboard`)
- 🔑 API key-based access per user
- ⏱️ Uptime logs and endpoint performance
- 🔍 Filtering by endpoint and date
- ⚙️ Per-user ping intervals and alert settings
- 🧱 Framework adapters: `express`, `fastify`, `koa`, `hono`, etc.
- 📦 NPM packages: `@ping-me/core`, `@ping-me/next`, etc.
- 🛡️ Rate limiting and abuse protection
- 💾 Metrics caching with MongoDB, Redis, or local
- 🧑‍💻 CLI support: `npx ping-me init`

---

## 📦 Packages

```
@ping-me/core
@ping-me/express
@ping-me/next
@ping-me/fastify
@ping-me/hono
@ping-me/koa
```

## 📂 Monorepo Structure (pnpm + turborepo)

```
packages/
  core/
  express/
  next/
  fastify/
app/
  dashboard/    # Next.js + Tailwind UI for metrics + settings
  api/          # REST API for ping logging and analytics
``` 

---

## 📄 Documentation

See the full docs at [pingme.dev](https://pingme.dev) (or `/docs` route locally).

- [Getting Started](https://pingme.dev/docs/intro)
- [Integrating with Express, Fastify, etc.](https://pingme.dev/docs/integrations)
- [API Key Auth & Metrics API](https://pingme.dev/docs/api)

---

## 💻 Contributing

We welcome PRs, suggestions, and feedback!

### Setup
```bash
git clone https://github.com/yourname/ping-me
cd ping-me
pnpm install
pnpm dev
```

### Useful Commands
```bash
pnpm turbo run build      # Build all packages
pnpm turbo run lint       # Lint
pnpm turbo run test       # Run tests
```

### Folder Structure
- `app/dashboard` – frontend (Next.js)
- `app/api` – metrics API routes
- `packages/` – core + integrations

### Before PR
- Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
- Run `pnpm format`
- Add unit tests if applicable

---

## 🧑‍🎓 Contributors

<a href="https://github.com/your-org/ping-me/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=your-org/ping-me" />
</a>

---

## 💖 Sponsor

If `ping-me` saved you time or kept your backend online — consider supporting:

- [GitHub Sponsors](https://github.com/sponsors/yourname)
- [Buy Me a Coffee](https://buymeacoffee.com/yourname)

---

## 🛰️ Deployment

- Vercel + MongoDB Atlas ready.
- `.env.example` included.
- Follow `/docs/deploy` to self-host.

---

## 📬 License

MIT © 2025 [Your Name](https://github.com/yourname)

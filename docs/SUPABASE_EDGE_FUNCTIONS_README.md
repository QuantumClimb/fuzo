ic ha# Supabase Edge Functions: Reference & Best Practices

## What Are Edge Functions?
Supabase Edge Functions are globally distributed, server-side TypeScript (Deno) functions that run close to your users. They are ideal for:
- Custom business logic
- Webhooks
- Integrating with third-party APIs
- Secure file uploads
- Real-time and low-latency operations

**Docs:** [Edge Functions Guide](https://supabase.com/docs/guides/functions)

---

## Key Features
- **Globally distributed** for low-latency
- **TypeScript-first** (Deno runtime, supports WASM)
- **NPM compatibility** (use most npm modules)
- **Secure** (JWT verification by default)
- **Integrates with Storage, Auth, Database, and Realtime**
- **WebSocket support**

---

## Getting Started
- **Create/Deploy via Dashboard:**
  - Go to your project > Edge Functions > Deploy a new function
  - Use the built-in editor or upload code
- **Local Development:**
  - Use the [Supabase CLI](https://supabase.com/docs/guides/cli) to create, serve, and deploy functions
  - Example:
    ```bash
    supabase functions new hello-world
    supabase functions serve
    supabase functions deploy hello-world
    ```
- **Testing:**
  - Use Deno’s built-in test runner
  - Place tests in `supabase/functions/tests/`
  - Example: `deno test --allow-all supabase/functions/tests/your-function-test.ts`

---

## Usage Patterns
- **HTTP Methods:** Supports GET, POST, PUT, PATCH, DELETE, OPTIONS
- **Authorization:**
  - By default, requires a valid JWT in the Authorization header
  - Can disable JWT verification for public endpoints (e.g., webhooks)
- **Naming:** Use hyphens for function names (URL-friendly)
- **Organization:**
  - Store shared code in `_shared/`
  - Use a top-level `import_map.json` for module resolution
  - Example structure:
    ```
    supabase/
      functions/
        _shared/
        your-function/
          index.ts
        tests/
          your-function-test.ts
      config.toml
    ```

---

## Integrating with Supabase Storage
- **Upload Files from Edge Functions:**
  ```typescript
  import { createClient } from 'npm:@supabase/supabase-js@2'
  Deno.serve(async (req) => {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    // ...generate or receive fileContent...
    const { data, error } = await supabaseAdmin.storage
      .from('images')
      .upload(`generated/${filename}.png`, fileContent.body!, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false,
      })
    if (error) throw error
    return new Response(JSON.stringify({ path: data.path }))
  })
  ```
- **Cache-First Pattern:**
  - Check storage before generating new content for performance
  - See [Storage Caching Guide](https://supabase.com/docs/guides/functions/storage-caching)

---

## Development Tips
- **Skip JWT Locally:** `supabase functions serve hello-world --no-verify-jwt`
- **Error Handling:** Use error types from `@supabase/supabase-js` for robust error handling
- **Config:** Use `supabase/config.toml` for per-function config (e.g., JWT verification, import maps)
- **TypeScript/JavaScript:** Both are supported; set entrypoint in `config.toml` if using JS
- **WebSockets:** Supported for real-time apps ([WebSocket Guide](https://supabase.com/docs/guides/functions/websockets))

---

## Advanced: Database Triggers & Queues
- **Automate tasks (e.g., embeddings, notifications) using triggers, queues, and Edge Functions**
- See [Automatic Embeddings Guide](https://supabase.com/docs/guides/ai/automatic-embeddings) for a full example

---

## Resources & Examples
- [Edge Function Examples (GitHub)](https://github.com/supabase/supabase/tree/master/examples/edge-functions)
- [Official Docs: Edge Functions](https://supabase.com/docs/guides/functions)
- [Integrating with Storage](https://supabase.com/docs/guides/functions/storage-caching)
- [Testing Edge Functions](https://supabase.com/docs/guides/functions/unit-test)
- [Development Tips](https://supabase.com/docs/guides/functions/development-tips)
- [WebSockets](https://supabase.com/docs/guides/functions/websockets)

---

## Best Practices
- Use Edge Functions for business logic, file uploads, webhooks, and low-latency needs
- Use Database Functions for heavy, data-intensive operations
- Organize code for reusability and maintainability
- Always secure sensitive endpoints (use JWT, service role keys only on server)

---

*This README is a living document. Update as Supabase Edge Functions evolve!* 
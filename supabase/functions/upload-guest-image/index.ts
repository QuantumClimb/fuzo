// Setup type definitions for Supabase Edge Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

// Helper to parse multipart form data (Deno v1.37+)
async function parseMultipart(req: Request) {
  const contentType = req.headers.get('content-type') || ''
  if (!contentType.startsWith('multipart/form-data')) {
    throw new Error('Content-Type must be multipart/form-data')
  }
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) throw new Error('No file found in form data')
  const filename = formData.get('filename') as string | null
  return { file, filename }
}

Deno.serve(async (req) => {
  const debug: any[] = [];
  debug.push({ step: 'function_invoked', method: req.method });
  if (req.method !== 'POST') {
    debug.push({ step: 'invalid_method', method: req.method });
    return new Response(JSON.stringify({ error: 'Method Not Allowed', debug }), { status: 405, headers: { 'Content-Type': 'application/json' } })
  }

  try {
    // Parse multipart form data
    const { file, filename } = await parseMultipart(req)
    debug.push({ step: 'parsed_form', filename, fileType: file?.type, fileSize: file?.size });
    if (!filename) {
      debug.push({ step: 'missing_filename' });
      return new Response(JSON.stringify({ error: 'Missing filename', debug }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    // Create Supabase admin client
    debug.push({ step: 'creating_supabase_client' });
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Upload to guest folder in fuzo-images bucket
    const uploadPath = `guest/${filename}`
    debug.push({ step: 'uploading', uploadPath });
    const { data, error } = await supabase.storage
      .from('fuzo-images')
      .upload(uploadPath, file.stream(), {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      debug.push({ step: 'upload_error', message: error.message, details: error });
      return new Response(JSON.stringify({ error: `Upload error: ${error.message}`, debug }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    debug.push({ step: 'upload_success', path: data.path });
    return new Response(JSON.stringify({ path: data.path, debug }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    debug.push({ step: 'caught_error', error: err instanceof Error ? err.message : String(err) });
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err), debug }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }
}) 
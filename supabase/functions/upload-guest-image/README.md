# upload-guest-image Edge Function

This Supabase Edge Function allows you to securely upload camera images to the `guest` folder in the `fuzo-images` storage bucket.

## Purpose
- Accepts a POST request with an image file (multipart/form-data)
- Saves the image to `fuzo-images/guest/<filename>` in Supabase Storage
- Returns the storage path on success

## Usage
- **Endpoint:** `/functions/v1/upload-guest-image`
- **Method:** `POST`
- **Content-Type:** `multipart/form-data`
- **Form fields:**
  - `file`: The image file (required)
  - `filename`: The desired file name (required)

### Example Request (JavaScript)
```js
const formData = new FormData();
formData.append('file', fileBlob, fileName);
formData.append('filename', fileName);

fetch('https://<project-id>.supabase.co/functions/v1/upload-guest-image', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer <JWT>' }, // if required
  body: formData,
});
```

## Response
- **Success:** `{ "path": "guest/<filename>" }`
- **Error:** HTTP 400/500 with error message

## Notes
- Uses the Supabase service role key for storage access (set in Edge Function environment)
- Does not upsert: will fail if a file with the same name exists
- Handles content type and error validation

---

*See the parent project README for more on Supabase Edge Functions and storage integration.* 
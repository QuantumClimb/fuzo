# Camera & Storage Implementation Guide

This document outlines the complete camera functionality and storage implementation in the FUZO app.

## 📸 **Camera Component Functionality**

### **Component Location**
- **File**: `src/components/Camera.tsx`
- **Purpose**: Photo capture and upload to Supabase Storage

### **Camera Flow**

#### **1. Camera Activation**
```typescript
// User clicks "Start Camera"
const startCamera = async () => {
  // Get camera stream with getUserMedia
  const stream = await navigator.mediaDevices.getUserMedia({ 
    video: { 
      facingMode: 'environment',
      width: { ideal: 1920 },
      height: { ideal: 1080 }
    } 
  });
  
  // Store stream in state
  setCameraStream(stream);
};
```

#### **2. Video Feed Display**
```typescript
// Video element renders when cameraStream exists
{cameraStream ? (
  <video
    ref={(el) => {
      videoRef.current = el;
      if (el && cameraStream) {
        el.srcObject = cameraStream;
        setIsCapturing(true);
      }
    }}
    autoPlay playsInline muted
    className="w-full h-full object-cover"
  />
) : (
  // Show camera icon and "Tap to start camera"
)}
```

#### **3. Photo Capture**
```typescript
const capturePhoto = () => {
  // Create canvas and capture from video
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = videoRef.current.videoWidth;
  canvas.height = videoRef.current.videoHeight;
  context.drawImage(videoRef.current, 0, 0);
  
  // Convert to base64 and save to local storage
  const imageData = canvas.toDataURL('image/jpeg', 0.8);
  setCapturedImage(imageData);
  
  // Generate filename with coordinates
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const coords = location ? `${location.lat.toFixed(4)}_${location.lng.toFixed(4)}` : 'no-location';
  const filename = `guest-image-${timestamp}-${coords}.jpg`;
  
  // Save to local storage
  const localImageKey = `camera_${timestamp}`;
  localStorage.setItem(localImageKey, imageData);
};
```

#### **4. Upload to Supabase**
```typescript
const uploadImage = async () => {
  // Convert base64 to blob
  const response = await fetch(capturedImage);
  const blob = await response.blob();
  
  // Create FormData for Edge Function
  const formData = new FormData();
  formData.append('file', blob, filename);
  formData.append('filename', filename);
  
  // Upload via Edge Function
  const uploadResponse = await fetch(`${supabaseUrl}/functions/v1/upload-guest-image`, {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
  });
};
```

## 🗄️ **Storage Implementation**

### **Supabase Storage Bucket**
- **Bucket Name**: `guestimages`
- **Folder Structure**: `guestimages/guest/`
- **File Naming**: `guest-image-{timestamp}-{lat}_{lng}.jpg`

### **Edge Function**
- **Function Name**: `upload-guest-image`
- **Location**: `supabase/functions/upload-guest-image/index.ts`
- **Purpose**: Handle file uploads with CORS support

#### **Edge Function Code**
```typescript
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // Parse multipart form data
  const { file, filename } = await parseMultipart(req);
  
  // Upload to guestimages bucket
  const uploadPath = `guest/${filename}`;
  const { data, error } = await supabase.storage
    .from('guestimages')
    .upload(uploadPath, file.stream(), {
      contentType: file.type,
      upsert: false,
    });
    
  return new Response(JSON.stringify({ path: data.path }), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
});
```

## 📱 **Feed Component Integration**

### **Image Retrieval**
```typescript
// In src/components/Feed.tsx
const loadImageFeed = async () => {
  // List files from guestimages bucket
  const { data: files, error } = await supabase.storage
    .from('guestimages')
    .list('guest', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' }
    });

  // Get public URLs for display
  const imagePosts = files.map(file => {
    const { data: urlData } = supabase.storage
      .from('guestimages')
      .getPublicUrl(`guest/${file.name}`);

    return {
      id: file.id || file.name,
      name: file.name,
      url: urlData.publicUrl,
      created_at: file.created_at || new Date().toISOString(),
    };
  });
};
```

## 🔧 **Configuration Requirements**

### **Environment Variables**
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### **Supabase Setup**
1. **Create `guestimages` bucket** in Supabase Storage
2. **Deploy Edge Function**: `npx supabase functions deploy upload-guest-image`
3. **Set bucket permissions** for public read access
4. **Configure CORS** in Edge Function (already done)

### **Required APIs**
- **Camera API**: `navigator.mediaDevices.getUserMedia`
- **Geolocation API**: `navigator.geolocation.getCurrentPosition`
- **Supabase Storage**: For file uploads and retrieval

## 🚀 **Deployment Commands**

### **Deploy Edge Function**
```bash
npx supabase functions deploy upload-guest-image
```

### **Check Function Status**
```bash
npx supabase functions list
```

### **View Function Logs**
```bash
npx supabase functions logs upload-guest-image
```

## 🐛 **Common Issues & Solutions**

### **1. CORS Errors**
- **Issue**: "Access to fetch blocked by CORS policy"
- **Solution**: Edge Function includes CORS headers for all responses

### **2. Bucket Not Found**
- **Issue**: "Upload error: Bucket not found"
- **Solution**: Ensure `guestimages` bucket exists in Supabase project

### **3. Camera Not Showing**
- **Issue**: Video feed doesn't appear
- **Solution**: Check browser permissions and HTTPS requirement

### **4. Upload Fails**
- **Issue**: 500 Internal Server Error
- **Solution**: Check Edge Function logs and bucket permissions

## 📊 **File Structure**

```
supabase/
├── functions/
│   └── upload-guest-image/
│       └── index.ts          # Edge Function for uploads
└── storage/
    └── guestimages/          # Storage bucket
        └── guest/            # Folder for uploaded images
            ├── guest-image-2025-07-26T08-46-05-034Z-13.0311_80.2783.jpg
            └── ...

src/
├── components/
│   ├── Camera.tsx           # Camera component
│   └── Feed.tsx             # Feed component (displays images)
└── lib/
    └── supabaseClient.ts    # Supabase client configuration
```

## ✅ **Testing Checklist**

- [ ] Camera activates and shows live feed
- [ ] Photo capture works with canvas
- [ ] Local storage saves image data
- [ ] Filename includes timestamp and coordinates
- [ ] Upload to Edge Function succeeds
- [ ] Image appears in Feed component
- [ ] CORS headers work correctly
- [ ] Error handling displays user-friendly messages

## 🎯 **Key Features**

1. **Live Camera Feed**: Real-time video preview
2. **GPS Coordinates**: Location tracking in filenames
3. **Local Storage**: Temporary storage before upload
4. **Edge Function Upload**: Secure file upload with validation
5. **Feed Integration**: Automatic display in social feed
6. **Error Handling**: Graceful failure handling
7. **CORS Support**: Cross-origin request handling
8. **Responsive Design**: Mobile-optimized interface

This implementation provides a complete camera-to-feed workflow with proper error handling and user experience considerations. 
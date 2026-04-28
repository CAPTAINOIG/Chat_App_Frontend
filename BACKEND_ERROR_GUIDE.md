# 🔧 Backend Error Handling Guide

## Current Issue: Profile Picture Upload (500 Error)

The frontend is receiving a **500 Internal Server Error** when uploading profile pictures to `/user/profilePicture`. Here's what needs to be fixed on the backend:

---

## 🐛 Profile Picture Upload Issues

### Error Details:
```
POST /user/profilePicture
Status: 500 Internal Server Error
```

### Frontend Request Format:
```javascript
{
  userId: "string",
  base64: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
}
```

### Expected Backend Response:
```javascript
// Success (200)
{
  success: true,
  message: "Profile picture updated successfully",
  url: "https://your-storage/path/to/image.jpg" // optional
}

// Error (400/413/500)
{
  success: false,
  message: "Descriptive error message",
  error: "Error details" // optional
}
```

---

## 🔍 Common Backend Issues & Solutions

### 1. **Base64 Parsing Issues**
**Problem:** Server can't parse the base64 string
```javascript
// ❌ Wrong - trying to parse full data URL
const imageBuffer = Buffer.from(base64, 'base64');

// ✅ Correct - extract base64 part only
const base64Data = base64.replace(/^data:image\/[a-z]+;base64,/, '');
const imageBuffer = Buffer.from(base64Data, 'base64');
```

### 2. **File Size Limits**
**Problem:** Server rejects large files without proper error
```javascript
// ✅ Add proper file size validation
const maxSize = 5 * 1024 * 1024; // 5MB
if (imageBuffer.length > maxSize) {
  return res.status(413).json({
    success: false,
    message: "Image size must be less than 5MB"
  });
}
```

### 3. **File Type Validation**
**Problem:** Server accepts any file type
```javascript
// ✅ Validate file type from base64 header
const mimeType = base64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

if (!mimeType || !allowedTypes.includes(mimeType[1])) {
  return res.status(400).json({
    success: false,
    message: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
  });
}
```

### 4. **Storage Issues**
**Problem:** File system or cloud storage errors
```javascript
// ✅ Proper error handling for storage
try {
  // Save to file system or cloud storage
  const filePath = await saveImage(imageBuffer, userId);
  
  res.status(200).json({
    success: true,
    message: "Profile picture updated successfully",
    url: filePath
  });
} catch (storageError) {
  console.error('Storage error:', storageError);
  res.status(500).json({
    success: false,
    message: "Failed to save image. Please try again."
  });
}
```

### 5. **Database Update Issues**
**Problem:** Image saved but database not updated
```javascript
// ✅ Use transactions for consistency
const transaction = await db.beginTransaction();
try {
  // Save image file
  const imageUrl = await saveImage(imageBuffer, userId);
  
  // Update user record
  await db.query(
    'UPDATE users SET profile_picture = ? WHERE id = ?',
    [imageUrl, userId],
    { transaction }
  );
  
  await transaction.commit();
  
  res.status(200).json({
    success: true,
    message: "Profile picture updated successfully",
    url: imageUrl
  });
} catch (error) {
  await transaction.rollback();
  // Clean up saved file if database update fails
  await deleteImage(imageUrl);
  throw error;
}
```

---

## 📝 Complete Backend Implementation Example

### Express.js Route Handler:
```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// POST /user/profilePicture
app.post('/user/profilePicture', authenticateToken, async (req, res) => {
  try {
    const { userId, base64 } = req.body;
    
    // Validation
    if (!userId || !base64) {
      return res.status(400).json({
        success: false,
        message: "Missing userId or image data"
      });
    }
    
    // Verify user owns this profile or is admin
    if (req.user.id !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this profile"
      });
    }
    
    // Extract and validate base64
    const mimeMatch = base64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
    if (!mimeMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid image format"
      });
    }
    
    const mimeType = mimeMatch[1];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!allowedTypes.includes(mimeType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
      });
    }
    
    // Convert base64 to buffer
    const base64Data = base64.replace(/^data:image\/[a-z]+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (imageBuffer.length > maxSize) {
      return res.status(413).json({
        success: false,
        message: "Image size must be less than 5MB"
      });
    }
    
    // Generate unique filename
    const fileExtension = mimeType.split('/')[1];
    const fileName = `profile_${userId}_${Date.now()}.${fileExtension}`;
    const filePath = path.join(__dirname, 'uploads', 'profiles', fileName);
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    
    // Save image
    await fs.writeFile(filePath, imageBuffer);
    
    // Update database
    const imageUrl = `/uploads/profiles/${fileName}`;
    await db.query(
      'UPDATE users SET profile_picture = ? WHERE id = ?',
      [imageUrl, userId]
    );
    
    res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      url: imageUrl
    });
    
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later."
    });
  }
});
```

### GET /user/fetchPicture Handler:
```javascript
app.get('/user/fetchPicture', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Missing userId parameter"
      });
    }
    
    // Get user's profile picture from database
    const result = await db.query(
      'SELECT profile_picture FROM users WHERE id = ?',
      [userId]
    );
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    const profilePicture = result[0].profile_picture;
    
    if (!profilePicture) {
      return res.status(404).json({
        success: false,
        message: "No profile picture found"
      });
    }
    
    res.status(200).json({
      success: true,
      url: profilePicture
    });
    
  } catch (error) {
    console.error('Fetch profile picture error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});
```

---

## 🚀 Quick Fixes for Current 500 Error

### 1. **Check Server Logs**
Look for the actual error in your server logs:
```bash
# Check logs for the exact error
tail -f /path/to/your/server.log
# or
pm2 logs your-app-name
```

### 2. **Add Basic Error Logging**
```javascript
app.post('/user/profilePicture', (req, res) => {
  try {
    // Your existing code
  } catch (error) {
    console.error('Profile upload error:', error.message);
    console.error('Stack trace:', error.stack);
    console.error('Request body:', req.body);
    
    res.status(500).json({
      success: false,
      message: "Server error uploading image"
    });
  }
});
```

### 3. **Check Common Issues**
- ✅ Is the uploads directory writable?
- ✅ Is there enough disk space?
- ✅ Are required dependencies installed?
- ✅ Is the database connection working?
- ✅ Are there any middleware conflicts?

### 4. **Test with Smaller Image**
Try uploading a very small image (< 100KB) to isolate the issue.

---

## 📋 Frontend Error Handling (Already Implemented)

The frontend now handles these error scenarios:

| Status Code | Frontend Response |
|-------------|-------------------|
| **200** | ✅ "Profile picture updated successfully!" |
| **400** | ❌ "Invalid image data. Please try a different image." |
| **401** | ❌ "You're not authorized to upload images. Please sign in again." |
| **413** | ❌ "Image is too large. Please choose a smaller image." |
| **500** | ❌ "Server error while uploading image. Please try again later." |
| **Network** | ❌ "Network error. Please check your connection and try again." |

### File Validation (Frontend):
- ✅ File type validation (JPEG, PNG, GIF, WebP only)
- ✅ File size limit (5MB max)
- ✅ Proper error messages
- ✅ Loading states
- ✅ Success feedback

---

## 🔧 Testing the Fix

### 1. **Test Different Scenarios:**
```bash
# Small image (should work)
curl -X POST /user/profilePicture \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"userId":"123","base64":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="}'

# Large image (should return 413)
# Invalid format (should return 400)
# Wrong user (should return 403)
```

### 2. **Monitor Server Response:**
```javascript
// Add temporary logging
console.log('Received upload request:', {
  userId: req.body.userId,
  base64Length: req.body.base64?.length,
  userAgent: req.headers['user-agent']
});
```

---

## 📞 Need Help?

If you're still getting 500 errors after implementing these fixes:

1. **Share the server logs** - The exact error message and stack trace
2. **Check the request** - Is the base64 data being received correctly?
3. **Test the endpoint** - Try with a simple test image
4. **Verify permissions** - File system and database permissions

The frontend is now robust and will handle any backend errors gracefully! 🎉

---

*This guide should help resolve the profile picture upload issues. The frontend improvements are already deployed and working.*
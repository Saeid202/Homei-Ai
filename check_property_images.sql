-- Check existing properties and their photo URLs
SELECT 
  id,
  title,
  photo_url,
  CASE 
    WHEN photo_url IS NULL THEN 'No image'
    WHEN photo_url = '' THEN 'Empty URL'
    WHEN photo_url LIKE 'blob:%' THEN 'Temporary blob URL'
    WHEN photo_url LIKE 'http%' THEN 'Valid URL'
    ELSE 'Other format'
  END as url_status,
  created_at
FROM properties 
ORDER BY created_at DESC;

-- Count properties by image status
SELECT 
  CASE 
    WHEN photo_url IS NULL THEN 'No image'
    WHEN photo_url = '' THEN 'Empty URL'
    WHEN photo_url LIKE 'blob:%' THEN 'Temporary blob URL'
    WHEN photo_url LIKE 'http%' THEN 'Valid URL'
    ELSE 'Other format'
  END as url_status,
  COUNT(*) as count
FROM properties 
GROUP BY 
  CASE 
    WHEN photo_url IS NULL THEN 'No image'
    WHEN photo_url = '' THEN 'Empty URL'
    WHEN photo_url LIKE 'blob:%' THEN 'Temporary blob URL'
    WHEN photo_url LIKE 'http%' THEN 'Valid URL'
    ELSE 'Other format'
  END; 
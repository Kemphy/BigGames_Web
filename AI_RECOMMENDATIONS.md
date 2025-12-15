# AI Recommendations Feature - Implementation Summary

## Overview

Aplikasi sekarang terintegrasi dengan sistem AI Recommendations dari backend yang menggunakan Hugging Face untuk memberikan rekomendasi ruangan yang dipersonalisasi.

## Backend URL

**Current Ngrok Tunnel:**

```
https://2d4ae8dc10a3.ngrok-free.app
```

> ⚠️ **Important**: URL ngrok akan berubah setiap kali backend restart. Update URL di `src/services/api.ts`

## Implemented Features

### 1. AI Service (`src/services/ai.service.ts`)

**Capabilities:**

- ✅ Get personalized room recommendations
- ✅ Log user events (VIEW_ROOM, CLICK_ROOM, BOOK_ROOM, RATE_ROOM)
- ✅ Admin: Generate room embeddings
- ✅ Admin: Bulk generate all embeddings

**Key Updates:**

- Room categories updated to: `PS4 | PS5 | PC | VIP | REGULAR`
- `base_price_per_hour` changed from string to number
- Event logging now fails silently (non-blocking UI)
- Added admin methods for embedding generation

### 2. Home Page (`src/pages/Home.tsx`)

**AI Features Implemented:**

- ✅ Display AI recommendations section at top
- ✅ Show "Trending Rooms" for new users (cold start)
- ✅ Show "Recommended for You" for returning users
- ✅ Display similarity score and reasoning
- ✅ Track CLICK_ROOM events when user clicks room card
- ✅ Fallback to empty array if AI service fails

**User Experience:**

```
New User (< 3 events):
"✨ Trending rooms - Booking lebih banyak untuk rekomendasi personal!"

Returning User:
"🤖 Dipilih khusus untuk Anda berdasarkan preferensi"
```

### 3. Booking Detail Page (`src/pages/BookingDetail.tsx`)

**Event Tracking:**

- ✅ Log VIEW_ROOM when page loads
- ✅ Log BOOK_ROOM after successful reservation
- ✅ Non-blocking event logging (doesn't block user flow)

### 4. Category System

**Updated Categories:**
| Old | New |
|-----|-----|
| VIP | VIP |
| REGULER | REGULAR |
| SIMULATOR | PS4, PS5, PC |

## How It Works

### User Journey

```
1. User opens Home Page
   ↓
2. AI loads recommendations (personalized or trending)
   ↓
3. User clicks room card → CLICK_ROOM event logged
   ↓
4. User views room detail → VIEW_ROOM event logged
   ↓
5. User completes booking → BOOK_ROOM event logged
   ↓
6. AI learns from user behavior
   ↓
7. Next visit: Better recommendations! 🎯
```

### API Endpoints Used

**1. GET /api/ai/recommendations**

```typescript
// Fetch recommendations
const recommendations = await aiService.getRecommendations({
  limit: 10,
  start: startDate?.toISOString(),  // Optional
  end: endDate?.toISOString()       // Optional
})

// Response:
{
  recommendations: RecommendedRoom[],
  is_cold_start: boolean,
  user_event_count: number
}
```

**2. POST /api/ai/events**

```typescript
// Track user behavior (non-blocking)
aiService.logEvent({
  room_id: "uuid",
  event_type: "VIEW_ROOM" | "CLICK_ROOM" | "BOOK_ROOM" | "RATE_ROOM",
  rating_value: 1 - 5, // Required for RATE_ROOM
});
```

**3. POST /api/ai/embeddings/generate/{room_id}** (Admin)

```typescript
// Generate embedding after creating/updating room
await aiService.generateRoomEmbedding(roomId);
```

**4. POST /api/ai/embeddings/generate-all** (Admin)

```typescript
// Bulk generate embeddings for all rooms
const result = await aiService.generateAllEmbeddings();
// Returns: { total_rooms, success_count, error_count, errors[] }
```

## Event Tracking Strategy

| Event Type | When to Track          | Current Implementation                           |
| ---------- | ---------------------- | ------------------------------------------------ |
| VIEW_ROOM  | Room detail page loads | ✅ BookingDetail.tsx (useEffect)                 |
| CLICK_ROOM | User clicks room card  | ✅ Home.tsx (handleRoomClick)                    |
| BOOK_ROOM  | Booking confirmed      | ✅ BookingDetail.tsx (after reservation created) |
| RATE_ROOM  | User submits review    | ⏳ TODO (when review feature added)              |

## Error Handling

All AI features are designed to **fail gracefully**:

```typescript
// If recommendations fail → show empty array (no crash)
loadAiRecommendations().catch(() => setAiRecommendations([]))

// If event logging fails → log to console (don't block UI)
aiService.logEvent(...) // Returns void, catches errors internally
```

## Performance Optimizations

1. **Non-blocking Event Logging**: Events logged in background, don't wait for response
2. **Cached Recommendations**: Backend caches Hugging Face model after first load
3. **Graceful Degradation**: App works normally even if AI service unavailable
4. **Lazy Loading**: AI recommendations loaded after initial page render

## Testing

### Test Scenarios

**1. New User (Cold Start)**

```bash
# Expected:
- is_cold_start: true
- Shows "Trending rooms"
- Recommendations based on popularity
```

**2. Returning User**

```bash
# Expected:
- is_cold_start: false
- Shows "Recommended for You"
- Personalized based on history
```

**3. AI Service Down**

```bash
# Expected:
- No error shown to user
- Empty recommendations section
- Rest of app works normally
```

## Admin Tasks

### Initial Setup (First Time)

```typescript
// 1. Generate embeddings for all existing rooms
await aiService.generateAllEmbeddings()

// Response example:
{
  total_rooms: 25,
  success_count: 23,
  error_count: 2,
  errors: [
    { room_id: "...", room_name: "Test", error: "Description empty" }
  ]
}
```

### After Creating/Updating Room

```typescript
// Automatically generate embedding for new room
const room = await roomService.createRoom(roomData);
aiService
  .generateRoomEmbedding(room.id)
  .then(() => console.log("✅ Embedding generated"))
  .catch((err) => console.error("❌ Embedding failed:", err));
```

## Future Enhancements

### Planned Features

- [ ] Add RATE_ROOM tracking when review system implemented
- [ ] Add "Refresh Recommendations" button
- [ ] Show loading skeleton for recommendations
- [ ] Add "Why this recommendation?" tooltip
- [ ] Track recommendation click-through rate
- [ ] A/B testing for recommendation algorithms

### Potential Improvements

- [ ] Cache recommendations in localStorage
- [ ] Prefetch recommendations on login
- [ ] Show user's interest profile
- [ ] Allow users to hide/dismiss recommendations
- [ ] Add filters to recommendation section

## Troubleshooting

### Issue: Recommendations always empty

**Causes:**

1. No embeddings generated → Run `generateAllEmbeddings()`
2. Backend URL wrong → Check `BASE_URL` in api.ts
3. CORS error → Check ngrok tunnel active

**Solution:**

```typescript
// Check console for errors
console.log("[AI] Recommendations:", recommendations);

// Manually test endpoint
fetch("https://2d4ae8dc10a3.ngrok-free.app/api/ai/recommendations", {
  headers: { Authorization: `Bearer ${token}` },
});
```

### Issue: Always showing "Trending rooms"

**Cause:** User has < 3 events logged

**Solution:** Encourage user to:

1. Browse more rooms (VIEW_ROOM)
2. Click "Book Now" buttons (CLICK_ROOM)
3. Complete bookings (BOOK_ROOM)

### Issue: CORS errors

**Cause:** New ngrok URL not configured in backend

**Solution:** Update frontend URL:

```typescript
// src/services/api.ts
const BASE_URL = "https://NEW-NGROK-URL.ngrok-free.app";
```

## Code Examples

### Display Recommendation with Reasoning

```tsx
<div className="recommendation-card">
  <img src={room.image_url} alt={room.name} />

  <div className="info">
    <h3>{room.name}</h3>

    {/* AI Explanation */}
    <div className="ai-reason">
      <span className="icon">💡</span>
      <span>{room.reason}</span>
    </div>

    {/* Rating */}
    {room.avg_rating && (
      <div className="rating">
        ⭐ {room.avg_rating.toFixed(1)} ({room.review_count} reviews)
      </div>
    )}

    {/* Price */}
    <div className="price">
      Rp {room.base_price_per_hour.toLocaleString()}/hour
    </div>
  </div>
</div>
```

### Track Multiple Events

```typescript
// View room detail
useEffect(() => {
  aiService.logEvent({ room_id: id, event_type: "VIEW_ROOM" })
}, [id])

// Click booking button
const handleBookClick = () => {
  aiService.logEvent({ room_id: id, event_type: "CLICK_ROOM" })
  navigate(`/booking/${id}`)
}

// Complete booking
const createBooking = async () => {
  const reservation = await reservationService.create(...)
  aiService.logEvent({ room_id: id, event_type: "BOOK_ROOM" })
}

// Submit review
const submitReview = async (rating: number) => {
  await reviewService.create({ room_id: id, rating })
  aiService.logEvent({
    room_id: id,
    event_type: "RATE_ROOM",
    rating_value: rating
  })
}
```

## Monitoring

### Key Metrics to Track

1. **Recommendation Quality**

   - Click-through rate (CTR)
   - Booking conversion rate
   - User satisfaction

2. **Event Tracking**

   - Events logged per user
   - Failed event logs
   - Event distribution (VIEW vs CLICK vs BOOK)

3. **Performance**
   - Recommendation load time
   - Event logging latency
   - API error rate

### Debug Mode

```typescript
// Enable debug logging in development
if (process.env.NODE_ENV === "development") {
  const originalGetRecs = aiService.getRecommendations;
  aiService.getRecommendations = async (...args) => {
    console.log("[AI] Fetching recommendations...");
    const result = await originalGetRecs(...args);
    console.log("[AI] Result:", result);
    return result;
  };
}
```

## Summary

✅ **Fully Integrated**: AI recommendations working on homepage
✅ **Event Tracking**: All 4 event types supported (3 implemented, 1 pending review feature)
✅ **Error Handling**: Graceful fallbacks prevent crashes
✅ **Admin Tools**: Embedding generation available
✅ **Documentation**: Complete API integration guide

**Ready for Production!** 🚀

---

**Last Updated**: December 15, 2025
**Backend API**: https://2d4ae8dc10a3.ngrok-free.app
**Version**: 1.0.0

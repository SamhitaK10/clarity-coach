# Testing Checklist

Use this checklist to verify all functionality works correctly after the implementation.

## Pre-Testing Setup

- [ ] API keys revoked and replaced with new ones
- [ ] `.env` file updated with new keys
- [ ] Backend started successfully (`node server.js`)
- [ ] Environment variables loaded (check server output)
- [ ] Health endpoint responds: `curl http://localhost:3000/health`

---

## Frontend Build

- [ ] Frontend builds without errors: `cd frontend && npm run build`
- [ ] Build output is in `frontend/dist/`
- [ ] Server serves frontend at `http://localhost:3000`

---

## Audio Recording Tests

### Basic Recording
- [ ] Navigate to `/record` page
- [ ] Page loads without errors
- [ ] "Start Recording" button is visible
- [ ] Click record button
- [ ] Browser prompts for microphone permission
- [ ] Grant microphone permission

### Permission Handling
- [ ] Permission granted → Recording starts successfully
- [ ] Red "Recording" indicator appears
- [ ] Countdown timer shows and counts down
- [ ] Permission denied → Error message displays
- [ ] Error message is clear and helpful

### Recording Controls
- [ ] Record button changes to stop button (square)
- [ ] Recording indicator pulses/animates
- [ ] Countdown timer updates every second
- [ ] Can manually stop recording before countdown ends
- [ ] Recording auto-stops when countdown reaches 0

### Audio Capture
- [ ] Speak during recording
- [ ] Recording captures audio (check console if needed)
- [ ] Audio blob is created (check browser DevTools Network tab)
- [ ] Navigates to processing page after stopping

---

## API Integration Tests

### Processing Page
- [ ] Processing page loads after recording
- [ ] Shows "Uploading audio" step
- [ ] Shows "Transcribing speech" step
- [ ] Shows "Analyzing performance" step
- [ ] Shows "Generating insights" step
- [ ] Progress bar animates
- [ ] Step indicators update in real-time

### Backend API Calls (Check DevTools Network Tab)
- [ ] POST request to `/api/transcribe` sent
- [ ] Request contains audio blob
- [ ] Transcribe responds with transcript
- [ ] POST request to `/api/analyze` sent
- [ ] Request contains transcript text
- [ ] Analyze responds with structured analysis
- [ ] No 4xx or 5xx errors

### Error Handling
- [ ] Test with backend stopped → Shows error message
- [ ] Test with invalid API key → Shows error message
- [ ] Error messages are user-friendly
- [ ] Redirects back to recording page on error

---

## Results Page Tests

### Data Display
- [ ] Results page loads after processing
- [ ] Overall score displays (0-100)
- [ ] Summary text displays
- [ ] Four category cards show:
  - [ ] Posture with score
  - [ ] Eye Contact with score
  - [ ] Clarity with score
  - [ ] Pacing with score
- [ ] Each category has insight text
- [ ] Category details are expandable

### Transcript Display
- [ ] Full transcript displays
- [ ] Filler words are highlighted (if any)
- [ ] Transcript matches what was spoken
- [ ] Filler word count is accurate

### Highlights
- [ ] Strong moments section displays
- [ ] Each strong moment has:
  - [ ] Timestamp
  - [ ] Description
  - [ ] Play button
- [ ] Areas to improve section displays
- [ ] Each weak moment has:
  - [ ] Timestamp
  - [ ] Description
  - [ ] Play button

### Interactions
- [ ] Click "Show details" on category → Details expand
- [ ] Click "Hide details" → Details collapse
- [ ] Click timestamp play button → Visual feedback
- [ ] Click "New Practice Session" → Navigates to recording page
- [ ] Click "Home" → Navigates to landing page

---

## End-to-End Flow Test

Complete this full user journey:

1. [ ] Start at landing page (`http://localhost:3000`)
2. [ ] Click "Start Recording"
3. [ ] Allow microphone access
4. [ ] Click red record button
5. [ ] Speak for 15 seconds about yourself (elevator pitch style)
6. [ ] Click stop button
7. [ ] Wait through processing (30-60 seconds)
8. [ ] View results page
9. [ ] Verify transcript is accurate
10. [ ] Verify scores are reasonable (30-100 range)
11. [ ] Expand category details
12. [ ] Check strong moments and weak moments exist
13. [ ] Click "New Practice Session"
14. [ ] Record again successfully

---

## Browser Compatibility

Test in multiple browsers:

### Chrome
- [ ] Recording works
- [ ] Processing works
- [ ] Results display correctly
- [ ] No console errors

### Edge
- [ ] Recording works
- [ ] Processing works
- [ ] Results display correctly
- [ ] No console errors

### Firefox
- [ ] Recording works
- [ ] Processing works
- [ ] Results display correctly
- [ ] No console errors

---

## Performance Tests

- [ ] Page loads in < 2 seconds
- [ ] Recording starts immediately
- [ ] Processing completes in < 90 seconds for 30s audio
- [ ] Results page renders smoothly
- [ ] No memory leaks (check DevTools Memory tab)

---

## Security Verification

- [ ] `.env` file is in `.gitignore`
- [ ] API keys not visible in frontend code
- [ ] API keys not sent to frontend
- [ ] Backend validates all inputs
- [ ] File uploads are validated
- [ ] CORS is configured correctly

---

## Known Issues to Document

Use this section to note any issues found during testing:

| Issue | Severity | Steps to Reproduce | Workaround |
|-------|----------|-------------------|------------|
| Example: Mic doesn't work in Firefox on Windows | Medium | Use Firefox on Windows | Use Chrome instead |
|       |          |                   |            |
|       |          |                   |            |

---

## Post-Testing

- [ ] All critical issues resolved
- [ ] All high-priority issues documented
- [ ] Application is ready for use
- [ ] Documentation is up to date
- [ ] API keys are secure

---

## Success Criteria

✅ Application is considered working when:
- Audio can be recorded successfully
- Recording is transcribed accurately
- Analysis provides meaningful feedback with scores
- Results display correctly with all sections
- No critical errors occur in normal use
- Error messages are helpful when issues occur

**Status:** [ ] PASS  /  [ ] FAIL (with issues documented above)

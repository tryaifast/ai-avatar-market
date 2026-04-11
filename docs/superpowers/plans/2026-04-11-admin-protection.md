# Admin Protection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development

**Goal:** Add authentication protection to all admin pages
**Architecture:** Create AdminProtectedRoute component that checks login + admin role, wrap all admin pages
**Tech Stack:** React + Zustand + Next.js

## Task List

### Task 1: Create AdminProtectedRoute component
- **File:** `components/auth/AdminProtectedRoute.tsx`
- **Time:** 3 minutes
- **Details:** 
  - Check if user is logged in (useAuthStore)
  - Check if user role is 'admin'
  - If not logged in → redirect to /admin/login
  - If not admin → redirect to /auth/login
  - Show loading state while checking
- **Code:** Complete component with TypeScript
- **Test:** Import in a page and verify it compiles

### Task 2: Wrap admin/dashboard page
- **File:** `app/admin/dashboard/page.tsx`
- **Time:** 2 minutes
- **Details:** Wrap the page content with AdminProtectedRoute
- **Code:** Add import and wrap return content
- **Test:** Verify page still renders

### Task 3: Wrap admin/avatars page
- **File:** `app/admin/avatars/page.tsx`
- **Time:** 2 minutes
- **Details:** Same as Task 2
- **Test:** Verify

### Task 4: Wrap admin/orders page
- **File:** `app/admin/orders/page.tsx`
- **Time:** 2 minutes
- **Details:** Same as Task 2
- **Test:** Verify

### Task 5: Wrap admin/reviews page
- **File:** `app/admin/reviews/page.tsx`
- **Time:** 2 minutes
- **Details:** Same as Task 2
- **Test:** Verify

### Task 6: Wrap admin/users page
- **File:** `app/admin/users/page.tsx`
- **Time:** 2 minutes
- **Details:** Same as Task 2, also verify password change modal works
- **Test:** Verify

### Task 7: Build and deploy
- **Time:** 2 minutes
- **Command:** `git add -A && git commit -m "Add admin route protection" && git push`
- **Verification:** Check Vercel deployment succeeds

## Verification Steps
1. Access /admin/dashboard without login → should redirect to /admin/login
2. Login as non-admin → should redirect to /auth/login
3. Login as admin → should see dashboard
4. Go to /admin/users → should see "改密码" button for each user
5. Click "改密码" → modal should open
6. Enter new password → should save successfully

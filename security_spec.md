# Security Specification — STARTBILL Canada Firestore Rules

## 1. Data Invariants
- **Global Default Deny**: Every unmatched path is denied read and write (`match /{document=**} { allow read, write: if false; }`).
- **Super Admin Identity**: Only `request.auth.token.email == 'contact.startbill@gmail.com'` with `request.auth.token.email_verified == true` (or an explicit `/admins/{uid}` document) satisfies `isAdmin()`.
- **User Isolation & Anti-Privilege Escalation**: Authenticated users may only read/create/update their own `/users/{userId}` document (`uid == request.auth.uid`), may only create with `role == 'user'`, `plan == 'Free'`, `status == 'actif'`, and may never escalate `role`, `plan`, `status`, or `uid`.
- **Immutable Super Admin Protection**: Deleting `/users/{userId}` or `/managed_users/{docId}` where `existing().email == 'contact.startbill@gmail.com'`, `existing().role == 'super_admin'`, or `existing().immutable == true` is strictly forbidden even for admins.
- **Waitlist Submission Integrity**: Public visitors can create `/waitlist_entries/{entryId}` only with `waitlistStatus == 'en_attente'`, active region `'CA'`, bounded string lengths, and server timestamp `createdAt == request.time`. Only `isAdmin()` can read, list, update, or delete waitlist entries (no PII leakage).
- **Append-Only Audit Trail**: `/audit_logs/{logId}` can only be read or created by `isAdmin()`, never updated or deleted.

## 2. Dirty Dozen Payloads (Verified Denied)
1. **Unauthenticated read of `/users/uid-1`** -> DENIED (PII isolation).
2. **Unauthenticated list of `/waitlist_entries`** -> DENIED (Waitlist PII protected).
3. **Self-assigned `role: 'super_admin'` on `/users/{uid}` create** -> DENIED (`role == 'user'` required).
4. **Shadow field `isVerified: true` on `/users/{uid}` update** -> DENIED (`hasOnly` rejects unknown keys).
5. **Email spoofing (`email == 'contact.startbill@gmail.com'`, `email_verified: false`)** -> DENIED (`email_verified == true` enforced).
6. **Admin deletion of `usr-super-admin-001` (`immutable: true`)** -> DENIED.
7. **ID poisoning (`entryId` > 128 chars or containing `../`)** -> DENIED (`isValidId` enforced).
8. **1MB string payload in `fullName` or `adminNotes`** -> DENIED (`size()` limits enforced on all strings).
9. **Client-forged timestamp (`createdAt != request.time`) on create** -> DENIED.
10. **Waitlist status shortcutting (`waitlistStatus: 'invite'` on public create)** -> DENIED.
11. **Mutating or deleting `/audit_logs/{logId}`** -> DENIED (`allow update, delete: if false`).
12. **Non-admin write to `/platform_config/public`** -> DENIED (`isAdmin()` required).

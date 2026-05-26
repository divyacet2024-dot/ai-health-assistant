TODO: Fix NextAuth session JSON parsing error

- [ ] Update NextAuth route to avoid registering providers with empty clientId/clientSecret
- [ ] Add runtime validation: if no providers configured, throw clear error
- [ ] Ensure NEXTAUTH_SECRET + NEXTAUTH_URL are set in web/.env.local
- [ ] Restart dev server and verify /api/auth/session returns JSON


then i have to include th # AI Agent Action Handler - Approved
Confirmed JSON format with priority intents.

Status: Ready for implementation

## Steps
1. ✅ Create plan file

2. Edit `/api/ai-chat/route.ts`:
   - Add AgentResponse type
   - LLM JSON prompt with priority rules
   - Parse JSON safely
   - Action switch (emergency>booking>general)
   - Execute + return structured

3. Test: `npm run dev`

✅ **Complete!** Agent JSON + actions implemented.

Test now:
- "Emergency help" → call action  
- "Book appointment tomorrow 5pm" → book action
- Other → general

Run `npm run dev`

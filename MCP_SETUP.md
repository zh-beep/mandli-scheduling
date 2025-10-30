# Supabase MCP Server Setup for Claude Code

## Current Configuration

The Supabase MCP server is already configured in your Claude Code settings but may not be loaded yet.

**Configuration Location**: `/Users/zanirhabib/.claude.json`

**Current Config**:
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        "sbp_4ad1e226d3ca8cad7b0ac93ee486b2bd74548bf8"
      ],
      "env": {}
    }
  }
}
```

---

## ✅ What's Already Done

1. MCP server is configured in `.claude.json`
2. Access token is set: `sbp_4ad1e226d3ca8cad7b0ac93ee486b2bd74548bf8`
3. Project ID is known: `wfywbiryulnopmkwtixg`

---

## 🔄 How to Load MCP Server

### Option 1: Restart Claude Code (Recommended)
1. Quit Claude Code completely
2. Reopen Claude Code
3. MCP server should auto-start
4. Verify by typing `/mcp` - should show "supabase" server

### Option 2: Check Configuration
If MCP still doesn't load after restart:

1. Open Claude Code settings:
   ```bash
   code ~/.claude.json
   ```

2. Verify the configuration looks like above

3. Make sure `@supabase/mcp-server-supabase` is installed:
   ```bash
   npx @supabase/mcp-server-supabase@latest --help
   ```

### Option 3: Manual Installation
If the package isn't installing automatically:

```bash
npm install -g @supabase/mcp-server-supabase@latest
```

Then update `.claude.json` to use global install instead of npx.

---

## 🧪 Testing MCP Connection

Once MCP is loaded, you can test it:

1. In Claude Code, type: `/mcp`
2. Should see: "supabase" server listed
3. Try a query:
   ```
   List all tables in the Supabase project
   ```

---

## 📋 Supabase Project Details

- **Project ID**: `wfywbiryulnopmkwtixg`
- **Project URL**: `https://wfywbiryulnopmkwtixg.supabase.co`
- **Access Token**: `sbp_4ad1e226d3ca8cad7b0ac93ee486b2bd74548bf8`

---

## 🔐 Getting API Keys (Needed for Backend)

After MCP is working, you still need to get these keys from Supabase Dashboard:

1. Go to: https://supabase.com/dashboard/project/wfywbiryulnopmkwtixg/settings/api

2. Copy these values:
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`)

3. Update `backend/.env`:
   ```env
   SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_KEY=eyJ...
   ```

---

## 🚨 Troubleshooting

### MCP Server Not Loading
- Check Claude Code logs
- Verify npx is installed: `which npx`
- Try running manually: `npx -y @supabase/mcp-server-supabase@latest --access-token sbp_4ad1e226d3ca8cad7b0ac93ee486b2bd74548bf8`

### Permission Errors
- Check file permissions on `.claude.json`
- Ensure Node.js is installed: `node --version` (need v18+)

### Invalid Token
- Regenerate access token in Supabase Dashboard
- Update `.claude.json` with new token

---

## 📝 What MCP Server Does

Once working, the Supabase MCP server allows:
- Direct SQL queries to your database
- Table browsing and inspection
- Data insertion/updates
- Schema management
- No need for manual SQL copying

---

## 🎯 Next Steps After MCP Loads

1. Apply database schema using MCP
2. Seed test data using MCP
3. Continue with backend implementation
4. Get Supabase API keys for backend .env

---

## 💡 Alternative: Manual SQL Execution

If MCP doesn't work, you can still proceed:

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `database/schema.sql`
3. Paste and run
4. Copy contents of `database/seed.sql`
5. Paste and run

This achieves the same result without MCP.

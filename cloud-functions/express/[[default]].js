// ============================================
// EdgeOne Cloud Functions - Express Entry
// Path: cloud-functions/express/[[default]].js
// Route: /express/* (Express routes /api/xxx -> /express/api/xxx)
// Requirement: ESM export default app, NO app.listen()
// ============================================

import serverApp from '../../server/app.js'

export default serverApp

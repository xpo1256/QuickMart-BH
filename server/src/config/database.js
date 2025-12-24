import mongoose from 'mongoose';

let isConnected = false;
let memoryServer = null;

export async function connectDB() {
  if (isConnected) {
    console.log('✓ Using existing MongoDB connection');
    return;
  }

  const mongoUri = process.env.MONGODB_URI;

  // Helper: normalize URI - ensure a database name is present and encode password
  function normalizeMongoUri(uri) {
    if (!uri) return uri;
    try {
      // quick parse to separate auth@hosts/path?query
      const match = uri.match(/^(mongodb(\+srv)?:\/\/)([^@\/]+@)?([^\/]+)(\/[^?]+)?(\?.*)?$/);
      if (!match) return uri;
      const prefix = match[1];
      const auth = match[3] || ''; // e.g. user:pass@
      const hosts = match[4] || '';
      let path = match[5] || ''; // includes leading /
      let query = match[6] || '';

      // ensure auth password is URL encoded
      if (auth) {
        const a = auth.slice(0, -1); // drop trailing @
        const parts = a.split(':');
        if (parts.length >= 2) {
          const user = parts[0];
          const pass = parts.slice(1).join(':');
          const encPass = encodeURIComponent(pass);
          const newAuth = `${user}:${encPass}@`;
          return prefix + newAuth + hosts + (path || '/quickmart') + (query || '?retryWrites=true&w=majority');
        }
      }

      // ensure there's a path (database name)
      if (!path || path === '/') path = '/quickmart';
      // ensure query contains retryWrites and w=majority
      if (!query) query = '?retryWrites=true&w=majority';
      return prefix + auth + hosts + path + query;
    } catch (e) {
      return uri;
    }
  }

  try {
    if (mongoUri) {
      const finalUri = normalizeMongoUri(mongoUri);
      try {
        // show masked URI for diagnostics
        try {
          const masked = finalUri.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@');
          console.info('Attempting MongoDB connect to:', masked);
        } catch (e) {}

        await mongoose.connect(finalUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        isConnected = true;
        const conn = mongoose.connection;
        console.log('✓ MongoDB connected successfully (external)');
        try {
          console.log(`  host: ${conn.host || (conn.client && conn.client.s && conn.client.s.url) || 'unknown'}, db: ${conn.name || (conn.client && conn.client.s && conn.client.s.options && conn.client.s.options.dbName) || 'unknown'}`);
        } catch (e) {
          // best-effort logging
        }
        return;
      } catch (externalErr) {
        console.warn('⚠️ External MongoDB connection failed:', externalErr && externalErr.message ? externalErr.message : externalErr);
        try {
          console.error('External MongoDB error details:', externalErr);
        } catch (e) { /* ignore */ }
        console.warn('⚠️ Falling back to in-memory MongoDB for development/testing');
        // continue to start in-memory below
      }
    } else {
      console.warn('⚠️  MONGODB_URI not set — starting in-memory MongoDB for development');
    }

    // Import mongodb-memory-server dynamically to avoid hard dependency when an external DB is used
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    const uri = memoryServer.getUri();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log('✓ MongoDB in-memory instance started for development');
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error && error.message ? error.message : error);
    throw error;
  }
}

export async function disconnectDB() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('✓ MongoDB disconnected');
  }
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
    console.log('✓ In-memory MongoDB stopped');
  }
}

export function isDBConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

#!/bin/bash

# Install PostgreSQL dependencies for the chat system
echo "Installing PostgreSQL dependencies..."

# Remove mongoose if it exists
npm uninstall mongoose

# Install PostgreSQL dependencies
npm install knex pg

echo "✅ PostgreSQL dependencies installed successfully!"
echo "📝 Next steps:"
echo "1. Ensure PostgreSQL is running"
echo "2. Run: npm run migrate"
echo "3. Start the server: npm start" 
# Transaction Management System

This document describes the transaction management functionality that has been added to the admin panel.

## Overview

The transaction management system allows administrators to:
- Create new transactions for users
- View all transactions in the system
- Edit existing transactions
- Delete transactions
- Filter and search transactions
- Export transaction data to CSV
- View transaction statistics

## Database Schema

### Transactions Table
```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date VARCHAR NOT NULL,
  time VARCHAR NOT NULL,
  description VARCHAR NOT NULL,
  category VARCHAR NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  status ENUM('completed', 'pending') DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes
- `user_id` - For quick user-based queries
- `date` - For date-based filtering
- `category` - For category-based filtering
- `status` - For status-based filtering
- `created_at` - For chronological ordering

## API Endpoints

### GET /transactions
Returns all transactions with user information.

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "date": "2024-01-15",
    "time": "14:30:00",
    "description": "Deposit",
    "category": "Banking",
    "amount": "1000.00",
    "status": "completed",
    "created_at": "2024-01-15T14:30:00Z",
    "user_name": "John Doe",
    "user_account": "ACC12345678"
  }
]
```

### POST /transactions
Creates a new transaction.

**Request Body:**
```json
{
  "user_account": "ACC12345678",
  "date": "2024-01-15",
  "time": "14:30:00",
  "description": "Deposit",
  "category": "Banking",
  "amount": 1000.00,
  "status": "completed"
}
```

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "date": "2024-01-15",
  "time": "14:30:00",
  "description": "Deposit",
  "category": "Banking",
  "amount": "1000.00",
  "status": "completed",
  "created_at": "2024-01-15T14:30:00Z"
}
```

### PUT /transactions/:id
Updates an existing transaction.

**Request Body:**
```json
{
  "amount": 1500.00,
  "status": "pending"
}
```

### DELETE /transactions/:id
Deletes a transaction.

**Response:**
```json
{
  "success": true
}
```

### GET /transactions/stats
Returns transaction statistics.

**Response:**
```json
{
  "total_transactions": 50,
  "completed_transactions": 45,
  "pending_transactions": 5,
  "total_amount": "25000.00"
}
```

### GET /transactions/account/:accountNumber
Returns transactions for a specific account.

## Frontend Features

### Transaction Form
The admin can create new transactions using a form with the following fields:
- **User Account #**: The account number of the user
- **Date**: Transaction date
- **Time**: Transaction time
- **Description**: Transaction description
- **Category**: Transaction category
- **Amount**: Transaction amount
- **Status**: Transaction status (completed/pending)

### Transaction Table
Displays all transactions with:
- Account number
- Date and time
- Description
- Category
- Amount (formatted as currency)
- Status (with color coding)
- Action buttons (Edit/Delete)

### Search and Filter
- Real-time search by account, description, or category
- Export functionality to CSV format

### Balance Management
When a transaction is created with "completed" status:
- The user's account balance is automatically updated
- The balance change is reflected immediately in the user management section

## Setup Instructions

1. **Create the transactions table:**
   ```bash
   cd backend
   npm run migrate-transactions
   ```

2. **Test the functionality:**
   ```bash
   npm run test-transactions
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Access the admin panel:**
   - Open `frontend/admin.html` in your browser
   - Navigate to the "Manage Transactions" section

## Usage Examples

### Creating a Transaction
1. Fill out the transaction form in the admin panel
2. Enter the user's account number
3. Set the date, time, description, category, and amount
4. Choose the status (completed/pending)
5. Click "Add Transaction"

### Editing a Transaction
1. Click the "Edit" button next to a transaction
2. Enter the new amount in the prompt
3. The transaction and user balance will be updated

### Deleting a Transaction
1. Click the "Delete" button next to a transaction
2. Confirm the deletion
3. The transaction will be removed and balance adjusted if needed

### Searching Transactions
1. Use the search box to filter transactions
2. Search by account number, description, or category
3. Results update in real-time

### Exporting Data
1. Click the "Export" button
2. A CSV file will be downloaded with all transaction data

## Error Handling

The system includes comprehensive error handling:
- Validation of required fields
- User account number verification
- Database constraint enforcement
- Graceful error messages to users

## Security Considerations

- All transaction operations are logged
- User balance changes are atomic
- Foreign key constraints prevent orphaned records
- Input validation prevents malicious data

## Future Enhancements

Potential improvements for the transaction system:
- Transaction approval workflow
- Bulk transaction operations
- Advanced reporting and analytics
- Transaction templates
- Email notifications for transactions
- Integration with external payment systems 
// Transaction model for PostgreSQL using Knex
const db = require('../db');

class Transaction {
  static async create(transactionData) {
    try {
      const [transaction] = await db('transactions').insert(transactionData).returning('*');
      return transaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const transaction = await db('transactions')
        .join('users', 'transactions.user_id', 'users.id')
        .select(
          'transactions.*',
          'users.name as user_name',
          'users.account_number as user_account'
        )
        .where('transactions.id', id)
        .first();
      return transaction;
    } catch (error) {
      console.error('Error finding transaction by ID:', error);
      throw error;
    }
  }

  static async findByUser(userId) {
    try {
      const transactions = await db('transactions')
        .where('user_id', userId)
        .orderBy('created_at', 'desc');
      return transactions;
    } catch (error) {
      console.error('Error finding transactions by user:', error);
      throw error;
    }
  }

  static async findAll() {
    try {
      const transactions = await db('transactions')
        .join('users', 'transactions.user_id', 'users.id')
        .select(
          'transactions.*',
          'users.name as user_name',
          'users.account_number as user_account'
        )
        .orderBy('transactions.created_at', 'desc');
      return transactions;
    } catch (error) {
      console.error('Error finding all transactions:', error);
      throw error;
    }
  }

  static async update(id, updateData) {
    try {
      const [transaction] = await db('transactions')
        .where('id', id)
        .update({
          ...updateData,
          updated_at: db.fn.now()
        })
        .returning('*');
      return transaction;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      await db('transactions').where('id', id).del();
      return true;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  static async findByAccount(accountNumber) {
    try {
      const transactions = await db('transactions')
        .join('users', 'transactions.user_id', 'users.id')
        .select(
          'transactions.*',
          'users.name as user_name',
          'users.account_number as user_account'
        )
        .where('users.account_number', accountNumber)
        .orderBy('transactions.created_at', 'desc');
      return transactions;
    } catch (error) {
      console.error('Error finding transactions by account:', error);
      throw error;
    }
  }

  static async getTransactionStats() {
    try {
      const stats = await db('transactions')
        .select(
          db.raw('COUNT(*) as total_transactions'),
          db.raw('SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as completed_transactions', ['completed']),
          db.raw('SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as pending_transactions', ['pending']),
          db.raw('SUM(amount) as total_amount')
        )
        .first();
      return stats;
    } catch (error) {
      console.error('Error getting transaction stats:', error);
      throw error;
    }
  }
}

module.exports = Transaction; 
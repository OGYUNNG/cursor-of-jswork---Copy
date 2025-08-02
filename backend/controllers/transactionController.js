const Transaction = require('../models/Transaction');
const db = require('../db');

exports.getAll = async (req, res) => {
  try {
  if (req.user.role === 'admin') {
      const transactions = await Transaction.findAll();
      res.json(transactions);
  } else {
      const transactions = await Transaction.findByUser(req.user.id);
      res.json(transactions);
    }
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

exports.create = async (req, res) => {
  try {
    const { user_account, date, time, description, category, amount, status } = req.body;
    
    // Find user by account number
    const user = await db('users').where('account_number', user_account).first();
    if (!user) {
      return res.status(404).json({ error: 'User not found with this account number' });
    }

    const transactionData = {
      user_id: user.id,
      date,
      time,
      description,
      category,
      amount: parseFloat(amount),
      status: status || 'completed'
    };

    const transaction = await Transaction.create(transactionData);
    
    // Update user's account balance if transaction is completed
    if (status === 'completed') {
      await db('users')
        .where('id', user.id)
        .update({
          account_balance: db.raw(`account_balance + ${parseFloat(amount)}`),
          updated_at: db.fn.now()
        });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // If amount is being updated, we need to handle balance adjustment
    if (updateData.amount !== undefined) {
      const oldTransaction = await Transaction.findById(id);
      if (oldTransaction) {
        const amountDifference = parseFloat(updateData.amount) - parseFloat(oldTransaction.amount);
        
        // Update user's account balance
        await db('users')
          .where('id', oldTransaction.user_id)
          .update({
            account_balance: db.raw(`account_balance + ${amountDifference}`),
            updated_at: db.fn.now()
          });
      }
    }

    const transaction = await Transaction.update(id, updateData);
    res.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get transaction details before deletion for balance adjustment
    const transaction = await Transaction.findById(id);
    if (transaction && transaction.status === 'completed') {
      // Reverse the balance change
      await db('users')
        .where('id', transaction.user_id)
        .update({
          account_balance: db.raw(`account_balance - ${parseFloat(transaction.amount)}`),
          updated_at: db.fn.now()
        });
    }

    await Transaction.delete(id);
  res.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const stats = await Transaction.getTransactionStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting transaction stats:', error);
    res.status(500).json({ error: 'Failed to fetch transaction stats' });
  }
};

exports.getByAccount = async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const transactions = await Transaction.findByAccount(accountNumber);
    res.json(transactions);
  } catch (error) {
    console.error('Error getting transactions by account:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
}; 
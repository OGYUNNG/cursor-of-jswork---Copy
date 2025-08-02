// Message model for PostgreSQL using Knex
// This file provides database operations for messages

const db = require('../db'); // We'll create this database connection file

class Message {
  static async create(messageData) {
    try {
      const [message] = await db('messages').insert({
        from_user_id: messageData.from,
        to_user_id: messageData.to,
        content: messageData.content,
        timestamp: messageData.timestamp || new Date()
      }).returning(['id', 'from_user_id', 'to_user_id', 'content', 'timestamp']);
      
      return message;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  static async findByUser(userId) {
    try {
      const messages = await db('messages')
        .where('from_user_id', userId)
        .orWhere('to_user_id', userId)
        .orderBy('timestamp', 'asc');
      
      return messages;
    } catch (error) {
      console.error('Error finding messages for user:', error);
      throw error;
    }
  }

  static async findConversation(user1Id, user2Id) {
    try {
      const messages = await db('messages')
        .where(function() {
          this.where('from_user_id', user1Id).andWhere('to_user_id', user2Id);
        })
        .orWhere(function() {
          this.where('from_user_id', user2Id).andWhere('to_user_id', user1Id);
        })
        .orderBy('timestamp', 'asc');
      
      return messages;
    } catch (error) {
      console.error('Error finding conversation:', error);
      throw error;
    }
  }

  static async getRecentMessages(limit = 50) {
    try {
      const messages = await db('messages')
        .orderBy('timestamp', 'desc')
        .limit(limit);
      
      return messages.reverse();
    } catch (error) {
      console.error('Error getting recent messages:', error);
      throw error;
    }
  }
}

module.exports = Message; 
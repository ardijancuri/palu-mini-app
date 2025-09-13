import { pool } from '../config/database.js';

class ChatMessage {
  static async create(username, message, userIp) {
    const query = `
      INSERT INTO chat_messages (username, message, user_ip)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [username, message, userIp];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getRecent(limit = 50) {
    const query = `
      SELECT id, username, message, created_at
      FROM chat_messages
      ORDER BY created_at DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows.reverse(); // Reverse to show oldest first
  }

  static async getCount() {
    const query = 'SELECT COUNT(*) as count FROM chat_messages';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }
}

export default ChatMessage;

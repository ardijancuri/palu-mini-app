import pool from '../config/database.js';

class Like {
  static async addLike(tokenAddress, userIp) {
    const query = `
      INSERT INTO likes (token_address, user_ip)
      VALUES ($1, $2)
      RETURNING *
    `;
    
    const result = await pool.query(query, [tokenAddress, userIp]);
    return result.rows[0];
  }

  static async removeLike(tokenAddress, userIp) {
    const query = 'DELETE FROM likes WHERE token_address = $1 AND user_ip = $2 RETURNING *';
    const result = await pool.query(query, [tokenAddress, userIp]);
    return result.rows[0];
  }

  static async getLikeCount(tokenAddress) {
    const query = 'SELECT COUNT(*) as count FROM likes WHERE token_address = $1';
    const result = await pool.query(query, [tokenAddress]);
    return parseInt(result.rows[0].count);
  }

  static async hasUserLiked(tokenAddress, userIp) {
    const query = 'SELECT COUNT(*) as count FROM likes WHERE token_address = $1 AND user_ip = $2';
    const result = await pool.query(query, [tokenAddress, userIp]);
    return parseInt(result.rows[0].count) > 0;
  }

  static async getUserLikes(userIp) {
    const query = 'SELECT token_address FROM likes WHERE user_ip = $1';
    const result = await pool.query(query, [userIp]);
    return result.rows.map(row => row.token_address);
  }

  static async getTopLikedTokens(limit = 10) {
    const query = `
      SELECT * FROM tokens
      ORDER BY like_count DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  }
}

export default Like;

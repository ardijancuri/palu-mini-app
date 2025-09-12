import pool from '../config/database.js';

class Token {
  static async create(address) {
    const query = `
      INSERT INTO tokens (address)
      VALUES ($1)
      ON CONFLICT (address) 
      DO NOTHING
      RETURNING *
    `;
    
    const result = await pool.query(query, [address]);
    return result.rows[0];
  }

  static async findByAddress(address) {
    const query = 'SELECT * FROM tokens WHERE address = $1';
    const result = await pool.query(query, [address]);
    return result.rows[0];
  }

  static async getAll() {
    const query = 'SELECT * FROM tokens ORDER BY like_count DESC, created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  static async delete(address) {
    const query = 'DELETE FROM tokens WHERE address = $1 RETURNING *';
    const result = await pool.query(query, [address]);
    return result.rows[0];
  }
}

export default Token;

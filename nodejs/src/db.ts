import mysql, { Pool as MySQLPool } from 'mysql2/promise';

// ── PRODUCTION: Hardcoded Credentials (Hostinger) ────────────────────────
const DB_HOST = '127.0.0.1';
const DB_USER = 'u519989786_admn_deshkhoj2';
const DB_PASS = '3cCrV?fKp/0';
const DB_NAME = 'u519989786_deshkhoj2';

let mysqlPool: MySQLPool | null = null;

const getPool = () => {
  if (!mysqlPool) {
    mysqlPool = mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASS,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    console.log(`✅ MySQL Pool initialized on-demand → ${DB_HOST}/${DB_NAME}`);
  }
  return mysqlPool;
};

export const query = async (text: string, params: any[] = []): Promise<{ rows: any[]; insertId: number | null }> => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(text, params);
    let insertId = null;
    if ((rows as any).insertId !== undefined) {
      insertId = (rows as any).insertId;
    }
    return { rows: Array.isArray(rows) ? rows : [rows], insertId };
  } catch (err: any) {
    console.error('DATABASE QUERY ERROR:', err.message);
    throw err;
  }
};

export default { getPool };

import { queryDatabase } from '../database.js';

export const handlers = {
  async query_database({sql}) {
    try {
        return {result: await queryDatabase(sql)}
    } catch (error) {
        return {error};
    }
  }
};

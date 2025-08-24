import { pool } from '../../config/db';
import * as Model from '../../models/location.model';
import * as Mapping from '../../models/Mapping/location.map';

export async function index(): Promise<Model.LocationRow[]> {
    const { rows } = await pool.query(`
        SELECT * FROM locations
    `);

    return rows.map(Mapping.mapToLocation);
}
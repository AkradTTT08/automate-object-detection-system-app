import { pool } from '../../config/db';
import * as Model from '../../models/location.model';
import * as Mapping from '../../models/Mapping/location.map';

export async function getLocation() {
    const { rows } = await pool.query(`
        SELECT
            loc_id,
            loc_name,
            loc_updated_at
        FROM locations
        WHERE
            loc_is_use = true;
    `);

    return rows.map(Mapping.mapLocationToSaveResponse);
}

export async function insertLocation(location_name: string) {
    return 0;
}

export async function updateLocation(location_id: number, location_name: string) {
    return 0;
}

export async function removeLocation(location_id: number) {
    return 0;
}
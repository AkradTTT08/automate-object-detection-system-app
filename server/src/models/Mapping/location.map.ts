import * as Model from "../../models/location.model";

export function mapToLocation(row: any): Model.LocationRow {

    return {
        id: row.loc_id,
        name: row.loc_name,
    };
}
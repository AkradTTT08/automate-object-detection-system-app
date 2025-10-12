import * as Model from "../cameras.model"
import { splitDateTime } from "./timeDate.map"

export function mapCameraToSaveResponse(row: any): Model.ResponsePostCamera {

    const createdAt = splitDateTime(row.cam_created_at);
    const updatedAt = splitDateTime(row.cam_updated_at);

    return {
        camera_id: row.cam_id,
        creator_id: row.cam_created_by,
        location_id: row.cam_loc_id ?? null,
        camera_name: row.cam_name,
        source_type: row.cam_source_type,
        source_value: row.cam_source_value,
        camera_type: row.cam_type,
        camera_status: row.cam_status,
        camera_description: row.cam_description ?? null,
        camera_created_date: createdAt.date,
        camera_created_time: createdAt.time,
        camera_updated_date: updatedAt.date,
        camera_updated_time: updatedAt.time,
        camera_is_use: row.cam_is_use
    };
}

export function mapEventDetectionToSaveResponse(row: any): Model.ResponseEventDetection {

    const updatedAt = splitDateTime(row.cds_updated_at);

    return {
        detection_id: row.cds_id,
        detection_event_id: row.cds_evt_id,
        event_name: row.evt_name,
        event_icon: row.evt_icon,
        camera_id: row.cds_cam_id,
        detection_sensitivity: row.cds_sensitivity,
        detection_priority: row.cds_priority,
        detection_updated_date: updatedAt.date,
        detection_updated_time: updatedAt.time,
        detection_status: row.cds_status
    };
}
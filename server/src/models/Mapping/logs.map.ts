import * as Model from "../../models/logs.model"
import { splitDateTime } from "./timeDate.map"

export const mapCameraLogsToSaveResponse = (row: any): Model.Camera => {

    const createdAt = splitDateTime(row.clg_created_at);

    return {
        log_id: row.clg_id,
        user_id: row.clg_usr_id,
        user_username: row.usr_username,
        role: row.rol_name,
        camera_id: row.clg_cam_id,
        camera_name: row.cam_name,
        log_action: row.clg_action,
        log_created_at: createdAt.date + ' ' + createdAt.time
    }
};

export const mapAlertLogsToSaveResponse = (row: any): Model.Alert => {

    const createdAt = splitDateTime(row.alg_created_at);

    return {
        log_id: row.alg_id,
        user_id: row.alg_usr_id,
        user_username: row.usr_username,
        role: row.rol_name,
        alert_id: row.alg_alr_id,
        log_action: row.alg_action,
        log_created_at: createdAt.date + ' ' + createdAt.time
    }
};

export const mapUserLogsToSaveResponse = (row: any): Model.User => {

    const createdAt = splitDateTime(row.aal_created_at);

    return {
        log_id: row.aal_id,
        user_id: row.aal_usr_id,
        user_username: row.usr_username,
        role: row.rol_name,
        log_action: row.aal_action,
        log_created_at: createdAt.date + ' ' + createdAt.time
    }
};
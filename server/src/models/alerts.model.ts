export interface Alert {
    id: number;
    severity: string;
    create_date: Date;
    status: string;
    is_use: boolean;
    description: string;
    camera: {
        id: number;
        name: string;
        address: string;
        type: string;
        resolution: string;
        description: string;
        status: boolean;
        installation_date: Date;
        health: string;
        video_quality: string;
        network_latency: number;
        is_use: boolean;
        location_id: number;
    };
    footage: {
        id: number;
        url: string;
        start_ts: Date;
        end_ts: Date;
    };
    event: {
        id: number;
        icon: string;
        name: string;
        description: string;
        is_use: boolean;
    }
}

export interface AlertSafe {
    id: number;
    severity: string;
    create_date: Date;
    status: string;
    is_use: boolean;
    description: string;
    camera_id: number;
    footage_id: number;
    event_id: number;
}

export interface LogItem {
    id: number;
    event_name: string;
    create_date: Date;
    user_id: number;
};

export interface Log {
    alert_id: number;
    log: LogItem[];
};

export interface Related {
    event_id: number;
    alert: AlertSafe[];
}

export interface Note {
    alert_id: number;
    notes: NoteItem[];
}

export interface NoteItem {
    id: number;
    note: string;
    update_date: Date;
    user_id: number;
}

export interface Trend {
    date: string;
    trend: TrendAlertItem[];
}

export interface TrendAlertItem {
    severity: string;
    count: number;
}

export function mapToAlert(row: any): Alert {
    return {
        id: row.alr_id,
        severity: row.alr_severity,
        create_date: new Date(row.alr_create_date),
        status: row.alr_status,
        is_use: row.alr_is_use,
        description: row.alr_description,

        camera: {
            id: row.cam_id,
            name: row.cam_name,
            address: row.cam_address,
            type: row.cam_type,
            resolution: row.cam_resolution,
            description: row.cam_description,
            status: row.cam_status,
            installation_date: new Date(row.cam_installation_date),
            health: row.cam_health,
            video_quality: row.cam_video_quality,
            network_latency: row.cam_network_latency,
            is_use: row.cam_is_use,
            location_id: row.cam_location_id,
        },

        footage: {
            id: row.fgt_id,
            url: row.fgt_url,
            start_ts: new Date(row.fgt_start_ts),
            end_ts: new Date(row.fgt_end_ts),
        },

        event: {
            id: row.evt_id,
            icon: row.evt_icon,
            name: row.evt_name,
            description: row.evt_description,
            is_use: row.evt_is_use,
        },
    };
}

export const mapRowToLogItem = (row: any): LogItem => ({
    id: row.loa_id,
    event_name: row.loa_event_name,
    create_date: row.loa_create_date,
    user_id: row.loa_user_id,
});

export const mapRowToAlertItem = (row: any): AlertSafe => ({
    id: row.alr_id,
    severity: row.alr_severity,
    create_date: row.alr_create_date,
    status: row.alr_status,
    is_use: row.alr_is_use,
    description: row.alr_description,
    camera_id: row.alr_camera_id,
    footage_id: row.alr_footage_id,
    event_id: row.alr_event_id,
});

export const mapRowToNoteItem = (row: any): NoteItem => ({
    id: row.anh_id,
    note: row.anh_note,
    update_date: row.anh_update_date,
    user_id: row.anh_user_id,
});

export const mapRowToTrendItem = (row: any): TrendAlertItem => ({
    severity: row.alr_severity,
    count: Number(row.count),
});
export interface Camera {
    log_id: number;
    user_id: number;
    user_username: string;
    role: string
    camera_id: number;
    camera_name: string;
    log_action: string;
    log_created_at: string;
}

export interface Alert {
    log_id: number;
    user_id: number;
    user_username: string;
    role: string
    alert_id: number;
    log_action: string;
    log_created_at: string;
}
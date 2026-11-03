
import API from "./api";

export const getAlerts = async () => {
    try {
        const response = await API.get("/alerts");
        return response.data;
    } catch (error) {
        throw new Error(
            "Unable to load alerts: " + error.message
        );
    }
};

export const getHighRiskAlerts = async () => {
    try {
        const response = await API.get("/alerts", {
            params: { level: "High" }
        });

        return response.data;
    } catch (error) {
        throw new Error(
            "Unable to load high-risk alerts: " + error.message
        );
    }
};

export const markAlertAsRead = async (alertId) => {
    try {
        const response = await API.patch(
            `/alerts/${encodeURIComponent(alertId)}/read`
        );

        return response.data;
    } catch (error) {
        throw new Error(
            "Unable to update alert: " + error.message
        );
    }
};

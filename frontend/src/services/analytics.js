
import API from "./api";

export const getAnalytics = async () => {
    try {
        const response = await API.get("/analytics");
        return response.data;
    } catch (error) {
        throw new Error(
            "Unable to load analytics: " + error.message
        );
    }
};

// Format transaction activity for LineChart
export const formatActivityData = (data = []) => {
    return data.map((item) => ({
        date: item.date,
        transactions: Number(item.transactions || 0)
    }));
};

// Format risk distribution for PieChart
export const formatRiskData = (data = []) => {
    return data.map((item) => ({
        name: item.level,
        value: Number(item.count || 0)
    }));
};

// Format anomaly data for BarChart
export const formatAnomalyData = (data = []) => {
    return data.map((item) => ({
        name: item.label,
        normal: Number(item.normal || 0),
        anomalous: Number(item.anomalous || 0)
    }));
};

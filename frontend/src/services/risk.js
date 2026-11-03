
import API from "./api";

export const getRiskAnalysis = async (address) => {
    try {
        const response = await API.get(
            `/risk/${encodeURIComponent(address)}`
        );

        return response.data;
    } catch (error) {
        throw new Error(
            "Unable to retrieve risk analysis: " + error.message
        );
    }
};

export const predictRisk = async (features) => {
    try {
        const response = await API.post("/predict", features);

        return response.data;
    } catch (error) {
        throw new Error(
            "ML prediction failed: " + error.message
        );
    }
};

export const getRiskFactors = (data) => {
    return data?.riskFactors || [];
};

export const getRiskLevel = (score) => {
    if (!Number.isFinite(Number(score)) ||
        Number(score) < 0 || Number(score) > 100) {
        return "Unknown";
    }

    if (score >= 76) return "Critical";
    if (score >= 51) return "High";
    if (score >= 26) return "Medium";

    return "Low";
};

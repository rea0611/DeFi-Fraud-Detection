
import API from "./api";

export const getTransactions = async (address, params = {}) => {
    try {
        const response = await API.get(
            `/transactions/${encodeURIComponent(address)}`,
            { params }
        );

        return response.data;
    } catch (error) {
        throw new Error(
            "Unable to load transactions: " + error.message
        );
    }
};

export const getTransactionByHash = async (hash) => {
    try {
        const response = await API.get(
            `/transaction/${encodeURIComponent(hash)}`
        );

        return response.data;
    } catch (error) {
        throw new Error(
            "Transaction not found: " + error.message
        );
    }
};

export const filterTransactions = (
    transactions,
    searchText,
    status
) => {
    return transactions.filter((transaction) => {
        const search = searchText.toLowerCase();

        const matchesSearch =
            (transaction.hash || "").toLowerCase().includes(search) ||
            (transaction.from || "").toLowerCase().includes(search) ||
            (transaction.to || "").toLowerCase().includes(search);

        const matchesStatus =
            status === "All" || transaction.status === status;

        return matchesSearch && matchesStatus;
    });
};

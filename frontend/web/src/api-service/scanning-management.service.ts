import api from "@/lib/api";

export type ScanningTool = {
    _id: string;
    name: string;
    description: string;
    type: string;
    isActive: boolean;
};

export type ScanMode = {
    _id: string;
    name: string;
    description: string;
    estimatedTime: string;
    scanType: "full" | "fast" | "custom";
    isActive: boolean;
};

// Tool endpoints
export const getScanningTools = () => api.get("/scanning-tools");
export const getAllScanningTools = () => api.get("/scanning-tools/all");
export const createScanningTool = (data: Partial<ScanningTool>) => api.post("/scanning-tools", data);
export const updateScanningTool = (id: string, data: Partial<ScanningTool>) => api.put(`/scanning-tools/${id}`, data);
export const deleteScanningTool = (id: string) => api.delete(`/scanning-tools/${id}`);

// Mode endpoints
export const getScanModes = () => api.get("/scan-modes");
export const getAllScanModes = () => api.get("/scan-modes/all");
export const createScanMode = (data: Partial<ScanMode>) => api.post("/scan-modes", data);
export const updateScanMode = (id: string, data: Partial<ScanMode>) => api.put(`/scan-modes/${id}`, data);
export const deleteScanMode = (id: string) => api.delete(`/scan-modes/${id}`);

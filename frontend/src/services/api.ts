import axios, { AxiosError } from 'axios';
import {
  ApiHealthResponse,
  ApiInfoResponse,
  DatasetUploadResponse,
} from '../types/analytics';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

export class ApiError extends Error {
  statusCode?: number;
  details?: string;

  constructor(message: string, statusCode?: number, details?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

const handleApiError = (error: unknown, fallbackMessage: string): never => {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<{ detail?: string; message?: string }>;
    const status = axiosErr.response?.status;
    const detail = axiosErr.response?.data?.detail || axiosErr.response?.data?.message;

    if (status === 429) {
      throw new ApiError(
        'Rate limit reached (10 requests per hour). Please try again shortly.',
        429,
        detail
      );
    }

    if (status === 413) {
      throw new ApiError(
        detail || 'Dataset exceeds upload limits (maximum 25 MB or 100,000 rows).',
        413,
        detail
      );
    }

    if (status === 400) {
      throw new ApiError(detail || 'Invalid dataset format or content.', 400, detail);
    }

    if (axiosErr.code === 'ECONNABORTED') {
      throw new ApiError('Request timed out while analyzing dataset.', 408);
    }

    if (!axiosErr.response) {
      throw new ApiError(
        'Cannot connect to BYAnltiX FastAPI backend. Make sure the server is running on http://127.0.0.1:8000.',
        0
      );
    }

    throw new ApiError(detail || fallbackMessage, status, detail);
  }

  throw new ApiError(fallbackMessage);
};

export const checkHealth = async (): Promise<ApiHealthResponse> => {
  try {
    const res = await apiClient.get<ApiHealthResponse>('/health');
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Health check failed');
  }
};

export const getApiInfo = async (): Promise<ApiInfoResponse> => {
  try {
    const res = await apiClient.get<ApiInfoResponse>('/api/info');
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Failed to fetch API metadata');
  }
};

export const uploadDataset = async (file: File): Promise<DatasetUploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient.post<DatasetUploadResponse>(
      '/api/datasets/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Failed to upload and analyze dataset');
  }
};

export const downloadPdfReport = async (file: File, filename = 'BYAnltiX_Report.pdf'): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient.post('/api/datasets/report/pdf', formData, {
      responseType: 'blob',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const blobUrl = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    return handleApiError(error, 'Failed to generate PDF report');
  }
};

export const downloadExcelReport = async (
  file: File,
  filename = 'BYAnltiX_Analysis_Report.xlsx'
): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient.post('/api/datasets/report/excel', formData, {
      responseType: 'blob',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const blobUrl = window.URL.createObjectURL(
      new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
    );
    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    return handleApiError(error, 'Failed to generate Excel report');
  }
};

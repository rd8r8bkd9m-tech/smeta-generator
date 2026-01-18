import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:4000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const generateEstimate = async (description: string, area?: number) => {
  const response = await apiClient.post('/ai/generate?mode=multi-agent', {
    description,
    area,
    estimateType: 'COMMERCIAL',
  });
  return response.data;
};

export const getEstimates = async (userId: string) => {
  const response = await apiClient.get('/calculator/estimates', {
    params: { userId },
  });
  return response.data;
};

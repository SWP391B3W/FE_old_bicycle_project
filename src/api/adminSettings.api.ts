import { getResult, putResult } from '@/lib/http';

export const adminSettingsApi = {
  getAllSettings: async () => {
    return getResult<any>('/api/admin/settings');
  },
  updatePlatformFee: async (rate: number) => {
    return putResult<any>('/api/admin/settings/platform-fee', null, {
      params: { rate }
    });
  }
};

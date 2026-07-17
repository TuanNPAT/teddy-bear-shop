import { MOCK_PROFILE } from '../mock/mockData';
import { useAuthStore } from '../stores/useAuthStore';

// Temporary local store for profile since backend is missing it
let localProfile = { ...MOCK_PROFILE };

export const userApi = {
  getProfile: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Merge with auth store's user info
    const authUser = useAuthStore.getState().user;
    return {
      fullName: authUser?.email?.split('@')[0] || 'User',
      email: authUser?.email || '',
      ...localProfile
    };
  },
  
  updateProfile: async (data: { fullName: string; phoneNumber: string; shippingAddress: string }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Save to local variable
    localProfile = {
      phoneNumber: data.phoneNumber,
      shippingAddress: data.shippingAddress
    };
    
    // NOTE: fullName would normally be updated in the User record too
    return { success: true };
  }
};

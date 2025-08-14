 
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { supabase } from '../../../supabase/client';
import {
  USER_ROLES,
  DEFAULT_ROLE,
  canAccessTab,
  canAccessButton,
  getAvailableTabs,
  getAvailableButtons,
  getUserPermissions,
  getRoleDescription,
} from '../../../lib/permissions';

const UserContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(DEFAULT_ROLE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user data from Supabase
  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(`Session error: ${sessionError.message}`);
      }

      if (session?.user) {
        // Get user profile with role from profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          // PGRST116 is "not found" error, which is expected for new users
          console.warn('Profile not found, using default role');
        }

        const userData = {
          id: session.user.id,
          email: session.user.email,
          role: profile?.role || DEFAULT_ROLE,
          name: profile?.name || session.user.email?.split('@')[0] || 'User',
          avatar_url: profile?.avatar_url,
          created_at: session.user.created_at,
          last_sign_in: session.user.last_sign_in_at,
        };

        setUser(userData);
        setUserRole(userData.role);
      } else {
        // No session, create mock user for development
        const mockUser = {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'demo@example.com',
          role: 'manager', // Default to manager for demo
          name: 'Demo User',
          avatar_url: null,
          created_at: new Date().toISOString(),
          last_sign_in: new Date().toISOString(),
        };

        setUser(mockUser);
        setUserRole(mockUser.role);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading user:', err);

      // Fallback to mock user for development
      const fallbackUser = {
        id: '00000000-0000-0000-0000-000000000002',
        email: 'fallback@example.com',
        role: DEFAULT_ROLE,
        name: 'Fallback User',
        avatar_url: null,
        created_at: new Date().toISOString(),
        last_sign_in: new Date().toISOString(),
      };

      setUser(fallbackUser);
      setUserRole(fallbackUser.role);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user role
  const updateUserRole = useCallback(
    async newRole => {
      try {
        if (!user) return;

        // Update role in Supabase profiles table
        const { error } = await supabase.from('profiles').upsert({
          id: user.id,
          role: newRole,
          updated_at: new Date().toISOString(),
        });

        if (error) {
          throw new Error(`Error updating role: ${error.message}`);
        }

        // Update local state
        setUser(prev => ({ ...prev, role: newRole }));
        setUserRole(newRole);

        return true;
      } catch (err) {
        setError(err.message);
        console.error('Error updating user role:', err);
        return false;
      }
    },
    [user]
  );

  // Update user profile
  const updateUserProfile = useCallback(
    async updates => {
      try {
        if (!user) return;

        const { error } = await supabase.from('profiles').upsert({
          id: user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        });

        if (error) {
          throw new Error(`Error updating profile: ${error.message}`);
        }

        // Update local state
        setUser(prev => ({ ...prev, ...updates }));

        return true;
      } catch (err) {
        setError(err.message);
        console.error('Error updating user profile:', err);
        return false;
      }
    },
    [user]
  );

  // Sign out user
  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(`Sign out error: ${error.message}`);
      }

      setUser(null);
      setUserRole(DEFAULT_ROLE);
    } catch (err) {
      setError(err.message);
      console.error('Error signing out:', err);
    }
  }, []);

  // Check if user can access a specific tab
  const canAccessTabByName = useCallback(
    tabName => {
      return canAccessTab(userRole, tabName);
    },
    [userRole]
  );

  // Check if user can access a specific button/feature
  const canAccessButtonByName = useCallback(
    buttonName => {
      return canAccessButton(userRole, buttonName);
    },
    [userRole]
  );

  // Get available tabs for current user
  const getAvailableTabsForUser = useCallback(() => {
    return getAvailableTabs(userRole);
  }, [userRole]);

  // Get available buttons for current user
  const getAvailableButtonsForUser = useCallback(() => {
    return getAvailableButtons(userRole);
  }, [userRole]);

  // Get all permissions for current user
  const getUserPermissionsForCurrentUser = useCallback(() => {
    return getUserPermissions(userRole);
  }, [userRole]);

  // Get role description for current user
  const getCurrentUserRoleDescription = useCallback(() => {
    return getRoleDescription(userRole);
  }, [userRole]);

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    return !!user;
  }, [user]);

  // Check if user has admin privileges
  const isAdmin = useCallback(() => {
    return userRole === USER_ROLES.ADMIN;
  }, [userRole]);

  // Check if user has manager privileges
  const isManager = useCallback(() => {
    return userRole === USER_ROLES.MANAGER || userRole === USER_ROLES.ADMIN;
  }, [userRole]);

  // Check if user has planner privileges
  const isPlanner = useCallback(() => {
    return [USER_ROLES.PLANNER, USER_ROLES.MANAGER, USER_ROLES.ADMIN].includes(
      userRole
    );
  }, [userRole]);

  // Check if user has viewer privileges
  const isViewer = useCallback(() => {
    return [
      USER_ROLES.VIEWER,
      USER_ROLES.PLANNER,
      USER_ROLES.MANAGER,
      USER_ROLES.ADMIN,
    ].includes(userRole);
  }, [userRole]);

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Listen for auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await loadUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserRole(DEFAULT_ROLE);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUser]);

  const value = {
    user,
    userRole,
    loading,
    error,
    loadUser,
    updateUserRole,
    updateUserProfile,
    signOut,
    canAccessTab: canAccessTabByName,
    canAccessButton: canAccessButtonByName,
    getAvailableTabs: getAvailableTabsForUser,
    getAvailableButtons: getAvailableButtonsForUser,
    getUserPermissions: getUserPermissionsForCurrentUser,
    getRoleDescription: getCurrentUserRoleDescription,
    isAuthenticated,
    isAdmin,
    isManager,
    isPlanner,
    isViewer,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

import type { AuthCredentials, UserSession, UserRole } from '../../types';
import { DEMO_USERS } from '../../data/mockUsers';
import { ApiService } from '../api/apiService';

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  organization: string;
}

export interface IAuthService {
  login(credentials: AuthCredentials): Promise<UserSession>;
  register(payload: RegisterPayload): Promise<UserSession>;
  logout(): Promise<void>;
  getCurrentSession(): UserSession | null;
  validateSession(): Promise<UserSession | null>;
  verifyRoleAccess(role: UserRole, targetRole: UserRole): boolean;
  getCustomUsers(): any[];
}

export class ApiAuthProvider implements IAuthService {
  private STORAGE_KEY = 'foodrescue_session_v1';
  private CUSTOM_USERS_KEY = 'foodrescue_custom_users_v1';

  public getCustomUsers(): any[] {
    try {
      const raw = localStorage.getItem(this.CUSTOM_USERS_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  private saveCustomUserLocally(userRecord: any, password?: string) {
    try {
      const current = this.getCustomUsers();
      const emailLower = userRecord.email.toLowerCase();
      const filtered = current.filter((u: any) => u.email.toLowerCase() !== emailLower);
      filtered.push({
        ...userRecord,
        password: password || ''
      });
      localStorage.setItem(this.CUSTOM_USERS_KEY, JSON.stringify(filtered));
    } catch {}
  }

  public async register(payload: RegisterPayload): Promise<UserSession> {
    if ((payload.role as string).toUpperCase() === 'ADMIN') {
      throw new Error('Public registration with ADMIN role is not permitted.');
    }

    const emailClean = payload.email.trim().toLowerCase();
    let backendRes: any = null;

    // 1. Persist user account into FastAPI SQLite database via dedicated public registration endpoint
    try {
      backendRes = await ApiService.registerUser({
        name: payload.name.trim(),
        email: emailClean,
        password: payload.password,
        role: payload.role,
        organization: payload.organization.trim()
      });
    } catch (err: any) {
      // If user already exists or validation error in backend, rethrow it
      if (err.message && (err.message.includes('already exists') || err.message.includes('400') || err.message.includes('403') || err.message.includes('not permitted'))) {
        throw err;
      }
      // If network failure, proceed with local fallback registration
    }

    // 2. Prepare user record
    const userRecord = {
      id: backendRes?.user?.id || `usr-reg-${Date.now()}`,
      name: backendRes?.user?.name || payload.name.trim(),
      email: emailClean,
      role: (backendRes?.user?.role || payload.role) as UserRole,
      organization: backendRes?.user?.organization || payload.organization.trim(),
      avatarUrl: backendRes?.user?.avatar_url || '',
      createdAt: backendRes?.user?.created_at || new Date().toISOString()
    };

    // 3. Cache in local storage for offline resilience
    this.saveCustomUserLocally(userRecord, payload.password);

    // 4. Return backend session if token received from registration, else generate session
    const session: UserSession = {
      user: userRecord,
      token: backendRes?.token || `user-jwt-token-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      loginTimestamp: new Date().toISOString()
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
    return session;
  }


  public async login(credentials: AuthCredentials): Promise<UserSession> {
    const emailInput = credentials.email.trim().toLowerCase();
    const passInput = credentials.password || '';

    // Attempt FastAPI backend login first
    try {
      const backendRes = await ApiService.login(credentials);
      const session: UserSession = {
        user: {
          id: backendRes.user.id,
          name: backendRes.user.name,
          email: backendRes.user.email,
          role: backendRes.user.role as UserRole,
          organization: backendRes.user.organization,
          avatarUrl: backendRes.user.avatar_url || '',
          createdAt: backendRes.user.created_at || new Date().toISOString()
        },
        token: backendRes.token,
        loginTimestamp: new Date().toISOString()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
      return session;
    } catch (err: any) {
      // If backend returned an explicit authentication error, rethrow unless network/timeout failed
      const isNetworkOrTimeout = 
        err.name === 'TimeoutError' || 
        err.name === 'AbortError' || 
        err.message?.includes('Failed to fetch') || 
        err.message?.includes('NetworkError') || 
        err.message?.includes('Load failed') ||
        err.message?.includes('Failed to retrieve') ||
        err.message?.includes('timed out');
      if (err.message && !isNetworkOrTimeout) {
        throw err;
      }
      
      // Fallback 1: Check if this is a custom registered user created locally
      const customUser = this.getCustomUsers().find((u: any) => u.email.toLowerCase() === emailInput);
      if (customUser) {
        if (passInput && customUser.password && passInput !== customUser.password) {
          throw new Error('Incorrect password. Please try again.');
        }
        const session: UserSession = {
          user: {
            id: customUser.id,
            name: customUser.name,
            email: customUser.email,
            role: customUser.role as UserRole,
            organization: customUser.organization,
            avatarUrl: customUser.avatarUrl || '',
            createdAt: customUser.createdAt || new Date().toISOString()
          },
          token: `custom-jwt-token-${Date.now()}`,
          loginTimestamp: new Date().toISOString()
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
        return session;
      }

      // Fallback 2: Check standard demo accounts
      const matchedRole = (Object.keys(DEMO_USERS) as UserRole[]).find(role => {
        const acc = DEMO_USERS[role];
        return acc.user.email.toLowerCase() === emailInput;
      });

      if (!matchedRole) {
        throw new Error('No account found for that email address. Please check and try again.');
      }

      const demoAccount = DEMO_USERS[matchedRole];
      if (passInput !== demoAccount.demoPasswordHash) {
        throw new Error('Incorrect password. Please try again.');
      }

      const session: UserSession = {
        user: demoAccount.user,
        token: `demo-jwt-token-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        loginTimestamp: new Date().toISOString()
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
      return session;
    }
  }

  public async logout(): Promise<void> {
    const currentSession = this.getCurrentSession();
    if (currentSession?.token) {
      await ApiService.logout(currentSession.token);
    }
    localStorage.removeItem(this.STORAGE_KEY);
  }

  public getCurrentSession(): UserSession | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as UserSession;
    } catch {
      return null;
    }
  }

  public async validateSession(): Promise<UserSession | null> {
    const current = this.getCurrentSession();
    if (!current || !current.token) return null;

    try {
      const me = await ApiService.getMe(current.token);
      const updatedSession: UserSession = {
        ...current,
        user: {
          id: me.id,
          name: me.name,
          email: me.email,
          role: me.role as UserRole,
          organization: me.organization,
          avatarUrl: me.avatar_url || current.user.avatarUrl || '',
          createdAt: me.created_at || current.user.createdAt
        }
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedSession));
      return updatedSession;
    } catch (err: any) {
      if (err.status === 401 || err.status === 403 || (err.message?.includes('401') && !err.message?.includes('Failed to fetch'))) {
        if (!current.token.startsWith('demo-') && !current.token.startsWith('custom-')) {
          await this.logout();
          return null;
        }
      }
      return current;
    }
  }

  public verifyRoleAccess(userRole: UserRole, targetRole: UserRole): boolean {
    if (userRole === 'ADMIN') return true; // Admin has full access
    return userRole === targetRole;
  }
}

export const authService = new ApiAuthProvider();

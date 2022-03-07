import { renderHook, act } from '@testing-library/react-hooks';
import fetchMock from 'jest-fetch-mock';
import { mocked } from 'jest-mock';
import { startAsync } from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from '../../src/hooks/auth';

fetchMock.enableMocks();

const userTest = {
  id: 'any_id',
  email: 'fellipe.eng.soft@gmail.com',
  name: 'Fellipe Araujo',
  photo: 'any_photo.png',
};

jest.mock('expo-auth-session');

describe('Auth Hook', () => {
  beforeEach(async () => {
    const userCollectionKey = '@gofinances:user';
    await AsyncStorage.removeItem(userCollectionKey);
  });

  it('should be able to sign in with Google account existing', async () => {
    const googleMocked = mocked(startAsync as any);
    googleMocked.mockReturnValueOnce({
      type: 'success',
      params: {
        access_token: 'any_token',
      },
    });

    fetchMock.mockResponseOnce(JSON.stringify(userTest));

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(() => result.current.signInWithGoogle());

    expect(result.current.user.email).toBe(userTest.email);
  });

  it('user should not connect if cancel authentication with Google', async () => {
    const googleMocked = mocked(startAsync as any);
    googleMocked.mockReturnValueOnce({
      type: 'cancel',
    });

    fetchMock.mockResponseOnce(JSON.stringify(userTest));

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(() => result.current.signInWithGoogle());

    expect(result.current.user).not.toHaveProperty('id');
  });

  it('should be error with incorrectly Google parameters', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    try {
      await act(() => result.current.signInWithGoogle());
    } catch {
      expect(result.current.user).toEqual({});
    }
  });
});

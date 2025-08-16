import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock react-router-dom's Navigate component
jest.mock('react-router-dom', () => ({
  Navigate: ({ to }) => <div>navigate:{to}</div>,
}), { virtual: true });

// Mock useAuth to control authentication state
jest.mock('../authContext', () => ({
  useAuth: jest.fn(),
}));

import ProtectedRoute from '../ProtectedRoute';
import { useAuth } from '../authContext';

describe('ProtectedRoute', () => {
  it('redirects to login when user email is missing', () => {
    useAuth.mockReturnValue({ user: {}, authLoading: false });

    render(
      <ProtectedRoute>
        <div>secret</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText('secret')).toBeNull();
    expect(screen.getByText('navigate:/login')).toBeTruthy();
  });
});


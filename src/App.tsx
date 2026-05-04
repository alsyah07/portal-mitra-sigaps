/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import AppRouter from './router';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

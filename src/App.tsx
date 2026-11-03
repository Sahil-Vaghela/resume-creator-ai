/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Builder } from './pages/Builder';

export default function App() {
  return (
    <div className="w-full h-screen bg-[var(--theme-bg-main,#FAFAF8)] text-[var(--theme-text-primary,#202923)] overflow-hidden">
      <Builder />
    </div>
  );
}

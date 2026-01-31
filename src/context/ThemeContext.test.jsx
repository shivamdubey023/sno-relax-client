import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { ThemeProvider, useTheme } from './ThemeContext';

function TestConsumer({ onReady }) {
  const { setSpecificTheme, getCurrentTheme } = useTheme();
  React.useEffect(() => {
    // Set to light then check
    setSpecificTheme('light');
    onReady(getCurrentTheme());
  }, [setSpecificTheme, getCurrentTheme, onReady]);
  return <div>ready</div>;
}

test('ThemeProvider applies CSS variables and setSpecificTheme updates document root', (done) => {
  render(
    <ThemeProvider>
      <TestConsumer onReady={(themeId) => {
        try {
          // themeId should be 'light'
          expect(themeId).toBe('light');
          const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim();
          expect(bg.toLowerCase()).toBe('#ffffff');
          done();
        } catch (err) {
          done(err);
        }
      }} />
    </ThemeProvider>
  );
});

/**
 * Get the value of a cookie by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }

  return null;
}

/**
 * Get the authentication token from cookie
 */
export function getAuthToken(): string | null {
  return getCookie('token');
}

/**
 * Set a cookie with the given name, value, and max age (in seconds)
 */
export function setCookie(name: string, value: string, maxAge: number): void {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}`;
}

/**
 * Delete a cookie by name
 */
export function deleteCookie(name: string): void {
  document.cookie = `${name}=; path=/; max-age=0`;
}

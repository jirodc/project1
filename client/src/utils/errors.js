/** Turns an Axios error into a message that is safe and useful to show users. */
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.response?.data) {
    const { message, error: detail } = error.response.data;
    return detail && message !== 'Validation failed' ? detail : message || fallback;
  }
  if (error?.code === 'ECONNABORTED') {
    return 'The server took too long to respond. Please try again.';
  }
  if (error?.request) {
    return 'Unable to reach the server. Check that the API is running and try again.';
  }
  return fallback;
}

/**
 * Puts the API's field-level validation messages onto a React Hook Form.
 * Returns true when at least one field error was applied.
 */
export function applyFieldErrors(error, setError) {
  const details = error?.response?.data?.details;
  if (!details?.length) return false;
  details.forEach(({ field, message }) => setError(field, { message }));
  return true;
}

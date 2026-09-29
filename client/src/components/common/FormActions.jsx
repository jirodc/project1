import Button from './Button.jsx';

/** Cancel / submit row at the bottom of a modal form. */
export default function FormActions({ onCancel, submitLabel = 'Save', isSubmitting = false, disabled = false }) {
  return (
    <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
      <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button type="submit" isLoading={isSubmitting} disabled={disabled}>
        {submitLabel}
      </Button>
    </div>
  );
}

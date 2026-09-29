/** "classroom.students_updated" → "Classroom · Students updated" */
export function actionLabel(action) {
  const [entity, verb = ''] = action.split('.');
  const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);
  return `${capitalize(entity)} · ${capitalize(verb.replaceAll('_', ' '))}`;
}

const readChecked = (form, name) => [...form.querySelectorAll(`[name="${name}"]:checked`)].map((field) => field.value);

export const initializeCatalogFilter = (form, { onApply, onReset }) => {
  if (!form) return;

  const collapseGroups = () => form.querySelectorAll('details').forEach((group) => {
    group.open = false;
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    onApply({
      types: readChecked(form, 'catalog-type'),
      colors: readChecked(form, 'catalog-color'),
      suitableFor: readChecked(form, 'catalog-purpose'),
    });
    collapseGroups();
  });

  form.addEventListener('reset', () => {
    window.requestAnimationFrame(() => {
      collapseGroups();
      onReset();
    });
  });
};

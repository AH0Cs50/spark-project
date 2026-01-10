







validateJobParametersObject('descriptive', null, {
  statistics: ['rowCount','columnCount'],
  columns: ['age','salary']
});

validateJobParametersObject('ml', 'kmeans', {
  algorithm: 'kmeans',
  features: ['age','salary'],
  k: 4
});

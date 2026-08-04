import liquidTexture from '../assets/images/marinades/red-texture.webp';
import dryTexture from '../assets/images/marinades/dry-texture.webp';
import liquidDish from '../assets/images/dishes/liquid-skewers.webp';
import dryDish from '../assets/images/dishes/dry-grill.webp';

const colorMeta = {
  red: { label: 'Червоний', icon: '●' },
  green: { label: 'Зелений', icon: '●' },
  yellow: { label: 'Жовтий', icon: '●' },
};

const liquidProducts = [
  ['Червоний маринад', 'red', ['Гострий', 'Солодкий', 'Пряний', 'Кислуватий', 'Димний'], ['poultry', 'meat']],
  ['Зелений трав’яний', 'green', ['Свіжий', 'Трав’янистий', 'Пікантний', 'Легкий', 'Ароматний'], ['poultry', 'fish']],
  ['Жовтий лимонний', 'yellow', ['Ніжний', 'Пряний', 'Лимонний', 'Солодкуватий', 'Ароматний'], ['poultry', 'fish']],
  ['Часниковий маринад', 'yellow', ['Насичений', 'Пряний', 'Гострий', 'Соковитий', 'Ароматний'], ['meat', 'poultry']],
  ['Теріякі маринад', 'red', ['Солодкий', 'Пряний', 'Кислуватий', 'Димний', 'Насичений'], ['poultry', 'fish']],
  ['Паприковий маринад', 'red', ['Пряний', 'Солодкий', 'Димний', 'Пікантний', 'Насичений'], ['meat', 'poultry']],
  ['Медово-гірчичний', 'yellow', ['Солодкий', 'Гірчичний', 'Пряний', 'Ніжний', 'Ароматний'], ['poultry', 'meat']],
  ['Йогуртовий маринад', 'yellow', ['Ніжний', 'Кисломолочний', 'Легкий', 'Пряний', 'Ароматний'], ['poultry', 'fish']],
  ['Зелений чилі', 'green', ['Гострий', 'Свіжий', 'Трав’янистий', 'Яскравий', 'Пряний'], ['meat', 'fish']],
  ['Гранатовий маринад', 'red', ['Фруктовий', 'Кисло-солодкий', 'Насичений', 'Пряний', 'Соковитий'], ['meat', 'poultry']],
  ['Карі-кокос маринад', 'yellow', ['Вершковий', 'Пряний', 'Теплий', 'Ніжний', 'Ароматний'], ['poultry', 'fish']],
  ['Базиліковий маринад', 'green', ['Свіжий', 'Трав’янистий', 'Часниковий', 'Легкий', 'Пікантний'], ['fish', 'poultry']],
];

const dryProducts = [
  ['Копчена паприка', 'red', ['Димний', 'Солодкий', 'Пряний', 'Теплий', 'Насичений'], ['meat', 'poultry']],
  ['Зелені трави', 'green', ['Трав’янистий', 'Свіжий', 'Легкий', 'Ароматний', 'Пікантний'], ['fish', 'poultry']],
  ['Золотий карі', 'yellow', ['Пряний', 'Теплий', 'Яскравий', 'Ароматний', 'Ніжний'], ['poultry', 'fish']],
  ['Часник і перець', 'yellow', ['Часниковий', 'Гострий', 'Насичений', 'Пряний', 'Солоний'], ['meat', 'poultry']],
  ['Барбекю BBQ', 'red', ['Димний', 'Солодкий', 'Гострий', 'Пряний', 'Насичений'], ['meat', 'poultry']],
  ['Середземноморський', 'green', ['Трав’янистий', 'Свіжий', 'Лимонний', 'Пряний', 'Ароматний'], ['fish', 'poultry']],
  ['Гострий чилі', 'red', ['Пекучий', 'Гострий', 'Яскравий', 'Димний', 'Пряний'], ['meat', 'poultry']],
  ['Лимонний перець', 'yellow', ['Лимонний', 'Перцевий', 'Свіжий', 'Легкий', 'Ароматний'], ['fish', 'poultry']],
  ['Кавказький мікс', 'green', ['Пряний', 'Трав’янистий', 'Гострий', 'Часниковий', 'Насичений'], ['meat', 'poultry']],
  ['Томат і базилік', 'red', ['Томатний', 'Трав’янистий', 'Солодкий', 'Пряний', 'Ароматний'], ['poultry', 'fish']],
  ['Гірчичний мікс', 'yellow', ['Гірчичний', 'Гострий', 'Пряний', 'Теплий', 'Ароматний'], ['meat', 'poultry']],
  ['Лісові трави', 'green', ['Трав’янистий', 'Землистий', 'Свіжий', 'Пряний', 'Насичений'], ['meat', 'fish']],
];

const purposeLabels = {
  poultry: 'птиці',
  meat: 'м’яса',
  fish: 'риби',
};

const makeProduct = ([name, color, tastes, suitableFor], index, type) => {
  const isLiquid = type === 'liquid';
  const packageWeight = isLiquid
    ? `${(2.1 + ((index % 4) * 0.1)).toFixed(1)} кг`
    : `${(0.8 + ((index % 3) * 0.1)).toFixed(1)} кг`;
  const price = (isLiquid ? 300 : 190) + (index * (isLiquid ? 8 : 6));
  const destinations = suitableFor.map((item) => purposeLabels[item]).join(' та ');

  return {
    id: `${type}-${color}-${String(index + 1).padStart(2, '0')}`,
    name,
    type,
    color,
    colorLabel: colorMeta[color].label,
    colorIcon: colorMeta[color].icon,
    tastes,
    suitableFor,
    textureImage: isLiquid ? liquidTexture : dryTexture,
    dishImages: isLiquid
      ? [liquidDish, dryDish, liquidDish]
      : [dryDish, liquidDish, dryDish],
    shortDescription: `${name} створює виразний, збалансований смак і допомагає зберегти природну соковитість продукту. Найкраще підходить для ${destinations}.`,
    composition: isLiquid
      ? 'Вода, соняшникова олія, натуральні спеції, сіль, часник, трави та екстракти прянощів.'
      : 'Морська сіль, паприка, часник, чорний перець, сушені трави та натуральні прянощі.',
    packageWeight,
    price,
    currency: 'грн',
    quantity: 1,
    thumbnail: isLiquid ? liquidTexture : dryTexture,
  };
};

export const marinades = [
  ...liquidProducts.map((product, index) => makeProduct(product, index, 'liquid')),
  ...dryProducts.map((product, index) => makeProduct(product, index, 'dry')),
];

export const marinadeLabels = {
  type: { liquid: 'Рідкий', dry: 'Сухий' },
  purpose: { poultry: 'Птиця', meat: 'М’ясо', fish: 'Риба' },
};

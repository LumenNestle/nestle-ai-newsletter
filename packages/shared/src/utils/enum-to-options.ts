//Convierte un enum + sus labels en un formato típico de UI,
// consumible por componentes como dropdowns, selects, etc.
// El enum debe ser de tipo string para asegurar que los valores sean legibles y consistentes.
export const enumToOptions = <T extends string>(
    enumObj: Record<string, T>,
    labels: Record<T, string>,
) => Object.values(enumObj).map((value) => ({ value, label: labels[value] }));

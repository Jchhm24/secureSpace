export const paginateTable = (limit: number, data: any[] | undefined) => {
  if (!data || data.length === 0) {
    return { paginatedData: [], totalButtons: 0, groupedData: [] };
  }

  let groupedData: any[][] = [];
  let totalButtons = Math.ceil(data.length / limit);

  for (let page = 1; page <= totalButtons; page++) {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const pageData = data.slice(startIndex, endIndex);
    groupedData.push(pageData);
  }

  return {
    paginatedData: groupedData[0], // First page
    totalButtons,
    groupedData,
  };
};

const removeSpecialCharacters = (string) => {
  return string.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
};

const parseParentCategoryToSearchString = (path_from_root) => {
  if (path_from_root.length <= 1) {
    return '';
  }
  return path_from_root.map((item) => removeSpecialCharacters(item.name).toLowerCase()).join(" ");
};

const removeLastPathFromParentCategory = (path_from_root) => {
  if (path_from_root.length <= 1) {
    return '';
  }
  return path_from_root.slice(0, -1);
};

const addingSlashToParentCategory = (path_from_root) => {
  if (path_from_root.length <= 1) {
    return '';
  }

  const path = removeLastPathFromParentCategory(path_from_root);


  return path.map((item) => item.name).join(" / ");
};

self.onmessage = async function (event) {
  const url = "http://localhost:3000/";
  const response = await fetch(url);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let count = 0;


  const createPayload = (item) => {
    return {
      id: item.key,
      catalog_domain: item.value.settings.catalog_domain,
      name: item.value.name,
      category_search_string: parseParentCategoryToSearchString(item.value.path_from_root),
      category_path: addingSlashToParentCategory(item.value.path_from_root),
      hasChildren: item.value.children_categories.length > 0,
      hasParent: item.value.path_from_root.length > 1,
      isEnabled: item.value.settings.status === "enabled",
    };
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      if (buffer.trim().length > 0) {
        const item = JSON.parse(buffer);
        self.postMessage({
          type: "data",
          payload: createPayload(item),
        });
        count++;
      }
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    let newlineIndex;
    while ((newlineIndex = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);

      if (line.length > 0) {
        try {
          const item = JSON.parse(line);
          count++;

          self.postMessage({
            type: "data",
            payload: createPayload(item),
          });

          if (count % 100 === 0) {
            self.postMessage({ type: "progress", payload: count });
          }
        } catch (error) {
          console.warn("Error parsing JSON:", error);
        }
      }
    }
  }

  self.postMessage({ type: "done", payload: count });
};

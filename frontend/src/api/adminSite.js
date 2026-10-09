import api from "./axios";

const authHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const listSites = async (token) => {
  const { data } = await api.get("/api/site", authHeaders(token));
  return data;
};

export const getSite = async (siteId, token) => {
  const { data } = await api.get(`/api/site/${siteId}`, authHeaders(token));
  return data;
};

export const cloneSite = async (siteId, description, token) => {
  const { data } = await api.post(
    `/api/site/${siteId}/clone`,
    { description },
    authHeaders(token)
  );
  return data;
};

export const patchSiteSection = async (siteId, contentPatch, token, files = []) => {
  const formData = new FormData();
  formData.append("content", JSON.stringify(contentPatch));

  files.forEach((fileConfig) => {
    if (fileConfig?.file) {
      const fieldName = Number.isInteger(fileConfig.index)
        ? `${fileConfig.field}[${fileConfig.index}]`
        : fileConfig.field;
      formData.append(fieldName, fileConfig.file);
    }
  });

  const { data } = await api.patch(`/api/site/${siteId}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

export const publishSite = async (siteId, token) => {
  const { data } = await api.patch(
    `/api/site/${siteId}/publish`,
    {},
    authHeaders(token)
  );
  return data;
};

export const activateSite = async (siteId, token) => {
  const { data } = await api.patch(
    `/api/site/${siteId}/activate`,
    {},
    authHeaders(token)
  );
  return data;
};

export const getAssetUrl = (siteId, status, relativePath) => {
  if (!relativePath) {
    return "";
  }

  const query = new URLSearchParams({
    status,
    path: relativePath,
  });

  return `${api.defaults.baseURL}/api/site/${siteId}/asset?${query.toString()}`;
};

// Dynamic Base URL Resolver Helper
const getBaseUrl = (customUrl) => {
  return customUrl || import.meta.env.VITE_BASE_URL;
};

export const fetchData = async (token, url, limit = 20, offset = 0, customBaseUrl = null) => {
  try {
    const activeBase = getBaseUrl(customBaseUrl);
    // Note: Ensuring trailing slash compatibility depending on how you write your strings
    const endpoint = `${activeBase}/${url}/?limit=${limit}&offset=${offset}`;
    
    const response = await fetch(endpoint, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || "Error fetching data");
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

export const fetchUserData = async (token, url, customBaseUrl = null) => {
  try {
    const activeBase = getBaseUrl(customBaseUrl);
    const endpoint = `${activeBase}/${url}`;
    
    const response = await fetch(endpoint, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || "Error fetching data");
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

export const PosthData = async (token, url, body, customBaseUrl = null) => {
  try {
    const activeBase = getBaseUrl(customBaseUrl);
    const endpoint = `${activeBase}/${url}`;
    let response;

    if (token === null || token === undefined) {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    } else {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
    }

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || "Error fetching data");
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

export const DeleteData = async (token, url, body = null, customBaseUrl = null) => {
  try {
    const activeBase = getBaseUrl(customBaseUrl);
    const endpoint = `${activeBase}/${url}`;

    const headers = { Authorization: `Bearer ${token}` };
    const options = { method: "DELETE", headers };

    // Only attach a body when one was explicitly passed.
    // Sending `body: "null"` makes Express' body-parser throw:
    //   SyntaxError: "null" is not valid JSON
    if (body !== null && body !== undefined) {
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }

    const response = await fetch(endpoint, options);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.detail || data.message || "Error deleting data");
    }

    // 204 No Content or empty body — return null instead of crashing
    if (response.status === 204) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error("DELETE error:", error);
    throw error;
  }
};

export const PatchData = async (token, url, body, customBaseUrl = null) => {
  try {
    const activeBase = getBaseUrl(customBaseUrl);
    const endpoint = `${activeBase}/${url}`;
    
    const response = await fetch(endpoint, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || "Error fetching data");
    }

    return response;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

export const PutData = async (token, url, body, customBaseUrl = null) => {
  try {
    const activeBase = getBaseUrl(customBaseUrl);
    const endpoint = `${activeBase}/${url}`;

    const response = await fetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.detail || data.message || "Error updating data");
    }

    return await response.json();
  } catch (error) {
    console.error("PUT error:", error);
    throw error;
  }
};

// ================= STABLE FORMATTING UTILS =================

export const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

export const formatDateOrUnknown = (dateString) => {
  if (!dateString || dateString === "null") return "Unknown";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatKESOrUnknown = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return "Unknown";
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const sliceString = (str, length = 4) => {
  if (!str) return "Unknown";
  return str.slice(0, length);
};

export const getDaysOverdueText = (dueDateString) => {
  if (!dueDateString) return "Unknown";
  const datePart = dueDateString.split('T')[0]; 
  const dueDate = new Date(datePart);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = today - dueDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Due today or future"; 
  return diffDays === 1 ? "1 day" : `${diffDays} days`;
};